import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdRefresh,
  MdArrowForward,
  MdWarning,
  MdInfo,
  MdDownload,
  MdShare
} from "react-icons/md";
import "./ClearanceStatusModern.css";

export default function ClearanceStatusModern() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [returns, setReturns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDept, setExpandedDept] = useState(null);
  const [activeTab, setActiveTab] = useState("issues"); // "issues" or "returns"
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // =====================================================
  // FETCH CLEARANCE DATA
  // =====================================================
  const fetchClearanceData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) return;

      // Fetch summary
      const summaryResponse = await axios.get(apiUrl + "/api/issues/summary", {
        headers: { Authorization: "Bearer " + token }
      });

      // Fetch pending issues
      const issuesResponse = await axios.get(apiUrl + "/api/issues/my-pending-issues", {
        headers: { Authorization: "Bearer " + token }
      });

      // Fetch returns
      const returnsResponse = await axios.get(apiUrl + "/api/issues/my-returns", {
        headers: { Authorization: "Bearer " + token }
      });

      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data);
        
        // MERGE pending issues into phase details
        const summaryData = summaryResponse.data;
        if (issuesResponse.data.success && summaryData.phaseDetails) {
          const issuesByDept = issuesResponse.data.issuesByDepartment || {};
          
          // Update each phase's departments with their associated issues
          const updatedPhases = { ...summaryData.phaseDetails };
          Object.keys(updatedPhases).forEach(phaseName => {
            const phase = updatedPhases[phaseName];
            if (phase.departments) {
              phase.departments = phase.departments.map(dept => {
                // Find matching issues for this department
                const deptIssues = issuesByDept[dept.name] || [];
                return {
                  ...dept,
                  pendingCount: deptIssues.length,
                  pendingItems: deptIssues
                };
              });
            }
          });
          
          // Update the setSummary with merged data
          setSummary({ ...summaryData, phaseDetails: updatedPhases });
        }
      }

      if (returnsResponse.data.success) {
        setReturns(returnsResponse.data);
      }

      setError("");
    } catch (err) {
      console.error("Error fetching clearance:", err);
      if (err.response?.status !== 404) {
        setError("Failed to load clearance status");
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearanceData();

    // Auto-refresh every 5 seconds if enabled
    const interval = autoRefreshEnabled
      ? setInterval(fetchClearanceData, 5000)
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled]);

  if (loading) {
    return (
      <div className="clearance-modern-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading clearance status...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="clearance-modern-container">
        <div className="no-clearance-notice">
          <MdInfo size={48} />
          <h2>No Clearance Request</h2>
          <p>You haven't submitted a clearance request yet.</p>
          <button onClick={() => navigate("/submit-clearance")}>
            Start Clearance Process
          </button>
        </div>
      </div>
    );
  }

  const isApproved = summary.overallStatus === "APPROVED";
  const phases = summary.phaseDetails;

  return (
    <div className="clearance-modern-container">
      <div className="clearance-header">
        <div className="header-content">
          <h1>🎓 Faculty Clearance Status</h1>
          <p className="subtitle">Real-time Automated Verification System</p>
        </div>
        <button className="refresh-btn" onClick={fetchClearanceData}>
          <MdRefresh size={20} /> Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <MdWarning /> {error}
        </div>
      )}

      {/* =====================================================
          OVERALL STATUS CARD
          ===================================================== */}
      <div className={`status-overview ${isApproved ? "approved" : "pending"}`}>
        <div className="status-main">
          {isApproved ? (
            <>
              <MdCheckCircle size={64} className="status-icon success" />
              <div className="status-text">
                <h2>✅ CLEARANCE APPROVED</h2>
                <p>All departments verified - You are fully cleared!</p>
              </div>
            </>
          ) : (
            <>
              <MdAccessTime size={64} className="status-icon pending" />
              <div className="status-text">
                <h2>⏳ CLEARANCE IN PROGRESS</h2>
                <p>Complete current phase to proceed</p>
              </div>
            </>
          )}
        </div>
        <div className="status-progress">
          <div className="progress-info">
            <span className="progress-label">Phase Progress</span>
            <span className="progress-value">{summary.phaseProgress}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(summary.phaseProgress.split("/")[0] /
                  summary.phaseProgress.split("/")[1]) *
                  100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* =====================================================
          PHASE BREAKDOWN
          ===================================================== */}
      <div className="phases-section">
        <h2 className="section-title">📋 Phase Breakdown</h2>

        {/* TAB NAVIGATION */}
        <div className="phase-tabs">
          <button
            className={`tab-btn ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            📌 Pending Issues
          </button>
          <button
            className={`tab-btn ${activeTab === "returns" ? "active" : ""}`}
            onClick={() => setActiveTab("returns")}
          >
            ✅ Returned Items
          </button>
        </div>

        {/* ISSUES TAB */}
        {activeTab === "issues" && (
          <>
            {Object.entries(phases).map(([phaseName, phaseData], idx) => (
              <div key={phaseName} className="phase-card">
                <div className="phase-header">
                  <div className="phase-info">
                    <span className="phase-number">{idx + 1}</span>
                    <div className="phase-text">
                      <h3>{phaseName}</h3>
                      <p className="dept-count">
                        {phaseData.departments.length} departments
                      </p>
                    </div>
                  </div>
                  <div className="phase-status">
                    {phaseData.allApproved ? (
                      <>
                        <MdCheckCircle size={32} className="icon success" />
                        <span className="status-label">APPROVED</span>
                      </>
                    ) : phaseData.status === "BLOCKED" ? (
                      <>
                        <MdCancel size={32} className="icon error" />
                        <span className="status-label">BLOCKED</span>
                      </>
                    ) : (
                      <>
                        <MdAccessTime size={32} className="icon warning" />
                        <span className="status-label">PENDING</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Department List */}
                <div className="departments-list">
                  {phaseData.departments.map((dept) => (
                    <div
                      key={dept.name}
                      className={`dept-item ${dept.status.toLowerCase()}`}
                    >
                      <div className="dept-left">
                        <div className="dept-status-icon">
                          {dept.status === "APPROVED" ? (
                            <MdCheckCircle />
                          ) : (
                            <MdCancel />
                          )}
                        </div>
                        <div className="dept-info">
                          <h4>{dept.name}</h4>
                          {dept.pendingCount > 0 && (
                            <p className="pending-count">
                              {dept.pendingCount} item(s) to return
                            </p>
                          )}
                          {dept.status === "APPROVED" && (
                            <p className="cleared-text">All items cleared</p>
                          )}
                        </div>
                      </div>

                      {/* Expandable Items List */}
                      {dept.pendingCount > 0 && (
                        <button
                          className="expand-btn"
                          onClick={() =>
                            setExpandedDept(
                              expandedDept === `${phaseName}-${dept.name}`
                                ? null
                                : `${phaseName}-${dept.name}`
                            )
                          }
                        >
                          {expandedDept === `${phaseName}-${dept.name}`
                            ? "−"
                            : "+"}
                        </button>
                      )}

                      {/* Expanded Item Details */}
                      {expandedDept === `${phaseName}-${dept.name}` && 
                        dept.pendingCount > 0 && (
                        <div className="pending-items-detail">
                          {dept.pendingItems.map((item) => (
                            <div key={item.id} className="item-detail-row">
                              <div className="item-info">
                                <p className="item-desc">{item.description}</p>
                                <span className="item-badge">{item.itemType}</span>
                              </div>
                              <div className="item-meta">
                                <span className="qty">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* RETURNS TAB */}
        {activeTab === "returns" && (
          <div className="returns-section">
            {returns && returns.returnsByDepartment && 
              Object.keys(returns.returnsByDepartment).length > 0 ? (
              <>
                <div className="returns-summary">
                  <p className="summary-text">
                    ✅ {returns.totalReturned} item(s) successfully returned
                  </p>
                </div>
                {Object.entries(returns.returnsByDepartment).map(
                  ([dept, items]) => (
                    <div key={dept} className="return-dept-card">
                      <h3 className="return-dept-name">
                        {dept}
                        <span className="return-badge">{items.length}</span>
                      </h3>
                      <div className="return-items-list">
                        {items.map((item) => (
                          <div key={item.id} className="return-item-row">
                            <div className="return-item-info">
                              <p className="return-item-desc">
                                {item.description}
                              </p>
                              <div className="return-item-meta">
                                <span className="return-type">
                                  {item.itemType}
                                </span>
                                <span className="return-date">
                                  Returned:{" "}
                                  {new Date(
                                    item.returnDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="return-condition">
                              <span className={`condition ${item.condition.toLowerCase()}`}>
                                {item.condition}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </>
            ) : (
              <div className="no-returns-notice">
                <p>No items returned yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          ITEMS TO RETURN
          ===================================================== */}
      {summary.totalItemsToReturn > 0 && (
        <div className="items-section">
          <h2 className="section-title">📦 Items to Return</h2>
          <div className="items-warning">
            <MdWarning /> You must return {summary.totalItemsToReturn} items
            before clearance is complete
          </div>

          {Object.entries(summary.itemsToReturn).map(([dept, items]) => (
            <div key={dept} className="dept-items-card">
              <h3 className="dept-name">
                {dept}{" "}
                <span className="item-badge">{items.itemsToReturn}</span>
              </h3>
              <div className="items-list">
                {items.items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-details">
                      <p className="item-description">{item.description}</p>
                      <span className="item-type">{item.itemType}</span>
                    </div>
                    <div className="item-qty">Qty: {item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          ACTION BUTTONS
          ===================================================== */}
      <div className="action-buttons">
        {isApproved && (
          <>
            <button className="btn btn-primary">
              <MdDownload /> Download Certificate
            </button>
            <button className="btn btn-secondary">
              <MdShare /> Share Certificate
            </button>
          </>
        )}
        {!isApproved && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/submit-clearance")}
          >
            <MdArrowForward /> Check Status Again
          </button>
        )}
      </div>

      {/* =====================================================
          AUTO-REFRESH TOGGLE
          ===================================================== */}
      <div className="settings-bar">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoRefreshEnabled}
            onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
          />
          Auto-refresh status
        </label>
        {refreshing && <span className="refreshing">Updating...</span>}
      </div>
    </div>
  );
}
