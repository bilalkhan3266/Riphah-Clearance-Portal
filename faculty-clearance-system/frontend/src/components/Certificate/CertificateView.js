import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './CertificateView.css';

export default function CertificateView() {
  const { clearanceId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [clearanceId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await axios.get(
        `${apiUrl}/api/certificate-view/${clearanceId}`
      );

      if (response.data.success) {
        setCertificate(response.data.data);
        setError('');
      } else {
        setError(response.data.message || 'Failed to load certificate');
      }
    } catch (err) {
      console.error('Certificate fetch error:', err);
      setError(err.response?.data?.message || 'Error loading certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.get(
        `${apiUrl}/api/certificate/${clearanceId}/download`,
        { responseType: 'blob' }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Clearance_Certificate_${certificate?.faculty_name || 'Faculty'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      alert('Error downloading certificate. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="cert-view-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cert-view-container">
        <div className="error-box">
          <h2>❌ Certificate Not Available</h2>
          <p>{error}</p>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Please contact the Faculty Clearance office if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="cert-view-container">
        <div className="error-box">
          <h2>❌ Certificate Not Found</h2>
          <p>The requested certificate could not be found.</p>
        </div>
      </div>
    );
  }

  const clearedDate = new Date(certificate.cleared_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const clearedDepartments = Object.entries(certificate.all_departments || {});

  return (
    <div className="cert-view-container">
      <div className="cert-view-header no-print">
        <div className="cert-view-title">
          <h1>📄 Clearance Certificate</h1>
        </div>
        <div className="cert-view-actions">
          <button onClick={handlePrint} className="action-btn print-btn">
            🖨️ Print
          </button>
          <button onClick={handleDownload} className="action-btn download-btn">
            ⬇️ Download PDF
          </button>
        </div>
      </div>

      <div className="certificate">
        <div className="cert-header">
          <div className="cert-logo">🎓</div>
          <h1>CLEARANCE CERTIFICATE</h1>
          <p>Riphah International University</p>
        </div>

        <div className="cert-body">
          <div className="cert-section greeting">
            <p className="greeting-text">
              This is to certify that
            </p>
            <h2 className="faculty-name">{certificate.faculty_name}</h2>
            <p className="designation">{certificate.designation || 'Faculty Member'}</p>
            <p className="cleared-message">
              has successfully completed the clearance process and has been <span className="badge-cleared">CLEARED</span> by all departments of Riphah International University.
            </p>
          </div>

          <div className="departments-section">
            <h3>Approved by All Departments:</h3>
            <div className="departments-grid">
              {clearedDepartments.map(([dept, info]) => (
                <div key={dept} className="dept-badge">
                  <span className="checkmark">✓</span>
                  <span className="dept-name">{info.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="qr-verification">
            <div className="qr-content">
              <p>Verification QR Code:</p>
              {certificate.qr_code && (
                <img src={certificate.qr_code} alt="Verification QR Code" className="qr-code" />
              )}
            </div>
          </div>

          <div className="cert-footer-content">
            <p className="cleared-date">Date of Clearance: <strong>{clearedDate}</strong></p>
            <p className="certificate-number">Certificate ID: <strong>{certificate.id}</strong></p>
            <div className="signature-line">
              <p>Faculty Clearance System</p>
              <p>Riphah International University</p>
            </div>
          </div>
        </div>

        <div className="print-only-footer">
          <p>This certificate has been generated by the Faculty Clearance System and is valid for official records.</p>
          <p>For verification, scan the QR code or visit: {process.env.REACT_APP_API_URL || 'http://localhost:5001'}/certificate-view/{certificate.id}</p>
        </div>
      </div>
    </div>
  );
}
