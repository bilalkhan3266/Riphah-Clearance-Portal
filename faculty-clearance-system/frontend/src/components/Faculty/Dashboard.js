import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import { 
  MdDashboard, 
  MdFileUpload, 
  MdCheckCircle, 
  MdMail, 
  MdEdit, 
  MdLogout,
  MdRefresh,
  MdAnalytics,
  MdTimeline,
  MdLibraryBooks
} from "react-icons/md";
import "./Dashboard.css";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [showAutoVerify, setShowAutoVerify] = useState(false);

  // ====== FACULTY INFO ======
  const displayName = user?.full_name || "Faculty";
  const displayDesignation = user?.designation || "Faculty Member";
  const displayDept = user?.department || "N/A";

  // ====== FETCH CLEARANCE STATUS ======
  const fetchClearanceStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        console.warn('⚠️ No token found in localStorage');
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching clearance status with token...');
      setIsRefreshing(true);
      
      const response = await axios.get(apiUrl + "/api/clearance-status", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      });

      console.log('📊 Raw API Response:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const statuses = response.data.data;
        console.log('✅ Clearance status received:', statuses.length, 'departments');
        console.log('📋 Raw statuses:', statuses);
        
        // Extract QR code if available
        if (response.data.qr_code) {
          console.log('🎫 QR Code received from backend:', response.data.qr_code ? 'YES ('+response.data.qr_code.substring(0, 50)+'...)' : 'NO');
          setQrCode(response.data.qr_code);
          console.log('🎫 QR Code state updated');
        } else {
          console.log('⚠️ No QR code in response');
          setQrCode(null);
        }
        
        // Convert API response to department cards format
        const deptMap = {
          "Lab": { key: "lab", label: "Laboratory" },
          "Library": { key: "library", label: "Library" },
          "Pharmacy": { key: "pharmacy", label: "Pharmacy" },
          "Finance": { key: "finance", label: "Finance & Accounts" },
          "HR": { key: "hr", label: "Human Resources" },
          "Records": { key: "records", label: "Records Office" },
          "IT": { key: "it", label: "IT Department" },
          "Admin": { key: "admin", label: "Administration" },
          "ORIC": { key: "oric", label: "ORIC" },
          "Warden": { key: "warden", label: "Warden Office" },
          "HOD": { key: "hod", label: "HOD Office" },
          "Dean": { key: "dean", label: "Dean Office" }
        };

        const deptList = statuses.map(item => {
          const deptName = item.department || "";
          const status = item.status || "Pending";
          
          // Map status: Approved -> Cleared, keep others as-is
          const normalizedStatus = status === 'Approved' ? 'Cleared' : (status === 'Rejected' ? 'Rejected' : 'Pending');
          
          console.log(`  ${deptName}: ${status} -> ${normalizedStatus}`);
          
          return {
            key: deptMap[deptName]?.key || deptName.toLowerCase(),
            label: deptMap[deptName]?.label || deptName,
            status: normalizedStatus,
            remarks: item.remarks || "",
            approved_by: item.approved_by || item.rejected_by,
            approved_at: item.checked_at
          };
        });

        console.log('📋 Mapped Departments:', deptList.map(d => `${d.label}: ${d.status}`).join(', '));
        setDepartments(deptList);
        setLastUpdated(new Date());
        setError("");
        setLoading(false);
      } else {
        console.warn("⚠️ Invalid response format:", response.data);
        setError("Invalid response from server");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Fetch Clearance Status Error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || err.message || "Failed to load clearance status");
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ====== FETCH UNREAD COUNT ======
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) return;

      const response = await axios.get(apiUrl + "/api/unread-count", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Unread count fetch error:", err);
    }
  };

  // ====== SEND CERTIFICATE EMAIL ======
  const handleSendCertificateEmail = async () => {
    try {
      setSendingEmail(true);
      setEmailStatus("");
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      const response = await axios.post(apiUrl + "/api/send-certificate", {}, {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setEmailStatus("✅ Certificate sent successfully to your email!");
        console.log('✅ Certificate email sent');
        setTimeout(() => setEmailStatus(""), 4000);
      } else {
        setEmailStatus("❌ Failed to send certificate: " + response.data.message);
      }
    } catch (err) {
      console.error('❌ Error sending certificate:', err);
      setEmailStatus("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSendingEmail(false);
    }
  };

  // ====== AUTO-REFRESH ON MOUNT ======
  useEffect(() => {
    fetchClearanceStatus();
    fetchUnreadCount();
    
    const statusInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing clearance status...");
      fetchClearanceStatus();
    }, 3000);

    const unreadInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing unread count...");
      fetchUnreadCount();
    }, 5000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("📲 Tab focused - refreshing clearance status...");
        fetchClearanceStatus();
        fetchUnreadCount();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(statusInterval);
      clearInterval(unreadInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ====== PROGRESS CALC ======
  const progress = useMemo(() => {
    if (departments.length === 0) return 0;
    const total = departments.length;
    const cleared = departments.filter(d => d.status === "Cleared").length;
    const rejected = departments.filter(d => d.status === "Rejected").length;
    const done = cleared + rejected; // Count both cleared and rejected as "processed"
    const calculatedProgress = Math.round((done / total) * 100);
    console.log(`📊 Progress: ${cleared} cleared + ${rejected} rejected = ${done}/${total} = ${calculatedProgress}%`);
    return calculatedProgress;
  }, [departments]);

  const allCleared = departments.length > 0 && departments.every(d => d.status === "Cleared");

  const statusClass = (s) => {
    if (s === "Cleared") return "status cleared";
    if (s === "Pending") return "status pending";
    if (s === "Rejected") return "status rejected";
    return "status na";
  };

  const handleMessageDept = (deptKey) => {
    navigate("/faculty-messages", { state: { dept: deptKey } });
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    fetchClearanceStatus();
    fetchUnreadCount();
  };

  // ====== SMART PRINT HANDLER ======
  const handlePrintCertificate = async () => {
    console.log('🖨️ Print button clicked - preparing certificate...');
    
    // Wait for QR code to be fully rendered
    const waitForQRCode = new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max (50 x 100ms)
      
      const checkQRCode = () => {
        const qrImage = document.querySelector('.qr-code-actual');
        
        if (qrImage && qrImage.complete) {
          console.log('✅ QR code is fully loaded');
          resolve(true);
        } else if (qrImage && qrImage.src && qrImage.src.startsWith('data:')) {
          console.log('✅ QR code data URL detected and ready');
          resolve(true);
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`⏳ Waiting for QR code... (${attempts}/${maxAttempts})`);
          setTimeout(checkQRCode, 100);
        } else {
          console.warn('⚠️ QR code took too long to load, printing anyway...');
          resolve(true);
        }
      };
      
      checkQRCode();
    });

    try {
      await waitForQRCode;
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🖨️ Triggering print dialog...');
      
      // Method 1: Direct window.print (works with proper CSS)
      window.print();
      
    } catch (err) {
      console.error('❌ Print error:', err);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 25) return "#ef4444";
    if (percentage <= 50) return "#f59e0b";
    if (percentage <= 75) return "#facc15";
    return "#16a34a";
  };

  const getProgressStage = (percentage) => {
    if (percentage <= 25) return "0-25";
    if (percentage <= 50) return "25-50";
    if (percentage <= 75) return "50-75";
    return "75-100";
  };

  return (
    <div className="fd-dashboard-page">

      {/* SIDEBAR */}
      <aside className="fd-sidebar">
        <div className="fd-profile">
          <div className="fd-avatar">
            {displayName ? displayName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <h3 className="fd-name">{displayName}</h3>
            <p className="fd-small">{displayDesignation} • {displayDept}</p>
            <p className="fd-small">Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button className="fd-nav-btn active" onClick={() => navigate("/faculty-dashboard")}>
            <MdDashboard className="nav-icon" /> Dashboard
          </button>

          <button className="fd-nav-btn" onClick={() => navigate("/faculty-clearance")}>
            <MdFileUpload className="nav-icon" /> Submit Clearance
          </button>

          <button className="fd-nav-btn" onClick={() => navigate("/faculty-clearance-status")}>
            <MdCheckCircle className="nav-icon" /> Clearance Status
          </button>

          <button className="fd-nav-btn" onClick={() => navigate("/faculty-messages")}>
            <MdMail className="nav-icon" /> Messages {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          <button className="fd-nav-btn" onClick={() => setShowAutoVerify(!showAutoVerify)}>
            <MdCheckCircle className="nav-icon" /> Auto Verify
          </button>

          <button className="fd-nav-btn" onClick={() => navigate("/faculty-edit-profile")}>
            <MdEdit className="nav-icon" /> Edit Profile
          </button>

          <button className="fd-nav-btn" onClick={handleLogoutClick}>
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>

        <footer className="fd-footer">© 2025 Riphah</footer>
      </aside>

      {/* MAIN CONTENT */}
      <main className="fd-main">
        <header className="fd-header-banner">
          <div className="fd-header-content">
            <div className="fd-header-left">
              <div className="fd-greeting">
                <h1 className="fd-header-title">Welcome back, {displayName}</h1>
                <p className="fd-header-subtitle">Faculty Clearance Management System — Riphah International University</p>
              </div>
              <p className="fd-header-desc">Track department approvals below. Your clearance progress is updated in real time.</p>
            </div>
            <div className="fd-header-right">
              <button 
                className={`btn-refresh-pro ${isRefreshing ? 'refreshing' : ''}`} 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <MdRefresh className="refresh-icon" /> {isRefreshing ? 'Updating...' : 'Refresh Status'}
              </button>
              <span className="last-updated-pro">
                Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            <MdAnalytics style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.5 }} />
            <p>Loading clearance status...</p>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}

        {!loading && departments.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <MdLibraryBooks style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }} />
            <p>No clearance data available. Please submit a clearance request.</p>
          </div>
        )}

        {!loading && departments.length > 0 && (
        <section className="fd-overview">
          {/* CLEARANCE STATUS CARD */}
          <div className="fd-status-card">
            <div className="status-header">
              <h3><MdAnalytics style={{ marginRight: "8px" }} /> Overall Clearance Status</h3>
              <span className={`status-badge ${allCleared ? 'cleared' : 'pending'}`}>
                {allCleared ? <><MdCheckCircle /> CLEARED</> : <>IN PROGRESS</>}
              </span>
            </div>
            
            <div className="status-content">
              <div className="status-info">
                <p><strong>Progress:</strong> {departments.filter(d => d.status === "Cleared" || d.status === "Not Applicable").length} of {departments.length} departments cleared</p>
                <p><strong>Status:</strong> {allCleared ? 'All departments have approved your clearance request' : 'Some departments are still reviewing your request'}</p>
              </div>

              {/* LINEAR PROGRESS BAR */}
              <div className="progress-bar-container">
                <div className="progress-bar-label">
                  <span>Clearance Progress</span>
                  <span className="progress-percentage" data-stage={getProgressStage(progress)}>{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: getProgressColor(progress)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="fd-progress-card">
            <div className="fd-progress-circle">
              <svg viewBox="0 0 120 120">
                <circle className="bg" cx="60" cy="60" r="54" />
                <circle
                  className="progress"
                  cx="60"
                  cy="60"
                  r="54"
                  stroke={getProgressColor(progress)}
                  style={{ strokeDashoffset: 339.292 - (339.292 * progress) / 100 }}
                />
                <text 
                  x="60" 
                  y="65" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  className="percent-text"
                  transform="rotate(90 60 65)"
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    fill: getProgressColor(progress),
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                    letterSpacing: "0",
                    pointerEvents: "none"
                  }}
                >
                  {progress}%
                </text>
              </svg>
            </div>

            <div className="fd-progress-meta">
              <strong>{progress}%</strong> complete
            </div>

            <p className="fd-note">
              {allCleared
                ? "All departments cleared — you can print your clearance certificate."
                : "Pending approvals from some departments."}
            </p>
          </div>

          <div className="fd-actions-card">
            <h3>Quick Actions</h3>
            <div className="fd-quick-grid">
              <button onClick={() => navigate("/faculty-clearance-status")}>View Full Status</button>
              <button style={{ backgroundColor: "#3b82f6", color: "white" }}
                      onClick={() => navigate("/faculty-messages")}>
                Open Messages
              </button>
              <button onClick={() => window.print()}>Print Page</button>
            </div>
          </div>
        </section>
        )}

        {/* DEPARTMENT CARDS */}
        {departments.length > 0 && (
        <section className="fd-cards">
          <h3 style={{ marginBottom: "20px", color: "#333" }}><MdLibraryBooks style={{ marginRight: "8px" }} /> Department Clearance Status</h3>
          <div className="fd-cards-grid">
            {departments.map((d) => (
              <article key={d.key} className={`fd-card ${d.status.toLowerCase()}`}>
                <div className="fd-card-head">
                  <h4>{d.label}</h4>
                  <span className={statusClass(d.status)}>{d.status}</span>
                </div>

                <div className="fd-card-status-indicator">
                  {d.status === "Cleared" && <div className="indicator cleared"><MdCheckCircle /> Cleared</div>}
                  {d.status === "Pending" && <div className="indicator pending"><MdTimeline /> Pending</div>}
                  {d.status === "Rejected" && <div className="indicator rejected">✗ Rejected</div>}
                  {d.status === "Not Applicable" && <div className="indicator na">— N/A</div>}
                </div>

                <p className="fd-card-remarks">
                  {d.remarks || (d.status === "Cleared"
                    ? "No outstanding issues"
                    : d.status === "Pending"
                    ? "Your request is being reviewed"
                    : "Please contact the department")}
                </p>

                <div className="fd-card-actions">
                  <button className="btn-message" onClick={() => handleMessageDept(d.key)}>
                    <MdMail style={{ marginRight: "4px" }} /> Message Dept
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}

        {/* CERTIFICATE */}
        {allCleared && (
          <section className="fd-certificate">
            <div className="cert-container">
              <div className="cert-header">
                <h2>✅ Clearance Certificate</h2>
                <p className="cert-subtitle">Your faculty clearance has been approved by all departments</p>
              </div>

              <div className="cert-content">
                <div className="cert-info">
                  <h3>Clearance Details</h3>
                  <p><strong>Faculty Member:</strong> {displayName}</p>
                  <p><strong>Designation:</strong> {displayDesignation}</p>
                  <p><strong>Status:</strong> <span className="status-badge cleared">✓ Cleared</span></p>
                </div>

                <div className="cert-qr-section">
                  <h3>Verification</h3>
                  <p className="qr-subtitle">Scan this code for verification</p>
                  {qrCode && qrCode.startsWith('data:') ? (
                    <img 
                      src={qrCode} 
                      alt="Clearance QR Code" 
                      className="qr-code-actual"
                      onError={(e) => {
                        console.error('❌ QR Code image failed to load:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="qr-placeholder">
                      <div className="barcode-visual" aria-hidden>
                        {Array.from({ length: 42 }).map((_, i) => (
                          <span key={i} className={`bar ${
                            i % 3 === 0 ? "bar-large" :
                            i % 2 === 0 ? "bar-medium" : "bar-small"
                          }`} />
                        ))}
                      </div>
                      <p style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>{qrCode ? 'QR Code loading...' : 'QR Code will appear here'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="cert-departments">
                <h3>All Departments Cleared ✓</h3>
                <div className="dept-grid-print">
                  {departments.length > 0 && departments.map((d) => (
                    <div key={d.key} className="dept-chip cleared">
                      <span className="chip-icon">✓</span>
                      <span className="chip-name">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cert-actions">
                <button onClick={handlePrintCertificate} className="fd-primary btn-large">
                  🖨️ Print & Download Certificate
                </button>
                <button onClick={() => handleSendCertificateEmail()} className="fd-secondary btn-large" disabled={sendingEmail}>
                  {sendingEmail ? "✉️ Sending..." : "✉️ Send to Email"}
                </button>
              </div>

              {emailStatus && (
                <div className="email-status-alert" style={emailStatus.includes("✅") ? {background: "#d1fae5", color: "#065f46", borderLeft: "4px solid #10b981"} : {background: "#fee2e2", color: "#991b1b", borderLeft: "4px solid #ef4444"}}>
                  {emailStatus}
                </div>
              )}

              <div className="cert-footer">
                <p>This certificate confirms that you have completed the clearance process. Keep this email for your records.</p>
                <p className="cert-date">Cleared on: {lastUpdated.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </section>
        )}

        {/* AUTO VERIFY SECTION */}
        {showAutoVerify && (
          <section className="fd-auto-verify-section">
            <div className="auto-verify-header">
              <h2><MdCheckCircle style={{ marginRight: "8px" }} /> Automatic Verification Status</h2>
              <button onClick={() => setShowAutoVerify(false)} style={{cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px'}}>✕</button>
            </div>

            <div className="auto-verify-content">
              <div className="verify-card">
                <h3>🔍 Real-Time Clearance Verification</h3>
                <p style={{marginBottom: "20px", color: "#666"}}>
                  Your clearance is automatically verified based on actual issue and return records from each department.
                </p>

                {allCleared ? (
                  <div className="verify-status cleared">
                    <div className="status-icon">✓</div>
                    <div className="status-details">
                      <h4>Clearance Complete</h4>
                      <p>All departments have verified your records. You are cleared to graduate.</p>
                    </div>
                  </div>
                ) : (
                  <div className="verify-status pending">
                    <div className="status-icon">⏳</div>
                    <div className="status-details">
                      <h4>Verification In Progress</h4>
                      <p>Verifying records from {departments.filter(d => d.status === "Pending").length} departments.</p>
                    </div>
                  </div>
                )}

                <div className="verify-breakdown">
                  <h4>Department Status Summary:</h4>
                  <div className="status-grid">
                    {departments.map(d => (
                      <div key={d.key} className={`status-item ${d.status.toLowerCase()}`}>
                        <span className="dept-name">{d.label}</span>
                        <span className="status-indicator">{d.status === "Cleared" ? "✓" : d.status === "Pending" ? "⏳" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="verify-notes">
                  <p style={{fontSize: "0.9rem", color: "#666"}}>
                    <strong>📌 Note:</strong> Verification is automatic and based on physical items issued and returned according to department records.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
