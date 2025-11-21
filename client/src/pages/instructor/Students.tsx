const Students = () => {
    return (
        <div className="students-view animate-fadeIn">
            <h1 className="view-title">Students</h1>
            <div className="card">
                <div className="empty-state" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--spacing-md)' }}>👥</span>
                    <h3>Student Directory</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>View and manage your 1,234 students.</p>
                </div>
            </div>
        </div>
    );
};

export default Students;
