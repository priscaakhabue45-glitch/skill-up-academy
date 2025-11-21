import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface DashboardHomeProps {
  onNavigate: (view: 'dashboard' | 'modules' | 'accountability' | 'assignments') => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { profile } = useAuth();
  const userName = profile?.full_name?.split(' ')[0] || 'Student';
  const currentWeek = 1;
  const currentModule = 1;
  const totalModules = 14;

  const [streak, setStreak] = useState(0);
  const [moduleData, setModuleData] = useState({
    title: 'Introduction to Digital Skills',
    description: 'Learn the foundations of digital literacy and online learning'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch Module 1 Data
        const { data: moduleResult, error: moduleError } = await supabase
          .from('modules')
          .select('title, description')
          .eq('week_number', 1)
          .maybeSingle();

        if (!moduleError && moduleResult) {
          setModuleData(moduleResult);
        }

        // Fetch Streak
        const { data: logs, error: logsError } = await supabase
          .from('daily_logs')
          .select('log_date')
          .eq('student_id', profile.id)
          .order('log_date', { ascending: false });

        if (!logsError && logs) {
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const loggedDates = new Set(logs.map(l => l.log_date));

          let currentStreak = 0;

          // If not logged today and not logged yesterday, streak is broken (0)
          if (!loggedDates.has(today) && !loggedDates.has(yesterday)) {
            setStreak(0);
            return;
          }

          // If today is logged, start from today. If not, start from yesterday.
          let dateIterator = loggedDates.has(today) ? new Date() : new Date(Date.now() - 86400000);

          while (true) {
            const dateStr = dateIterator.toISOString().split('T')[0];
            if (loggedDates.has(dateStr)) {
              currentStreak++;
              dateIterator.setDate(dateIterator.getDate() - 1);
            } else {
              break;
            }
          }
          setStreak(currentStreak);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [profile?.id]);

  return (
    <div className="dashboard-home animate-fadeIn">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {userName}! 🎉</h1>
          <p className="welcome-subtitle">You're on a roll! Keep up the great work.</p>
        </div>
        <div className="welcome-illustration">
          <img src="/welcome-illustration.svg" alt="Learning illustration" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section card">
        <div className="flex justify-between items-center mb-md">
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Your Progress</h3>
            <p style={{ color: 'var(--color-gray-600)', margin: 0 }}>
              You are currently in Week {currentWeek} / Module {currentModule}
            </p>
          </div>
          <div className="progress-percentage">
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {Math.round((currentModule / totalModules) * 100)}%
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(currentModule / totalModules) * 100}%` }}></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card card" onClick={() => onNavigate('modules')}>
            <span className="action-icon">▶️</span>
            <h4>Resume Learning</h4>
            <p>Continue where you left off</p>
          </button>
          <button className="action-card card" onClick={() => onNavigate('accountability')}>
            <span className="action-icon">✅</span>
            <h4>Check Accountability</h4>
            <p>Log your daily progress</p>
          </button>
          <button className="action-card card" onClick={() => onNavigate('assignments')}>
            <span className="action-icon">📝</span>
            <h4>Submit Assignments</h4>
            <p>Complete and submit your work</p>
          </button>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="learning-path">
        <h3 className="section-title">Learning Path</h3>
        <div className="current-module-banner">
          <div className="module-info">
            <span className="badge badge-primary">Week {currentWeek}</span>
            <h2 style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
              {moduleData.title}
            </h2>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-lg)' }}>
              {moduleData.description}
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('modules')}>
              Continue Learning →
            </button>
          </div>
          <div className="module-stats">
            <div className="stat-box">
              <h4>5/7</h4>
              <p>Lectures</p>
            </div>
            <div className="stat-box">
              <h4>72%</h4>
              <p>Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Accountability Preview */}
        <div className="accountability-card card">
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Accountability</h3>
          <div className="streak-display">
            <span className="streak-icon">🔥</span>
            <div>
              <h2 style={{ color: 'var(--color-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                {streak} Days
              </h2>
              <p style={{ color: 'var(--color-gray-600)', margin: 0 }}>Current Streak</p>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
            onClick={() => onNavigate('accountability')}
          >
            Check-in Today
          </button>
        </div>

        {/* Explore Section */}
        <div className="explore-section">
          <h3 className="section-title">Explore</h3>
          <div className="explore-grid">
            <button className="explore-card card clickable">
              <span className="explore-icon">👥</span>
              <h4>Community</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>Join discussions</p>
            </button>
            <div className="explore-card card">
              <span className="explore-icon">🏆</span>
              <h4>Certificates</h4>
              <span className="badge badge-warning">Coming Soon</span>
            </div>
            <div className="explore-card card">
              <span className="explore-icon">💼</span>
              <h4>Portfolio</h4>
              <span className="badge badge-warning">Coming Soon</span>
            </div>
            <div className="explore-card card">
              <span className="explore-icon">📚</span>
              <h4>Resources</h4>
              <span className="badge badge-warning">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
        }

        .section-title {
          margin-bottom: var(--spacing-lg);
          color: var(--color-gray-900);
        }

        /* Welcome Banner */
        .welcome-banner {
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--color-white);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          position: relative;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: rgba(255, 168, 0, 0.2);
          border-radius: 50%;
          filter: blur(60px);
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-sm);
          color: var(--color-white);
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          opacity: 0.95;
          margin: 0;
        }

        .welcome-illustration img {
          max-width: 250px;
          height: auto;
        }

        /* Progress Section */
        .progress-section {
          background: var(--color-white);
        }

        /* Quick Actions */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
        }

        .action-card {
          text-align: center;
          cursor: pointer;
          background: var(--color-white);
          border: 2px solid transparent;
          transition: all var(--transition-normal);
        }

        .action-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-4px);
        }

        .action-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: var(--spacing-md);
        }

        .action-card h4 {
          margin-bottom: var(--spacing-sm);
        }

        .action-card p {
          color: var(--color-gray-600);
          font-size: 0.875rem;
          margin: 0;
        }

        /* Learning Path */
        .current-module-banner {
          background: linear-gradient(135deg, rgba(66, 141, 255, 0.1) 0%, rgba(255, 168, 0, 0.1) 100%);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .module-info {
          flex: 1;
        }

        .module-stats {
          display: flex;
          gap: var(--spacing-xl);
        }

        .stat-box {
          text-align: center;
          padding: var(--spacing-lg);
          background: var(--color-white);
          border-radius: var(--radius-lg);
          min-width: 100px;
        }

        .stat-box h4 {
          font-size: 2rem;
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-box p {
          color: var(--color-gray-600);
          font-size: 0.875rem;
          margin: 0;
        }

        /* Bottom Grid */
        .bottom-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--spacing-2xl);
        }

        .accountability-card {
          background: var(--color-white);
        }

        .streak-display {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .streak-icon {
          font-size: 4rem;
        }

        /* Explore Section */
        .explore-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .explore-card {
          text-align: center;
          background: var(--color-white);
          position: relative;
        }

        .explore-card.clickable {
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-normal);
        }

        .explore-card.clickable:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .explore-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: var(--spacing-md);
        }

        .explore-card h4 {
          margin-bottom: var(--spacing-sm);
        }

        @media (max-width: 1200px) {
          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .module-stats {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .welcome-banner {
            flex-direction: column;
            text-align: center;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .current-module-banner {
            flex-direction: column;
            text-align: center;
          }

          .module-stats {
            flex-direction: row;
            margin-top: var(--spacing-lg);
          }

          .explore-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
