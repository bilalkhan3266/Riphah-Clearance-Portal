import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdCheckCircle, MdError,
  MdPeople, MdFilterList, MdRefresh
} from 'react-icons/md';
import {
  getAllUsers, createUser, updateUser, deleteUser, getAllDepartments
} from '../services/adminService';

const ROLE_COLORS = {
  admin:   { bg: '#FEE2E2', color: '#991B1B' },
  faculty: { bg: '#ECFDF5', color: '#059669' },
  Lab:     { bg: '#DBEAFE', color: '#1E40AF' },
  Library: { bg: '#E0E7FF', color: '#4338CA' },
  Pharmacy:{ bg: '#FDF4FF', color: '#9333EA' },
  Finance: { bg: '#FEF3C7', color: '#92400E' },
  HR:      { bg: '#FCE7F3', color: '#9D174D' },
  Records: { bg: '#E0F2FE', color: '#0369A1' },
  IT:      { bg: '#F0FDF4', color: '#166534' },
  ORIC:    { bg: '#FFF7ED', color: '#C2410C' },
  Admin:   { bg: '#FEE2E2', color: '#991B1B' },
  Warden:  { bg: '#F5F3FF', color: '#6D28D9' },
  HOD:     { bg: '#ECFEFF', color: '#0E7490' },
  Dean:    { bg: '#FFF1F2', color: '#BE123C' },
};

const USER_ROLES = [
  'faculty','admin','Lab','Library','Pharmacy','Finance',
  'HR','Records','IT','ORIC','Admin','Warden','HOD','Dean'
];

