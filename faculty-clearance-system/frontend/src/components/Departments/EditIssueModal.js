import React, { useState } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function EditIssueModal({ issue, departmentName, onClose, onUpdated }) {
  const [form, setForm] = useState({
    itemType: issue.itemType || 'book',
    description: issue.description || '',
    status: issue.status || 'Issued',
    quantity: issue.quantity || 1,
    dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : '',
    notes: issue.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/api/department-edit/${departmentName}/issue/${issue._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        onUpdated(res.data.data, res.data.clearanceStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '14px', width: '520px', maxWidth: '92vw', maxHeight: '90vh', overflow: 'auto' },
    header: { padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '14px 14px 0 0', color: 'white' },
    body: { padding: '24px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: 'white' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
    field: { marginBottom: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelBtn: { padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
    saveBtn: { padding: '10px 22px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
    error: { padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #FCA5A5' },
    info: { padding: '10px 14px', background: '#EFF6FF', color: '#1E40AF', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', border: '1px solid #BFDBFE' }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Edit Issue</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.85 }}>Faculty: {issue.facultyId} {issue.facultyName ? `(${issue.facultyName})` : ''}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold' }}><MdClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.info}>
              Changing the status affects clearance immediately. Setting status to <strong>Cleared</strong> makes the faculty eligible for clearance in this department.
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label}>Item Type *</label>
                <select style={s.select} value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })}>
                  <option value="book">Book</option><option value="equipment">Equipment</option><option value="fee">Fee</option>
                  <option value="document">Document</option><option value="access-card">Access Card</option><option value="property">Property</option>
                  <option value="dues">Dues</option><option value="report">Report</option><option value="key">Key</option>
                  <option value="material">Material</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Status *</label>
                <select style={s.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Issued">Issued</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Returned">Partially Returned</option>
                </select>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Description *</label>
              <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label}>Quantity</label>
                <input style={s.input} type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <label style={s.label}>Due Date</label>
                <input style={s.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Notes</label>
              <textarea style={{ ...s.input, height: '50px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...s.saveBtn, opacity: loading ? 0.6 : 1 }}>
              <MdSave style={{ fontSize: '16px', fontWeight: 'bold' }} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
