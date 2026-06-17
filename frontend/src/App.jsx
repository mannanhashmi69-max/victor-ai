import React, { useState, useEffect } from 'react';
import './App.css';

const VictorAI = () => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [deliveryFormat, setDeliveryFormat] = useState('text');
  
  // State for Auth and Project IDs required by the backend
  const [token, setToken] = useState('');
  const [projectId, setProjectId] = useState('');
  const [credits, setCredits] = useState(0);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    setupSession();
  }, []);

  // Backend requires full JWT Authentication and a valid Project
  const setupSession = async () => {
    try {
      // 1. Register/Login a temporary user to get a valid JWT
      const authRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `user-${Date.now()}@victor.ai`,
          password: 'securepassword123',
          username: 'Developer'
        })
      });
      const authData = await authRes.json();
      
      if (authData.token) {
        setToken(authData.token);
        setCredits(authData.credits);

        // 2. Create a default project for this authenticated session
        const projectRes = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`
          },
          body: JSON.stringify({
            name: 'Default Project',
            description: 'Automated workspace for UI submissions'
          })
        });
        const projectData = await projectRes.json();
        if (projectData.success) {
          setProjectId(projectData.project.id);
          console.log('✅ Auth and Project initialized successfully!');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize authenticated session:', error);
    }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!currentTask.trim() || !token || !projectId) {
      alert('Please wait until the session is fully initialized.');
      return;
    }

    setLoading(true);
    try {
      // Corrected API endpoint: /api/tasks
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Passing the required JWT
        },
        // Match payload properties to backend expectations
        body: JSON.stringify({
          projectId: projectId,
          prompt: currentTask,
          format: deliveryFormat
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // The backend processes asynchronously and returns a 'processing' status
        setTasks([data, ...tasks]);
        setCurrentTask('');
        alert('🚀 Task submitted and processing in background!');
        
        // Refresh usage details to update credits display
        fetchUsage();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/usage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCredits(data.creditsAvailable);
    } catch (err) {
      console.error('Could not fetch updated credits', err);
    }
  };

  return (
    <div className="victor-ai-container">
      <header className="victor-header">
        <h1>🌿 VICTOR AI</h1>
        <p>Multi-Agent AI Orchestration System</p>
      </header>

      <nav className="victor-nav">
        <button 
          className={`nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          📝 Submit Task
        </button>
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            fetchUsage();
          }}
        >
          📊 Dashboard
        </button>
      </nav>

      <main className="victor-main">
        {activeTab === 'submit' && (
          <div className="panel task-panel">
            <h2>📝 Submit New Task</h2>
            <form onSubmit={submitTask}>
              <textarea
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Describe your task (e.g., 'generate a summary of web3 trends')..."
                rows={6}
                disabled={loading || !projectId}
              />
              
              <div className="format-selector">
                <label>Delivery Format:</label>
                <select value={deliveryFormat} onChange={(e) => setDeliveryFormat(e.target.value)}>
                  <option value="text">📄 Plain Text</option>
                  <option value="json">📊 JSON</option>
                  <option value="markdown">📝 Markdown</option>
                  <option value="html">🌐 HTML</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading || !currentTask.trim() || !projectId}
                className="submit-btn"
              >
                {!projectId ? '⏳ Initializing Session...' : loading ? '⏳ Processing...' : '🚀 Submit Task'}
              </button>
            </form>

            {tasks.length > 0 && (
              <div className="recent-results">
                <h3>📊 Recent Submissions</h3>
                {tasks.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="result-card">
                    <div className="result-status" style={{ color: '#00d084' }}>
                      Status: {task.status.toUpperCase()}
                    </div>
                    <div className="result-preview">
                      ID: {task.taskId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="panel dashboard-panel">
            <h2>📊 User Dashboard</h2>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="stat-label">💵 Credits Available</div>
                <div className="stat-value">{credits}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">✅ Tasks Processed</div>
                <div className="stat-value">{tasks.length}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="victor-footer">
        <p>Victor AI v1.0 © 2026 - Enterprise Multi-Agent Platform</p>
      </footer>
    </div>
  );
};

export default VictorAI;
