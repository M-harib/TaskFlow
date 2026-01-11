# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import text

# ----- App setup -----
app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')

# Handle DATABASE_URL from Render (postgres:// -> postgresql://)
database_url = os.getenv('DATABASE_URL', 'sqlite:///taskflow.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

frontend_url = os.getenv('FRONTEND_URL', 'https://taskflow-nu-two.vercel.app')
cors_origins = [
    "http://localhost:3000",
    "https://taskflow-nu-two.vercel.app",
    "https://taskflow-l4m8.onrender.com"
]

CORS(
    app,
    resources={r"/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type", "Authorization"]
    }},
    supports_credentials=True
)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Initialize database tables on startup (for Render/production)
with app.app_context():
    try:
        db.create_all()
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")

# ---------------- MODELS ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(500))
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.String(20))
    priority = db.Column(db.String(10), default='Low')

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))


# ---------------- ROUTES ----------------
@app.route('/')
def home():
    return "TaskFlow API is running!"

# Simple DB health check
@app.route('/health')
def health():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Handle preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        return response


# TASKS
@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({"message": "No JSON data received"}), 400
    title = data.get('title')
    description = data.get('description', '').strip()
    deadline = data.get('deadline', '').strip()
    priority = data.get('priority', 'Low')
    if not title or not title.strip():
        return jsonify({"message": "Title is required"}), 400
    new_task = Task(title=title.strip(), description=description, deadline=deadline, priority=priority, user_id=current_user_id)
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task created successfully!", "task": {
        "id": new_task.id, "title": new_task.title, "description": new_task.description,
        "status": new_task.status, "deadline": new_task.deadline, "priority": new_task.priority
    }}), 201


@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=current_user_id).all()
    output = [{
        "id": t.id, "title": t.title, "description": t.description, "status": t.status,
        "deadline": t.deadline, "priority": t.priority, "created_at": t.created_at.isoformat()
    } for t in tasks]
    return jsonify(output), 200


@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    if not task:
        return jsonify({"message": "Task not found"}), 404
    data = request.get_json() or {}
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.deadline = data.get('deadline', task.deadline)
    task.priority = data.get('priority', task.priority)
    db.session.commit()
    return jsonify({"message": "Task updated successfully!"}), 200


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    if not task:
        return jsonify({"message": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully!"}), 200


# AUTH
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid username or password"}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200


# ---------------- RUN ----------------
if __name__ == '__main__':
    # create tables on startup (useful on small apps; for production consider migrations)
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') in ('1', 'true', 'True')
    app.run(host='0.0.0.0', port=port, debug=debug)
