import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AccountabilityLog {
  videosCompleted: number;
  notes: string;
  keyLearning: string;
  actionTaken: string;
}

const Accountability = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || 'Student';
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);
  const [totalLogs, setTotalLogs] = useState(0);

  const [formData, setFormData] = useState<AccountabilityLog>({
    videosCompleted: 0,
    notes: '',
    keyLearning: '',
    actionTaken: ''
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [canSubmitToday, setCanSubmitToday] = useState(true);

  useEffect(() => {
    fetchAccountabilityData();
  }, []);

  const fetchAccountabilityData = async () => {
    try {
      setInitialLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Get all logs for this user
      if (!user) return;

      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('student_id', user.id)
        .order('log_date', { ascending: false });

      if (error) throw error;

      if (logs) {
        setTotalLogs(logs.length);

        // Check if submitted today
        const today = new Date().toISOString().split('T')[0];
        const todayLog = logs.find((log: any) => log.log_date === today);

        if (todayLog) {
          setCanSubmitToday(false);
          setLastSubmission(today);
        } else if (logs.length > 0) {
          setLastSubmission(logs[0].log_date);
        }

        // Calculate Streak
        let streak = 0;
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Check consecutive days backwards
        for (let i = 0; i < logs.length; i++) {
          const logDate = new Date(logs[i].log_date);
          logDate.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(todayDate.getTime() - logDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // If the first log is today, it counts. 
          // If the first log is yesterday (diffDays=1), it counts.
          // If we are at index 0, diffDays can be 0 or 1.
          // If we are deeper, the difference between logs[i] and logs[i-1] must be 1 day.

          if (i === 0) {
            if (diffDays <= 1) {
              streak++;
            } else {
              break; // Streak broken
            }
          } else {
            const prevLogDate = new Date(logs[i - 1].log_date);
            prevLogDate.setHours(0, 0, 0, 0);

            const gapTime = Math.abs(prevLogDate.getTime() - logDate.getTime());
            const gapDays = Math.ceil(gapTime / (1000 * 60 * 60 * 24));

            if (gapDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
        setCurrentStreak(streak);
      }

    } catch (error) {
      console.error('Error fetching accountability data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'videosCompleted' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmitToday) {
      alert("You've already submitted your accountability log for today!");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login to submit logs');
        return;
      }

      const { error } = await supabase
        .from('daily_logs')
        .insert({
          student_id: user.id,
          videos_completed: formData.videosCompleted,
          notes: formData.notes,
          key_learning: formData.keyLearning,
          action_taken: formData.actionTaken,
          log_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      setCanSubmitToday(false);
      setLastSubmission(new Date().toISOString().split('T')[0]);

      // Refresh data to update streak
      fetchAccountabilityData();

      // Reset form
      setFormData({
        videosCompleted: 0,
        notes: '',
        keyLearning: '',
        actionTaken: ''
      });

    } catch (error) {
      console.error('Error submitting log:', error);
      alert('Failed to submit log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="accountability-tracker" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem' }}>Loading tracker...</div>
      </div>
    );
  }

  return (
    <div className="accountability-tracker">
      <div className="tracker-container">
        {/* Header Section */}
        <div className="tracker-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title" style={{ marginBottom: 0 }}>Daily Accountability Tracker</h1>
              <button
                onClick={fetchAccountabilityData}
                className="btn-icon"
                title="Refresh Data"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '5px', borderRadius: '50%' }}
              >
                🔄
              </button>
            </div>
            <p className="page-subtitle" style={{ marginTop: '0.5rem' }}>
              Track your daily progress and stay committed to your learning journey
            </p>
          </div>

          {/* Streak Display */}
          <div className="streak-card">
            <div className="streak-icon-large">🔥</div>
            <div className="streak-info">
              <h2 className="streak-number">{currentStreak}</h2>
              <p className="streak-label">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <h3>Last Check-in</h3>
              <p>{lastSubmission || 'Never'}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <h3>Today's Status</h3>
              <p>{!canSubmitToday ? 'Completed' : 'Not submitted'}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <h3>Total Logs</h3>
              <p>{totalLogs} entries</p>
            </div>
          </div>
        </div>

        {/* Success Message - Show when submitted */}
        {!canSubmitToday && (
          <div className="success-banner">
            <span className="success-icon">🎉</span>
            <div>
              <h3>Great job, {userName}!</h3>
              <p>Your accountability log has been recorded. Keep up the excellent work!</p>
              <p style={{ marginTop: 'var(--spacing-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                Come back tomorrow to continue your streak! 🔥
              </p>
            </div>
          </div>
        )}

        {/* Main Form - Only show if can submit today */}
        {canSubmitToday ? (
          <div className="tracker-form-container">
            <div className="form-header">
              <h2>Today's Learning Log</h2>
              <p>Complete all fields to submit your daily accountability</p>
            </div>

            <form onSubmit={handleSubmit} className="accountability-form">
              {/* Videos Completed */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎥</span>
                  How many videos did you complete today?
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="videosCompleted"
                  className="form-input"
                  value={formData.videosCompleted}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  required
                  placeholder="Enter number of videos"
                />
                <p className="form-hint">Include all educational videos you watched and completed</p>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Notes from today's learning
                  <span className="required">*</span>
                </label>
                <textarea
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="What did you study? What concepts did you explore? Any challenges faced?"
                />
                <p className="form-hint">Brief summary of what you learned today (minimum 20 characters)</p>
              </div>

              {/* Key Learning */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💡</span>
                  What was your biggest takeaway?
                  <span className="required">*</span>
                </label>
                <textarea
                  name="keyLearning"
                  className="form-textarea"
                  value={formData.keyLearning}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="What's the most important thing you learned today? What 'aha' moment did you have?"
                />
                <p className="form-hint">Identify the most valuable insight from today's session</p>
              </div>

              {/* Action Taken */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎯</span>
                  What action will you take based on today's learning?
                  <span className="required">*</span>
                </label>
                <textarea
                  name="actionTaken"
                  className="form-textarea"
                  value={formData.actionTaken}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="How will you apply what you learned? What specific steps will you take?"
                />
                <p className="form-hint">Commit to a concrete action or application</p>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Today\'s Log'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Already Submitted - Show completed card */
          <div className="already-submitted-section">
            <div className="completed-card">
              <div className="completed-icon">✅</div>
              <h2>You're all set for today!</h2>
              <p>Your daily accountability has been logged. Take a moment to celebrate your consistency!</p>
            </div>
          </div>
        )}

        {/* Motivational Section */}
        <div className="motivation-section">
          <div className="motivation-card">
            <h3>💪 Why Daily Accountability Matters</h3>
            <ul>
              <li>Builds consistent learning habits</li>
              <li>Helps you reflect on your progress</li>
              <li>Keeps you motivated with streak tracking</li>
              <li>Reinforces learning through active recall</li>
            </ul>
          </div>
          <div className="motivation-card">
            <h3>📈 Your Progress</h3>
            <p>You're doing amazing! Every day of learning brings you closer to your goals.</p>
            <div className="progress-stats">
              <div className="mini-stat">
                <span className="mini-stat-number">{currentStreak}</span>
                <span className="mini-stat-label">Day Streak</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-number">{totalLogs}</span>
                <span className="mini-stat-label">Total Logs</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-number">100%</span>
                <span className="mini-stat-label">Commitment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .accountability-tracker {
          min-height: 100vh;
          background: var(--color-gray-50);
          padding: var(--spacing-2xl);
        }

        .tracker-container {
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-2xl);
          gap: var(--spacing-2xl);
        }

        .header-content {
          flex: 1;
        }

        .page-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-sm);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-subtitle {
          color: var(--color-gray-600);
          font-size: 1.125rem;
          margin: 0;
        }

        /* Streak Card */
        .streak-card {
          background: var(--gradient-primary);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          color: var(--color-white);
          box-shadow: var(--shadow-xl);
          min-width: 200px;
        }

        .streak-icon-large {
          font-size: 4rem;
        }

        .streak-number {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          line-height: 1;
        }

        .streak-label {
          font-size: 1rem;
          opacity: 0.9;
          margin: var(--spacing-xs) 0 0 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .stat-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-normal);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content h3 {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin: 0 0 var(--spacing-xs) 0;
          font-weight: 600;
        }

        .stat-content p {
          font-size: 1.25rem;
          color: var(--color-gray-900);
          margin: 0;
          font-weight: 700;
        }

        /* Success Banner */
        .success-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          border: 2px solid var(--color-success);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          margin-bottom: var(--spacing-2xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          animation: slideDown 0.5s ease-out;
        }

        .success-icon {
          font-size: 3rem;
        }

        .success-banner h3 {
          color: var(--color-success);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .success-banner p {
          color: var(--color-gray-700);
          margin: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Already Submitted Section */
        .already-submitted-section {
          margin-bottom: var(--spacing-2xl);
        }

        .completed-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-3xl);
          text-align: center;
          box-shadow: var(--shadow-lg);
        }

        .completed-icon {
          font-size: 5rem;
          margin-bottom: var(--spacing-lg);
        }

        .completed-card h2 {
          color: var(--color-gray-900);
          margin-bottom: var(--spacing-md);
        }

        .completed-card p {
          color: var(--color-gray-600);
          font-size: 1.125rem;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Form Container */
        .tracker-form-container {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          box-shadow: var(--shadow-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .form-header {
          margin-bottom: var(--spacing-2xl);
          padding-bottom: var(--spacing-lg);
          border-bottom: 2px solid var(--color-gray-200);
        }

        .form-header h2 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-gray-900);
        }

        .form-header p {
          color: var(--color-gray-600);
          margin: 0;
        }

        /* Form Groups */
        .accountability-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: 600;
          color: var(--color-gray-900);
          font-size: 1rem;
        }

        .label-icon {
          font-size: 1.25rem;
        }

        .required {
          color: var(--color-error);
          margin-left: var(--spacing-xs);
        }

        .form-input,
        .form-textarea {
          padding: var(--spacing-md);
          border: 2px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: var(--font-secondary);
          transition: all var(--transition-fast);
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(66, 141, 255, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-hint {
          font-size: 0.875rem;
          color: var(--color-gray-500);
          margin: 0;
        }

        .form-actions {
          margin-top: var(--spacing-lg);
        }

        /* Motivation Section */
        .motivation-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
        }

        .motivation-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          box-shadow: var(--shadow-md);
        }

        .motivation-card h3 {
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--color-gray-900);
        }

        .motivation-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .motivation-card li {
          padding: var(--spacing-sm) 0;
          color: var(--color-gray-700);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .motivation-card li::before {
          content: '✓';
          color: var(--color-success);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .progress-stats {
          display: flex;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-xl);
        }

        .mini-stat {
          flex: 1;
          text-align: center;
          padding: var(--spacing-lg);
          background: var(--color-gray-50);
          border-radius: var(--radius-lg);
        }

        .mini-stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .mini-stat-label {
          display: block;
          font-size: 0.75rem;
          color: var(--color-gray-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tracker-header {
            flex-direction: column;
          }

          .page-title {
            font-size: 2rem;
          }

          .streak-card {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .progress-stats {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Accountability;
