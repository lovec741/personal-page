from datetime import datetime, timedelta
from typing import Dict, List, Set, Tuple
import requests
from bs4 import BeautifulSoup
from http.cookies import SimpleCookie
from urllib.parse import quote_plus, urlparse, parse_qs
import jwt
from app.storage import UserStorage
from zoneinfo import ZoneInfo

TIMEZONE = ZoneInfo("Europe/Prague")

CAS_URL = "https://idp.cuni.cz/cas/login?service={}"

RECODEX_BASE_URL = "https://recodex.mff.cuni.cz"
OWL_BASE_URL = "https://owl.mff.cuni.cz"

CACHE_INVALIDATION_TIME_H = 1 

class InvalidCredentialsException(Exception):
    pass

def get_cas_ticket_for_service(username: str, password: str, cas_service_url: str):
    cas_url = CAS_URL.format(quote_plus(cas_service_url)) 

    session = requests.session()
    login_page = session.get(cas_url)

    soup = BeautifulSoup(login_page.text, "lxml")
    form = soup.select("form#fm1")[0]

    form_data = {}
    for input in form.select("input"):
        form_data[input["name"]] = input["value"] if input.has_attr("value") else ""

    form_data.update({
        "username": username,
        "password": password
    })

    response = session.post(cas_url, data=form_data, allow_redirects=False)
    if response.status_code == 401:
        raise InvalidCredentialsException()

    ticket = parse_qs(urlparse(response.raw.get_redirect_location()).query)["ticket"][0]
    return ticket


class OwlDataCollection:
    def __init__(self, username: str, password: str, token: str|None):
        self.token = token
        self.session = requests.Session()

        if not token or not self._test_token(): # no token or invalid token
            print("OWL Getting new token")
            self.token = self._get_token(username, password)
        else:
            print("OWL Reusing token")

    @staticmethod
    def _get_token(username: str, password: str):
        ticket = get_cas_ticket_for_service(username, password, OWL_BASE_URL+"/acct/login/cas?next=/")
        
        url = OWL_BASE_URL+f"/acct/login/cas?next=/&ticket={quote_plus(ticket)}"
        api_login_response = requests.get(url, allow_redirects=False)

        cookies = api_login_response.cookies
        token = None
        for cookie in cookies:
            if cookie.name == 'owl_session':
                token = cookie.value
                break

        if not token:
            raise Exception("owl no cookie found")
        
        return token
    
    def _test_token(self):
        response = self._fetch_owl_page(OWL_BASE_URL+"/settings/", False)
        if response.status_code == 302 and "login" in response.headers.get("Location", ""):
            return False
        return True
    
    def _fetch_owl_page(self, url: str, allow_redirects=True):
        cookie = SimpleCookie()
        cookie["owl_session"] = self.token
        self.session.cookies.update(cookie)
        response = self.session.get(url, allow_redirects=allow_redirects)
        return response
            
    def _fetch_and_parse_owl_page(self, url: str):  
        response = self._fetch_owl_page(url)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            return soup
        else:
            print(f"Failed to fetch the page. Status code: {response.status_code}")
            return None

    def get_this_semester_courses(self):
        soup = self._fetch_and_parse_owl_page(OWL_BASE_URL+"/")
        if soup:
            header = soup.find('header')
            if header and header.find_next_sibling() and header.find_next_sibling().find_next_sibling():
                ul = header.find_next_sibling().find_next_sibling()
                courses = []
                if ul.name == 'ul':
                    for li in ul.find_all('li', recursive=True)[:-1]:
                        link = li.find('a')
                        if link:
                            course_url = link.get('href')
                            course_name = link.text.strip()
                                                
                            courses.append({
                                'name': course_name,
                                'url': OWL_BASE_URL+course_url,
                            })
                return courses
            else:
                print("No header found or no element after header")
                return None
    
    @staticmethod
    def _convert_points(points: str, default: str="-") -> int|float|str:
        try:
            points = float(points)
        except ValueError:
            points = default
        if isinstance(points, float) and points.is_integer():
            points = int(points)
        return points
    
    def get_topics_for_course(self, course: Dict[str, str]):
        soup = self._fetch_and_parse_owl_page(course['url'])
        if soup:
            topics = []
            topics_tables = soup.find_all('table', class_='topics')
            for topics_table in topics_tables:

                rows = topics_table.find_all('tr')

                for row in rows[1:]: # skip header
                    cells = row.find_all('td')
                    
                    topic_link = cells[0].find('a')
                    topic_name = topic_link.text
                    topic_url = topic_link['href']
                    
                    deadline = None
                    deadline_text = cells[1].contents[0].strip()
                    if deadline_text:
                        date_time_part = deadline_text.split('(')[0].strip()
                        deadline = datetime.strptime(date_time_part, '%Y-%m-%d %H:%M')
                        deadline = deadline.replace(tzinfo=TIMEZONE)


                    points = self._convert_points(cells[2].contents[0].strip(), "-")
                    max_points = self._convert_points(cells[3].contents[0].strip(), "?")
                    
                    topic_data = {
                        'course': course,
                        'name': topic_name,
                        'url': OWL_BASE_URL+topic_url,
                        'deadline': deadline,
                        'points': points,
                        'max_points': max_points,
                        'acknowledged': row.get('class')[0] == "told"
                    }
                    
                    topics.append(topic_data)
            return topics
    
    def get_topics_and_courses(self, hidden_courses: Set):
        courses = self.get_this_semester_courses()
        topics = []
        for course in courses:
            if course["url"] in hidden_courses: # dont fetch data for hidden courses
                continue

            course_topics = self.get_topics_for_course(course)
            if course_topics:
                topics += course_topics
        return topics, courses


