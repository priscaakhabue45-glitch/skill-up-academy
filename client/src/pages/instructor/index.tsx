import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Overview from './Overview';
import Courses from './Courses';
import Students from './Students';
import Grading from './Grading';
import Analytics from './Analytics';

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'students' | 'assignments' | 'analytics'>('dashboard');

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="instructor-dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h3 className="logo-text">Skill Up Instructor</h3>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        <span>Overview</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'courses' ? 'active' : ''}`}
                        onClick={() => setCurrentView('courses')}
                    >
                        <span className="nav-icon">📚</span>
                        <span>My Courses</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'students' ? 'active' : ''}`}
                        onClick={() => setCurrentView('students')}
                    >
                        <span className="nav-icon">👥</span>
                        <span>Students</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'assignments' ? 'active' : ''}`}
                        onClick={() => setCurrentView('assignments')}
                    >
                        <span className="nav-icon">📝</span>
                        <span>Assignments</span>
                        <span className="badge badge-warning" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>5</span>
                    </button>
                    <button
                        className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
                        onClick={() => setCurrentView('analytics')}
                    >
                        <span className="nav-icon">📈</span>
                        <span>Analytics</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>Settings</span>
                    </button>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {currentView === 'dashboard' && <Overview onViewChange={setCurrentView} />}
                {currentView === 'courses' && <Courses />}
                {currentView === 'students' && <Students />}
                {currentView === 'assignments' && <Grading />}
                {currentView === 'analytics' && <Analytics />}
            </main>

            <style>{`
        .instructor-dashboard {
          display: flex;
          min-height: 100vh;
          background: var(--color-gray-50);
        }

        .dashboard-sidebar {
          width: 280px;
          background: var(--color-white);
          border-right: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 50;
        }

        .sidebar-header {
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .logo-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.25rem;
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: transparent;
          border: none;
          border-radius: var(--radius-lg);
          color: var(--color-gray-700);
          font-family: var(--font-secondary);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background: var(--color-gray-100);
          color: var(--color-primary);
        }

        .nav-item.active {
          background: var(--gradient-primary);
          color: var(--color-white);
          box-shadow: var(--shadow-md);
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .sidebar-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }

        .dashboard-main {
          margin-left: 280px;
          flex: 1;
          padding: var(--spacing-2xl);
          max-width: 1400px;
        }

        /* Shared View Styles */
        .view-header {
          margin-bottom: var(--spacing-2xl);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-title {
          font-size: 2rem;
          color: var(--color-gray-900);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .view-subtitle {
          color: var(--color-gray-600);
          margin: 0;
        }

        .card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 1024px) {
          .dashboard-sidebar {
            width: 80px;
          }
          
          .nav-item span:not(.nav-icon):not(.badge) {
            display: none;
          }

          .logo-text {
            font-size: 0.8rem;
          }

          .dashboard-main {
            margin-left: 80px;
          }
        }
      `}</style>
        </div>
    );
};

export default InstructorDashboard;
