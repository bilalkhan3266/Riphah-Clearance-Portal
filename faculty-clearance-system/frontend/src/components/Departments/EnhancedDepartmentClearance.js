import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { MdDashboard, MdFileUpload, MdCheckCircle, MdCancel, MdMail, MdEdit, MdLogout, MdSend, MdReply, MdPushPin, MdAssignment, MdChat, MdHourglassEmpty, MdClose, MdCheck, MdSave, MdFolder, MdPerson } from 'react-icons/md';
import axios from 'axios';
import './EnhancedDepartmentClearance.css';

/**
 * Generic Enhanced Department Clearance Component
 * Usage: Pass departmentConfig with name, icon, checklist items
 */
export default function EnhancedDepartmentClearance({ 
  departmentConfig, 
  facultyId, 
  onComplete 
}) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('clearance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Phase state
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isDeptInPhase, setIsDeptInPhase] = useState(false);
  
  // Clearance state
  const [checklist, setChecklist] = useState({});
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('pending');
  const [clearanceHistory, setClearanceHistory] = useState([]);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  
  // Edit Profile state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    designation: user?.designation || '',
    password: '',
    confirmPassword: ''
  });

  // Issues and Returns state
  const [issues, setIssues] = useState([]);
  const [returns, setReturns] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const DEPARTMENT = departmentConfig?.name || 'Department';

  // Initialize checklist from config
  useEffect(() => {
    if (departmentConfig?.checklistItems) {
      const initialChecklist = {};
      departmentConfig.checklistItems.forEach(item => {
        initialChecklist[item.key] = false;
      });
      setChecklist(initialChecklist);
    }
  }, [departmentConfig]);

  // Fetch clearance history and messages
  useEffect(() => {
    fetchClearanceHistory();
    fetchCurrentPhase();
    fetchMessages();
    fetchIssuesAndReturns();
  }, []);

  const fetchCurrentPhase = async () => {
    try {
      const token = localStorage.getItem('token');
      const requests = await axios.get(`${API_URL}/api/clearance-requests?department=${DEPARTMENT}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (requests.data.currentPhase) {
        setCurrentPhase(requests.data.currentPhase);
        const deptPhase = getDepartmentPhase(DEPARTMENT);
        setIsDeptInPhase(requests.data.currentPhase === deptPhase);
      }
    } catch (err) {
      console.error('Error fetching current phase:', err);
    }
  };

  const getDepartmentPhase = (department) => {
    const PHASES = {
      'Phase 1': ['Library', 'Pharmacy'],
      'Phase 2': ['Finance', 'HR', 'Records'],
      'Phase 3': ['IT', 'ORIC', 'Admin'],
      'Phase 4': ['Warden', 'HOD', 'Dean']
    };
    
    for (const [phase, depts] of Object.entries(PHASES)) {
      if (depts.includes(department)) {
        return phase;
      }
    }
    return 'Unknown';
  };

  const fetchClearanceHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/clearance-requests?department=${DEPARTMENT}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setClearanceHistory(response.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching clearance history:', err);
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

  const fetchIssuesAndReturns = async () => {
    try {
      setIssuesLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch issues
      const issuesResponse = await axios.get(
        `${API_URL}/api/departments/${DEPARTMENT}/issues`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (issuesResponse.data?.data) {
        setIssues(issuesResponse.data.data);
      }

      // Fetch returns
      const returnsResponse = await axios.get(
        `${API_URL}/api/departments/${DEPARTMENT}/returns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (returnsResponse.data?.data) {
        setReturns(returnsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching issues and returns:', err);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApproveClearance = async () => {
    const requiredItems = departmentConfig?.checklistItems?.filter(item => item.required);
    const allRequiredChecked = requiredItems?.every(item => checklist[item.key]);

    if (!allRequiredChecked) {
      setError(`All required items for ${DEPARTMENT} must be verified`);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/clearance-requests/${facultyId}/approve`,
        {
          department: DEPARTMENT,
          checklist,
          remarks,
          approved_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`${DEPARTMENT} clearance approved successfully!`);
        setStatus('approved');
        fetchClearanceHistory();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error approving ${DEPARTMENT} clearance`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClearance = async () => {
    if (!remarks.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/clearance-requests/${facultyId}/reject`,
        {
          department: DEPARTMENT,
          remarks,
          rejected_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`${DEPARTMENT} clearance rejected. Faculty notified.`);
        setStatus('rejected');
        fetchClearanceHistory();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error rejecting clearance`);
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
        : `${API_URL}/api/messages/send`;

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
        setSuccess('Message sent successfully!');
        setMessageInput('');
        setReplyingTo(null);
        fetchMessages();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.email || !profileData.full_name) {
      setError('Email and name are required');
      return;
    }

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/update-profile`,
        {
          email: profileData.email,
          full_name: profileData.full_name,
          designation: profileData.designation,
          ...(profileData.password && { password: profileData.password })
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name || 'Faculty';
  const displayId = user?.faculty_id || 'N/A';
  const displayDept = user?.department || 'N/A';

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'sent') return msg.sender_id === user?.id;
    if (messageFilter === 'received') return msg.receiver_id === user?.id;
    if (messageFilter === 'pending') return msg.status === 'pending' || msg.status === 'unread';
    return true;
  });

  const pendingMessages = messages.filter(m => m.status === 'pending' || m.status === 'unread');

  return (
    <div className="department-page">
      <aside className="fd-sidebar">
        <div className="fd-profile">
          <div className="fd-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="fd-name">{displayName}</h3>
            <p className="fd-small">{displayId} • {displayDept}</p>
            <p className="fd-small" style={{fontSize: '0.75rem', marginTop: '4px'}}>Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          {user?.role === 'faculty' ? (
            <>
              <button onClick={() => navigate("/faculty-dashboard")} className="fd-nav-btn">
                <MdDashboard className="nav-icon" /> Dashboard
              </button>
              <button onClick={() => navigate("/faculty-clearance")} className="fd-nav-btn">
                <MdFileUpload className="nav-icon" /> Submit Clearance
              </button>
              <button onClick={() => navigate("/faculty-clearance-status")} className="fd-nav-btn">
                <MdCheckCircle className="nav-icon" /> Clearance Status
              </button>
              <button onClick={() => navigate("/faculty-messages")} className="fd-nav-btn">
                <MdMail className="nav-icon" /> Messages
                {pendingMessages.length > 0 && (
                  <span className="badge">{pendingMessages.length}</span>
                )}
              </button>
              <button onClick={() => navigate("/faculty-edit-profile")} className="fd-nav-btn">
                <MdEdit className="nav-icon" /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="nav-section-title">Department Staff</div>
              <p className="nav-info"><MdPushPin style={{verticalAlign:'middle',marginRight:'4px'}} /> {departmentConfig?.icon} {departmentConfig?.name} Clearance Officer</p>
              <button 
                onClick={() => setActiveTab('clearance')}
                className={`fd-nav-btn ${activeTab === 'clearance' ? 'active' : ''}`}
              >
                <MdDashboard className="nav-icon" /> Clearance Form
              </button>
              <button 
                onClick={() => setActiveTab('issues')}
                className={`fd-nav-btn ${activeTab === 'issues' ? 'active' : ''}`}
              >
                <MdFileUpload className="nav-icon" /> Issue Files ({issues.length})
              </button>
              <button 
                onClick={() => setActiveTab('returns')}
                className={`fd-nav-btn ${activeTab === 'returns' ? 'active' : ''}`}
              >
                <MdCheckCircle className="nav-icon" /> Return Files ({returns.length})
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`fd-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
              >
                <MdMail className="nav-icon" /> Messages
              </button>
              <button onClick={() => window.location.reload()} className="fd-nav-btn">
                <MdDashboard className="nav-icon" /> Refresh
              </button>
            </>
          )}
          <button onClick={handleLogout} className="fd-nav-btn logout">
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>

        <footer className="fd-footer">© 2025 Riphah</footer>
      </aside>

      <main className="fd-main">
        <header className="fd-header">
          <div>
            <h1>{departmentConfig?.icon} {departmentConfig?.name} Clearance</h1>
            <p>{departmentConfig?.phase || 'Phase'} - {departmentConfig?.description || 'Department Clearance'}</p>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'clearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('clearance')}
          >
            <MdAssignment style={{verticalAlign:'middle',marginRight:'4px'}} /> Clearance Form
          </button>
          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MdChat style={{verticalAlign:'middle',marginRight:'4px'}} /> Messages {messages.length > 0 && `(${messages.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <MdHourglassEmpty style={{verticalAlign:'middle',marginRight:'4px'}} /> Pending {pendingMessages.length > 0 && `(${pendingMessages.length})`}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <MdFolder style={{verticalAlign:'middle',marginRight:'4px'}} /> Issue Files ({issues.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            <MdCheck style={{verticalAlign:'middle',marginRight:'4px'}} /> Return Files ({returns.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <MdPerson style={{verticalAlign:'middle',marginRight:'4px'}} /> Edit Profile
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* CLEARANCE TAB */}
        {activeTab === 'clearance' && (
          <div className="department-clearance-form">
            <div className="form-header">
              <h2>{departmentConfig?.icon} {departmentConfig?.name} Clearance Form</h2>
              <span className="phase-badge">{departmentConfig?.phase || 'Phase'}</span>
            </div>

            <div className="checklist">
              {departmentConfig?.checklistItems?.map((item, idx) => (
                <label key={idx}>
                  <input
                    type="checkbox"
                    checked={checklist[item.key] || false}
                    onChange={() => handleCheckboxChange(item.key)}
                  />
                  {item.required && <span className="required">*</span>}
                  {item.label}
                </label>
              ))}
            </div>

            <div className="remarks-section">
              <label>Remarks & Comments:</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add notes about the clearance, approve/reject reasons..."
                rows="6"
              />
            </div>

            <div className="button-group">
              {!isDeptInPhase && (
                <div className="alert alert-info">
                  <p><MdHourglassEmpty style={{verticalAlign:'middle',marginRight:'4px'}} /> This request is not yet in {DEPARTMENT}'s approval phase.</p>
                  <p>Current Phase: {currentPhase}</p>
                  <p>Once the current phase is completed, {DEPARTMENT} will be activated.</p>
                </div>
              )}
              <button 
                className="btn-approve" 
                onClick={handleApproveClearance}
                disabled={loading || !isDeptInPhase}
                title={!isDeptInPhase ? `Awaiting Phase Assignment` : ''}
              >
                {!isDeptInPhase ? <><MdHourglassEmpty style={{verticalAlign:'middle'}} /> Awaiting Phase Assignment</> : (loading ? <><MdCheckCircle style={{verticalAlign:'middle'}} /> Processing...</> : <><MdCheckCircle style={{verticalAlign:'middle'}} /> Approve {DEPARTMENT} Clearance</>)}
              </button>
              <button 
                className="btn-reject"
                onClick={handleRejectClearance}
                disabled={loading || !isDeptInPhase}
                title={!isDeptInPhase ? `Awaiting Phase Assignment` : ''}
              >
                {!isDeptInPhase ? <><MdHourglassEmpty style={{verticalAlign:'middle'}} /> Awaiting Phase Assignment</> : (loading ? <><MdCancel style={{verticalAlign:'middle'}} /> Processing...</> : 'Reject & Request Resolution')}
              </button>
            </div>

            {status === 'approved' && (
              <div className="success-message">
                <MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> {DEPARTMENT} clearance approved! Faculty may proceed to next phase.
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="messages-tab">
            <div className="messages-header">
              <h2><MdChat style={{verticalAlign:'middle',marginRight:'4px'}} /> Messages</h2>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${messageFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${messageFilter === 'sent' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('sent')}
                >
                  Sent
                </button>
                <button 
                  className={`filter-btn ${messageFilter === 'received' ? 'active' : ''}`}
                  onClick={() => setMessageFilter('received')}
                >
                  Received
                </button>
              </div>
            </div>

            <div className="messages-list">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg, idx) => (
                  <div key={idx} className={`message-item ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                    <div className="message-header">
                      <strong>{msg.sender_name || 'Unknown'}</strong>
                      <span className="message-time">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="message-body">{msg.message}</div>
                    {msg.sender_id !== user?.id && (
                      <button 
                        className="reply-btn"
                        onClick={() => setReplyingTo(msg._id)}
                      >
                        <MdReply /> Reply
                      </button>
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
                  Replying to message... 
                  <button className="close-reply" onClick={() => setReplyingTo(null)}><MdClose /></button>
                </div>
              )}
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                rows="4"
              />
              <button 
                className="btn-send"
                onClick={handleSendMessage}
                disabled={loading}
              >
                <MdSend /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="pending-tab">
            <h2><MdHourglassEmpty style={{verticalAlign:'middle',marginRight:'4px'}} /> Pending Messages & Requests</h2>
            {pendingMessages.length > 0 ? (
              <div className="pending-list">
                {pendingMessages.map((msg, idx) => (
                  <div key={idx} className="pending-item">
                    <div className="pending-header">
                      <strong>{msg.sender_name || 'Department'}</strong>
                      <span className="pending-badge">PENDING</span>
                    </div>
                    <div className="pending-body">{msg.message}</div>
                    <button 
                      className="reply-btn-pending"
                      onClick={() => {
                        setActiveTab('messages');
                        setReplyingTo(msg._id);
                      }}
                    >
                      <MdReply /> Reply Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-pending"><MdCheckCircle style={{verticalAlign:'middle',marginRight:'4px'}} /> No pending messages or requests</p>
            )}

            <div className="clearance-history">
              <h3><MdAssignment style={{verticalAlign:'middle',marginRight:'4px'}} /> Recent Clearance Requests</h3>
              {clearanceHistory.length > 0 ? (
                clearanceHistory.map((req, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-status" style={{
                      backgroundColor: req.status === 'Approved' ? '#10b981' : 
                                      req.status === 'Pending' ? '#f59e0b' : '#ef4444'
                    }}>
                      {req.status}
                    </div>
                    <div className="history-details">
                      <p><strong>{req.department}</strong></p>
                      <p className="history-date">Submitted: {new Date(req.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No clearance requests yet</p>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="form-header">
              <h2><MdPerson style={{verticalAlign:'middle',marginRight:'4px'}} /> Edit Profile</h2>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="your.email@riphah.edu.pk"
                />
              </div>

              <div className="form-group">
                <label>Designation:</label>
                <input
                  type="text"
                  value={profileData.designation}
                  onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                  placeholder="Your designation"
                />
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep current):</label>
                <input
                  type="password"
                  value={profileData.password}
                  onChange={(e) => setProfileData({...profileData, password: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                  placeholder="Confirm password"
                />
              </div>

              <button 
                className="btn-save-profile"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                <MdSave style={{verticalAlign:'middle',marginRight:'4px'}} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="issues-tab">
            <div className="form-header">
              <h2><MdFolder style={{verticalAlign:'middle',marginRight:'4px'}} /> Issue Files</h2>
              <p>Records of items issued to faculty members</p>
            </div>

            {issuesLoading ? (
              <div style={{textAlign: 'center', padding: '20px'}}>Loading issues...</div>
            ) : issues.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                <p>No issues recorded yet</p>
              </div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Item Type</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id} className={`row-${issue.status?.toLowerCase() || 'pending'}`}>
                      <td>{issue.facultyId}</td>
                      <td><span className="badge">{issue.itemType}</span></td>
                      <td>{issue.description}</td>
                      <td>{issue.quantity}</td>
                      <td>
                        <span className={`status-badge ${issue.status?.toLowerCase() || 'pending'}`}>
                          {issue.status || 'Pending'}
                        </span>
                      </td>
                      <td>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RETURNS TAB */}
        {activeTab === 'returns' && (
          <div className="returns-tab">
            <div className="form-header">
              <h2><MdCheck style={{verticalAlign:'middle',marginRight:'4px'}} /> Return Files</h2>
              <p>Records of items returned and clearances processed</p>
            </div>

            {issuesLoading ? (
              <div style={{textAlign: 'center', padding: '20px'}}>Loading returns...</div>
            ) : returns.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                <p>No returns recorded yet</p>
              </div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Reference Issue</th>
                    <th>Quantity Returned</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Return Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnRec) => {
                    const relatedIssue = issues.find(i => i._id === returnRec.referenceIssueId);
                    return (
                      <tr key={returnRec._id} className={`row-${returnRec.status?.toLowerCase() || 'cleared'}`}>
                        <td>{returnRec.facultyId}</td>
                        <td>{relatedIssue?.description || returnRec.referenceIssueId.substring(0, 8) + '...'}</td>
                        <td>{returnRec.quantityReturned}</td>
                        <td><span className="badge">{returnRec.condition}</span></td>
                        <td>
                          <span className={`status-badge ${returnRec.status?.toLowerCase() || 'cleared'}`}>
                            {returnRec.status || 'Cleared'}
                          </span>
                        </td>
                        <td>{new Date(returnRec.returnDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
