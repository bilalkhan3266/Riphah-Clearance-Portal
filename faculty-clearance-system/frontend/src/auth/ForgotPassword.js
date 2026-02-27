// src/auth/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const logo512 = "/logo512.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState("email"); // email, code, or verify

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/forgot-password`,
        { email: email.trim().toLowerCase() }
      );

      if (response.data.success) {
        setSuccess("✅ Reset code sent to your email. Check your inbox and spam folder.");
        setTimeout(() => {
          setStep("code");
          setSuccess("");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to send reset code");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to send reset code";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || code.trim().length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/verify-reset-code`,
        { 
          email: email.trim().toLowerCase(),
          code: code.trim()
        }
      );

      if (response.data.success) {
        setSuccess("✅ Code verified! Redirecting to reset password...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, { replace: true });
        }, 1500);
      } else {
        setError(response.data.message || "Invalid code. Please try again.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Invalid code. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleResendCode = () => {
    setStep("email");
    setCode("");
    setError("");
    setSuccess("");
  };

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

        {/* RIGHT SIDE - FORGOT PASSWORD FORM */}
        <div className="auth-form-container">
          <div className="form-wrapper">
            {step === "email" ? (
              <>
                <div className="form-header">
                  <h2>Reset Password</h2>
                  <p>Enter your email to receive a reset code</p>
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

                <form onSubmit={handleSubmitEmail} className="auth-form">
                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                          setSuccess("");
                        }}
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="form-hint">
                      We'll send you a 6-digit reset code
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loader"></span> Sending Code...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="form-header">
                  <h2>Enter Reset Code</h2>
                  <p>Check your email for the 6-digit code</p>
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

                <form onSubmit={handleSubmitCode} className="auth-form">
                  {/* Reset Code */}
                  <div className="form-group">
                    <label className="form-label">6-Digit Code</label>
                    <div className="input-wrapper">
                      <span className="input-icon"></span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setCode(value);
                          setError("");
                        }}
                        disabled={loading}
                        maxLength="6"
                        required
                      />
                    </div>
                    <p className="form-hint">
                      Enter the code from your email. Valid for 15 minutes.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loader"></span> Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </form>

                <div style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{ fontSize: "13px" }}
                  >
                    Didn't receive code? Send again
                  </button>
                </div>
              </>
            )}

            <div className="form-divider">
              <span>Remember your password?</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleBackToLogin}
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
