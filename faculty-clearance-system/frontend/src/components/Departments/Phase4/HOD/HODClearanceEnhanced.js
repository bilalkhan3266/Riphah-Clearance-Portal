import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { MdCheckCircle, MdMail, MdLogout, MdSend, MdReply, MdThumbUp, MdCancel, MdExpandMore, MdExpandLess, MdDownload, MdAttachFile, MdDescription, MdRefresh, MdPushPin, MdHourglassEmpty, MdAssignment, MdChat, MdClose, MdCheck, MdSupervisorAccount, MdBarChart, MdWarning } from 'react-icons/md';
import axios from 'axios';
import '../../../Departments/Phase1/Library/LibraryClearance.css';

export default function HODClearanceEnhanced({ onComplete }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('faculty-list'); // faculty-list, selected, messages, approved, rejected, issues, returns
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
  
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  // HOD-specific: Expanded faculty details
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const DEPARTMENT = 'HOD';
  
  // All Phase 1-3 departments
  const ALL_DEPARTMENTS = [
    // Phase 1
    { name: 'Lab', phase: 'Phase 1' },
    { name: 'Library', phase: 'Phase 1' },
    { name: 'Pharmacy', phase: 'Phase 1' },
    // Phase 2
    { name: 'Finance', phase: 'Phase 2' },
    { name: 'HR', phase: 'Phase 2' },
    { name: 'Records', phase: 'Phase 2' },
    // Phase 3
    { name: 'Admin', phase: 'Phase 3' },
    { name: 'IT', phase: 'Phase 3' },
    { name: 'ORIC', phase: 'Phase 3' }
  ];

  // Fetch clearance requests and messages on mount
  useEffect(() => {
    console.log('HOD Component Mounted - Fetching clearance requests...');
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
      const response = await axios.get(`${API_URL}/api/clearance-requests?department=HOD`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.requests) {
        const requests = response.data.requests;
        
        // Filter for PENDING HOD approvals (no HOD status or not Approved/Rejected)
        const pending = requests.filter(req => 
          !req.departments?.HOD || 
          (req.departments?.HOD?.status !== 'Approved' && 
           req.departments?.HOD?.status !== 'Rejected')
        );
        setPendingRequests(pending);
        
        // Filter for APPROVED HOD requests
        const approved = requests.filter(req => 
          req.departments?.HOD?.status === 'Approved'
        );
        setApprovedRequests(approved);
        
        // Filter for REJECTED HOD requests
        const rejected = requests.filter(req => 
          req.departments?.HOD?.status === 'Rejected'
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

  // HOD-specific: Calculate clearance completion percentage
  const calculateClearanceProgress = (request) => {
    let completed = 0;
    ALL_DEPARTMENTS.forEach(dept => {
      if (request.departments?.[dept.name]?.status === 'Approved') {
        completed++;
      }
    });
    return Math.round((completed / ALL_DEPARTMENTS.length) * 100);
  };

  // HOD-specific: Get department status for a faculty
  const getDepartmentStatus = (request, deptName) => {
    const status = request.departments?.[deptName]?.status;
    if (status === 'Approved') return <MdCheckCircle />;
    if (status === 'Rejected') return <MdCancel />;
    return <MdHourglassEmpty />;
  };

  const handleSelectFaculty = (facultyId) => {
    const id = typeof facultyId === 'object' ? (facultyId?.faculty_id || facultyId?.employee_id || facultyId?._id) : facultyId;
    setSelectedFacultyId(id);
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
      const date = new Date(request.departments?.HOD?.checked_at).toLocaleDateString();
      
      let content = '';
      
      if (approvalType === 'approved') {
        content = `
CLEARANCE APPROVAL LETTER

Date: ${date}
To: ${facultyName}
Department: HOD

RE: HOD CLEARANCE APPROVAL

Dear ${facultyName},

This is to certify that your clearance request for HOD Department has been APPROVED.

Status: APPROVED
Approved By: ${request.departments?.HOD?.approved_by || 'HOD Staff'}
Remarks: ${request.departments?.HOD?.remarks || 'HOD clearance completed successfully'}

You may proceed with the next phase of clearance process.

Regards,
HOD Department
Riphah International University
        `;
      } else {
        content = `
CLEARANCE REJECTION LETTER

Date: ${date}
To: ${facultyName}
Department: HOD

RE: HOD CLEARANCE REJECTION

Dear ${facultyName},

Your clearance request for HOD Department has been REJECTED and requires further action.

Status: REJECTED
Rejected By: ${request.departments?.HOD?.rejected_by || 'HOD Staff'}
Reason: ${request.departments?.HOD?.remarks || 'Requirements not met'}

Please address the issues mentioned and resubmit your request.

Regards,
HOD Department
Riphah International University
        `;
      }

      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HOD_${approvalType === 'approved' ? 'Approval' : 'Rejection'}_${facultyName}_${date}.txt`);
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

  const displayName = user?.full_name || 'HOD Staff';
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
            <p className="fd-small">{displayRole} • HOD Department</p>
            <p className="fd-small" style={{fontSize: '0.75rem', marginTop: '4px'}}>Riphah International University</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button onClick={() => { fetchAllClearanceRequests(); setSuccess('Data refreshed'); setTimeout(() => setSuccess(''), 2000); }} className="fd-nav-btn" title="Refresh data">
            <MdRefresh /> Refresh
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
            <h1><MdSupervisorAccount /> HOD Clearance Processing</h1>
            <p>Final verification of all departmental clearances</p>
          </div>
        </header>

        {/* Error/Success Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* FACULTY LIST TAB */}
        {activeTab === 'faculty-list' && (
          <div className="faculty-list-section">
            <div className="section-header">
              <h2><MdAssignment /> Faculty Members</h2>
              <p>Select a faculty to verify their complete clearance status across all 9 departments</p>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="faculty-grid">
                {pendingRequests.map(request => {
                  const faculty = request.faculty_id;
                  const progress = calculateClearanceProgress(request);
                  const isExpanded = expandedFaculty === request._id;
                  
                  return (
                    <div key={request._id} className="faculty-card">
                      <div className="faculty-avatar">{(faculty?.full_name || request.faculty_name)?.charAt(0).toUpperCase()}</div>
                      <div className="faculty-info">
                        <h3>{faculty?.full_name || request.faculty_name}</h3>
                        <p className="faculty-id">ID: {request.faculty_id?.faculty_id}</p>
                        <p className="faculty-designation">{faculty?.designation || 'Not specified'}</p>
                        <p className="faculty-department">Dept: {faculty?.department || 'Not specified'}</p>
                        <p className="faculty-location">Office: {faculty?.office_location || 'Not specified'}</p>
                        
                        {/* HOD-specific: Progress indicator */}
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>
                            Clearance Progress: <span style={{ color: progress === 100 ? '#27ae60' : '#f39c12' }}>{progress}%</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            backgroundColor: '#ecf0f1', 
                            borderRadius: '4px', 
                            overflow: 'hidden' 
                          }}>
                            <div style={{ 
                              width: `${progress}%`, 
                              height: '100%', 
                              backgroundColor: progress === 100 ? '#27ae60' : '#3498db',
                              transition: 'width 0.3s'
                            }}></div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', width: '100%' }}>
                        <button 
                          className="fd-nav-btn"
                          onClick={() => setExpandedFaculty(isExpanded ? null : request._id)}
                          style={{ fontSize: '0.9rem', padding: '8px' }}
                        >
                          {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                        <button 
                          className="btn-process"
                          onClick={() => handleSelectFaculty(request.faculty_id)}
                        >
                          Final Approval →
                        </button>
                      </div>

                      {/* HOD-specific: Expandable department status */}
                      {isExpanded && (
                        <div style={{ 
                          width: '100%', 
                          marginTop: '15px', 
                          paddingTop: '15px', 
                          borderTop: '1px solid #ecf0f1',
                          gridColumn: '1 / -1'
                        }}>
                          <h4 style={{ marginBottom: '10px', fontSize: '0.95rem' }}><MdBarChart /> Department Clearance Status:</h4>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}>
                            {ALL_DEPARTMENTS.map(dept => (
                              <div key={dept.name} style={{
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #ecf0f1'
                              }}>
                                <div style={{ fontWeight: 'bold' }}>
                                  {getDepartmentStatus(request, dept.name)} {dept.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginTop: '3px' }}>
                                  {dept.phase}
                                </div>
                                {request.departments?.[dept.name]?.remarks && (
                                  <div style={{ fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic', color: '#555' }}>
                                    {request.departments[dept.name].remarks.substring(0, 30)}...
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p><MdCheckCircle /> All faculty cleared! No pending requests.</p>
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
              if (!selected) return null;
              
              const progress = calculateClearanceProgress(selected);
              
              return (
                <div>
                  <div className="processing-header">
                    <h2>Final approval for {selected.faculty_id?.full_name || selected.faculty_name}</h2>
                    <button className="btn-back" onClick={() => setActiveTab('faculty-list')}>← Back</button>
                  </div>

                  {/* HOD-specific: Department Status Summary */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '2px solid #ecf0f1'
                  }}>
                    <h3 style={{ marginBottom: '15px' }}><MdBarChart /> Complete Clearance Status (All 9 Departments)</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px'
                    }}>
                      {ALL_DEPARTMENTS.map(dept => {
                        const deptStatus = selected.departments?.[dept.name]?.status;
                        const statusColor = deptStatus === 'Approved' ? '#27ae60' : deptStatus === 'Rejected' ? '#e74c3c' : '#f39c12';
                        return (
                          <div key={dept.name} style={{
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            borderLeft: `4px solid ${statusColor}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '5px' }}>
                              {dept.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#555' }}>
                              {deptStatus === 'Approved' ? <><MdCheckCircle /> Approved</> : deptStatus === 'Rejected' ? <><MdCancel /> Rejected</> : <><MdHourglassEmpty /> Pending</>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
                              {dept.phase}
                            </div>
                            {selected.departments?.[dept.name]?.remarks && (
                              <div style={{ fontSize: '0.75rem', marginTop: '6px', fontStyle: 'italic', color: '#555', maxHeight: '50px', overflow: 'hidden' }}>
                                "{selected.departments[dept.name].remarks}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* HOD-specific: Overall progress and warnings */}
                    <div style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid #ecf0f1'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong>Overall Clearance Progress:</strong>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: progress === 100 ? '#27ae60' : '#f39c12' }}>
                          {progress}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        backgroundColor: '#ecf0f1', 
                        borderRadius: '6px', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          width: `${progress}%`, 
                          height: '100%', 
                          backgroundColor: progress === 100 ? '#27ae60' : progress >= 75 ? '#f39c12' : '#e74c3c',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                      {progress < 100 && (
                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404', fontSize: '0.9rem' }}>
                          <MdWarning /> {9 - Math.round((progress / 100) * 9)} department(s) still pending. Complete all Phase 1-3 clearances before HOD approval.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="library-clearance-form">
                    <div className="form-header">
                      <h3><MdSupervisorAccount /> HOD Final Clearance Verification</h3>
                      <span className="phase-badge">Phase 4 - Final Clearance (100%)</span>
                    </div>

                    
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* APPROVED REQUESTS TAB */}
        {activeTab === 'approved' && (
          <div className="approved-section">
            <div className="section-header">
              <h2><MdCheckCircle /> Approved Clearances</h2>
              <p>Faculty members with completed HOD final clearance</p>
            </div>

            {approvedRequests.length > 0 ? (
              <div className="clearance-grid">
                {approvedRequests.map(request => (
                  <div key={request._id} className="clearance-card approved">
                    <div className="status-badge approved-badge"><MdCheckCircle /> APPROVED</div>
                    <div className="faculty-info-card">
                      <h3>{request.faculty_id?.full_name || request.faculty_name || 'Faculty'}</h3>
                      <p className="faculty-id">ID: {request.faculty_id?.faculty_id}</p>
                      <p className="faculty-email">{request.faculty_id?.email}</p>
                      <div className="approval-details">
                        <p><strong>Approval Date:</strong> {new Date(request.departments?.HOD?.checked_at).toLocaleDateString()}</p>
                        <p><strong>Approved By:</strong> {request.departments?.HOD?.approved_by || 'HOD Staff'}</p>
                        <p><strong>Status:</strong> <MdCheckCircle /> Fully Cleared (All 9 departments verified)</p>
                        <p><strong>Remarks:</strong> {request.departments?.HOD?.remarks || 'HOD final clearance approved'}</p>
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
                <p>No approved clearance requests yet</p>
              </div>
            )}
          </div>
        )}

        {/* REJECTED REQUESTS TAB */}
        {activeTab === 'rejected' && (
          <div className="rejected-section">
            <div className="section-header">
              <h2><MdCancel /> Rejected Clearances</h2>
              <p>Faculty members with rejected HOD final clearance</p>
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
                        <p><strong>Rejection Date:</strong> {new Date(request.departments?.HOD?.checked_at).toLocaleDateString()}</p>
                        <p><strong>Rejected By:</strong> {request.departments?.HOD?.rejected_by || 'HOD Staff'}</p>
                        <p><strong>Reason:</strong> {request.departments?.HOD?.remarks || 'HOD final clearance not met'}</p>
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
              <h2><MdPushPin /> Create Issues for HOD Department</h2>
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
                <p><MdCheckCircle /> No pending issues for HOD department</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="returns-section">
            <div className="section-header">
              <h2><MdCheckCircle /> Record Returns for HOD Department</h2>
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
                <p>No returned items yet for HOD department</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
