import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import "./Auth.css";

const logo512 = "/logo512.png";

// Validation Functions
const validateName = (name) => {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 3) return "Name must be at least 3 characters";
  if (!/^[a-zA-Z\s]{3,}$/.test(name.trim())) {
    return "Name must contain only alphabets and spaces (no numbers or special characters)";
  }
  return "";
};

const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  
  // Check if email is lowercase
  if (email !== email.toLowerCase()) {
    return "Email must be all lowercase (no capital letters)";
  }
  
  // Check if it ends with @riphah.edu.pk
  if (!email.trim().endsWith("@riphah.edu.pk")) {
    return "Email must use the university domain: @riphah.edu.pk";
  }
  
  // Get the part before @
  const beforeAt = email.trim().split("@")[0];
  
  // Check for numbers in email
  if (/\d/.test(beforeAt)) {
    return "Email cannot contain numbers";
  }
  
  // Check that it only contains lowercase letters and dots
  if (!/^[a-z.]+$/.test(beforeAt)) {
    return "Email can only contain lowercase letters and dots (e.g., bilal.khan@riphah.edu.pk)";
  }
  
  // Check that it has at least one dot
  if (!beforeAt.includes(".")) {
    return "Email must contain at least one dot (e.g., firstname.lastname@riphah.edu.pk)";
  }
  
  // Check that it doesn't start or end with a dot
  if (beforeAt.startsWith(".") || beforeAt.endsWith(".")) {
    return "Email cannot start or end with a dot";
  }
  
  // Check for consecutive dots
  if (beforeAt.includes("..")) {
    return "Email cannot contain consecutive dots";
  }
  
  return "";
};

const validateEmployeeId = (id) => {
  if (!id.trim()) return "Employee ID is required";
  if (!/^[a-zA-Z0-9]+$/.test(id.trim())) {
    return "Employee ID can only contain letters and numbers (no special characters)";
  }
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&* etc.)";
  }
  return "";
};

