import React, { useState, useEffect } from 'react';
import './App.css';

// ====== VICTOR AI FRONTEND ======
// Production-ready multi-agent system UI

const VictorAI = () => {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDashboard, setUserDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [deliveryFormat, setDeliveryFormat] = useState('text');
  const [userId] = useState(`user-${Date.now()}`);

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      console.log('✅ Backend healthy:', data);
    } catch (error) {
      console.log('❌ Backend offline');
    }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!currentTask.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/task/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId
        },
        body: JSON.stringify({
          description: currentTask,
          delivery_format: deliveryFormat
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setTasks([data, ...tasks]);
        setCurrentTask('');
        alert('✅ Task submitted successfully!');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
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
          onClick={() => setActiveTab('dashboard')}
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
                placeholder="Describe your task..."
                rows={6}
                disabled={loading}
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
                disabled={loading || !currentTask.trim()}
                className="submit-btn"
              >
                {loading ? '⏳ Processing...' : '🚀 Submit Task'}
              </button>
            </form>

            {tasks.length > 0 && (
              <div className="recent-results">
                <h3>📊 Recent Results</h3>
                {tasks.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="result-card">
                    <div className="result-status">
                      ✅ Completed
                    </div>
                    <div className="result-preview">
                      Task {idx + 1}
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
                <div className="stat-value">100</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">✅ Tasks Completed</div>
                <div className="stat-value">{tasks.length}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="victor-footer">
        <p>Victor AI v1.0 © 2024 - Enterprise Multi-Agent Platform</p>
      </footer>
    </div>
  );
};

export default VictorAI;