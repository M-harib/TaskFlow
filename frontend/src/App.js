import React, { useState, useEffect } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ===== ERROR BOUNDARY =====
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ textAlign: 'left' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== LOGIN FORM =====
function LoginForm({ onLogin, switchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('${API_URL}/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.access_token) onLogin(data.access_token, username);
      else alert(data.message || 'Login failed');
    } catch {
      alert('Login failed');
    }
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
        <button onClick={switchToSignup} className="btn-gray mt-4">Create an account</button>
      </div>
    </div>
  );
}

// ===== SIGNUP FORM =====
function SignupForm({ switchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('${API_URL}/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) switchToLogin();
      else {
        const data = await res.json();
        alert(data.message || 'Signup failed');
      }
    } catch {
      alert('Signup failed');
    }
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
        <button onClick={switchToLogin} className="btn-gray mt-4">Back to Login</button>
      </div>
    </div>
  );
}

// ===== APP COMPONENT =====
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authMode, setAuthMode] = useState('login');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Low');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState('Low');
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem('darkMode') === 'true';
});


  const motivationalMessages = [
    "You can do it!",
    "Every task completed is a victory!",
    "Stay focused and crush it!",
    "One step at a time!",
    "Productivity is power!",
  ];

  const login = (jwtToken, user) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('username', user);
    setToken(jwtToken);
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
    setTasks([]);
  };

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch('${API_URL}/tasks', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.status === 401) return logout();
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    generateAiSuggestion();
  }, [token]);

  useEffect(() => {
  if (darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}, [darkMode]);


  const generateAiSuggestion = () => {
    const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setAiSuggestion(String(randomMsg || 'Stay productive!'));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch('${API_URL}/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), deadline, priority }),
      });
      if (res.status === 401) return logout();
      setTitle(''); setDescription(''); setDeadline(''); setPriority('Low');
      fetchTasks(); generateAiSuggestion();
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditDeadline(task.deadline || '');
    setEditPriority(task.priority || 'Low');
  };

  const saveEdit = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, description: editDescription, deadline: editDeadline, priority: editPriority }),
      });
      if (res.status === 401) return logout();
      setEditingTaskId(null); setEditTitle(''); setEditDescription(''); setEditDeadline(''); setEditPriority('Low');
      fetchTasks();
    } catch (err) {
      console.error('Edit task error:', err);
    }
  };

  const completeTask = async (task) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.status === 401) return logout();
      fetchTasks();
    } catch (err) {
      console.error('Complete task error:', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return logout();
      fetchTasks();
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const chartData = {
    labels: ['Pending', 'Completed'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          tasks.filter(t => t.status !== 'completed').length,
          tasks.filter(t => t.status === 'completed').length
        ],
        backgroundColor: ['#3b82f6', '#6b7280']
      }
    ]
  };

  if (!token) {
    return authMode === 'login'
      ? <LoginForm onLogin={login} switchToSignup={() => setAuthMode('signup')} />
      : <SignupForm switchToLogin={() => setAuthMode('login')} />;
  }

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="top-header">
          <div className="username-display">
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>TaskFlow - Hello {username}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6b7280' }}>
              Personal To-Do List
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-gray"
              onClick={() => {
                setDarkMode(prev => {
                  localStorage.setItem('darkMode', !prev);
                  return !prev;
                });
              }}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button className="btn-red" onClick={logout}>Logout</button>
          </div>
        </div>


        {/* ADD TASK */}
        <form onSubmit={handleAddTask} className="form mb-6">
          <input type="text" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button type="submit" className="btn-blue">Add Task</button>
        </form>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="form mb-4"
        />

        {/* TASK COLUMNS */}
        <div className="task-columns-container">
          {/* Pending */}
          <div className="task-column">
            <div className="task-column-header">
              <h2 className="text-lg font-semibold">Pending Tasks</h2>
            </div>
            <div className="task-column-body">
              {tasks.filter(t => t.status !== 'completed' && t.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(task => (
                  <div key={task.id} className="task-card">
                    <div className={`priority priority-${task.priority?.toLowerCase()}`}></div>
                    {editingTaskId === task.id ? (
                      <>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        <input value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                        <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
                        <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                          <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                        <button className="btn-green mt-2" onClick={() => saveEdit(task.id)}>Save</button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        {/* BADGES */}
                        <div className="badges">
                          {task.deadline && <span className="badge badge-deadline">Due: {task.deadline}</span>}
                        </div>
                        <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => completeTask(task)} className="btn-green">Complete</button>
                          <button onClick={() => deleteTask(task.id)} className="btn-red">Delete</button>
                          <button onClick={() => startEdit(task)} className="btn-gray">Edit</button>
                        </div>
                      </>
                    )}
                  </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="task-column">
            <div className="task-column-header">
              <h2 className="text-lg font-semibold">Completed Tasks</h2>
            </div>
            <div className="task-column-body">
              {tasks.filter(t => t.status === 'completed').map(task => (
                <div key={task.id} className="task-card completed">
                  <h3 className="font-semibold">{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  {task.deadline && <span className="badge badge-deadline">Completed by: {task.deadline}</span>}
                  <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY CHART */}
        <div className="summary-chart mb-6">
          <h2 className="text-lg font-semibold mb-2">Summary</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        {/* AI MOTIVATION */}
        {aiSuggestion && (
          <div className="ai-popup">{aiSuggestion}</div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
