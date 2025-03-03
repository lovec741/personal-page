from datetime import datetime, timedelta
from typing import Dict
import requests
from bs4 import BeautifulSoup
from http.cookies import SimpleCookie
from urllib.parse import quote_plus, urlparse, parse_qs
import jwt

import os
import pickle
import hashlib


HIDE_COURSES = set([
    "Úvod do počítačových sítí (St, 15:40, N1)"
])

CAS_URL = "https://idp.cuni.cz/cas/login?service={}"

RECODEX_BASE_URL = "https://recodex.mff.cuni.cz"
OWL_BASE_URL = "https://owl.mff.cuni.cz"

def cas_login_recodex(username, password):
    cas_url = CAS_URL.format(RECODEX_BASE_URL+"/cas-auth-ext/") 

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
    ticket = parse_qs(urlparse(response.raw.get_redirect_location()).query)["ticket"][0]

    url = RECODEX_BASE_URL+f"/cas-auth-ext/?ticket={quote_plus(ticket)}"
    api_login_response = requests.get(url, allow_redirects=True)

    parsed_url = urlparse(api_login_response.url)
    query_params = parse_qs(parsed_url.query)
    
    sis_api_token = query_params['token'][0]
    url = RECODEX_BASE_URL+"/api/v1/login/cas-uk"
    api_login_response = requests.post(url, data={"token": sis_api_token})

    return api_login_response.json()["payload"]["accessToken"]

def cas_login_owl(username, password):
    cas_url = CAS_URL.format(quote_plus(OWL_BASE_URL+"/acct/login/cas?next=/")) 

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
        return None
    ticket = parse_qs(urlparse(response.raw.get_redirect_location()).query)["ticket"][0]

    url = f"https://owl.mff.cuni.cz/acct/login/cas?next=/&ticket={quote_plus(ticket)}"
    api_login_response = requests.get(url, allow_redirects=False)

    # Extract the owl_session cookie from the response
    cookies = api_login_response.cookies
    token = None
    
    for cookie in cookies:
        if cookie.name == 'owl_session':
            token = cookie.value
            print(f"Found owl_session cookie: {token}")
            break
    
    
    return token

def fetch_and_parse_owl_page(url, token):  
    session = requests.Session()
    cookie = SimpleCookie()
    cookie["owl_session"] = token
    session.cookies.update(cookie)
    
    response = session.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup
    else:
        print(f"Failed to fetch the page. Status code: {response.status_code}")
        return None

def get_this_semester_courses(token):
    soup = fetch_and_parse_owl_page(OWL_BASE_URL+"/", token)
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

def get_topics_for_course(course: Dict[str, str], token):
    soup = fetch_and_parse_owl_page(course['url'], token)
    if soup:
        topics = []
        topics_tables = soup.find_all('table', class_='topics')
        for topics_table in topics_tables:

            rows = topics_table.find_all('tr')

            for row in rows[1:]: # skip header
                cells = row.find_all('td')              
                
                # topic name and link
                topic_link = cells[0].find('a')
                topic_name = topic_link.text
                topic_url = topic_link['href']
                
                deadline = None
                deadline_text = cells[1].contents[0].strip()
                if deadline_text:
                    date_time_part = deadline_text.split('(')[0].strip()
                    deadline = datetime.strptime(date_time_part, '%Y-%m-%d %H:%M')

                    
                points = cells[2].contents[0].strip() or "-"
                points = float(points) if points != "-" else points
                if isinstance(points, float) and points.is_integer():
                    points = int(points)
                
                max_points = cells[3].contents[0].strip() or "?"
                max_points = float(max_points) if max_points != "?" else max_points
                if isinstance(max_points, float) and max_points.is_integer():
                    max_points = int(max_points)
                
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

