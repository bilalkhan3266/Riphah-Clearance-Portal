import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdAssignment,
  MdRefresh,
  MdPeople,
  MdSchool,
  MdScience,
  MdMenuBook,
  MdLocalPharmacy,
  MdAccountBalance,
  MdGroups,
  MdFolder,
  MdComputer,
  MdBiotech,
  MdAdminPanelSettings,
  MdHome,
  MdSupervisorAccount,
  MdWorkspacePremium
} from 'react-icons/md';
import { getAdminStats, getDepartmentStats } from '../services/adminService';

const DEPT_ICONS = {
  Lab: { icon: MdScience, color: '#8B5CF6' },
  Library: { icon: MdMenuBook, color: '#3B82F6' },
  Pharmacy: { icon: MdLocalPharmacy, color: '#EC4899' },
  Finance: { icon: MdAccountBalance, color: '#F59E0B' },
  HR: { icon: MdGroups, color: '#10B981' },
  Records: { icon: MdFolder, color: '#6366F1' },
  IT: { icon: MdComputer, color: '#0EA5E9' },
  ORIC: { icon: MdBiotech, color: '#14B8A6' },
  Admin: { icon: MdAdminPanelSettings, color: '#7C3AED' },
  Warden: { icon: MdHome, color: '#F97316' },
  HOD: { icon: MdSupervisorAccount, color: '#2563EB' },
  Dean: { icon: MdWorkspacePremium, color: '#DC2626' }
};

const DEPT_ORDER = ['Lab','Library','Pharmacy','Finance','HR','Records','Admin','IT','ORIC','Warden','HOD','Dean'];

