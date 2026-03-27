import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  MdPerson, MdLock, MdEmail, MdCheckCircle, MdError, MdEdit, 
  MdDashboard, MdFileUpload, MdMail, MdLogout 
} from 'react-icons/md';
import './EditProfile.css';

export default function FacultyEditProfile() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [profileImage, setProfileImage] = useState(user?.profile_image || null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    isLengthy: false
  });
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        password: "",
        confirmPassword: ""
      });
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
    }
  }, [user]);

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        isLengthy: false
      });
      return;
    }

    setPasswordStrength({
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
      isLengthy: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...fieldErrors };

    if (name === 'full_name') {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setForm((prev) => ({ ...prev, [name]: lettersOnly }));
      if (lettersOnly.trim().length < 2) {
        newErrors.full_name = 'Full name must contain at least 2 characters';
      } else {
        delete newErrors.full_name;
      }
    } else if (name === 'email') {
      setForm((prev) => ({ ...prev, [name]: value }));
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    } else if (name === 'password') {
      setForm((prev) => ({ ...prev, [name]: value }));
      checkPasswordStrength(value);
      if (value && value.length > 0 && value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else {
        delete newErrors.password;
      }
    } else if (name === 'confirmPassword') {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (value && form.password && value !== form.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setFieldErrors(newErrors);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const newErrors = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (form.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(form.password)) {
        newErrors.password = 'Password does not meet all requirements';
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please correct the errors above and try again.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const updateData = {
        full_name: form.full_name.trim(),
        email: form.email.trim()
      };

      if (form.password) {
        updateData.password = form.password;
      }

      const response = await axios.put(
        apiUrl + '/api/update-profile',
        updateData,
        {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Your profile has been updated successfully!');
        setFieldErrors({});
        setForm({ ...form, password: '', confirmPassword: '' });

        const updatedUser = response.data.user || { ...user, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setTimeout(() => {
          navigate('/faculty-dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      setError(err.response?.data?.message || 'An error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const metRequirements = Object.values(passwordStrength).filter(Boolean).length;
    if (metRequirements <= 1) return '#ef4444';
    if (metRequirements <= 2) return '#f59e0b';
    if (metRequirements <= 3) return '#eab308';
    if (metRequirements <= 4) return '#84cc16';
    return '#16a34a';
  };

  const getPasswordStrengthLabel = () => {
    const metRequirements = Object.values(passwordStrength).filter(Boolean).length;
    if (metRequirements === 0) return 'Very Weak';
    if (metRequirements <= 2) return 'Weak';
    if (metRequirements <= 3) return 'Fair';
    if (metRequirements <= 4) return 'Good';
    return 'Strong';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="ep-dashboard-page">
      {/* SIDEBAR - matches Dashboard sidebar */}
      <aside className="ep-sidebar">
        <div className="ep-profile">
          <div className="ep-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h3 className="ep-name">{user?.full_name || 'Faculty'}</h3>
            <p className="ep-small">{user?.designation || 'Faculty Member'} &bull; {user?.department || 'N/A'}</p>
            <p className="ep-small">Riphah International University</p>
          </div>
        </div>

        <nav className="ep-nav">
          <button className="ep-nav-btn" onClick={() => navigate('/faculty-dashboard')}>
            <MdDashboard className="nav-icon" /> Dashboard
          </button>
          <button className="ep-nav-btn" onClick={() => navigate('/faculty-clearance')}>
            <MdFileUpload className="nav-icon" /> Submit Clearance
          </button>
          <button className="ep-nav-btn" onClick={() => navigate('/faculty-clearance-status')}>
            <MdCheckCircle className="nav-icon" /> Clearance Status
          </button>
          <button className="ep-nav-btn" onClick={() => navigate('/faculty-messages')}>
            <MdMail className="nav-icon" /> Messages
          </button>
          <button className="ep-nav-btn" onClick={() => navigate('/faculty-dashboard', { state: { scrollToAutoVerify: true } })}>
            <MdCheckCircle className="nav-icon" /> Auto Verify
          </button>
          <button className="ep-nav-btn active" onClick={() => navigate('/faculty-edit-profile')}>
            <MdEdit className="nav-icon" /> Edit Profile
          </button>
          <button className="ep-nav-btn" onClick={handleLogout}>
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>

        <footer className="ep-footer">&copy; 2025 Riphah</footer>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ep-main">
        <div className="ep-header-banner">
          <h1 className="ep-header-title"><MdEdit style={{ marginRight: '10px' }} /> Edit Profile</h1>
          <p className="ep-header-subtitle">Update your personal information and manage your account</p>
        </div>

        <div className="ep-content-card">
          {error && (
            <div className="ep-alert ep-alert-error">
              <MdError className="ep-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="ep-alert ep-alert-success">
              <MdCheckCircle className="ep-alert-icon" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* PERSONAL INFORMATION SECTION */}
            <div className="ep-form-section">
              <label className="ep-section-label">
                <MdPerson size={16} />
                Personal Information
              </label>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-label">
                    Full Name <span className="ep-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('full_name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your full name"
                    className={`ep-input ${focusedField === 'full_name' ? 'focused' : ''} ${fieldErrors.full_name ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.full_name && (
                    <div className="ep-error-msg"><MdError size={14} /> {fieldErrors.full_name}</div>
                  )}
                </div>

                <div className="ep-form-group">
                  <label className="ep-label">
                    Email Address <span className="ep-asterisk">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email address"
                    className={`ep-input ${focusedField === 'email' ? 'focused' : ''} ${fieldErrors.email ? 'error' : ''}`}
                    required
                  />
                  {fieldErrors.email && (
                    <div className="ep-error-msg"><MdError size={14} /> {fieldErrors.email}</div>
                  )}
                </div>
              </div>
            </div>

            {/* SECURITY SECTION */}
            <div className="ep-form-section">
              <label className="ep-section-label">
                <MdLock size={16} />
                Change Password
              </label>
              <p className="ep-hint">Leave blank to keep your current password</p>

              <div className="ep-form-grid">
                <div className="ep-form-group">
                  <label className="ep-label">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter new password"
                    className={`ep-input ${focusedField === 'password' ? 'focused' : ''} ${fieldErrors.password ? 'error' : ''}`}
                  />
                  {fieldErrors.password && (
                    <div className="ep-error-msg"><MdError size={14} /> {fieldErrors.password}</div>
                  )}

                  {form.password && (
                    <>
                      <div className="ep-strength-section">
                        <div className="ep-strength-label">
                          Password Strength: <span style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthLabel()}</span>
                        </div>
                        <div className="ep-strength-bar">
                          <div
                            className="ep-strength-fill"
                            style={{
                              width: `${(Object.values(passwordStrength).filter(Boolean).length / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                      </div>
                      <div className="ep-checklist">
                        {[
                          { key: 'isLengthy', label: 'At least 8 characters' },
                          { key: 'hasUppercase', label: 'One uppercase letter (A-Z)' },
                          { key: 'hasLowercase', label: 'One lowercase letter (a-z)' },
                          { key: 'hasNumber', label: 'One number (0-9)' },
                          { key: 'hasSpecial', label: 'One special character (@$!%*?&)' }
                        ].map((item) => (
                          <div key={item.key} className={`ep-checklist-item ${passwordStrength[item.key] ? 'met' : ''}`}>
                            <span>{passwordStrength[item.key] ? '\u2713' : '\u25CB'}</span>
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="ep-form-group">
                  <label className="ep-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm new password"
                    className={`ep-input ${focusedField === 'confirmPassword' ? 'focused' : ''} ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  />
                  {fieldErrors.confirmPassword && (
                    <div className="ep-error-msg"><MdError size={14} /> {fieldErrors.confirmPassword}</div>
                  )}
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="ep-button-group">
              <button
                type="button"
                className="ep-btn ep-btn-secondary"
                onClick={() => navigate('/faculty-dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ep-btn ep-btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