class RecodexDataCollection:
    def __init__(self, username: str, password: str, token: str|None):
        self.token = token
        self.user_id = self._get_user_id() if token else None
        self.session = requests.Session()

        self.user_data = None
        if token and self.user_id: # have token and token could be parsed (because have user_id)
            self.user_data = self._get_user_data() # test token by getting user data
        
        if not self.user_data: # no token or invalid token
            print("RECODEX Getting new token")
            self.token = self._get_token(username, password)
            self.user_id = self._get_user_id()
            self.user_data = self._get_user_data()
        else:
            print("RECODEX Reusing token")

    @staticmethod
    def _get_token(username: str, password: str):
        ticket = get_cas_ticket_for_service(username, password, RECODEX_BASE_URL+"/cas-auth-ext/")

        url = RECODEX_BASE_URL+f"/cas-auth-ext/?ticket={quote_plus(ticket)}"
        api_login_response = requests.get(url, allow_redirects=True)

        parsed_url = urlparse(api_login_response.url)
        query_params = parse_qs(parsed_url.query)
        
        sis_api_token = query_params['token'][0]
        url = RECODEX_BASE_URL+"/api/v1/login/cas-uk"
        api_login_response = requests.post(url, data={"token": sis_api_token})

        return api_login_response.json()["payload"]["accessToken"]

    @staticmethod
    def _get_localized_text(texts: List[Dict]):
        localized_text = None
        for text in texts:
            if text.get('locale') == 'cs':
                localized_text = text
                break
        
        if localized_text is None:
            for text in texts:
                if text.get('locale') == 'en':
                    localized_text = text
                    break
        
        if localized_text is None and texts:
            localized_text = texts[0]
        return localized_text

    def _api_request(self, method: str, endpoint: str):
        headers = {"Authorization": "Bearer " + self.token}
        resp = self.session.request(method, RECODEX_BASE_URL+"/api/v1"+endpoint, headers=headers)
        if resp.status_code == 401:
            return None
        return resp.json()["payload"]

    def get_topics_and_courses(self, hidden_courses: Set):    
        groups = self._api_request("GET", "/groups")
        
        topics = []
        courses = []
        for group in groups:
            group_localized_text = self._get_localized_text(group["localizedTexts"])
            group_id = group.get('id')
            course = {
                'name': group_localized_text.get('name'),
                'url': RECODEX_BASE_URL+f"/app/group/{group_id}/assignments",
            }
            courses.append(course)

            if course["url"] in hidden_courses: # dont fetch data for hidden courses
                continue

            assignments = self._api_request("GET", "/groups/{}/assignments".format(group_id))
            
            for i, assignment in enumerate(assignments, 1):
                localized_text = self._get_localized_text(assignment["localizedTexts"])
                deadline_timestamp = assignment['firstDeadline']
                deadline = datetime.fromtimestamp(deadline_timestamp, TIMEZONE)
                solutions = self._api_request("GET", "/exercise-assignments/{}/users/{}/solutions".format(assignment["id"], self.user_id))
                max_points = assignment['maxPointsBeforeFirstDeadline']
                points = "-"
                for solution in solutions:
                    if solution["isBestSolution"]:
                        points = str(solution["actualPoints"]) + ("" if solution["bonusPoints"] == 0 else f"+{solution['bonusPoints']}")
                topic_data = {
                    'course': course,
                    'name': localized_text.get('name'),
                    'url': RECODEX_BASE_URL+f"/app/assignment/{assignment['id']}/user/{self.user_id}",
                    'deadline': deadline,
                    'points': points,
                    'max_points': max_points,
                    'acknowledged': False
                }
                topics.append(topic_data)
        return topics, courses

    def _get_user_data(self):
        return self._api_request("GET", "/users/{}".format(self.user_id))

    def _get_user_id(self):
        try:
            decoded_token = jwt.decode(self.token, options={"verify_signature": False})
            user_id = decoded_token["sub"]
            return user_id
        except Exception:
            return None


def get_all_topics_and_courses(username: str, password: str, ignore_cache: bool = False) -> Tuple[Dict, Dict]:        
    user_storage = UserStorage(username, password)
    user_data = user_storage.load_user_data()

    settings = user_data.get("settings", {})
    hidden_courses = set(settings.get("hidden_courses", []))

    # check for cache
    if not ignore_cache and user_data.get("cache") \
        and user_data["cache"]["timestamp"].tzinfo is not None \
        and user_data["cache"]["timestamp"] + timedelta(hours=CACHE_INVALIDATION_TIME_H) > datetime.now(TIMEZONE):
            print("Using cached topics data")
            return user_data["cache"], settings

    # no cache
    try:
        owl = OwlDataCollection(username, password, user_data.get("owl_token"))
        recodex = RecodexDataCollection(username, password, user_data.get("recodex_token"))
    except InvalidCredentialsException:
        return None, None

    name = recodex.user_data["fullName"]

    recodex_topics, recodex_courses = recodex.get_topics_and_courses(hidden_courses)
    owl_topics, owl_courses = owl.get_topics_and_courses(hidden_courses)
    topics = recodex_topics + owl_topics
    courses = recodex_courses + owl_courses

    topics.sort(key=lambda x: x['deadline'] or datetime(1970,1,1,1,tzinfo=TIMEZONE))
    courses.sort(key=lambda x: x['name'])

    data = {
        "topics": topics,
        "courses": courses,
        "name": name,
        "timestamp": datetime.now(TIMEZONE),
        "hidden_courses": hidden_courses
    }
    
    user_data["cache"] = data
    user_data["owl_token"] = owl.token
    user_data["recodex_token"] = recodex.token
    user_storage.save_user_data(user_data)

    return data, user_data.get("settings", {})