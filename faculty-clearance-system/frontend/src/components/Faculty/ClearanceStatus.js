import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import "./ClearanceStatus.css";
import axios from "axios";
import { 
  MdDashboard, 
  MdFileUpload, 
  MdCheckCircle, 
  MdMail, 
  MdEdit, 
  MdLogout,
  MdRefresh,
  MdPrint,
  MdQrCode2,
  MdVerifiedUser,
  MdCancel,
  MdHourglassEmpty,
  MdSchool,
  MdReplay,
  MdInfo,
} from "react-icons/md";

export default function ClearanceStatus() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [phaseStatus, setPhaseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    fetchClearanceStatus();
    const interval = setInterval(fetchClearanceStatus, 5000);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchClearanceStatus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  const fetchClearanceStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      const res = await axios.get(apiUrl + `/api/clearance-requests/${user?.id}/phase-status`, {
        headers: { Authorization: "Bearer " + token },
        timeout: 8000,
      });

      if (res.data.success) {
        setPhaseStatus(res.data.phaseStatus);
        setLastUpdated(new Date());
        if (res.data.phaseStatus.overall_status !== 'Not Submitted') setError("");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setPhaseStatus({ overall_status: 'Not Submitted' });
        setError("");
      } else {
        setError(err.response?.data?.message || "Failed to fetch clearance status.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClearanceStatus();
  };

  const handleResubmit = async () => {
    try {
      setResubmitting(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      const response = await axios.post(
        apiUrl + "/api/clearance-requests/resubmit",
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(fetchClearanceStatus, 1000);
      } else {
        setError(response.data.message || "Failed to resubmit");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resubmit clearance request");
    } finally {
      setResubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || "Faculty";
  const displayDesignation = user?.designation || "N/A";
  const displayDept = user?.department || "N/A";

  // Count stats from departments array
  const departments = phaseStatus?.departments || [];
  const approvedCount = departments.filter(d => d.status === 'Approved').length;
  const rejectedCount = departments.filter(d => d.status === 'Rejected').length;
  const hasRejected = rejectedCount > 0;

  if (loading) {
    return (
      <div className="fd-dashboard-page">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading clearance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-dashboard-page">
      <aside className="fd-sidebar">
        <div className="fd-profile">
          <div className="fd-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="fd-name">{displayName}</h3>
            <p className="fd-small">{displayDesignation} • {displayDept}</p>
            <p className="fd-small">Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button onClick={() => navigate("/faculty-dashboard")} className="fd-nav-btn">
            <MdDashboard className="nav-icon" /> Dashboard
          </button>
          <button onClick={() => navigate("/faculty-clearance")} className="fd-nav-btn">
            <MdFileUpload className="nav-icon" /> Submit Clearance
          </button>
          <button onClick={() => navigate("/faculty-clearance-status")} className="fd-nav-btn active">
            <MdCheckCircle className="nav-icon" /> Clearance Status
          </button>
          <button onClick={() => navigate("/faculty-messages")} className="fd-nav-btn">
            <MdMail className="nav-icon" /> Messages
          </button>
          <button onClick={() => navigate("/faculty-dashboard", { state: { scrollToAutoVerify: true } })} className="fd-nav-btn">
            <MdCheckCircle className="nav-icon" /> Auto Verify
          </button>
          <button onClick={() => navigate("/faculty-edit-profile")} className="fd-nav-btn">
            <MdEdit className="nav-icon" /> Edit Profile
          </button>
          <button onClick={handleLogout} className="fd-nav-btn logout">
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>
        <footer className="fd-footer">© 2025 Riphah</footer>
      </aside>

      <main className="fd-main">
        {/* Header Banner */}
        <div className="cs-header-container">
          <div className="cs-header-content">
            <div>
              <h1 className="cs-page-title">Clearance Status</h1>
              <p className="cs-page-subtitle">Sequential auto-validation across 12 departments &mdash; Riphah International University</p>
            </div>
            <div className="cs-header-meta">
              <span className="cs-last-updated-badge">
                <MdRefresh className="cs-meta-icon" />
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {phaseStatus && phaseStatus.overall_status === 'Not Submitted' ? (
          <div className="cs-empty-state">
            <div className="cs-empty-icon-wrap">
              <MdFileUpload className="cs-empty-icon" />
            </div>
            <h2>No Clearance Request Submitted</h2>
            <p>Start the process by submitting a clearance request below.</p>
            <button onClick={() => navigate("/faculty-clearance")} className="cs-submit-btn">
              <MdFileUpload /> Submit Your Clearance Request
            </button>
          </div>
        ) : (
          <div className="cs-content-wrapper">

            {/* ====== CLEARANCE COMPLETE — Premium QR Section ====== */}
            {phaseStatus && phaseStatus.overall_status === 'Cleared' && (
              <div className="cs-cleared-hero">
                {/* Background decoration */}
                <div className="cs-cleared-bg-pattern" />

                <div className="cs-cleared-badge-row">
                  <span className="cs-cleared-badge"><MdVerifiedUser /> Verified</span>
                </div>

                <div className="cs-cleared-icon-ring">
                  <MdCheckCircle className="cs-cleared-check" />
                </div>

                <h2 className="cs-cleared-title">Clearance Approved</h2>
                <p className="cs-cleared-subtitle">All 12 departments have been successfully verified.</p>

                <div className="cs-divider" />

                {/* QR Premium Card */}
                {phaseStatus.qr_code && (
                  <div className="cs-qr-premium-card">
                    <div className="cs-qr-glass-inner">
                      <div className="cs-qr-label">
                        <MdQrCode2 className="cs-qr-label-icon" />
                        <span>Scan to Verify Certificate</span>
                      </div>
                      <div className="cs-qr-image-frame">
                        <img src={phaseStatus.qr_code} alt="Clearance QR Code" className="cs-qr-image" />
                      </div>
                      <div className="cs-qr-meta">
                        <div className="cs-qr-meta-item">
                          <span className="cs-qr-meta-label">Clearance ID</span>
                          <span className="cs-qr-meta-value">{phaseStatus.clearance_id || '—'}</span>
                        </div>
                        <div className="cs-qr-meta-divider" />
                        <div className="cs-qr-meta-item">
                          <span className="cs-qr-meta-label">Cleared On</span>
                          <span className="cs-qr-meta-value">
                            {new Date(phaseStatus.cleared_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="cs-cleared-actions">
                  <button className="cs-btn-print" onClick={() => window.print()}>
                    <MdPrint /> Print Certificate
                  </button>
                </div>
              </div>
            )}

            {/* ====== Sequential Department Progress ====== */}
            {departments.length > 0 && (
              <div className="cs-departments-section">
                <div className="cs-section-header">
                  <div className="cs-section-header-left">
                    <h2>Department Verification</h2>
                    <p>{approvedCount} of 12 departments cleared{phaseStatus?.stoppedAt ? ` — Stopped at ${phaseStatus.stoppedAt}` : ''}</p>
                  </div>
                  <div className="cs-section-header-right">
                    <div className="cs-progress-pill">
                      <span className="cs-progress-pill-text">{Math.round((approvedCount / 12) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="cs-progress-track">
                  <div
                    className={`cs-progress-fill ${approvedCount === 12 ? 'cs-progress-complete' : ''}`}
                    style={{ width: `${(approvedCount / 12) * 100}%` }}
                  />
                </div>

                {/* Department Grid */}
                <div className="cs-depts-grid">
                  {departments.map((dept) => (
                    <div key={dept.name} className={`cs-dept-card cs-dept-${dept.status.toLowerCase()}`}>
                      <div className="cs-dept-card-icon">
                        {dept.status === 'Approved' && <MdCheckCircle className="cs-icon-approved" />}
                        {dept.status === 'Rejected' && <MdCancel className="cs-icon-rejected" />}
                        {dept.status === 'Pending' && <MdHourglassEmpty className="cs-icon-pending" />}
                      </div>
                      <div className="cs-dept-order">#{dept.order}</div>
                      <h4 className="cs-dept-name">{dept.name}</h4>
                      <span className={`cs-dept-badge cs-badge-${dept.status.toLowerCase()}`}>{dept.status}</span>
                      {dept.remarks && (
                        <p className="cs-dept-remarks">{dept.remarks}</p>
                      )}
                      {dept.checked_at && (
                        <small className="cs-dept-date">{new Date(dept.checked_at).toLocaleString()}</small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== Control Bar ====== */}
            <div className="cs-control-bar">
              <div className="cs-control-left">
                <button onClick={handleRefresh} disabled={refreshing} className={`cs-refresh-btn ${refreshing ? 'refreshing' : ''}`}>
                  <MdRefresh className={refreshing ? 'spin-icon' : ''} /> {refreshing ? "Updating..." : "Refresh Status"}
                </button>
                {hasRejected && (
                  <button onClick={handleResubmit} disabled={resubmitting} className={`cs-resubmit-all-btn ${resubmitting ? 'resubmitting' : ''}`}>
                    <MdReplay /> {resubmitting ? "Re-checking..." : "Re-check Clearance"}
                  </button>
                )}
              </div>
              <div className="cs-control-right">
                <span className="cs-last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* ====== How It Works Guide ====== */}
            <div className="cs-guide-section">
              <div className="cs-guide-header">
                <MdInfo className="cs-guide-header-icon" />
                <h2>How Sequential Auto-Validation Works</h2>
              </div>
              <div className="cs-guide-grid">
                <div className="cs-guide-card cs-guide-approved">
                  <div className="cs-guide-icon-wrap approved"><MdCheckCircle /></div>
                  <h3>Approved</h3>
                  <p>No pending issues found. Department auto-cleared.</p>
                </div>
                <div className="cs-guide-card cs-guide-rejected">
                  <div className="cs-guide-icon-wrap rejected"><MdCancel /></div>
                  <h3>Rejected</h3>
                  <p>Pending issue found. Return the item, then re-check.</p>
                </div>
                <div className="cs-guide-card cs-guide-pending">
                  <div className="cs-guide-icon-wrap pending"><MdHourglassEmpty /></div>
                  <h3>Pending</h3>
                  <p>Not yet reached. Previous department must clear first.</p>
                </div>
                <div className="cs-guide-card cs-guide-cleared">
                  <div className="cs-guide-icon-wrap cleared"><MdSchool /></div>
                  <h3>Cleared</h3>
                  <p>All 12 departments approved. QR certificate generated and emailed.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