def get_all_topics_and_courses(username, password):     
    cache_dir = os.path.expanduser("~/.cache/topics")
    cache_file = os.path.join(cache_dir, "topics_cache.pkl")

    hash_obj = hashlib.sha256((username + password).encode())
    hash = hash_obj.hexdigest()
    
    # Create cache directory if it doesn't exist
    os.makedirs(cache_dir, exist_ok=True)
    
    # Check if cache exists and is less than 1 hour old
    if os.path.exists(cache_file):
        with open(cache_file, 'rb') as f:
            data = pickle.load(f)
        if hash in data and data[hash]["timestamp"] < datetime.now() + timedelta(hours=1):
            try:
                print("Using cached topics data")                                        
                return data[hash]["name"], data[hash]["topics"], data[hash]["courses"]
            except (pickle.PickleError, EOFError, AttributeError) as e:
                print(f"Error reading cache: {e}. Fetching fresh data...")
    else:
        data = {}
    # If cache doesn't exist or is old, fetch fresh data
    owl_token = cas_login_owl(username, password)
    if not owl_token:
        return None, None
    recodex_token = cas_login_recodex(username, password)

    decoded_token = jwt.decode(recodex_token, options={"verify_signature": False})
    user_id = decoded_token["sub"]
    name = recodex_get_user_data(recodex_token, user_id)["fullName"]

    courses = get_this_semester_courses(owl_token)
    topics = []
    for course in courses:
        course_topics = get_topics_for_course(course, owl_token)
        if course_topics:
            topics += course_topics

    recodex_topics, recodex_courses = recodex_get_topics_and_courses(recodex_token, user_id)
    if recodex_topics:
        topics += recodex_topics
    courses += recodex_courses
    topics.sort(key=lambda x: x['deadline'] or datetime(1970,1,1,1))

    data[hash] = {
        "topics": topics,
        "courses": courses,
        "name": name,
        "timestamp": datetime.now()
    }
    # Cache the topics
    try:
        with open(cache_file, 'wb') as f:
            pickle.dump(data, f)
        print("Topics cached successfully")
    except Exception as e:
        print(f"Error caching topics: {e}")

    return name, topics, courses

def get_localized_text(texts):
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

def recodex_api_request(method, endpoint, token):
    headers = {"Authorization": "Bearer " + token}
    resp = requests.request(method, RECODEX_BASE_URL+"/api/v1"+endpoint, headers=headers)
    return resp.json()["payload"]

def recodex_get_topics_and_courses(token, user_id):    
    groups = recodex_api_request("GET", "/groups", token)
    
    topics = []
    courses = []
    for group in groups:
        group_localized_text = get_localized_text(group["localizedTexts"])
        group_id = group.get('id')
        course = {
            'name': group_localized_text.get('name'),
            'url': RECODEX_BASE_URL+f"/app/group/{group_id}/assignments",
        }
        courses.append(course)

        assignments = recodex_api_request("GET", "/groups/{}/assignments".format(group_id), token)
        
        for i, assignment in enumerate(assignments, 1):
            localized_text = get_localized_text(assignment["localizedTexts"])
            deadline_timestamp = assignment['firstDeadline']
            deadline = datetime.fromtimestamp(deadline_timestamp)
            # if deadline > datetime.now():
            solutions = recodex_api_request("GET", "/exercise-assignments/{}/users/{}/solutions".format(assignment["id"], user_id), token)
            max_points = assignment['maxPointsBeforeFirstDeadline']
            points = "-"
            for solution in solutions:
                if solution["isBestSolution"]:
                    points = str(solution["actualPoints"]) + ("" if solution["bonusPoints"] == 0 else f"+{solution['bonusPoints']}")
            topic_data = {
                'course': course,
                'name': localized_text.get('name'),
                'url': RECODEX_BASE_URL+f"/app/assignment/{assignment['id']}/user/{user_id}",
                'deadline': deadline,
                'points': points,
                'max_points': max_points,
                'acknowledged': False
            }
            topics.append(topic_data)
    return topics, courses

def recodex_get_user_data(token, user_id):    
    return recodex_api_request("GET", "/users/{}".format(user_id), token)
    