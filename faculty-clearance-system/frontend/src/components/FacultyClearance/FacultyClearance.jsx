import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FacultyClearance.css';

const FacultyClearance = () => {
  const [clearanceData, setCleeanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [certificateAvailable, setCertificateAvailable] = useState(false);

  const facultyId = localStorage.getItem('employeeId') || localStorage.getItem('facultyId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClearanceStatus();
  }, []);

  const fetchClearanceStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clearance/${facultyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCleeanceData(response.data.data);
        
        // Set QR code if available
        if (response.data.data.qrCode?.data) {
          setQrCodeUrl(response.data.data.qrCode.data);
        }

        // Check if certificate is available
        if (response.data.data.overallStatus === 'Completed' && response.data.data.certificatePath) {
          setCertificateAvailable(true);
        }
      }
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No clearance record found. Submit a new request to begin.');
        setCleeanceData(null);
      } else {
        setError(err.response?.data?.message || 'Error fetching clearance status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClearance = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        '/api/clearance/submit',
        { facultyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCleeanceData(response.data.data);
        if (response.data.data.qrCode?.data) {
          setQrCodeUrl(response.data.data.qrCode.data);
        }
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting clearance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get(`/api/clearance/${facultyId}/certificate`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Clearance_Certificate_${facultyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      setError('Error downloading certificate');
    }
  };

  const handleReEvaluate = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/clearance/${facultyId}/re-evaluate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCleeanceData(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error re-evaluating clearance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="clearance-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading clearance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clearance-container">
      <div className="clearance-header">
        <h1>📋 Faculty Clearance Status</h1>
        <p className="subtitle">Track your departmental clearance approval</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!clearanceData ? (
        // No clearance record - show submit button
        <div className="no-record-section">
          <div className="card no-record-card">
            <div className="card-header warning">
              <h2>No Clearance Record Found</h2>
            </div>
            <div className="card-body">
              <p>You haven't submitted a clearance request yet. Click the button below to initiate the process.</p>
              <p className="info-text">
                The system will automatically check all departments and determine your clearance status.
              </p>
              <button 
                className="btn btn-primary btn-large"
                onClick={handleSubmitClearance}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Submit Clearance Request'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Status Card */}
          <div className="overall-status-card">
            <div className={`status-indicator ${clearanceData.overallStatus.toLowerCase()}`}>
              {clearanceData.overallStatus === 'Completed' ? '✓' : '⚠️'}
            </div>
            <div className="status-content">
              <h2>Overall Status</h2>
              <p className={`status-badge ${clearanceData.overallStatus.toLowerCase()}`}>
                {clearanceData.overallStatus === 'Completed' ? 'Approved' : 'Pending'}
              </p>
              {clearanceData.completionDate && (
                <p className="completion-date">
                  Completed on: {new Date(clearanceData.completionDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* QR Code Section - Only show if approved */}
          {clearanceData.overallStatus === 'Completed' && qrCodeUrl && (
            <div className="qr-certificate-section">
              <div className="qr-code-card">
                <h3>Verification QR Code</h3>
                <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                <p className="qr-info">Scan to verify your clearance</p>
              </div>

              {certificateAvailable && (
                <div className="certificate-card">
                  <h3>📄 Certificate</h3>
                  <p>Your clearance certificate is ready to download.</p>
                  <button 
                    className="btn btn-success"
                    onClick={handleDownloadCertificate}
                  >
                    Download Certificate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Departments Grid */}
          <div className="departments-section">
            <h2>Department Clearance Status</h2>
            <div className="departments-grid">
              {clearanceData.phases && clearanceData.phases.map((phase, index) => (
                <div key={index} className={`dept-card ${phase.status.toLowerCase()}`}>
                  <div className="dept-header">
                    <h3>{phase.name}</h3>
                    <span className={`status-icon ${phase.status.toLowerCase()}`}>
                      {phase.status === 'Approved' ? '✓' : phase.status === 'Rejected' ? '✗' : '⏳'}
                    </span>
                  </div>
                  <div className="dept-body">
                    <p className={`dept-status ${phase.status.toLowerCase()}`}>
                      {phase.status}
                    </p>
                    {phase.remarks && <p className="remarks">{phase.remarks}</p>}
                    {phase.approvedDate && (
                      <p className="approved-date">
                        {new Date(phase.approvedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rejected Departments List */}
          {clearanceData.rejectedDepartments && clearanceData.rejectedDepartments.length > 0 && (
            <div className="rejected-section">
              <div className="card alert-card">
                <div className="card-header error">
                  <h2>⚠️ Action Required</h2>
                </div>
                <div className="card-body">
                  <p className="warning-text">
                    Your clearance has been rejected. Please clear the pending items in the following departments:
                  </p>
                  <ul className="rejected-list">
                    {clearanceData.rejectedDepartments.map((dept, index) => (
                      <li key={index}>
                        <strong>{dept.name}:</strong> {dept.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="next-steps">
                    Once you have cleared all pending items, click the "Re-evaluate" button below to resubmit your clearance request.
                  </p>
                  <button 
                    className="btn btn-warning"
                    onClick={handleReEvaluate}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Re-evaluate Clearance'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {clearanceData.overallStatus === 'Rejected' && (
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleReEvaluate}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Re-evaluate Clearance'}
              </button>
            </div>
          )}

          {/* Success Message */}
          {clearanceData.overallStatus === 'Completed' && (
            <div className="alert alert-success">
              ✓ Congratulations! You have been cleared by all departments. Your certificate has been emailed to you.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyClearance;
