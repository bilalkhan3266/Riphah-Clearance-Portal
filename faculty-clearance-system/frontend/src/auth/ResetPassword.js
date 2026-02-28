// src/auth/ResetPassword.js
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const logo512 = "/logo512.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate parameters on mount
  useEffect(() => {
    if (!email || !code) {
      setError("Invalid or missing reset code. Please request a new password reset.");
    }
  }, [email, code]);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (!password) return 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
    setError("");
    setSuccess("");
  };

  const getPasswordStrengthText = (strength) => {
    const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    switch (strength) {
      case 0:
        return "";
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Fair";
      case 4:
        return "Good";
      case 5:
        return "Strong";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 0:
        return "#d0d0d0";
      case 1:
        return "#ff4444";
      case 2:
        return "#ff8800";
      case 3:
        return "#ffbb00";
      case 4:
        return "#88cc00";
      case 5:
        return "#00bb00";
      default:
        return "#d0d0d0";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validations
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (passwordStrength < 2) {
      setError("Password is too weak. Use uppercase, numbers, and special characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/set-new-password`,
        { 
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword
        }
      );

      if (response.data.success) {
        setSuccess("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to reset password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (error && error.includes("Invalid or missing reset code")) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
        </div>

        <div className="auth-wrapper">
          <div className="auth-branding">
            <div className="branding-content">
              <div className="logo-section">
                <img src={logo512} alt="Riphah Logo" className="main-logo" />
                <h1>Riphah International University</h1>
                <p className="university-tagline">Excellence in Education</p>
              </div>
              <div className="branding-info">
                <h2>Faculty Clearance System</h2>
                <p>Streamlined clearance process for faculty members</p>
                <ul className="features-list">
                  <li><span className="feature-icon">✓</span> Simple clearance workflow</li>
                  <li><span className="feature-icon">✓</span> Real-time approval tracking</li>
                  <li><span className="feature-icon">✓</span> Multi-department coordination</li>
                  <li><span className="feature-icon">✓</span> Secure authentication</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="auth-form-container">
            <div className="form-wrapper">
              <div className="verification-message">
                <div className="verification-icon">⚠️</div>
                <h3>Reset Code Invalid</h3>
                <p>{error}</p>
                <button 
                  onClick={() => navigate("/forgot-password")} 
                  className="btn-submit"
                  style={{ marginTop: "30px" }}
                >
                  Request New Reset Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
      </div>

      <div className="auth-wrapper">
        {/* LEFT SIDE - BRANDING */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-section">
              <img src={logo512} alt="Riphah Logo" className="main-logo" />
              <h1>Riphah International University</h1>
              <p className="university-tagline">Excellence in Education</p>
            </div>
            <div className="branding-info">
              <h2>Faculty Clearance System</h2>
              <p>Streamlined clearance process for faculty members</p>
              <ul className="features-list">
                <li><span className="feature-icon">✓</span> Simple clearance workflow</li>
                <li><span className="feature-icon">✓</span> Real-time approval tracking</li>
                <li><span className="feature-icon">✓</span> Multi-department coordination</li>
                <li><span className="feature-icon">✓</span> Secure authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - RESET PASSWORD FORM */}
        <div className="auth-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Create New Password</h2>
              <p>Enter your new password to complete the reset</p>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="success-alert">
                <span className="error-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    disabled={loading || !email || !code}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{
                      display: "flex",
                      gap: "4px",
                      marginBottom: "6px"
                    }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: "6px",
                            borderRadius: "3px",
                            backgroundColor: i <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : "#e0e0e0",
                            transition: "background-color 0.3s ease"
                          }}
                        />
                      ))}
                    </div>
                    <span style={{
                      fontSize: "12px",
                      color: getPasswordStrengthColor(passwordStrength),
                      fontWeight: "600"
                    }}>
                      Strength: {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                )}

                <p className="form-hint">
                  Use at least 6 characters, including uppercase, numbers, and symbols
                </p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    disabled={loading || !email || !code}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="form-hint" style={{ color: "#10b981" }}>
                    ✅ Passwords match
                  </p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="form-hint" style={{ color: "#ef4444" }}>
                    ❌ Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={loading || !email || !code}>
                {loading ? (
                  <>
                    <span className="loader"></span> Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="form-divider">
              <span>Remember your password?</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/login", { replace: true })}
              disabled={loading}
            >
              Back to Login
            </button>

            <div className="auth-footer">
              <p>© 2025 Riphah International University. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

