import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../IssueReturn.css';
import { MdCheckCircle, MdAssignment } from 'react-icons/md';

export default function LibraryReturn() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/issues/returned/Library`);
      setReturns(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError(err.response?.data?.message || 'Error fetching returns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="return-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="return-container">
      <div className="return-header">
        <h2><MdCheckCircle style={{verticalAlign:'middle',marginRight:'8px',color:'#10b981'}} /> Library - Returned Items</h2>
        <p>Records of items returned by faculty members</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Returned Items List */}
      <div className="returns-list-section">
        <h3><MdAssignment style={{verticalAlign:'middle',marginRight:'8px'}} /> Returned Items</h3>
        {returns.length === 0 ? (
          <div className="no-data">No returned items</div>
        ) : (
          <table className="returns-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Item Name</th>
                <th>Issued Date</th>
                <th>Returned Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((item) => (
                <tr key={item._id}>
                  <td>{item.employeeId}</td>
                  <td>{item.itemName}</td>
                  <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(item.returnDate).toLocaleDateString()}</td>
                  <td><span className="badge badge-returned">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
