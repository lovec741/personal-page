from flask import Flask, abort, render_template, request, session, redirect, url_for, jsonify
from datetime import datetime
from flask_session import Session
from cachelib import FileSystemCache
from cryptography.fernet import Fernet
import base64
import hashlib
from dotenv import load_dotenv
import os
from zoneinfo import ZoneInfo

from app.storage import UserStorage
from app import assignments

TIMEZONE = ZoneInfo("Europe/Prague")

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
        if "data" in session or "settings" in session:
            now = datetime.now(TIMEZONE)
            data = session.pop("data")
            settings = session.pop("settings")
            topics = data["topics"]
            upcoming_topics = [topic for topic in topics if topic["deadline"] and topic["deadline"] > now]
            no_deadline_topics = [topic for topic in topics if not topic["deadline"]]
            old_topics = reversed([topic for topic in topics if topic["deadline"] and topic["deadline"] < now])
            return render_template(
                "assignments/overview.jinja",
                name=data["name"],
                courses=data["courses"],
                upcoming_topics=upcoming_topics,
                no_deadline_topics=no_deadline_topics,
                old_topics=old_topics,
                now=now,
                data_timestamp=data["timestamp"],
                hidden_courses=settings.get("hidden_courses", [])
            )
        else:
            return render_template("assignments/loading.jinja")
    
    username = request.form["username"]
    password = decrypt_password(request.form["encryptedPassword"])
    if not password:
        abort(401)

    data, settings = assignments.get_all_topics_and_courses(username, password, request.form["ignoreCache"] == "true")
    if not data: # invalid credentials (couldnt get tokens)
        return redirect(url_for("assignments_login", logout=1))
    data["topics"] = [topic for topic in data["topics"] if topic["course"]["url"] not in settings.get("hidden_courses", [])]
    session["data"] = data
    session["settings"] = settings
    return redirect(url_for("assignments_overview"))

@app.route('/assignments/save-settings', methods=["POST"])
def save_settings_endpoint():
    data = request.get_json()
    username = data.get("username")
    password = decrypt_password(data.get("encryptedPassword"))
    if not password:
        abort(401)
    settings = data.get("settings")

    user_storage = UserStorage(username, password)
    user_data = user_storage.load_user_data()
    if "cache" in user_data:
        new_hidden_courses = set(settings.get("hidden_courses", []))
        cache_hidden_courses = set(user_data["cache"].get("hidden_courses", []))

        unhidden_courses = cache_hidden_courses - new_hidden_courses
        if unhidden_courses: # invalidate cache
            print("Some hidden courses were unhidden, invalidating cache")
            user_data.pop("cache")
    user_data["settings"] = settings
    user_storage.save_user_data(user_data)
    return ""

def get_encryption_key():
    digest = hashlib.sha256(app.config["SECRET_KEY"].encode()).digest()
    return base64.urlsafe_b64encode(digest)

def encrypt_password(password):   
    key = get_encryption_key()
    cipher_suite = Fernet(key)
    encrypted_password = cipher_suite.encrypt(password.encode())
    return encrypted_password.decode()

def decrypt_password(encrypted_password):   
    key = get_encryption_key()
    cipher_suite = Fernet(key)
    try:
        decrypted_password = cipher_suite.decrypt(encrypted_password.encode())
        return decrypted_password.decode()
    except Exception:
        return None

@app.route('/assignments/encrypt-password', methods=["POST"])
def encrypt_password_endpoint():   
    data = request.get_json()
    password = data.get("password")    
    encrypted = encrypt_password(password)
    return jsonify({"encrypted_password": encrypted})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
