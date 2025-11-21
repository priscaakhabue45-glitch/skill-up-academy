import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import DashboardHome from './DashboardHome';
import Modules from './Modules';
import Accountability from './Accountability';
import Assignments from './Assignments';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'modules' | 'accountability' | 'assignments'>('dashboard');

  const handleNavigation = (view: 'dashboard' | 'modules' | 'accountability' | 'assignments') => {
    setCurrentView(view);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    navigate('/');
  };

  return (
    <div className="student-dashboard">
      {/* Left Sidebar - Collapsed in modules view */}
      <aside className={`dashboard-sidebar ${currentView === 'modules' ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {currentView !== 'modules' ? (
            <h3 className="logo-text">Skill Up Academy</h3>
          ) : (
            <h3 className="logo-text">SA</h3>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('dashboard')}
            title="Dashboard"
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentView === 'modules' ? 'active' : ''}`}
            onClick={() => handleNavigation('modules')}
            title="Modules"
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Modules</span>
          </button>
          <button
            className={`nav-item ${currentView === 'assignments' ? 'active' : ''}`}
            onClick={() => handleNavigation('assignments')}
            title="Assignments"
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Assignments</span>
          </button>
          <button
            className={`nav-item ${currentView === 'accountability' ? 'active' : ''}`}
            onClick={() => handleNavigation('accountability')}
            title="Accountability Tracker"
          >
            <span className="nav-icon">✍️</span>
            <span className="nav-text">Accountability Tracker</span>
          </button>
          <a
            href="https://chat.whatsapp.com/Jrm8WYLC3XgKobhMTERlv8"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            title="Community"
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Community</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={toggleDarkMode} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <span className="nav-icon">{isDarkMode ? '☀️' : '🌙'}</span>
            <span className="nav-text">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="nav-item" title="Settings">
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${currentView === 'modules' ? 'collapsed-sidebar' : ''}`}>
        {currentView === 'dashboard' && <DashboardHome onNavigate={handleNavigation} />}
        {currentView === 'modules' && <Modules />}
        {currentView === 'assignments' && <Assignments />}
        {currentView === 'accountability' && <Accountability />}
      </main>

      <style>{`
        .student-dashboard {
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
          transition: width var(--transition-normal);
          z-index: 50;
        }

        .dashboard-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: var(--spacing-xl);
          border-bottom: 1px solid var(--color-gray-200);
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .logo-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.25rem;
          margin: 0;
          white-space: nowrap;
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
          white-space: nowrap;
          overflow: hidden;
        }

        .dashboard-sidebar.collapsed .nav-item {
          padding: var(--spacing-md);
          justify-content: center;
        }

        .dashboard-sidebar.collapsed .nav-text {
          display: none;
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
          min-width: 24px;
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
          transition: margin-left var(--transition-normal);
        }

        .dashboard-main.collapsed-sidebar {
          margin-left: 80px;
          padding: 0;
          max-width: 100%;
        }

        @media (max-width: 1024px) {
          .dashboard-sidebar {
            width: 80px;
          }
          
          .dashboard-sidebar .nav-text {
            display: none;
          }
          
          .dashboard-sidebar .logo-text {
             font-size: 0.875rem;
          }

          .dashboard-main {
            margin-left: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
