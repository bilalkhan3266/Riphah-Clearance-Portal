import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../IssueReturn.css';
import { MdBiotech, MdAssignment, MdCheckCircle, MdSend } from 'react-icons/md';

export default function ORICIssue() {
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/issues/pending/ORIC`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(response.data.data || []);
      setError(null);
    } catch (err) {
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
          department: 'ORIC'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(`Item issued successfully to ${formData.employeeId}`);
      setFormData({ employeeId: '', itemName: '' });
      
      // Refresh issues list
      fetchIssues();
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
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
        <h2><MdBiotech style={{verticalAlign:'middle',marginRight:'8px'}} /> ORIC - Issue Files</h2>
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
              <option>Forms</option>
              <option>Documents</option>
              <option>Approvals</option>
              <option>Letters</option>
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

      {issues.length === 0 ? (
        <div className="no-records">No issues recorded yet</div>
      ) : (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Item Type</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Issue Date</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id} className={`row-${issue.status?.toLowerCase() || 'issued'}`}>
                <td>{issue.facultyId}</td>
                <td>{issue.itemType}</td>
                <td>{issue.description}</td>
                <td>{issue.quantity}</td>
                <td>
                  <span className={`status-badge ${issue.status?.toLowerCase() || 'issued'}`}>
                    {issue.status || 'Issued'}
                  </span>
                </td>
                <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
                <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

