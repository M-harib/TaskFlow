import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

const motivationalMessages = [
  "You got this! 💪",
  "One step at a time!",
  "Keep pushing, success is near!",
  "Tasks today, freedom tomorrow!",
  "Stay focused and finish strong!"
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showSignup, setShowSignup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState("");

  // Login / Logout
  const login = (jwtToken) => { localStorage.setItem('token', jwtToken); setToken(jwtToken); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); setTasks([]); };

  // Fetch tasks
  const fetchTasks = () => {
    if (!token) return;
    fetch('http://127.0.0.1:5000/tasks', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => console.error('Fetch tasks error:', err));
  };

  useEffect(() => { fetchTasks(); }, [token]);

  // Random AI suggestion popup every 20 sec
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setAiSuggestion(msg);
      setTimeout(() => setAiSuggestion(""), 5000);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Task CRUD
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    fetch('http://127.0.0.1:5000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: title.trim(), description: description.trim(), deadline })
    }).then(() => { setTitle(''); setDescription(''); setDeadline(''); fetchTasks(); })
      .catch(err => console.error('Add task error:', err));
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDeadline(task.deadline || "");
  };

  const saveEdit = (taskId) => {
    fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: editTitle, description: editDescription, deadline: editDeadline })
    }).then(() => { setEditingTaskId(null); setEditTitle(''); setEditDescription(''); setEditDeadline(''); fetchTasks(); })
      .catch(err => console.error('Edit task error:', err));
  };

  const completeTask = (task) => {
    fetch(`http://127.0.0.1:5000/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'completed' })
    }).then(() => fetchTasks())
      .catch(err => console.error('Complete task error:', err));
  };

  const deleteTask = (taskId) => {
    fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchTasks())
      .catch(err => console.error('Delete task error:', err));
  };

  if (!token) {
    return showSignup ?
      <SignupForm onSignupSuccess={() => setShowSignup(false)} /> :
      <LoginForm onLogin={login} showSignup={() => setShowSignup(true)} />;
  }

  // Filtered tasks
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Progress chart data
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{ label: 'Tasks', data: [completedCount, tasks.length - completedCount], backgroundColor: ['#16a34a', '#3b82f6'] }]
  };

  return (
    <div className="min-h-screen">
      <div className="container">
        <div className="header">TaskFlow To-Do List</div>

        {/* AI Popup */}
        {aiSuggestion && <div className="ai-popup">{aiSuggestion}</div>}

        {/* Add Task */}
        <form onSubmit={handleAddTask} className="form">
          <div className="form-row">
            <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <input type="text" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <button type="submit" className="btn-blue">Add Task</button>
        </form>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="form mt-2"
        />

        {/* Progress Chart */}
        <div className="mt-4">
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        {/* Task List */}
        <ul className="task-list mt-4">
          {filteredTasks.map(task => {
            const overdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';
            return (
              <li key={task.id} className={`task ${task.status === 'completed' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
                <div className="flex-1">
                  {editingTaskId === task.id ? (
                    <>
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1" />
                      <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className="flex-1" />
                      <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
                    </>
                  ) : (
                    <span><strong>{task.title}</strong> {task.description && `— ${task.description}`} {task.deadline && `(Due: ${task.deadline})`}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {editingTaskId === task.id ? (
                    <button onClick={() => saveEdit(task.id)} className="btn-green">Save</button>
                  ) : (
                    <button onClick={() => startEdit(task)} className="btn-yellow">Edit</button>
                  )}
                  <button onClick={() => completeTask(task)} disabled={editingTaskId === task.id} className="btn-green">Complete</button>
                  <button onClick={() => deleteTask(task.id)} className="btn-red">Delete</button>
                </div>
              </li>
            );
          })}
        </ul>

        <button onClick={logout} className="btn-gray mt-4">Logout</button>
      </div>
    </div>
  );
}

// Login Form
function LoginForm({ onLogin, showSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => onLogin(data.access_token))
      .catch(() => alert('Login failed'));
  };
  return (
    <div className="min-h-screen flex-center">
      <div className="container">
        <div className="header">Login</div>
        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-blue">Login</button>
        </form>
        <button onClick={showSignup} className="btn-gray mt-4">Create an account</button>
      </div>
    </div>
  );
}

// Signup Form
function SignupForm({ onSignupSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      .then(() => onSignupSuccess())
      .catch(() => alert('Signup failed'));
  };
  return (
    <div className="min-h-screen flex-center">
      <div className="container">
        <div className="header">Sign Up</div>
        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-green">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default App;
