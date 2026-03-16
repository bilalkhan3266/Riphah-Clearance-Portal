import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../IssueReturn.css';
import { MdFolderOpen, MdAssignment, MdPendingActions, MdCheckCircle, MdSend } from 'react-icons/md';

export default function RecordIssue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Issue form state
  const [formData, setFormData] = useState({
    employeeId: '',
    itemName: ''
  });
  const [issuingItem, setIssuingItem] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/issues/pending/Record`);
      setIssues(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError(err.response?.data?.message || 'Error fetching issues');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssueItem = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.itemName) {
      setError('Employee ID and Item Name are required');
      return;
    }

    try {
      setIssuingItem(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `/api/issues/issue-item`,
        {
          employeeId: formData.employeeId,
          itemName: formData.itemName,
          department: 'Record'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(`Item issued successfully to ${formData.employeeId}`);
      setFormData({ employeeId: '', itemName: '' });
      
      // Refresh issues list
      fetchIssues();
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error issuing item:', err);
      setError(err.response?.data?.message || 'Error issuing item');
    } finally {
      setIssuingItem(false);
    }
  };

  if (loading) {
    return <div className="issue-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="issue-container">
      <div className="issue-header">
        <h2><MdFolderOpen style={{verticalAlign:'middle',marginRight:'8px'}} /> Record - Issue Files</h2>
        <p>Items issued to faculty members</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Issue Item Form */}
      <div className="issue-form-section">
        <h3><MdAssignment style={{verticalAlign:'middle',marginRight:'8px'}} /> Issue New Item</h3>
        <form onSubmit={handleIssueItem} className="issue-form">
          <div className="form-group">
            <label>Employee ID *</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleFormChange}
              placeholder="Enter faculty/employee ID"
              required
            />
          </div>

          <div className="form-group">
            <label>Item Type *</label>
            <select name="itemType" value={formData.itemType} onChange={handleFormChange}>
              <option>Transcript</option>
              <option>Certificate</option>
              <option>Degree</option>
              <option>Documents</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Item description"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleFormChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleFormChange}
            />
          </div>

          <button type="submit" disabled={issuingItem} className="btn btn-primary">
            {issuingItem ? 'Issuing...' : <><MdSend style={{verticalAlign:'middle',marginRight:'4px'}} /> Issue Item</>}
          </button>
        </form>
      </div>

      {/* Issues List */}
      <div className="issues-list-section">
        <h3><MdPendingActions style={{verticalAlign:'middle',marginRight:'8px'}} /> Pending Issues</h3>
        {issues.length === 0 ? (
          <div className="no-data">No pending issues</div>
        ) : (
          <table className="issues-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Item Name</th>
                <th>Issued Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td>{issue.employeeId}</td>
                  <td>{issue.itemName}</td>
                  <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                  <td><span className="badge badge-issued">{issue.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