export default function AdminDashboard() {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0
  });
  const [departmentStats, setDepartmentStats] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const statsResponse = await getAdminStats(token);
      if (statsResponse.success) setStats(statsResponse.data || {});
      const deptResponse = await getDepartmentStats(token);
      if (deptResponse.success && deptResponse.data) setDepartmentStats(deptResponse.data.stats || {});
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const approvalRate = stats.totalRequests > 0 ? Math.round((stats.approvedCount / stats.totalRequests) * 100) : 0;
  const pendingRate = stats.totalRequests > 0 ? Math.round((stats.pendingCount / stats.totalRequests) * 100) : 0;
  const rejectionRate = stats.totalRequests > 0 ? Math.round((stats.rejectedCount / stats.totalRequests) * 100) : 0;

  const statCards = [
    { label: 'Total Requests', value: stats.totalRequests || 0, icon: <MdAssignment />, color: 'primary', sub: 'All clearance submissions', badge: null },
    { label: 'Approved', value: stats.approvedCount || 0, icon: <MdCheckCircle />, color: 'success', sub: 'Fully cleared', badge: approvalRate > 0 ? `${approvalRate}%` : null, badgeType: 'positive' },
    { label: 'Pending', value: stats.pendingCount || 0, icon: <MdAccessTime />, color: 'warning', sub: 'In progress', badge: pendingRate > 0 ? `${pendingRate}%` : null, badgeType: 'warning' },
    { label: 'Rejected', value: stats.rejectedCount || 0, icon: <MdCancel />, color: 'danger', sub: 'Blocked by issues', badge: rejectionRate > 0 ? `${rejectionRate}%` : null, badgeType: 'negative' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
        borderRadius: '16px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20px', right: '80px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Dashboard Overview</h2>
              <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.85 }}>
                Sequential Auto-Validation System — Real-time clearance monitoring
              </p>
            </div>
            <button onClick={fetchDashboardData} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s'
            }}>
              <MdRefresh style={{ fontSize: '18px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: 0.8 }}>
              <MdSchool style={{ fontSize: '16px' }} />
              <span>Riphah International University</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: 0.8 }}>
              <MdPeople style={{ fontSize: '16px' }} />
              <span>{stats.totalRequests || 0} Faculty Requests</span>
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>
              Last updated: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 20px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', color: '#991B1B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={fetchDashboardData} style={{ padding: '6px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Retry</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid var(--${card.color})` }}>
            <div className="stat-card-header">
              <h4 className="stat-card-title">{card.label}</h4>
              <div className={`stat-card-icon ${card.color}`}>{card.icon}</div>
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{card.value}</p>
              {card.badge && (
                <span className={`stat-card-change ${card.badgeType}`}>{card.badge}</span>
              )}
            </div>
            <p className="stat-card-footnote">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress Ring */}
      <div style={{
        background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB',
        padding: '28px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
          <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#10B981" strokeWidth="10"
              strokeDasharray={`${(approvalRate / 100) * 327} 327`} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>{approvalRate}%</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>Cleared</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>System Overview</h3>
          {[
            { label: 'Approved', value: stats.approvedCount || 0, pct: approvalRate, color: '#10B981' },
            { label: 'Pending', value: stats.pendingCount || 0, pct: pendingRate, color: '#F59E0B' },
            { label: 'Rejected', value: stats.rejectedCount || 0, pct: rejectionRate, color: '#EF4444' },
          ].map((row, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{row.label}</span>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{row.value} ({row.pct}%)</span>
              </div>
              <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Cards with Progress Bars */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>Department Overview</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Sequential clearance progress across all 12 departments</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Approved</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} /> Pending</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} /> Rejected</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {DEPT_ORDER.map((dept, idx) => {
            const d = departmentStats[dept] || { total: 0, approved: 0, pending: 0, rejected: 0 };
            const total = d.total || 1;
            const approvedPct = Math.round((d.approved / total) * 100);
            const pendingPct = Math.round((d.pending / total) * 100);
            const rejectedPct = Math.round((d.rejected / total) * 100);
            const isFullyCleared = d.total > 0 && d.approved === d.total;

            return (
              <div key={dept} style={{
                background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
                padding: '20px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                borderLeft: `4px solid ${isFullyCleared ? '#10B981' : d.rejected > 0 ? '#EF4444' : '#4F46E5'}`
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                      background: isFullyCleared ? '#ECFDF5' : `${(DEPT_ICONS[dept]?.color || '#4F46E5')}15`,
                      color: isFullyCleared ? '#059669' : (DEPT_ICONS[dept]?.color || '#4F46E5')
                    }}>
                      {DEPT_ICONS[dept] ? React.createElement(DEPT_ICONS[dept].icon) : <MdAssignment />}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                        {dept}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>#{idx + 1} in sequence</span>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: isFullyCleared ? '#ECFDF5' : d.rejected > 0 ? '#FEF2F2' : '#FFF7ED',
                    color: isFullyCleared ? '#059669' : d.rejected > 0 ? '#DC2626' : '#D97706'
                  }}>
                    {isFullyCleared ? 'All Cleared' : d.rejected > 0 ? 'Has Issues' : 'In Progress'}
                  </span>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { label: 'Total', val: d.total, bg: '#F3F4F6', clr: '#374151' },
                    { label: 'Approved', val: d.approved, bg: '#ECFDF5', clr: '#059669' },
                    { label: 'Pending', val: d.pending, bg: '#FFF7ED', clr: '#D97706' },
                    { label: 'Rejected', val: d.rejected, bg: '#FEF2F2', clr: '#DC2626' },
                  ].map((s, si) => (
                    <div key={si} style={{
                      flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: '8px', background: s.bg
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: s.clr }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Stacked Progress Bar */}
                <div style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280' }}>Clearance Progress</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>{d.total > 0 ? approvedPct : 0}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    {d.total > 0 && (
                      <>
                        <div style={{ width: `${approvedPct}%`, background: '#10B981', transition: 'width 0.6s ease' }} />
                        <div style={{ width: `${pendingPct}%`, background: '#F59E0B', transition: 'width 0.6s ease' }} />
                        <div style={{ width: `${rejectedPct}%`, background: '#EF4444', transition: 'width 0.6s ease' }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && Object.keys(departmentStats).length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px' }}>
          <div className="spinner"></div>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>Loading dashboard data...</span>
        </div>
      )}

      {/* Spin animation for refresh icon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
