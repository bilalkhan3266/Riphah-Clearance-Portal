import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentClearance.css';

const DepartmentClearance = ({ departmentName }) => {
  const [issues, setIssues] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issues');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

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

  useEffect(() => {
    fetchData();
  }, [departmentName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch issues
      const issuesRes = await axios.get(
        `/api/departments/${departmentName}/issues`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues(issuesRes.data.data || []);

      // Fetch returns
      const returnsRes = await axios.get(
        `/api/departments/${departmentName}/returns`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReturns(returnsRes.data.data || []);

      // Fetch stats
      const statsRes = await axios.get(
        `/api/departments/${departmentName}/issue-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsRes.data.data);

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/departments/${departmentName}/issue`,
        issueFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIssues([response.data.data, ...issues]);
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
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating issue');
    }
  };

  const handleAddReturn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/departments/${departmentName}/return`,
        returnFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReturns([response.data.data, ...returns]);
        setReturnFormData({
          facultyId: '',
          referenceIssueId: '',
          quantityReturned: 1,
          condition: 'Good',
          notes: ''
        });
        setShowReturnForm(false);
        setError(null);
        // Refresh data
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating return');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await axios.delete(
          `/api/departments/${departmentName}/issues/${issueId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIssues(issues.filter(i => i._id !== issueId));
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting issue');
      }
    }
  };

  if (loading) {
    return (
      <div className="dept-clearance-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dept-clearance-container">
      <div className="dept-header">
        <h1>🏢 {departmentName} Clearance Management</h1>
        <p>Manage issue and return records for faculty clearance</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalIssues}</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{stats.pendingCount}</div>
            <div className="stat-label">Pending Items</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-value">{stats.clearedCount}</div>
            <div className="stat-label">Cleared Items</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          📋 Issues ({issues.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          ✓ Returns ({returns.length})
        </button>
      </div>

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="tab-content">
          <button 
            className="btn btn-primary"
            onClick={() => setShowIssueForm(!showIssueForm)}
          >
            {showIssueForm ? 'Cancel' : '+ Add Issue'}
          </button>

          {showIssueForm && (
            <form className="form-section" onSubmit={handleAddIssue}>
              <h3>Create New Issue</h3>
              
              <div className="form-group">
                <label>Faculty ID *</label>
                <input
                  type="text"
                  required
                  value={issueFormData.facultyId}
                  onChange={(e) => setIssueFormData({...issueFormData, facultyId: e.target.value})}
                  placeholder="Enter faculty ID"
                />
              </div>

              <div className="form-group">
                <label>Faculty Name</label>
                <input
                  type="text"
                  value={issueFormData.facultyName}
                  onChange={(e) => setIssueFormData({...issueFormData, facultyName: e.target.value})}
                  placeholder="Enter faculty name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Type *</label>
                  <select
                    required
                    value={issueFormData.itemType}
                    onChange={(e) => setIssueFormData({...issueFormData, itemType: e.target.value})}
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

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={issueFormData.quantity}
                    onChange={(e) => setIssueFormData({...issueFormData, quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  required
                  value={issueFormData.description}
                  onChange={(e) => setIssueFormData({...issueFormData, description: e.target.value})}
                  placeholder="Describe the issue"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={issueFormData.dueDate}
                  onChange={(e) => setIssueFormData({...issueFormData, dueDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={issueFormData.notes}
                  onChange={(e) => setIssueFormData({...issueFormData, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows="2"
                />
              </div>

              <button type="submit" className="btn btn-success">Create Issue</button>
            </form>
          )}

          {/* Issues List */}
          <div className="records-list">
            {issues.length === 0 ? (
              <p className="no-records">No issues created yet.</p>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Item Type</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id} className={`row-${issue.status.toLowerCase()}`}>
                      <td>{issue.facultyId}</td>
                      <td><span className="badge">{issue.itemType}</span></td>
                      <td>{issue.description}</td>
                      <td>{issue.quantity}</td>
                      <td>
                        <span className={`status-badge ${issue.status.toLowerCase()}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteIssue(issue._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        <div className="tab-content">
          <button 
            className="btn btn-primary"
            onClick={() => setShowReturnForm(!showReturnForm)}
          >
            {showReturnForm ? 'Cancel' : '+ Process Return'}
          </button>

          {showReturnForm && (
            <form className="form-section" onSubmit={handleAddReturn}>
              <h3>Process Return/Clearance</h3>
              
              <div className="form-group">
                <label>Faculty ID *</label>
                <input
                  type="text"
                  required
                  value={returnFormData.facultyId}
                  onChange={(e) => setReturnFormData({...returnFormData, facultyId: e.target.value})}
                  placeholder="Enter faculty ID"
                />
              </div>

              <div className="form-group">
                <label>Reference Issue ID *</label>
                <select
                  required
                  value={returnFormData.referenceIssueId}
                  onChange={(e) => setReturnFormData({...returnFormData, referenceIssueId: e.target.value})}
                >
                  <option value="">Select an issue to clear</option>
                  {issues
                    .filter(i => i.status !== 'Cleared')
                    .map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        {issue.facultyId} - {issue.description}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity Returned</label>
                  <input
                    type="number"
                    min="1"
                    value={returnFormData.quantityReturned}
                    onChange={(e) => setReturnFormData({...returnFormData, quantityReturned: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <select
                    value={returnFormData.condition}
                    onChange={(e) => setReturnFormData({...returnFormData, condition: e.target.value})}
                  >
                    <option value="Good">Good</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Normal">Normal</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({...returnFormData, notes: e.target.value})}
                  placeholder="Return notes"
                  rows="2"
                />
              </div>

              <button type="submit" className="btn btn-success">Process Return</button>
            </form>
          )}

          {/* Returns List */}
          <div className="records-list">
            {returns.length === 0 ? (
              <p className="no-records">No returns recorded yet.</p>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Item Type</th>
                    <th>Qty Returned</th>
                    <th>Status</th>
                    <th>Return Date</th>
                    <th>Condition</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((ret) => (
                    <tr key={ret._id} className={`row-${ret.status.toLowerCase()}`}>
                      <td>{ret.facultyId}</td>
                      <td>{ret.itemType}</td>
                      <td>{ret.quantityReturned}</td>
                      <td>
                        <span className={`status-badge ${ret.status.toLowerCase()}`}>
                          {ret.status}
                        </span>
                      </td>
                      <td>{new Date(ret.returnDate).toLocaleDateString()}</td>
                      <td><span className="badge">{ret.condition}</span></td>
                      <td>{ret.verifiedBy ? '✓' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentClearance;
