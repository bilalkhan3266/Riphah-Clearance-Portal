import React, { useState } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function EditReturnModal({ returnRecord, departmentName, onClose, onUpdated }) {
  const [form, setForm] = useState({
    status: returnRecord.status || 'Returned',
    returnDate: returnRecord.returnDate ? new Date(returnRecord.returnDate).toISOString().split('T')[0] : '',
    condition: returnRecord.condition || 'Good',
    quantityReturned: returnRecord.quantityReturned || 1,
    notes: returnRecord.notes || ''
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
        `${API_URL}/api/department-edit/${departmentName}/return/${returnRecord._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        onUpdated(res.data.data, res.data.clearanceStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update return');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '14px', width: '480px', maxWidth: '92vw', maxHeight: '90vh', overflow: 'auto' },
    header: { padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '14px 14px 0 0', color: 'white' },
    body: { padding: '24px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: 'white' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
    field: { marginBottom: '14px' },
    footer: { padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelBtn: { padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
    saveBtn: { padding: '10px 22px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
    error: { padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #FCA5A5' },
    info: { padding: '10px 14px', background: '#ECFDF5', color: '#065F46', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', border: '1px solid #6EE7B7' }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Edit Return</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.85 }}>Faculty: {returnRecord.facultyId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold' }}><MdClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            {error && <div style={s.error}>{error}</div>}
            <div style={s.info}>
              Editing a return record triggers automatic clearance re-evaluation for this faculty member.
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label}>Status *</label>
                <select style={s.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Returned">Returned</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Partial Return">Partial Return</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Condition</label>
                <select style={s.select} value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label}>Return Date</label>
                <input style={s.input} type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Quantity Returned</label>
                <input style={s.input} type="number" min="1" value={form.quantityReturned} onChange={e => setForm({ ...form, quantityReturned: parseInt(e.target.value) || 1 })} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Notes</label>
              <textarea style={{ ...s.input, height: '60px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
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
