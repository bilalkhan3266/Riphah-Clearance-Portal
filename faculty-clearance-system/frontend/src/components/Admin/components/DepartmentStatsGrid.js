import React from 'react';
import StatCard from './StatCard';

export default function DepartmentStatsGrid({
  departments = [],
  stats = {},
  loading = false
}) {
  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!departments.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3 className="empty-state-title">No departments yet</h3>
        <p className="empty-state-description">
          Departments will appear here once they are added to the system.
        </p>
      </div>
    );
  }

  return (
    <div>
      {departments.map((dept) => {
        const deptStats = stats[dept._id] || stats[dept] || {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0
        };

        return (
          <div key={dept._id || dept} style={{ marginBottom: '32px' }}>
            <h3 
              style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937'
              }}
            >
              {typeof dept === 'string' ? dept : dept.name || dept._id}
            </h3>
            <div className="stat-grid">
              <StatCard
                title="Total Requests"
                value={deptStats.total || 0}
                icon={null}
                type="total"
              />
              <StatCard
                title="Approved"
                value={deptStats.approved || 0}
                type="approved"
              />
              <StatCard
                title="Pending"
                value={deptStats.pending || 0}
                type="pending"
              />
              <StatCard
                title="Rejected"
                value={deptStats.rejected || 0}
                type="rejected"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
