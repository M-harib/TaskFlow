# TaskFlow – Full-Stack To-Do App

TaskFlow is a **full-stack productivity application** designed to help users manage tasks efficiently. It features smart task management, secure authentication, interactive dashboards, and a responsive interface. Built with **Flask, React, SQLite, JWT, and Chart.js**, TaskFlow enhances workflow, organization, and user engagement.

## Features

- **Task Management:** Create, read, update, and delete tasks with ease.
- **Secure Authentication:** User login and registration secured with JWT and bcrypt password hashing.
- **Responsive Frontend:** React UI with dynamic task filtering, dark mode toggle, and mobile-friendly design.
- **Analytics Dashboard:** Interactive charts using Chart.js to track task completion and productivity.
- **Persistent Storage:** SQLite database ensures all tasks are saved securely.
- **RESTful API:** Flask backend provides modular and scalable API endpoints.

## Tech Stack

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Flask, Python
- **Database:** SQLite
- **Authentication:** JWT, bcrypt
- **Visualization:** Chart.js
- **Tools:** Git, VS Code, npm, pip

## Installation

1. **Clone the repository**
bash
git clone https://github.com/M-harib/TaskFlow.git
cd TaskFlow
2. **Setup Backend**
Copy code
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
3. **Run Flask Server**
Copy code
export FLASK_APP=app.py  # Linux/Mac
set FLASK_APP=app.py     # Windows
flask run
4. **Setup Frontend**
Copy code
cd ../frontend
npm install
npm start
The app should now be running at http://localhost:3000.


## Usage

-Register a new account or login with existing credentials.
-Add tasks with due dates and categories.
-Mark tasks as completed or update them.
-View productivity statistics and task completion trends in the dashboard.
