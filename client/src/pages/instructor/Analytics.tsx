const Analytics = () => {
    return (
        <div className="analytics-view animate-fadeIn">
            <h1 className="view-title">Analytics</h1>
            <div className="card">
                <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--spacing-md)' }}>📈</span>
                    <h3>Performance Insights</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>Track your course engagement and revenue.</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