export default function UserManagement() {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', phone: '', department: '', role: 'faculty'
  });

  useEffect(() => { if (token) { fetchUsers(); fetchDepartments(); } }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const r = await getAllUsers(token);
      if (r.success && Array.isArray(r.data)) setUsers(r.data);
    } catch (err) {
      showMsg(err.message || 'Failed to load users', 'error');
    } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const r = await getAllDepartments(token);
      if (r.success && Array.isArray(r.data)) setDepartments(r.data);
    } catch (err) { console.error('Failed to load departments:', err); }
  };

  const showMsg = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', password: '', phone: '', department: '', role: 'faculty' });
    setFormErrors({});
  };

  const validateForm = () => {
    const e = {};
    if (!formData.full_name.trim()) e.full_name = 'Full name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.department) e.department = 'Department is required';
    if (!editingUser && !formData.password) e.password = 'Password is required';
    else if (!editingUser && formData.password.length < 6) e.password = 'Min 6 characters';
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) e.phone = 'Invalid phone';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const handleOpenModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setFormData({ full_name: u.full_name||'', email: u.email||'', password: '', phone: u.phone||'', department: u.department||'', role: u.role||'faculty' });
    } else { setEditingUser(null); resetForm(); }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); resetForm(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      if (editingUser) {
        const d = { ...formData }; if (!d.password) delete d.password;
        const r = await updateUser(token, editingUser._id, d);
        if (r.success) { showMsg('User updated successfully'); await fetchUsers(); handleCloseModal(); }
        else showMsg(r.message || 'Failed', 'error');
      } else {
        const r = await createUser(token, formData);
        if (r.success) { showMsg('User created successfully'); await fetchUsers(); handleCloseModal(); }
        else showMsg(r.message || 'Failed', 'error');
      }
    } catch (err) { showMsg(err.message || 'Failed to save user', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      const r = await deleteUser(token, userId);
      if (r.success) { showMsg('User deleted'); await fetchUsers(); }
      else showMsg(r.message || 'Failed', 'error');
    } catch (err) { showMsg(err.message || 'Failed', 'error'); }
    finally { setLoading(false); }
  };

  const getDeptName = (id) => {
    const d = departments.find(x => x._id === id || x === id);
    return typeof d === 'string' ? d : d?.name || id || '—';
  };

  const filtered = users.filter(u => {
    const match = (u.full_name||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (u.email||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  getDeptName(u.department).toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = !roleFilter || u.role === roleFilter;
    return match && roleMatch;
  });

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role]||0)+1; return acc; }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
        borderRadius: '16px', padding: '28px 32px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>User Management</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.85 }}>
              {users.length} total users across {new Set(users.map(u => u.department)).size} departments
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchUsers} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500
            }}>
              <MdRefresh style={{ fontSize: '16px' }} /> Refresh
            </button>
            <button onClick={() => handleOpenModal()} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
              background: 'white', border: 'none', color: '#4F46E5', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600
            }}>
              <MdAdd style={{ fontSize: '16px' }} /> Add User
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      {message && (
        <div style={{
          padding: '14px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
          background: messageType === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${messageType === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: messageType === 'success' ? '#065F46' : '#991B1B'
        }}>
          {messageType === 'success' ? <MdCheckCircle size={18} /> : <MdError size={18} />}
          <span style={{ flex: 1 }}>{message}</span>
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '18px' }}><MdClose /></button>
        </div>
      )}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Total Users', val: users.length, cl: '#4F46E5' },
          ...Object.entries(roleCounts).slice(0, 5).map(([role, count]) => ({
            label: role, val: count,
            cl: (ROLE_COLORS[role] || {}).color || '#374151'
          }))
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '14px 16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.cl }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{
        background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px 20px',
        display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <MdSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '18px' }} />
          <input type="text" placeholder="Search by name, email, or department..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdFilterList style={{ color: '#6B7280', fontSize: '18px' }} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{
            padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px',
            background: 'white', cursor: 'pointer', outline: 'none', color: '#374151'
          }}>
            <option value="">All Roles</option>
            {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9CA3AF' }}>
            <MdPeople style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>{searchTerm || roleFilter ? 'No users match your filters' : 'No users yet'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  {['User','Email','Department','Role','Phone','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const rc = ROLE_COLORS[u.role] || { bg: '#F3F4F6', color: '#374151' };
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white',
                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', flexShrink: 0
                          }}>
                            {(u.full_name || 'U')[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1F2937' }}>{u.full_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B7280' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{getDeptName(u.department)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                          fontWeight: 600, background: rc.bg, color: rc.color
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B7280' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenModal(u)} style={{
                            padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: '#EEF2FF', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                          }}>
                            <MdEdit size={13} /> Edit
                          </button>
                          <button onClick={() => handleDelete(u._id)} style={{
                            padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                          }}>
                            <MdDelete size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) handleCloseModal(); }} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '24px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', maxWidth: '560px', width: '100%',
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white',
              padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: '16px 16px 0 0'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
                  {editingUser ? 'Update user information' : 'Add a new user to the system'}
                </p>
              </div>
              <button onClick={handleCloseModal} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><MdClose size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Full Name" required name="full_name" value={formData.full_name}
                  onChange={handleInputChange} error={formErrors.full_name} placeholder="John Doe" />
                <FormField label="Email" required name="email" type="email" value={formData.email}
                  onChange={handleInputChange} error={formErrors.email} placeholder="john@example.com" />
              </div>

              {!editingUser && (
                <FormField label="Password" required name="password" type="password" value={formData.password}
                  onChange={handleInputChange} error={formErrors.password} placeholder="Min. 6 characters"
                  hint="Minimum 6 characters required" />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField label="Phone" name="phone" type="tel" value={formData.phone}
                  onChange={handleInputChange} error={formErrors.phone} placeholder="03001234567" />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Department <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select name="department" value={formData.department} onChange={handleInputChange} style={{
                    width: '100%', padding: '10px 14px', border: `1px solid ${formErrors.department ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '8px', fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none'
                  }}>
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d._id || d} value={d._id || d}>{typeof d === 'string' ? d : d.name || d._id}</option>
                    ))}
                  </select>
                  {formErrors.department && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{formErrors.department}</p>}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Role <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select name="role" value={formData.role} onChange={handleInputChange} style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none'
                }}>
                  {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E5E7EB', marginTop: '8px' }}>
                <button type="button" onClick={handleCloseModal} style={{
                  padding: '10px 20px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151'
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
                  borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, required, name, type = 'text', value, onChange, error, placeholder, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{
        width: '100%', padding: '10px 14px', border: `1px solid ${error ? '#EF4444' : '#E5E7EB'}`,
        borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
      }} />
      {error && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{error}</p>}
      {hint && <p style={{ color: '#9CA3AF', fontSize: '11px', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}