const designationOptions = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Junior Professor",
  "Visiting Teacher",
  "Senior Lecturer",
  "Lecturer",
  "Assistant Lecturer",
  "Teaching Assistant",
  "Instructor",
  "Research Fellow"
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    full_name: "",
    email: "",
    employee_id: "",
    password: "",
    confirmPassword: "",
    designation: "",
    department: ""
  });

  const [passwordStrength, setPasswordStrength] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employee_id: "",
    role: "faculty",
    designation: "",
    department: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Real-time field validation
    let errors = { ...fieldErrors };

    if (name === "full_name") {
      errors.full_name = validateName(value);
    } else if (name === "email") {
      errors.email = validateEmail(value);
    } else if (name === "employee_id") {
      errors.employee_id = validateEmployeeId(value);
    } else if (name === "password") {
      errors.password = validatePassword(value);
      // Check password strength
      if (!value) {
        setPasswordStrength("");
      } else if (value.length < 8) {
        setPasswordStrength("weak");
      } else if (
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?]/.test(value)
      ) {
        if (value.length >= 12) {
          setPasswordStrength("strong");
        } else {
          setPasswordStrength("medium");
        }
      } else {
        setPasswordStrength("weak");
      }
      // Check if confirmPassword matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      } else if (formData.confirmPassword) {
        errors.confirmPassword = "";
      }
    } else if (name === "confirmPassword") {
      if (value !== formData.password) {
        errors.confirmPassword = "Passwords do not match";
      } else {
        errors.confirmPassword = "";
      }
    } else if (name === "designation") {
      errors.designation = !value.trim() ? "Designation is required" : "";
    } else if (name === "department") {
      errors.department = !value.trim() ? "Department is required" : "";
    }

    setFieldErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    const newErrors = {
      full_name: validateName(formData.full_name),
      email: validateEmail(formData.email),
      employee_id: validateEmployeeId(formData.employee_id),
      password: validatePassword(formData.password),
      confirmPassword: "",
      designation: !formData.designation.trim() ? "Designation is required" : "",
      department: !formData.department.trim() ? "Department is required" : ""
    };

    // Check if confirmPassword matches
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error)) {
      setError("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        employee_id: formData.employee_id.trim(),
        role: formData.role,
        designation: formData.designation.trim(),
        department: formData.department.trim()
      });

      if (result.success) {
        setSuccess("✅ Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Faculty signup only

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
              <h2>Faculty Portal</h2>
              <p>Faculty Registration Only</p>
              <ul className="features-list">
                <li><span className="feature-icon">✓</span> Quick account creation</li>
                <li><span className="feature-icon">✓</span> Streamlined clearance process</li>
                <li><span className="feature-icon">✓</span> Multi-department clearance</li>
                <li><span className="feature-icon">✓</span> 24/7 System access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SIGNUP FORM */}
        <div className="auth-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Faculty Clearance System Registration</p>
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
              {/* Hidden role field - always faculty */}
              <input type="hidden" name="role" value="faculty" />

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">
                  Full Name *
                  {!fieldErrors.full_name && formData.full_name && (
                    <span className="validation-success"> ✓</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type="text"
                    name="full_name"
                    className={`form-input ${fieldErrors.full_name ? "input-error" : formData.full_name && !fieldErrors.full_name ? "input-success" : ""}`}
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Bilal Khan"
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.full_name && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.full_name}
                  </small>
                )}
                {!fieldErrors.full_name && formData.full_name && (
                  <small className="form-hint" style={{ color: "#28a745" }}>
                    ✓ Valid name format
                  </small>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  Email Address *
                  {!fieldErrors.email && formData.email && (
                    <span className="validation-success"> ✓</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${fieldErrors.email ? "input-error" : formData.email && !fieldErrors.email ? "input-success" : ""}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.email}
                  </small>
                )}
                {!fieldErrors.email && formData.email && (
                  <small className="form-hint" style={{ color: "#28a745" }}>
                    ✓ Valid email format
                  </small>
                )}
              </div>

              {/* Employee ID */}
              <div className="form-group">
                <label className="form-label">
                  Employee ID *
                  {!fieldErrors.employee_id && formData.employee_id && (
                    <span className="validation-success"> ✓</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input
                    type="text"
                    name="employee_id"
                    className={`form-input ${fieldErrors.employee_id ? "input-error" : formData.employee_id && !fieldErrors.employee_id ? "input-success" : ""}`}
                    value={formData.employee_id}
                    onChange={handleChange}
                    placeholder="e.g., EMP2025001 or RIU12345"
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.employee_id && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.employee_id}
                  </small>
                )}
                {!fieldErrors.employee_id && formData.employee_id && (
                  <small className="form-hint" style={{ color: "#28a745" }}>
                    ✓ Valid employee ID (letters and numbers only)
                  </small>
                )}
                {!formData.employee_id && (
                  <small className="form-hint">
                    Your unique employee identification number (letters and numbers only, no special characters)
                  </small>
                )}
              </div>

              {/* Designation */}
              <div className="form-group">
                <label className="form-label">
                  Designation *
                  {!fieldErrors.designation && formData.designation && (
                    <span className="validation-success"> ✓</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <select
                    name="designation"
                    className={`form-input ${fieldErrors.designation ? "input-error" : formData.designation && !fieldErrors.designation ? "input-success" : ""}`}
                    value={formData.designation}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select your academic designation</option>
                    {designationOptions.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.designation && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.designation}
                  </small>
                )}
                {!fieldErrors.designation && formData.designation && (
                  <small className="form-hint" style={{ color: "#28a745" }}>
                    ✓ Designation selected
                  </small>
                )}
                {!formData.designation && (
                  <small className="form-hint">
                    Select your academic designation from the list
                  </small>
                )}
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">Department *</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <select
                    name="department"
                    className="form-input"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select your department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Law">Law</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <small className="form-hint">Your academic department</small>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">
                  Password *
                  {passwordStrength === "strong" && (
                    <span className="validation-success"> ✓ Strong</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-input ${fieldErrors.password ? "input-error" : passwordStrength === "strong" ? "input-success" : ""}`}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Riphah@2025"
                    disabled={loading}
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
                {fieldErrors.password && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.password}
                  </small>
                )}
                {!fieldErrors.password && formData.password && (
                  <>
                    <div className="password-strength-indicator">
                      <div
                        className={`strength-bar strength-${passwordStrength}`}
                        style={{
                          width:
                            passwordStrength === "weak"
                              ? "33%"
                              : passwordStrength === "medium"
                              ? "66%"
                              : "100%"
                        }}
                      ></div>
                    </div>
                    <small className="form-hint" style={{ color: "#28a745" }}>
                      ✓ Password strength: <strong>{passwordStrength.toUpperCase()}</strong>
                    </small>
                  </>
                )}
                {!formData.password && (
                  <small className="form-hint">
                    Password must be at least 8 characters and include: uppercase letter, lowercase letter, number & special character (!@#$%^&* etc.)
                  </small>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  Confirm Password *
                  {!fieldErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span className="validation-success"> ✓</span>
                  )}
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-input ${fieldErrors.confirmPassword ? "input-error" : formData.confirmPassword && !fieldErrors.confirmPassword ? "input-success" : ""}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
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
                {fieldErrors.confirmPassword && (
                  <small className="form-error">
                    <span className="error-icon">✗</span> {fieldErrors.confirmPassword}
                  </small>
                )}
                {!fieldErrors.confirmPassword && formData.confirmPassword && (
                  <small className="form-hint" style={{ color: "#28a745" }}>
                    ✓ Passwords match
                  </small>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loader"></span> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="form-divider">
              <span>Already registered?</span>
            </div>

            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>

            <div className="auth-footer">
              <p>© 2025 Riphah International University. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
