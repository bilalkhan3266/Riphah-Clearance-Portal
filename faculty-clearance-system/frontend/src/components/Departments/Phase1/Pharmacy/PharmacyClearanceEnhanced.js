import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { MdCheckCircle, MdMail, MdLogout, MdSend, MdReply, MdThumbUp, MdCancel, MdDownload, MdAttachFile, MdDescription, MdAssignment, MdClose, MdRefresh, MdPushPin, MdLocalPharmacy } from 'react-icons/md';
import axios from 'axios';
import '../Library/LibraryClearance.css';

export default function PharmacyClearanceEnhanced({ onComplete }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('faculty-list'); // faculty-list, selected, messages, approved, rejected, issues, returns
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Clearance requests state (pending, approved, rejected)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [remarks, setRemarks] = useState(''); // For approve/reject remarks
  
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
  
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const DEPARTMENT = 'Pharmacy';

  // Fetch clearance requests and messages on mount
  useEffect(() => {
    console.log('Pharmacy Component Mounted - Fetching clearance requests...');
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
      const response = await axios.get(`${API_URL}/api/clearance-requests?department=Pharmacy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.requests) {
        const requests = response.data.requests;
        
        // Filter for PENDING Pharmacy approvals (no Pharmacy status or not Approved/Rejected)
        const pending = requests.filter(req => 
          !req.departments?.Pharmacy || 
          (req.departments?.Pharmacy?.status !== 'Approved' && 
           req.departments?.Pharmacy?.status !== 'Rejected')
        );
        setPendingRequests(pending);
        
        // Filter for APPROVED Pharmacy requests
        const approved = requests.filter(req => 
          req.departments?.Pharmacy?.status === 'Approved'
        );
        setApprovedRequests(approved);
        
        // Filter for REJECTED Pharmacy requests
        const rejected = requests.filter(req => 
          req.departments?.Pharmacy?.status === 'Rejected'
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

  const handleSelectFaculty = (facultyId) => {
    const id = typeof facultyId === 'object' ? (facultyId?.faculty_id || facultyId?.employee_id || facultyId?._id) : facultyId;
    setSelectedFacultyId(id);
    setRemarks(''); // Clear previous remarks
    setActiveTab('selected');
  };

  // Approve Clearance Handler
  const handleApproveClearance = async () => {
    if (!remarks.trim()) {
      setError('Please provide remarks for approval');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/clearance-requests/${selectedFacultyId}/approve`,
        {
          department: DEPARTMENT,
          remarks: remarks || '${DEPARTMENT} clearance completed',
          approved_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Clearance approved successfully!');
        setTimeout(() => {
          setSelectedFacultyId(null);
          setRemarks('');
          fetchAllClearanceRequests();
          setActiveTab('approved');
          setTimeout(() => setSuccess(''), 3000);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving clearance');
    } finally {
      setLoading(false);
    }
  };

  // Reject Clearance Handler
  const handleRejectClearance = async () => {
    if (!remarks.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/clearance-requests/${selectedFacultyId}/reject`,
        {
          department: DEPARTMENT,
          remarks,
          rejected_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Clearance rejected and faculty notified!');
        setTimeout(() => {
          setSelectedFacultyId(null);
          setRemarks('');
          fetchAllClearanceRequests();
          setActiveTab('rejected');
          setTimeout(() => setSuccess(''), 3000);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting clearance');
    } finally {
      setLoading(false);
    }
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
      const date = new Date(request.departments?.Pharmacy?.checked_at).toLocaleDateString();
      
      let content = '';
      
      if (approvalType === 'approved') {
        content = `
CLEARANCE APPROVAL LETTER

Date: ${date}
To: ${facultyName}
Department: Pharmacy

RE: PHARMACY CLEARANCE APPROVAL

Dear ${facultyName},

This is to certify that your clearance request for Pharmacy Department has been APPROVED.

Status: APPROVED
Approved By: ${request.departments?.Pharmacy?.approved_by || 'Pharmacy Staff'}
Remarks: ${request.departments?.Pharmacy?.remarks || 'Pharmacy clearance completed successfully'}

You may proceed with the next phase of clearance process.

Regards,
Pharmacy Department
Riphah International University
        `;
      } else {
        content = `
CLEARANCE REJECTION LETTER

Date: ${date}
To: ${facultyName}
Department: Pharmacy

RE: PHARMACY CLEARANCE REJECTION

Dear ${facultyName},

Your clearance request for Pharmacy Department has been REJECTED and requires further action.

Status: REJECTED
Rejected By: ${request.departments?.Pharmacy?.rejected_by || 'Pharmacy Staff'}
Reason: ${request.departments?.Pharmacy?.remarks || 'Requirements not met'}

Please address the issues mentioned and resubmit your request.

Regards,
Pharmacy Department
Riphah International University
        `;
      }

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pharmacy_${approvalType === 'approved' ? 'Approval' : 'Rejection'}_${facultyName}_${date}.txt`);
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

  const displayName = user?.full_name || 'Pharmacy Staff';
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
            <p className="fd-small">{displayRole} • Pharmacy Department</p>
            <p className="fd-small" style={{fontSize: '0.75rem', marginTop: '4px'}}>Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button onClick={() => { fetchAllClearanceRequests(); setSuccess('Data refreshed'); setTimeout(() => setSuccess(''), 2000); }} className="fd-nav-btn" title="Refresh data">
            <MdRefresh className="nav-icon" /> Refresh
          </button>
          <button onClick={() => setActiveTab('faculty-list')} className={`fd-nav-btn ${activeTab === 'faculty-list' ? 'active' : ''}`}>
            <MdCheckCircle className="nav-icon" /> Faculty List
            {pendingRequests.length > 0 && (
              <span className="badge">{pendingRequests.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('messages')} className={`fd-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}>
            <MdMail className="nav-icon" /> Messages
            {receivedMessages.length > 0 && (
              <span className="badge">{receivedMessages.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('issues')} className={`fd-nav-btn ${activeTab === 'issues' ? 'active' : ''}`}>
            <MdPushPin className="nav-icon" /> Create Issues
            {departmentIssues.length > 0 && (
              <span className="badge">{departmentIssues.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('returns')} className={`fd-nav-btn ${activeTab === 'returns' ? 'active' : ''}`}>
            <MdCheckCircle className="nav-icon" /> Record Returns
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
            <h1><MdLocalPharmacy style={{verticalAlign:'middle',marginRight:'8px'}} /> Pharmacy Clearance Processing</h1>
            <p>Manage faculty clearance requests</p>
          </div>
        </header>

        {/* Error/Success Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* FACULTY LIST TAB */}
        {activeTab === 'faculty-list' && (
          <div className="faculty-list-section">
            <div className="section-header">
              <h2><MdAssignment style={{verticalAlign:'middle',marginRight:'8px'}} /> Faculty Members</h2>
              <p>Select a faculty to process their pharmacy clearance</p>
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
                      </div>
                      <button 
                        className="btn-process"
                        onClick={() => handleSelectFaculty(request.faculty_id)}
                      >
                        Process Clearance →
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p><MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px',color:'#10b981'}} /> All faculty cleared! No pending requests.</p>
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
                    <h2>Faculty Clearance Status: {selected.faculty_id?.full_name || selected.faculty_name}</h2>
                    <button className="btn-back" onClick={() => setActiveTab('faculty-list')}>← Back</button>
                  </div>

                  <div className="library-clearance-form">
                    <div className="form-header">
                      <h3><MdLocalPharmacy style={{verticalAlign:'middle',marginRight:'8px'}} /> Pharmacy Clearance Processing</h3>
                      <span className="phase-badge">Phase 1 - Health & Safety (25%)</span>
                    </div>

                    {/* Manual Approval/Rejection Section */}
                    <div style={{
                      padding: '20px',
                      marginTop: '20px',
                      backgroundColor: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '8px'
                    }}>
                      <h4 style={{ marginTop: '0', color: '#6b21a8' }}>Department Approval/Rejection</h4>
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 16px 0' }}>
                        Provide remarks and make a final approval or rejection decision
                      </p>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                          Remarks / Comments *
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Enter your remarks for approval/rejection..."
                          rows="5"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn-approve" 
                          onClick={handleApproveClearance}
                          disabled={loading || !remarks.trim()}
                          style={{
                            flex: '1',
                            minWidth: '150px',
                            padding: '10px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading || !remarks.trim() ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: loading || !remarks.trim() ? '0.5' : '1',
                            transition: 'all 0.2s'
                          }}
                        >
                          <MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> {loading ? 'Processing...' : 'Approve Clearance'}
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={handleRejectClearance}
                          disabled={loading || !remarks.trim()}
                          style={{
                            flex: '1',
                            minWidth: '150px',
                            padding: '10px 20px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading || !remarks.trim() ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            opacity: loading || !remarks.trim() ? '0.5' : '1',
                            transition: 'all 0.2s'
                          }}
                        >
                          <MdCancel style={{verticalAlign:'middle',marginRight:'4px'}} /> {loading ? 'Processing...' : 'Reject & Request Resolution'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="section-header">
              <h2><MdMail style={{verticalAlign:'middle',marginRight:'8px'}} /> Messages</h2>
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
                          <MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> Replying...
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
              <h2><MdPushPin style={{verticalAlign:'middle',marginRight:'8px'}} /> Issue Management</h2>
              <p>Create and manage issues (items faculty need to return)</p>
            </div>

            {/* Add Issue Form */}
            <div style={{ marginBottom: '24px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowIssueForm(!showIssueForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {showIssueForm ? <><MdClose /> Cancel</> : '+ Create New Issue'}
              </button>

              {showIssueForm && (
                <form onSubmit={handleAddIssue} style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Faculty ID *</label>
                    <input
                      type="text"
                      required
                      value={issueFormData.facultyId}
                      onChange={(e) => setIssueFormData({...issueFormData, facultyId: e.target.value})}
                      placeholder="e.g. E12345"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Faculty Name</label>
                    <input
                      type="text"
                      value={issueFormData.facultyName}
                      onChange={(e) => setIssueFormData({...issueFormData, facultyName: e.target.value})}
                      placeholder="Enter faculty name"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Item Type *</label>
                      <select
                        required
                        value={issueFormData.itemType}
                        onChange={(e) => setIssueFormData({...issueFormData, itemType: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      >
                        <option value="book">Book</option>
                        <option value="equipment">Equipment</option>
                        <option value="fee">Fee</option>
                        <option value="document">Document</option>
                        <option value="access-card">Access Card</option>
                        <option value="property">Property</option>
                        <option value="dues">Dues</option>
                        <option value="report">Report</option>
                        <option value="key">Key</option>
                        <option value="material">Material</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={issueFormData.quantity}
                        onChange={(e) => setIssueFormData({...issueFormData, quantity: parseInt(e.target.value) || 1})}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
                    <textarea
                      required
                      value={issueFormData.description}
                      onChange={(e) => setIssueFormData({...issueFormData, description: e.target.value})}
                      placeholder="Describe the issue or item"
                      rows="3"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Due Date</label>
                      <input
                        type="date"
                        value={issueFormData.dueDate}
                        onChange={(e) => setIssueFormData({...issueFormData, dueDate: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notes</label>
                    <textarea
                      value={issueFormData.notes}
                      onChange={(e) => setIssueFormData({...issueFormData, notes: e.target.value})}
                      placeholder="Additional notes"
                      rows="2"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Creating...' : <><MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> Create Issue</>}
                  </button>
                </form>
              )}
            </div>

            {/* Issues List */}
            {departmentIssues.length > 0 ? (
              <div className="issues-list">
                {departmentIssues.map((issue) => (
                  <div key={issue._id} className="issue-card" style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div className="issue-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: '0' }}>{issue.facultyId}</h3>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: issue.status === 'Cleared' ? '#d1fae5' : '#fef3c7',
                        color: issue.status === 'Cleared' ? '#047857' : '#92400e',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>{issue.status}</span>
                    </div>
                    <div className="issue-details" style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <p style={{ margin: '0' }}><strong>Item:</strong> {issue.description}</p>
                      <p style={{ margin: '0' }}><strong>Type:</strong> {issue.itemType}</p>
                      <p style={{ margin: '0' }}><strong>Quantity:</strong> {issue.quantity}</p>
                      <p style={{ margin: '0' }}><strong>Issued:</strong> {new Date(issue.issueDate).toLocaleDateString()}</p>
                      {issue.dueDate && <p style={{ margin: '0' }}><strong>Due:</strong> {new Date(issue.dueDate).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#065f46'
              }}>
                <p style={{ fontSize: '18px' }}><MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px',color:'#10b981'}} /> No pending issues for Pharmacy department</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="returns-section">
            <div className="section-header">
              <h2><MdCheckCircle style={{verticalAlign:'middle',marginRight:'8px',color:'#10b981'}} /> Return Management</h2>
              <p>Record items returned by faculty members</p>
            </div>

            {/* Add Return Form */}
            <div style={{ marginBottom: '24px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowReturnForm(!showReturnForm)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {showReturnForm ? <><MdClose /> Cancel</> : '+ Record Return'}
              </button>

              {showReturnForm && (
                <form onSubmit={handleAddReturn} style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Faculty ID *</label>
                    <input
                      type="text"
                      required
                      value={returnFormData.facultyId}
                      onChange={(e) => setReturnFormData({...returnFormData, facultyId: e.target.value})}
                      placeholder="e.g. E12345"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Issue Reference *</label>
                    <select
                      required
                      value={returnFormData.referenceIssueId}
                      onChange={(e) => setReturnFormData({...returnFormData, referenceIssueId: e.target.value})}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    >
                      <option value="">-- Select an issue to return --</option>
                      {departmentIssues.map(issue => (
                        <option key={issue._id} value={issue._id}>
                          Ref #{issue.issueReferenceNumber} - {issue.itemType} ({issue.quantity} qty) - {issue.facultyId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quantity Returned</label>
                      <input
                        type="number"
                        min="1"
                        value={returnFormData.quantityReturned}
                        onChange={(e) => setReturnFormData({...returnFormData, quantityReturned: parseInt(e.target.value) || 1})}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Condition *</label>
                      <select
                        required
                        value={returnFormData.condition}
                        onChange={(e) => setReturnFormData({...returnFormData, condition: e.target.value})}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      >
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notes</label>
                    <textarea
                      value={returnFormData.notes}
                      onChange={(e) => setReturnFormData({...returnFormData, notes: e.target.value})}
                      placeholder="Additional notes about the return"
                      rows="2"
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Recording...' : <><MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> Record Return</>}
                  </button>
                </form>
              )}
            </div>

            {/* Returns List */}
            {departmentReturns.length > 0 ? (
              <div className="returns-list">
                {departmentReturns.map((item) => (
                  <div key={item._id} className="return-card" style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <div className="return-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: '0' }}>{item.facultyId}</h3>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: item.condition === 'Good' ? '#d1fae5' : '#fecaca',
                        color: item.condition === 'Good' ? '#047857' : '#991b1b',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>{item.condition}</span>
                    </div>
                    <div className="return-details" style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <p style={{ margin: '0' }}><strong>Issue Ref:</strong> {item.issueReferenceNumber}</p>
                      <p style={{ margin: '0' }}><strong>Quantity:</strong> {item.quantityReturned}</p>
                      <p style={{ margin: '0' }}><strong>Return Date:</strong> {new Date(item.returnDate).toLocaleDateString()}</p>
                      <p style={{ margin: '0' }}><strong>Received By:</strong> {item.receivedBy || 'Pharmacy Staff'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#065f46'
              }}>
                <p style={{ fontSize: '18px' }}>No returned items yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
