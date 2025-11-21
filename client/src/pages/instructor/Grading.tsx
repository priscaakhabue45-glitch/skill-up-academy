const Grading = () => {
    return (
        <div className="grading-view animate-fadeIn">
            <h1 className="view-title">Assignments & Grading</h1>
            <div className="card">
                <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--spacing-md)' }}>📝</span>
                    <h3>Grading Center</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>You have 5 assignments pending review.</p>
                </div>
            </div>
        </div>
    );
};

export default Grading;
