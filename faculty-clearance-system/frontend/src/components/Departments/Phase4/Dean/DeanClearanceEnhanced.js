import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { MdCheckCircle, MdMail, MdLogout, MdSend, MdReply, MdThumbUp, MdCancel, MdDownload, MdShowChart, MdInsertChart, MdAttachFile, MdDescription, MdRefresh, MdPushPin, MdAssignment, MdChat, MdClose, MdCheck, MdSchool, MdBarChart, MdTrendingUp, MdWarning, MdStar } from 'react-icons/md';
import axios from 'axios';
import '../../../Departments/Phase1/Library/LibraryClearance.css';

export default function DeanClearanceEnhanced({ onComplete }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, faculty-list, selected, messages, approved, rejected, analytics, issues, returns
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Clearance requests state (pending, approved, rejected)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  
  // Approved and Rejected requests
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  
  // Issues and Returns state
  const [departmentIssues, setDepartmentIssues] = useState([]);
  const [departmentReturns, setDepartmentReturns] = useState([]);
  // Issue/Return Forms
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    facultyId: '',
    facultyName: '',
    itemType: 'book',
    description: '',
    quantity: 1,
    dueDate: '',
    notes: ''
  });
  const [returnFormData, setReturnFormData] = useState({
    facultyId: '',
    referenceIssueId: '',
    quantityReturned: 1,
    condition: 'Good',
    notes: ''
  });
  
  // Clearance remarks and signature
  const [remarks, setRemarks] = useState('');
  const [signatureAuthorized, setSignatureAuthorized] = useState(false);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const DEPARTMENT = 'Dean';

  // Fetch clearance requests and messages on mount
  useEffect(() => {
    console.log('Dean Component Mounted - Fetching clearance requests...');
    fetchAllClearanceRequests();
    fetchMessages();
    fetchDepartmentIssues();
    fetchDepartmentReturns();
    // Auto-refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchAllClearanceRequests();
      fetchDepartmentIssues();
      fetchDepartmentReturns();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllClearanceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/clearance-requests?department=Dean`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.requests) {
        const requests = response.data.requests;
        
        // Filter for PENDING Dean approvals (no Dean status or not Approved/Rejected)
        const pending = requests.filter(req => 
          !req.departments?.Dean || 
          (req.departments?.Dean?.status !== 'Approved' && 
           req.departments?.Dean?.status !== 'Rejected')
        );
        setPendingRequests(pending);
        
        // Filter for APPROVED Dean requests
        const approved = requests.filter(req => 
          req.departments?.Dean?.status === 'Approved'
        );
        setApprovedRequests(approved);
        
        // Filter for REJECTED Dean requests
        const rejected = requests.filter(req => 
          req.departments?.Dean?.status === 'Rejected'
        );
        setRejectedRequests(rejected);
        
        console.log('Clearance Requests:', { pending, approved, rejected });
      }
    } catch (err) {
      console.error('Error fetching clearance requests:', err);
      setError('Failed to load clearance requests');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/my-messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchDepartmentIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/departments/${DEPARTMENT}/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDepartmentIssues(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching department issues:', err);
    }
  };

  const fetchDepartmentReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/departments/${DEPARTMENT}/returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDepartmentReturns(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching department returns:', err);
    }
  };

  // Dean-specific: Calculate key statistics
  const getTotalRequests = () => pendingRequests.length + approvedRequests.length + rejectedRequests.length;
  const getApprovalRate = () => {
    const total = getTotalRequests();
    if (total === 0) return 0;
    return Math.round((approvedRequests.length / total) * 100);
  };
  const getRejectionRate = () => {
    const total = getTotalRequests();
    if (total === 0) return 0;
    return Math.round((rejectedRequests.length / total) * 100);
  };
  const getPendingRate = () => {
    const total = getTotalRequests();
    if (total === 0) return 100;
    return Math.round((pendingRequests.length / total) * 100);
  };

  const handleSelectFaculty = (facultyId) => {
    const id = typeof facultyId === 'object' ? (facultyId?.faculty_id || facultyId?.employee_id || facultyId?._id) : facultyId;
    setSelectedFacultyId(id);
    setRemarks('');
    setSignatureAuthorized(false);
    setActiveTab('selected');
  };

  // Add Issue Handler
  const handleAddIssue = async (e) => {
    e.preventDefault();
    if (!issueFormData.facultyId || !issueFormData.description) {
      setError('Please fill in all required fields (Faculty ID, Description)');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/departments/${DEPARTMENT}/issue`,
        issueFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Issue created successfully!');
        setIssueFormData({
          facultyId: '',
          facultyName: '',
          itemType: 'book',
          description: '',
          quantity: 1,
          dueDate: '',
          notes: ''
        });
        setShowIssueForm(false);
        fetchDepartmentIssues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating issue');
    } finally {
      setLoading(false);
    }
  };

  // Add Return Handler
  const handleAddReturn = async (e) => {
    e.preventDefault();
    if (!returnFormData.facultyId || !returnFormData.referenceIssueId) {
      setError('Please fill in all required fields (Faculty ID, Issue Reference)');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/departments/${DEPARTMENT}/return`,
        returnFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Return recorded successfully!');
        setReturnFormData({
          facultyId: '',
          referenceIssueId: '',
          quantityReturned: 1,
          condition: 'Good',
          notes: ''
        });
        setShowReturnForm(false);
        fetchDepartmentReturns();
        fetchDepartmentIssues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording return');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = replyingTo 
        ? `${API_URL}/api/messages/reply/${replyingTo}`
        : `${API_URL}/api/send`;

      const response = await axios.post(
        endpoint,
        { 
          message: messageInput.trim(),
          department: DEPARTMENT,
          type: replyingTo ? 'reply' : 'message'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Message sent instantly!');
        setMessageInput('');
        setReplyingTo(null);
        // Immediately update local state without waiting for full fetch
        const newMessage = {
          _id: response.data.message_id || Date.now(),
          message: messageInput.trim(),
          sender_id: user?.id,
          sender_name: user?.full_name,
          created_at: new Date().toISOString(),
          status: 'sent'
        };
        setMessages([newMessage, ...messages]);
        setTimeout(() => setSuccess(''), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApprovalLetter = (request, approvalType) => {
    try {
      const faculty = request.faculty_id;
      const facultyName = faculty?.full_name || request.faculty_name || 'Faculty';
      const date = new Date(request.departments?.Dean?.checked_at).toLocaleDateString();
      
      let content = '';
      
      if (approvalType === 'approved') {
        content = `
CLEARANCE APPROVAL LETTER

Date: ${date}
To: ${facultyName}
Department: Dean

RE: DEAN CLEARANCE APPROVAL

Dear ${facultyName},

This is to certify that your clearance request for Dean Department has been APPROVED.

Status: APPROVED
Approved By: ${request.departments?.Dean?.approved_by || 'Dean Staff'}
Remarks: ${request.departments?.Dean?.remarks || 'Dean clearance completed successfully'}

You may proceed with the next phase of clearance process.

Regards,
Dean Department
Riphah International University
        `;
      } else {
        content = `
CLEARANCE REJECTION LETTER

Date: ${date}
To: ${facultyName}
Department: Dean

RE: DEAN CLEARANCE REJECTION

Dear ${facultyName},

Your clearance request for Dean Department has been REJECTED and requires further action.

Status: REJECTED
Rejected By: ${request.departments?.Dean?.rejected_by || 'Dean Staff'}
Reason: ${request.departments?.Dean?.remarks || 'Requirements not met'}

Please address the issues mentioned and resubmit your request.

Regards,
Dean Department
Riphah International University
        `;
      }

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dean_${approvalType === 'approved' ? 'Approval' : 'Rejection'}_${facultyName}_${date}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`${approvalType === 'approved' ? 'Approval' : 'Rejection'} letter downloaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download letter');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name || 'Dean Staff';
  const displayRole = user?.role || 'Staff';

  const receivedMessages = messages.filter(msg => msg.sender_id !== user?.id);

  // Debug log
  console.log('Selected Faculty ID:', selectedFacultyId);
  console.log('Pending Requests:', pendingRequests);
  console.log('Approved Requests:', approvedRequests);
  console.log('Rejected Requests:', rejectedRequests);

  return (
    <div className="department-page">
      <aside className="fd-sidebar">
        <div className="fd-profile">
          <div className="fd-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="fd-name">{displayName}</h3>
            <p className="fd-small">{displayRole} • Dean Office</p>
            <p className="fd-small" style={{fontSize: '0.75rem', marginTop: '4px'}}>Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button onClick={() => { fetchAllClearanceRequests(); setSuccess('Data refreshed'); setTimeout(() => setSuccess(''), 2000); }} className="fd-nav-btn" title="Refresh data">
            <MdRefresh /> Refresh
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`fd-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <MdShowChart className="nav-icon" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('faculty-list')} className={`fd-nav-btn ${activeTab === 'faculty-list' ? 'active' : ''}`}>
            <MdCheckCircle className="nav-icon" /> Faculty List
            {pendingRequests.length > 0 && (
              <span className="badge">{pendingRequests.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('approved')} className={`fd-nav-btn ${activeTab === 'approved' ? 'active' : ''}`}>
            <MdThumbUp className="nav-icon" /> Approved
            {approvedRequests.length > 0 && (
              <span className="badge">{approvedRequests.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('rejected')} className={`fd-nav-btn ${activeTab === 'rejected' ? 'active' : ''}`}>
            <MdCancel className="nav-icon" /> Rejected
            {rejectedRequests.length > 0 && (
              <span className="badge">{rejectedRequests.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`fd-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
            <MdInsertChart className="nav-icon" /> Analytics
          </button>
          <button onClick={() => setActiveTab('messages')} className={`fd-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}>
            <MdMail className="nav-icon" /> Messages
            {receivedMessages.length > 0 && (
              <span className="badge">{receivedMessages.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('issues')} className={`fd-nav-btn ${activeTab === 'issues' ? 'active' : ''}`}>
            <MdPushPin /> Create Issues
            {departmentIssues.length > 0 && (
              <span className="badge">{departmentIssues.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('returns')} className={`fd-nav-btn ${activeTab === 'returns' ? 'active' : ''}`}>
            <MdCheckCircle /> Record Returns
            {departmentReturns.length > 0 && (
              <span className="badge">{departmentReturns.length}</span>
            )}
          </button>
          <button onClick={handleLogout} className="fd-nav-btn logout">
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>

        <footer className="fd-footer">© 2025 Riphah</footer>
      </aside>

      <main className="fd-main">
        <header className="fd-header">
          <div>
            <h1><MdSchool /> Dean Clearance Processing</h1>
            <p>Highest Authority - Final Degree Conferment</p>
          </div>
        </header>

        {/* Error/Success Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section" style={{ display: 'grid', gap: '20px' }}>
            <div className="section-header">
              <h2><MdBarChart /> Dean Office Dashboard</h2>
              <p>Overview of all faculty clearance statuses and institutional statistics</p>
            </div>

            {/* Key Statistics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                borderLeft: '4px solid #2196f3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Total Clearances</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                  {getTotalRequests()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                  Including pending, approved, and rejected
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f3e5f5',
                borderRadius: '8px',
                borderLeft: '4px solid #9c27b0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Pending Processing</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9c27b0' }}>
                  {pendingRequests.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                  {getPendingRate()}% of total clearances
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                borderLeft: '4px solid #4caf50',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Degrees Conferred</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                  {approvedRequests.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                  {getApprovalRate()}% approval rate
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                borderLeft: '4px solid #f44336',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>Clearances Rejected</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f44336' }}>
                  {rejectedRequests.length}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                  {getRejectionRate()}% rejection rate
                </div>
              </div>
            </div>

            {/* Authority Badge */}
            <div style={{
              padding: '20px',
              backgroundColor: '#fce4ec',
              borderRadius: '8px',
              border: '2px solid #e91e63',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e91e63', marginBottom: '8px' }}>
                <MdStar /> HIGHEST AUTHORITY
              </div>
              <div style={{ fontSize: '0.95rem', color: '#555' }}>
                You have the authority to confer degrees upon successful completion of all clearance requirements.
                All approvals made by you are final and binding.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <button 
                className="fd-nav-btn"
                onClick={() => setActiveTab('faculty-list')}
                style={{ padding: '12px', fontSize: '1rem' }}
              >
                <MdAssignment /> Start Processing
              </button>
              <button 
                className="fd-nav-btn"
                onClick={() => setActiveTab('analytics')}
                style={{ padding: '12px', fontSize: '1rem' }}
              >
                <MdDownload /> View Reports
              </button>
              <button 
                className="fd-nav-btn"
                onClick={() => setActiveTab('approved')}
                style={{ padding: '12px', fontSize: '1rem' }}
              >
                <MdCheckCircle /> View Conferred
              </button>
            </div>
          </div>
        )}

        {/* FACULTY LIST TAB */}
        {activeTab === 'faculty-list' && (
          <div className="faculty-list-section">
            <div className="section-header">
              <h2><MdAssignment /> Faculty Members</h2>
              <p>Select a faculty to grant final clearance and confer degree</p>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="faculty-grid">
                {pendingRequests.map(request => {
                  const faculty = request.faculty_id;
                  return (
                    <div key={request._id} className="faculty-card">
                      <div className="faculty-avatar">{(faculty?.full_name || request.faculty_name)?.charAt(0).toUpperCase()}</div>
                      <div className="faculty-info">
                        <h3>{faculty?.full_name || request.faculty_name}</h3>
                        <p className="faculty-id">ID: {request.faculty_id?.faculty_id}</p>
                        <p className="faculty-designation">{faculty?.designation || 'Not specified'}</p>
                        <p className="faculty-department">Dept: {faculty?.department || 'Not specified'}</p>
                        <p className="faculty-location">Office: {faculty?.office_location || 'Not specified'}</p>
                        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <MdWarning /> Ready for final degree conferment verification
                        </div>
                      </div>
                      <button 
                        className="btn-process"
                        onClick={() => handleSelectFaculty(request.faculty_id)}
                      >
                        Confer Degree →
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p><MdCheckCircle /> All faculty cleared! All degrees conferred.</p>
              </div>
            )}
          </div>
        )}

        {/* SELECTED FACULTY TAB */}
        {activeTab === 'selected' && selectedFacultyId && (
          <div className="faculty-processing-section">
            {(() => {
              const selected = pendingRequests.find(req => 
                req.faculty_id?._id === selectedFacultyId || 
                req.faculty_id?.faculty_id === selectedFacultyId || 
                req._id === selectedFacultyId
              );
              return selected ? (
                <div>
                  <div className="processing-header">
                    <h2>Degree Conferment for {selected.faculty_id?.full_name || selected.faculty_name}</h2>
                    <button className="btn-back" onClick={() => setActiveTab('faculty-list')}>← Back</button>
                  </div>

                  <div className="library-clearance-form">
                    <div className="form-header">
                      <h3><MdSchool /> Final Degree Conferment Authority</h3>
                      <span className="phase-badge">Phase 4 - Degree Conferment (100%)</span>
                    </div>

                    <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '6px', marginBottom: '20px', border: '2px solid #4caf50' }}>
                      <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>
                        <MdCheckCircle /> All Clearances Verified
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#555' }}>
                        This faculty has completed ALL departmental clearances and is eligible for degree conferment. 
                        As Dean, your signature below grants the final authority to confer the degree.
                      </div>
                    </div>

                    
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* APPROVED REQUESTS TAB */}
        {activeTab === 'approved' && (
          <div className="approved-section">
            <div className="section-header">
              <h2><MdCheckCircle /> Degrees Conferred</h2>
              <p>Faculty members who have received their degree conferment from the Dean</p>
            </div>

            {approvedRequests.length > 0 ? (
              <div className="clearance-grid">
                {approvedRequests.map(request => (
                  <div key={request._id} className="clearance-card approved">
                    <div className="status-badge approved-badge"><MdSchool /> CONFERRED</div>
                    <div className="faculty-info-card">
                      <h3>{request.faculty_id?.full_name || request.faculty_name || 'Faculty'}</h3>
                      <p className="faculty-id">ID: {request.faculty_id?.faculty_id}</p>
                      <p className="faculty-email">{request.faculty_id?.email}</p>
                      <div className="approval-details">
                        <p><strong>Degree Conferment Date:</strong> {new Date(request.departments?.Dean?.checked_at).toLocaleDateString()}</p>
                        <p><strong>Conferred By:</strong> {request.departments?.Dean?.approved_by || 'Dean Office'}</p>
                        <p><strong>Status:</strong> <MdCheckCircle /> DEGREE CONFERRED - FULLY CLEARED</p>
                        <p><strong>Honors/Remarks:</strong> {request.departments?.Dean?.remarks || 'Degree conferred'}</p>
                      </div>

                      {/* Approval Files Section */}
                      <div className="approval-files-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#10b981', fontSize: '14px' }}>
                          <MdAttachFile /> Approval Documents
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleDownloadApprovalLetter(request, 'approved')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              backgroundColor: '#d1fae5',
                              color: '#047857',
                              border: '1px solid #6ee7b7',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#a7f3d0'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#d1fae5'}
                          >
                            <MdDownload size={16} /> Approval Letter
                          </button>
                          <button
                            onClick={() => window.print()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              backgroundColor: '#dbeafe',
                              color: '#0284c7',
                              border: '1px solid #7dd3fc',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#bfdbfe'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          >
                            <MdDescription size={16} /> Print Record
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No degrees conferred yet</p>
              </div>
            )}
          </div>
        )}

        {/* REJECTED REQUESTS TAB */}
        {activeTab === 'rejected' && (
          <div className="rejected-section">
            <div className="section-header">
              <h2><MdCancel /> Rejected Clearances</h2>
              <p>Faculty members with rejected Dean final clearance</p>
            </div>

            {rejectedRequests.length > 0 ? (
              <div className="clearance-grid">
                {rejectedRequests.map(request => (
                  <div key={request._id} className="clearance-card rejected">
                    <div className="status-badge rejected-badge"><MdCancel /> REJECTED</div>
                    <div className="faculty-info-card">
                      <h3>{request.faculty_id?.full_name || request.faculty_name || 'Faculty'}</h3>
                      <p className="faculty-id">ID: {request.faculty_id?.faculty_id}</p>
                      <p className="faculty-email">{request.faculty_id?.email}</p>
                      <div className="rejection-details">
                        <p><strong>Rejection Date:</strong> {new Date(request.departments?.Dean?.checked_at).toLocaleDateString()}</p>
                        <p><strong>Rejected By:</strong> {request.departments?.Dean?.rejected_by || 'Dean Office'}</p>
                        <p><strong>Reason:</strong> {request.departments?.Dean?.remarks || 'Dean final clearance not met'}</p>
                      </div>

                      {/* Rejection Files Section */}
                      <div className="rejection-files-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f5d5d5' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#dc2626', fontSize: '14px' }}>
                          <MdAttachFile /> Rejection Documents
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleDownloadApprovalLetter(request, 'rejected')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fca5a5',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
                          >
                            <MdDownload size={16} /> Rejection Letter
                          </button>
                          <button
                            onClick={() => window.print()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              backgroundColor: '#dbeafe',
                              color: '#0284c7',
                              border: '1px solid #7dd3fc',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#bfdbfe'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          >
                            <MdDescription size={16} /> Print Record
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No rejected clearance requests</p>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="analytics-section" style={{ display: 'grid', gap: '20px' }}>
            <div className="section-header">
              <h2><MdTrendingUp /> Clearance Analytics & Reports</h2>
              <p>Institutional clearance statistics and performance metrics</p>
            </div>

            {/* Charts and Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #eee'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Clearance Status Distribution</h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '20px', backgroundColor: '#9c27b0', borderRadius: '2px' }}></div>
                    <span>Pending: <strong>{pendingRequests.length}</strong> ({getPendingRate()}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '20px', backgroundColor: '#4caf50', borderRadius: '2px' }}></div>
                    <span>Approved: <strong>{approvedRequests.length}</strong> ({getApprovalRate()}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '30px', height: '20px', backgroundColor: '#f44336', borderRadius: '2px' }}></div>
                    <span>Rejected: <strong>{rejectedRequests.length}</strong> ({getRejectionRate()}%)</span>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #eee'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Processing Timeline</h3>
                <div style={{ fontSize: '0.95rem', color: '#666' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Total Processed:</strong> {getTotalRequests()} clearances
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Degrees Conferred:</strong> {approvedRequests.length}
                  </div>
                  <div>
                    <strong>Processing Rate:</strong> {getTotalRequests() > 0 ? Math.round((approvedRequests.length / getTotalRequests()) * 100) : 0}% completion
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #eee'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Institutional Summary</h3>
                <div style={{ fontSize: '0.95rem', color: '#666' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Institution:</strong> Riphah International University
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Authority Level:</strong> Dean Office (Highest)
                  </div>
                  <div>
                    <strong>Generated:</strong> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                className="fd-nav-btn"
                style={{ padding: '12px 24px', fontSize: '1rem', gap: '8px', display: 'inline-flex', alignItems: 'center' }}
              >
                <MdDownload /> Export Report (PDF)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="section-header">
              <h2><MdChat /> Messages</h2>
            </div>

            <div className="messages-container">
              <div className="messages-list">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`message-item ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                      <div className="message-header">
                        <strong>{msg.sender_name || 'Unknown'}</strong>
                        <span className="message-time">
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="message-body">{msg.message}</div>
                      {msg.sender_id !== user?.id && !replyingTo?.includes(msg._id) && (
                        <button 
                          className="reply-btn"
                          onClick={() => setReplyingTo(msg._id)}
                        >
                          <MdReply /> Reply
                        </button>
                      )}
                      {replyingTo === msg._id && (
                        <div className="reply-indicator">
                          <MdCheck /> Replying...
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-messages">No messages yet</p>
                )}
              </div>

              <div className="message-compose">
                {replyingTo && (
                  <div className="reply-indicator">
                    <span>Replying to message...</span>
                    <button className="close-reply" onClick={() => setReplyingTo(null)}><MdClose /></button>
                  </div>
                )}
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Ctrl+Enter to send)"
                  rows="4"
                />
                <button 
                  className="btn-send"
                  onClick={handleSendMessage}
                  disabled={loading || !messageInput.trim()}
                >
                  <MdSend /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="issues-section">
            <div className="section-header">
              <h2><MdPushPin /> Create Issues for Dean Department</h2>
              <p>Items that faculty members need to return to clear this department</p>
            </div>

            {departmentIssues.length > 0 ? (
              <div className="issues-list">
                {departmentIssues.map((issue) => (
                  <div key={issue._id} className="issue-card">
                    <div className="issue-header">
                      <h3>{issue.facultyId}</h3>
                      <span className={`status-badge ${issue.status?.toLowerCase()}`}>{issue.status}</span>
                    </div>
                    <div className="issue-details">
                      <p><strong>Item:</strong> {issue.description}</p>
                      <p><strong>Type:</strong> {issue.itemType}</p>
                      <p><strong>Quantity:</strong> {issue.quantity}</p>
                      <p><strong>Issued Date:</strong> {new Date(issue.issueDate).toLocaleDateString()}</p>
                      <p><strong>Due Date:</strong> {new Date(issue.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p><MdCheckCircle /> No pending issues for Dean department</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="returns-section">
            <div className="section-header">
              <h2><MdCheckCircle /> Record Returns for Dean Department</h2>
              <p>Items that have been successfully returned by faculty members</p>
            </div>

            {departmentReturns.length > 0 ? (
              <div className="returns-list">
                {departmentReturns.map((item) => (
                  <div key={item._id} className="return-card">
                    <div className="return-header">
                      <h3>{item.facultyId}</h3>
                      <span className={`condition-badge ${item.condition?.toLowerCase()}`}>{item.condition}</span>
                    </div>
                    <div className="return-details">
                      <p><strong>Returned Item:</strong> {item.issueReferenceNumber}</p>
                      <p><strong>Type:</strong> {item.itemType}</p>
                      <p><strong>Quantity Returned:</strong> {item.quantityReturned}</p>
                      <p><strong>Return Date:</strong> {new Date(item.returnDate).toLocaleDateString()}</p>
                      <p><strong>Received By:</strong> {item.receivedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No returned items yet for Dean department</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
