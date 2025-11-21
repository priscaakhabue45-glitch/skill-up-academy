import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface OverviewProps {
  onViewChange: (view: 'dashboard' | 'courses' | 'students' | 'assignments' | 'analytics') => void;
}

const Overview = ({ onViewChange }: OverviewProps) => {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    submissions: 0
  });
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch Total Students
      const { count: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (studentError) throw studentError;

      // 2. Fetch Active Courses (Modules)
      const { count: courseCount, error: courseError } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      if (courseError) throw courseError;

      // 3. Fetch Total Submissions
      const { count: submissionCount, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true });

      if (submissionError) throw submissionError;

      setStats({
        students: studentCount || 0,
        courses: courseCount || 0,
        submissions: submissionCount || 0
      });

      // 4. Fetch Pending Assignments (Recent 5)
      const { data: pendingData, error: pendingError } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments (title),
          profiles (full_name)
        `)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (pendingError) throw pendingError;

      setPendingAssignments(pendingData || []);

    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overview-view animate-fadeIn">
      <div className="view-header">
        <div>
          <h1 className="view-title">Instructor Overview</h1>
          <p className="view-subtitle">Welcome back! Here's what's happening with your courses.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onViewChange('courses')}>
          + Create New Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon students">👥</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.students}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon courses">📚</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.courses}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon submissions">📝</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.submissions}</h3>
            <p>Total Submissions</p>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Recent Activity / Pending Grading */}
        <div className="section-card card">
          <div className="card-header">
            <h3>Pending Assignments</h3>
            <button className="btn-link" onClick={() => onViewChange('assignments')}>View All</button>
          </div>
          <div className="list-items">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map((submission) => (
                <div key={submission.id} className="list-item">
                  <div className="item-icon">📝</div>
                  <div className="item-details">
                    <h4>{submission.assignments?.title || 'Unknown Assignment'}</h4>
                    <p>Submitted by {submission.profiles?.full_name || 'Unknown Student'} • {new Date(submission.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <button className="btn btn-sm btn-secondary">Grade</button>
                </div>
              ))
            ) : (
              <div className="empty-list">
                <p>No pending assignments to grade.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Replacing Top Courses for now as we don't have course ratings) */}
        <div className="section-card card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="list-items">
            <button className="list-item action-item" onClick={() => onViewChange('courses')}>
              <div className="item-icon">➕</div>
              <div className="item-details">
                <h4>Create New Module</h4>
                <p>Add content for next week</p>
              </div>
            </button>
            <button className="list-item action-item" onClick={() => onViewChange('students')}>
              <div className="item-icon">👥</div>
              <div className="item-details">
                <h4>Manage Students</h4>
                <p>View progress and profiles</p>
              </div>
            </button>
            <button className="list-item action-item" onClick={() => onViewChange('assignments')}>
              <div className="item-icon">✅</div>
              <div className="item-details">
                <h4>Grade All Pending</h4>
                <p>{pendingAssignments.length} assignments waiting</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          position: relative;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.students { background: rgba(66, 141, 255, 0.1); color: var(--color-primary); }
        .stat-icon.courses { background: rgba(255, 168, 0, 0.1); color: var(--color-secondary); }
        .stat-icon.submissions { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }

        .stat-info h3 {
          font-size: 1.75rem;
          margin: 0;
          color: var(--color-gray-900);
        }

        .stat-info p {
          margin: 0;
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--spacing-lg);
        }

        .section-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-card h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .list-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border: 1px solid var(--color-gray-100);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
          background: transparent;
          width: 100%;
          text-align: left;
        }

        .list-item:hover {
          background: var(--color-gray-50);
        }

        .action-item {
          cursor: pointer;
        }

        .item-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1rem;
          color: var(--color-gray-900);
        }

        .item-details p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-weight: 600;
        }

        .empty-list {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--color-gray-500);
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Overview;
