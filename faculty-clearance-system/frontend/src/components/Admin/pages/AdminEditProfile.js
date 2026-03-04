import React, { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  MdPerson, MdLock, MdEmail, MdPhone, MdEdit, MdCheckCircle,
  MdError, MdClose, MdSave, MdVisibility, MdVisibilityOff
} from 'react-icons/md';
import {
  getAdminProfile, updateAdminProfile, changeAdminPassword
} from '../services/adminService';

export default function AdminEditProfile() {
  const { user, token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const r = await getAdminProfile(token);
      if (r.success && r.data) {
        setFormData({
          full_name: r.data.full_name || '',
          email: r.data.email || '',
          phone: r.data.phone || '',
          department: r.data.department || ''
        });
      }
    } catch (err) { showMsg(err.message || 'Failed to load profile', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) loadProfileData(); }, [token, loadProfileData]);

  const showMsg = (msg, type = 'success') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const validateProfile = () => {
    const e = {};
    if (!formData.full_name.trim()) e.full_name = 'Full name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = 'Invalid email format';
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) e.phone = 'Invalid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e = {};
    if (!passwordData.currentPassword) e.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) e.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    if (!passwordData.confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (passwordData.newPassword !== passwordData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(p => ({ ...p, [name]: value }));
    if (pwErrors[name]) setPwErrors(p => ({ ...p, [name]: '' }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    try {
      setLoading(true);
      const r = await updateAdminProfile(token, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone
      });
      if (r.success) showMsg('Profile updated successfully');
      else showMsg(r.message || 'Failed', 'error');
    } catch (err) { showMsg(err.message || 'Failed to update profile', 'error'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      setLoading(true);
      const r = await changeAdminPassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (r.success) {
        showMsg('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else showMsg(r.message || 'Failed', 'error');
    } catch (err) { showMsg(err.message || 'Failed to change password', 'error'); }
    finally { setLoading(false); }
  };

  const pwStrength = (() => {
    const pw = passwordData.newPassword;
    if (!pw) return { pct: 0, label: '', color: '#E5E7EB' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { pct: 20, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { pct: 40, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { pct: 60, label: 'Good', color: '#F59E0B' };
    if (score <= 4) return { pct: 80, label: 'Strong', color: '#10B981' };
    return { pct: 100, label: 'Excellent', color: '#059669' };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
        borderRadius: '16px', padding: '28px 32px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#4F46E5',
            background: 'white', flexShrink: 0
          }}>
            {(user?.full_name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{user?.full_name || 'Admin'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.85 }}>System Administrator</p>
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
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><MdClose size={18} /></button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Information Card */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
            }}><MdPerson size={18} /></div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>Personal Information</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Update your account details</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <MdPerson size={14} color="#6B7280" /> Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleProfileChange}
                disabled={loading} placeholder="Enter your full name" style={{
                  width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.full_name ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
              />
              {errors.full_name && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><MdError size={13} /> {errors.full_name}</p>}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <MdEmail size={14} color="#6B7280" /> Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleProfileChange}
                disabled={loading} placeholder="Enter your email" style={{
                  width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.email ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
              />
              {errors.email && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><MdError size={13} /> {errors.email}</p>}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                <MdPhone size={14} color="#6B7280" /> Phone Number
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleProfileChange}
                disabled={loading} placeholder="Enter phone number" style={{
                  width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.phone ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
              />
              {errors.phone && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><MdError size={13} /> {errors.phone}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Department
              </label>
              <input type="text" value={formData.department} disabled placeholder="Department"
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '14px', background: '#F9FAFB', color: '#9CA3AF', cursor: 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
              borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s'
            }}>
              <MdSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Change Card */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626'
            }}><MdLock size={18} /></div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>Change Password</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} style={{ padding: '24px' }}>
            {/* Current Password */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Current Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showCurrentPw ? 'text' : 'password'} name="currentPassword"
                  value={passwordData.currentPassword} onChange={handlePasswordChange}
                  disabled={loading} placeholder="Enter current password" style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    border: `1.5px solid ${pwErrors.currentPassword ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px'
                }}>
                  {showCurrentPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {pwErrors.currentPassword && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0' }}>{pwErrors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                New Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showNewPw ? 'text' : 'password'} name="newPassword"
                  value={passwordData.newPassword} onChange={handlePasswordChange}
                  disabled={loading} placeholder="Enter new password" style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    border: `1.5px solid ${pwErrors.newPassword ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px'
                }}>
                  {showNewPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {passwordData.newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>Password strength</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: pwStrength.color }}>{pwStrength.label}</span>
                  </div>
                  <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pwStrength.pct}%`, background: pwStrength.color, borderRadius: '2px', transition: 'all 0.3s' }} />
                  </div>
                </div>
              )}
              {pwErrors.newPassword && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0' }}>{pwErrors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Confirm New Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input type="password" name="confirmPassword"
                value={passwordData.confirmPassword} onChange={handlePasswordChange}
                disabled={loading} placeholder="Confirm new password" style={{
                  width: '100%', padding: '11px 14px',
                  border: `1.5px solid ${pwErrors.confirmPassword ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
              {pwErrors.confirmPassword && <p style={{ color: '#EF4444', fontSize: '12px', margin: '5px 0 0' }}>{pwErrors.confirmPassword}</p>}
              {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                <p style={{ color: '#10B981', fontSize: '12px', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MdCheckCircle size={13} /> Passwords match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', background: '#1F2937', border: 'none',
              borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s'
            }}>
              <MdLock size={16} /> {loading ? 'Updating...' : 'Update Password'}
            </button>

            {/* Password Tips */}
            <div style={{ marginTop: '20px', padding: '14px 16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Password Tips</p>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>
                <li>Use at least 6 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
