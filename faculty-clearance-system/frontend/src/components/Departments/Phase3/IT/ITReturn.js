import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../IssueReturn.css';
import { MdComputer } from 'react-icons/md';

export default function ITReturn() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const returnsRes = await axios.get(`/api/issues/returned/IT`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReturns(returnsRes.data.data || []);
      setError(null);
    } catch (err) {
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
        <h2><MdComputer style={{verticalAlign:'middle',marginRight:'8px'}} /> IT - Return Files</h2>
        <p>Records of items returned and clearances processed</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {returns.length === 0 ? (
        <div className="no-records">No returns recorded yet</div>
      ) : (
        <table className="return-table">
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Item Name</th>
              <th>Status</th>
              <th>Return Date</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((returnRec) => (
              <tr key={returnRec._id} className={`row-${returnRec.status?.toLowerCase() || 'returned'}`}>
                <td>{returnRec.employeeId}</td>
                <td>{returnRec.itemName}</td>
                <td>
                  <span className={`status-badge ${returnRec.status?.toLowerCase() || 'returned'}`}>
                    {returnRec.status || 'Returned'}
                  </span>
                </td>
                <td>{new Date(returnRec.returnDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

