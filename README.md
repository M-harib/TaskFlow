# TaskFlow – Full-Stack To-Do App

TaskFlow is a **full-stack productivity application** designed to help users manage tasks efficiently. It features smart task management, secure authentication, interactive dashboards, and a responsive interface. Built with **Flask, React, PostgreSQL, JWT, and Chart.js**, TaskFlow enhances workflow, organization, and user engagement.

## 🌐 Live Demo

- **Frontend:** https://taskflow-nu-two.vercel.app
- **Backend API:** https://taskflow-l4m8.onrender.com

## Features

- **Task Management:** Create, read, update, and delete tasks with ease.
- **Secure Authentication:** User login and registration secured with JWT and bcrypt password hashing.
- **Responsive Frontend:** React UI with dynamic task filtering, dark mode toggle, and mobile-friendly design.
- **Analytics Dashboard:** Interactive charts using Chart.js to track task completion and productivity.
- **Persistent Storage:** PostgreSQL database ensures all tasks are saved securely.
- **RESTful API:** Flask backend provides modular and scalable API endpoints.
- **Cloud Deployed:** Backend on Render, Frontend on Vercel

## Tech Stack

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Flask, Python
- **Database:** PostgreSQL (Production), SQLite (Development)
- **Authentication:** JWT, bcrypt
- **Visualization:** Chart.js
- **Deployment:** Render (Backend), Vercel (Frontend)
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
   source venv/bin/activate # Linux/Mac
   venv\Scripts\activate # Windows
   pip install -r requirements.txt
3. **Run Flask Server**
   Copy code
   export FLASK_APP=app.py # Linux/Mac
   set FLASK_APP=app.py # Windows
   flask run
4. **Setup Frontend**
   Copy code
   cd ../frontend
   npm install
   npm start
   The app should now be running at http://localhost:3000.

## Usage

- Register a new account or login with existing credentials.
- Add tasks with due dates and categories.
- Mark tasks as completed or update them.
- View productivity statistics and task completion trends in the dashboard.

## Deployment

### Backend (Render)

The backend is deployed on Render with PostgreSQL database:

- Automatic deployments from `main` branch
- Environment variables configured for production
- Database migrations handled automatically

### Frontend (Vercel)

The frontend is deployed on Vercel:

- Connected to GitHub repository
- Automatic deployments on push
- Environment variable `REACT_APP_API_URL` configured

## Environment Variables

### Backend (.env)

```
JWT_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@host/database
FRONTEND_URL=https://taskflow-nu-two.vercel.app
```

### Frontend (.env)

```
REACT_APP_API_URL=https://taskflow-l4m8.onrender.com
```
