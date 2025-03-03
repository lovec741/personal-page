from flask import Flask, render_template, request, session, redirect, url_for
from datetime import datetime
from app import assignments
from flask_session import Session
from cachelib import FileSystemCache
import json

from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='../static', template_folder='../templates')
app.config["SESSION_TYPE"] = "cachelib"
app.config['SESSION_CACHELIB'] = FileSystemCache(os.path.join(os.path.dirname(__file__), '../cache'))
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

Session(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assignments/login')
def assignments_login():
    return render_template("assignments/login.jinja")


@app.route('/assignments', methods=["GET", "POST"])
def assignments_overview():
    if request.method == "GET":
        if "name" in session:
            now = datetime.now()
            name = session.pop("name") 
            topics = session.pop("topics") 
            courses = session.pop("courses") 
            upcoming_topics = [topic for topic in topics if topic["deadline"] and topic["deadline"] > now]
            no_deadline_topics = [topic for topic in topics if not topic["deadline"]]
            old_topics = reversed([topic for topic in topics if topic["deadline"] and topic["deadline"] < now])
            return render_template("assignments/overview.jinja", name=name, courses=courses, upcoming_topics=upcoming_topics, no_deadline_topics=no_deadline_topics, old_topics=old_topics, now=now)
        else:
            return render_template("assignments/loading.jinja")

    hidden_courses = set(json.loads(request.form["hiddenCourses"])) if request.form["hiddenCourses"] else []
    name, topics, courses = assignments.get_all_topics_and_courses(request.form["username"], request.form["password"])
    if not name:
        return redirect(url_for("assignments_login", logout=1))
    session["name"] = name
    session["topics"] = [topic for topic in topics if topic["course"]["url"] not in hidden_courses]
    session["courses"] = courses
    return redirect(url_for("assignments_overview"))


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
