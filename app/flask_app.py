from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from datetime import datetime
from app import assignments
from flask_session import Session
from cachelib import FileSystemCache
import json
from cryptography.fernet import Fernet
import base64
import hashlib


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
        if "data" in session:
            now = datetime.now()
            (name, topics, courses, data_timestamp) = session.pop("data") 
            upcoming_topics = [topic for topic in topics if topic["deadline"] and topic["deadline"] > now]
            no_deadline_topics = [topic for topic in topics if not topic["deadline"]]
            old_topics = reversed([topic for topic in topics if topic["deadline"] and topic["deadline"] < now])
            return render_template("assignments/overview.jinja", name=name, courses=courses, upcoming_topics=upcoming_topics, no_deadline_topics=no_deadline_topics, old_topics=old_topics, now=now, data_timestamp=data_timestamp)
        else:
            return render_template("assignments/loading.jinja")
    
    hidden_courses = set(json.loads(request.form["hiddenCourses"])) if request.form["hiddenCourses"] else []
    password = decrypt_password(request.form["encryptedPassword"])
    name, topics, courses, timestamp = assignments.get_all_topics_and_courses(request.form["username"], password, request.form["ignoreCache"] == "true")
    if not name: # could fetch userdata from owl
        return redirect(url_for("assignments_login", logout=1))
    topics = [topic for topic in topics if topic["course"]["url"] not in hidden_courses]
    session["data"] = (name, topics, courses, timestamp)
    return redirect(url_for("assignments_overview"))

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

@app.route('/encrypt-password', methods=["POST"])
def encrypt_password_endpoint():   
    data = request.get_json()
    password = data.get("password")    
    encrypted = encrypt_password(password)
    return jsonify({"encrypted_password": encrypted})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
