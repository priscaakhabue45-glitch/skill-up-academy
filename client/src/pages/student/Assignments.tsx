import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Assignment {
  id: string;
  module_id: string;
  module_title?: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submitted_date?: string;
  submission_text?: string;
}

const Assignments = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No user logged in');
        return;
      }

      // Fetch assignments with module details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
                    *,
                    modules (title)
                `)
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Fetch user's submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionsError) throw submissionsError;

      // Merge data
      const mergedAssignments: Assignment[] = assignmentsData.map((assignment: any) => {
        const submission = submissionsData.find((s: any) => s.assignment_id === assignment.id);

        return {
          id: assignment.id,
          module_id: assignment.module_id,
          module_title: assignment.modules?.title || 'Unknown Module',
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          status: submission ? (submission.status as 'submitted' | 'graded') : 'pending',
          grade: submission?.grade,
          feedback: submission?.feedback,
          submitted_date: submission?.submitted_at,
          submission_text: submission?.submission_text
        };
      });

      setAssignments(mergedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedFilter === 'all') return true;
    return assignment.status === selectedFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'submitted':
        return <span className="badge badge-info">Submitted</span>;
      case 'graded':
        return <span className="badge badge-success">Graded</span>;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login to submit assignments');
        return;
      }

      const { error } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: selectedAssignment.id,
          student_id: user.id,
          submission_text: submissionText,
          status: 'submitted'
        });

      if (error) throw error;

      alert('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setSubmissionText('');
      setSelectedAssignment(null);

      // Refresh list
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length
  };

  if (loading) {
    return (
      <div className="assignments-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem' }}>Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="assignments-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Assignments</h1>
            <p className="page-subtitle">Track and submit your module assignments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">📚</div>
            <div className="stat-details">
              <h3>{stats.total}</h3>
              <p>Total Assignments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-details">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon submitted">📤</div>
            <div className="stat-details">
              <h3>{stats.submitted}</h3>
              <p>Submitted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon graded">✅</div>
            <div className="stat-details">
              <h3>{stats.graded}</h3>
              <p>Graded</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${selectedFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-tab ${selectedFilter === 'submitted' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('submitted')}
          >
            Submitted ({stats.submitted})
          </button>
          <button
            className={`filter-tab ${selectedFilter === 'graded' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('graded')}
          >
            Graded ({stats.graded})
          </button>
        </div>

        {/* Assignments List */}
        <div className="assignments-list">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div className="assignment-module">{assignment.module_title}</div>
                  {getStatusBadge(assignment.status)}
                </div>
                <h3 className="assignment-title">{assignment.title}</h3>
                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  </div>
                  {assignment.submitted_date && (
                    <div className="meta-item">
                      <span className="meta-icon">✓</span>
                      <span>Submitted: {new Date(assignment.submitted_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {assignment.grade !== undefined && (
                    <div className="meta-item">
                      <span className="meta-icon">🎯</span>
                      <span>Grade: {assignment.grade}%</span>
                    </div>
                  )}
                </div>

                <div className="assignment-actions">
                  {assignment.status === 'pending' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitModal(true);
                      }}
                    >
                      Submit Assignment
                    </button>
                  )}
                  {assignment.status === 'submitted' && (
                    <button className="btn btn-secondary" disabled>
                      Awaiting Review
                    </button>
                  )}
                  {assignment.status === 'graded' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      View Feedback
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No assignments found</h3>
              <p>There are no {selectedFilter !== 'all' ? selectedFilter : ''} assignments at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Assignment</h2>
              <button className="close-btn" onClick={() => setShowSubmitModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <h3>{selectedAssignment.title}</h3>
              <p className="modal-subtitle">{selectedAssignment.module_title}</p>

              <div className="form-group" style={{ marginTop: 'var(--spacing-xl)' }}>
                <label className="form-label">
                  Your Submission
                  <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={8}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your assignment submission here or paste a link to your work..."
                  required
                />
                <p className="form-hint">
                  You can submit text, links to documents, or URLs to your work (Google Drive, YouTube, etc.)
                </p>
              </div>

              <div className="file-upload-info">
                <p>💡 <strong>Tip:</strong> For larger files or presentations, upload to Google Drive and share the link here.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!submissionText.trim() || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedAssignment && selectedAssignment.status === 'graded' && !showSubmitModal && (
        <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assignment Feedback</h2>
              <button className="close-btn" onClick={() => setSelectedAssignment(null)}>×</button>
            </div>

            <div className="modal-body">
              <h3>{selectedAssignment.title}</h3>
              <p className="modal-subtitle">{selectedAssignment.module_title}</p>

              <div className="grade-display">
                <div className="grade-circle">
                  <span className="grade-number">{selectedAssignment.grade}%</span>
                  <span className="grade-label">Grade</span>
                </div>
              </div>

              {selectedAssignment.feedback && (
                <div className="feedback-section">
                  <h4>Instructor Feedback</h4>
                  <p>{selectedAssignment.feedback}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedAssignment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .assignments-page {
          min-height: 100vh;
          background: var(--color-gray-50);
          padding: var(--spacing-2xl);
        }

        .assignments-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .page-header {
          margin-bottom: var(--spacing-2xl);
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

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.total {
          background: rgba(66, 141, 255, 0.1);
        }

        .stat-icon.pending {
          background: rgba(255, 168, 0, 0.1);
        }

        .stat-icon.submitted {
          background: rgba(66, 153, 225, 0.1);
        }

        .stat-icon.graded {
          background: rgba(16, 185, 129, 0.1);
        }

        .stat-details h3 {
          font-size: 2rem;
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--color-gray-900);
        }

        .stat-details p {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin: 0;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-2xl);
          border-bottom: 2px solid var(--color-gray-200);
          overflow-x: auto;
        }

        .filter-tab {
          padding: var(--spacing-md) var(--spacing-lg);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          color: var(--color-gray-600);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .filter-tab:hover {
          color: var(--color-primary);
        }

        .filter-tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        /* Assignments List */
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .assignment-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          box-shadow: var(--shadow-md);
          transition: transform var(--transition-normal);
        }

        .assignment-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .assignment-module {
          font-size: 0.875rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .assignment-title {
          font-size: 1.5rem;
          margin: 0 0 var(--spacing-md) 0;
          color: var(--color-gray-900);
        }

        .assignment-description {
          color: var(--color-gray-700);
          line-height: 1.6;
          margin-bottom: var(--spacing-lg);
        }

        .assignment-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-gray-200);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.875rem;
          color: var(--color-gray-600);
        }

        .meta-icon {
          font-size: 1rem;
        }

        .assignment-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        /* Empty State */
        .empty-state {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--spacing-3xl);
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .empty-state h3 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--color-gray-900);
        }

        .empty-state p {
          color: var(--color-gray-600);
          margin: 0;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-xl);
        }

        .modal-content {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-2xl);
        }

        .modal-header {
          padding: var(--spacing-2xl);
          border-bottom: 2px solid var(--color-gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: var(--color-gray-900);
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: var(--color-gray-400);
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .close-btn:hover {
          color: var(--color-gray-600);
        }

        .modal-body {
          padding: var(--spacing-2xl);
        }

        .modal-body h3 {
          margin: 0 0 var(--spacing-xs) 0;
          color: var(--color-gray-900);
        }

        .modal-subtitle {
          color: var(--color-primary);
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-footer {
          padding: var(--spacing-2xl);
          border-top: 2px solid var(--color-gray-200);
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
        }

        .file-upload-info {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--color-gray-50);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: var(--color-gray-700);
        }

        .file-upload-info p {
          margin: 0;
        }

        /* Grade Display */
        .grade-display {
          display: flex;
          justify-content: center;
          margin: var(--spacing-2xl) 0;
        }

        .grade-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
          box-shadow: var(--shadow-xl);
        }

        .grade-number {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
        }

        .grade-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-top: var(--spacing-xs);
        }

        .feedback-section {
          margin-top: var(--spacing-2xl);
          padding: var(--spacing-xl);
          background: var(--color-gray-50);
          border-radius: var(--radius-lg);
        }

        .feedback-section h4 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--color-gray-900);
        }

        .feedback-section p {
          color: var(--color-gray-700);
          line-height: 1.8;
          margin: 0;
        }

        /* Badge Variants */
        .badge.badge-info {
          background: rgba(66, 153, 225, 0.1);
          color: #2563eb;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-tabs {
            overflow-x: scroll;
          }

          .assignment-actions {
            flex-direction: column;
          }

          .assignment-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Assignments;
