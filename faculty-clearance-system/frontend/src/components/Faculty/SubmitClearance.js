import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import { 
  MdDashboard, 
  MdFileUpload, 
  MdCheckCircle, 
  MdMail, 
  MdEdit, 
  MdLogout,
  MdPerson,
  MdPeople,
  MdLocationOn,
  MdPhone,
  MdInfo,
  MdChecklistRtl
} from "react-icons/md";

export default function SubmitClearance() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  // Add custom scrollbar styles on component mount
  useEffect(() => {
    // Create style element
    const style = document.createElement("style");
    style.id = "custom-scrollbar-styles";
    style.innerHTML = `
      /* Webkit browsers scrollbar */
      ::-webkit-scrollbar {
        width: 12px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3b82f6, #6366f1);
        border-radius: 6px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563eb, #4f46e5);
      }

      /* Firefox scrollbar */
      * {
        scrollbar-width: thin !important;
        scrollbar-color: #3b82f6 #f1f5f9 !important;
      }

      main {
        scrollbar-width: thin !important;
        scrollbar-color: #3b82f6 #f1f5f9 !important;
      }

      aside {
        scrollbar-width: thin !important;
        scrollbar-color: #3b82f6 #f1f5f9 !important;
      }
    `;

    // Remove existing style if present
    const existing = document.getElementById("custom-scrollbar-styles");
    if (existing) {
      existing.remove();
    }

    // Append new style
    document.head.appendChild(style);

    return () => {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const [formData, setFormData] = useState({
    faculty_id: user?.faculty_id || "",
    faculty_name: user?.full_name || "",
    designation: user?.designation || "",
    office_location: "",
    contact_number: "",
    degree_status: "",
    department: user?.department || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingRequests, setExistingRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(true);
  const [departmentStatuses, setDepartmentStatuses] = useState({});
  const [resubmittingDept, setResubmittingDept] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing clearance requests for the faculty
  useEffect(() => {
    const fetchExistingRequests = async () => {
      try {
        setFetchingRequests(true);
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

        if (!token) {
          setFetchingRequests(false);
          return;
        }

        const response = await axios.get(apiUrl + "/api/clearance-requests", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (response.data.success && response.data.requests) {
          setExistingRequests(response.data.requests);
          
          const statuses = {};
          response.data.requests.forEach((req) => {
            // Extract department statuses from the departments object
            if (req.departments && typeof req.departments === 'object') {
              Object.keys(req.departments).forEach((dept) => {
                statuses[dept] = req.departments[dept].status;
              });
            }
          });
          setDepartmentStatuses(statuses);
        }
      } catch (err) {
        console.error("Error fetching existing requests:", err);
        setExistingRequests([]);
      } finally {
        setFetchingRequests(false);
      }
    };

    fetchExistingRequests();
  }, []);

  const hasActiveRequest = existingRequests.length > 0 && 
    existingRequests.some(req => req.status !== "Rejected");
  const hasRejectedRequests = Object.values(departmentStatuses).some(status => status === "Rejected");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "contact_number") {
      const digitsOnly = value.replace(/[^\d]/g, "");
      setFormData({ ...formData, [name]: digitsOnly });
    } else if (name === "office_location") {
      const lettersOnly = value.replace(/[^a-zA-Z0-9\s-]/g, "");
      setFormData({ ...formData, [name]: lettersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setError("");
  };

  const handleResubmit = async (department) => {
    setResubmittingDept(department);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token found. Please login again.");
        setResubmittingDept(null);
        return;
      }

      const response = await axios.post(
        apiUrl + "/api/clearance-requests/resubmit",
        {
          faculty_id: formData.faculty_id,
          faculty_name: formData.faculty_name,
          designation: formData.designation,
          office_location: formData.office_location.trim(),
          contact_number: formData.contact_number.trim(),
          degree_status: formData.degree_status.trim(),
          department: department,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(`✅ Resubmit request sent to ${department}!`);
        
        setDepartmentStatuses({
          ...departmentStatuses,
          [department]: "Pending"
        });

        const updatedResponse = await axios.get(apiUrl + "/api/clearance-requests", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (updatedResponse.data.success) {
          setExistingRequests(updatedResponse.data.requests);
          const statuses = {};
          updatedResponse.data.requests.forEach((req) => {
            // Extract department statuses from the departments object
            if (req.departments && typeof req.departments === 'object') {
              Object.keys(req.departments).forEach((dept) => {
                statuses[dept] = req.departments[dept].status;
              });
            }
          });
          setDepartmentStatuses(statuses);
        }

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.data.message || "❌ Resubmit failed. Please try again.");
      }
    } catch (err) {
      console.error("Resubmit Error:", err);
      
      if (err.response?.status === 401) {
        setError("❌ Invalid or expired token. Please login again.");
      } else if (err.response?.status === 400) {
        setError("❌ " + (err.response?.data?.message || "Invalid request data."));
      } else if (err.response?.status === 500) {
        setError("❌ Server error: " + (err.response?.data?.message || "Failed to resubmit."));
      } else {
        setError("❌ Unable to resubmit: " + (err.message || "Unknown error"));
      }
    } finally {
      setResubmittingDept(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (hasActiveRequest) {
      setError("❌ You already have an active clearance request. You cannot submit another one.");
      return;
    }

    if (
      !formData.office_location.trim() ||
      !formData.contact_number.trim() ||
      !formData.degree_status.trim()
    ) {
      setError("❌ Please fill all required fields.");
      return;
    }

    if (!formData.faculty_id.trim() || !formData.faculty_name.trim()) {
      setError("❌ Faculty information is missing. Please logout and login again.");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token found. Please login again.");
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      console.log('📝 Submitting clearance request:', {
        faculty_id: formData.faculty_id,
        faculty_name: formData.faculty_name,
        designation: formData.designation,
        office_location: formData.office_location,
        contact_number: formData.contact_number,
        degree_status: formData.degree_status,
      });

      const response = await axios.post(
        apiUrl + "/api/clearance-requests",
        {
          faculty_id: formData.faculty_id,
          faculty_name: formData.faculty_name,
          designation: formData.designation,
          office_location: formData.office_location.trim(),
          contact_number: formData.contact_number.trim(),
          degree_status: formData.degree_status.trim(),
          department: formData.department,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess("✅ Clearance Request Submitted Successfully!\n\nYour request is now in Phase 1 (Library and Pharmacy).\nYou will be notified when it progresses to the next phase.");

        setFormData({
          faculty_id: user?.faculty_id || "",
          faculty_name: user?.full_name || "",
          designation: user?.designation || "",
          office_location: "",
          contact_number: "",
          degree_status: "",
          department: user?.department || "",
        });

        const updatedResponse = await axios.get(apiUrl + "/api/clearance-requests", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (updatedResponse.data.success) {
          setExistingRequests(updatedResponse.data.requests);
          const statuses = {};
          updatedResponse.data.requests.forEach((req) => {
            // Extract department statuses from the departments object
            if (req.departments && typeof req.departments === 'object') {
              Object.keys(req.departments).forEach((dept) => {
                statuses[dept] = req.departments[dept].status;
              });
            }
          });
          setDepartmentStatuses(statuses);
        }

        setTimeout(() => {
          navigate("/faculty-clearance-status");
        }, 2000);
      } else {
        setError(
          response.data.message || "❌ Submission failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Clearance Request Error:", err);
      
      if (err.response?.status === 401) {
        setError("❌ Invalid or expired token. Please login again.");
      } else if (err.response?.status === 400) {
        setError("❌ " + (err.response?.data?.message || "Invalid form data. Please check all fields."));
      } else if (err.response?.status === 500) {
        setError("❌ Server error: " + (err.response?.data?.message || "Failed to submit request."));
      } else if (err.response?.data?.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError(
          "❌ Unable to submit request: " + (err.message || "Unknown error")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || "Faculty";
  const displayDesignation = user?.designation || "N/A";
  const displayDept = user?.department || "N/A";

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed positioning */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-lg border-r border-gray-200 overflow-y-auto z-10">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{displayName}</h3>
              <p className="text-xs text-gray-600 truncate mt-1">{displayDesignation}</p>
              <p className="text-xs text-gray-500 truncate">{displayDept}</p>
              <p className="text-xs text-gray-500 truncate">Riphah International University</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <button
            onClick={() => navigate("/faculty-dashboard")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
          >
            <MdDashboard className="text-lg flex-shrink-0" /> Dashboard
          </button>
          <button
            onClick={() => navigate("/faculty-clearance")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 transition text-sm font-medium border border-blue-200 relative"
          >
            <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-r" />
            <MdFileUpload className="text-lg flex-shrink-0" /> Submit Clearance
          </button>
          <button
            onClick={() => navigate("/faculty-clearance-status")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
          >
            <MdCheckCircle className="text-lg flex-shrink-0" /> Clearance Status
          </button>
          <button
            onClick={() => navigate("/faculty-messages")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
          >
            <MdMail className="text-lg flex-shrink-0" /> Messages
          </button>
          <button
            onClick={() => navigate("/faculty-dashboard", { state: { scrollToAutoVerify: true } })}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
          >
            <MdCheckCircle className="text-lg flex-shrink-0" /> Auto Verify
          </button>
          <button
            onClick={() => navigate("/faculty-edit-profile")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
          >
            <MdEdit className="text-lg flex-shrink-0" /> Edit Profile
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-red-700 hover:bg-red-50 transition text-sm font-medium">
            <MdLogout className="text-lg flex-shrink-0" /> Logout
          </button>
        </nav>

        <footer className="text-center p-4 text-xs text-gray-500 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 font-semibold tracking-wide">© 2025 Riphah</footer>
      </aside>

      {/* Main Content - Accounts for fixed sidebar */}
      <main className="ml-72 flex-1 h-screen overflow-y-scroll overflow-x-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header - Not Fixed, Scrolls with Content */}
          <div className="bg-white border-b-2 border-gray-200 shadow-lg p-6 mb-8 rounded-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📋 Submit Clearance Request
            </h1>
            <p className="text-gray-600 text-sm mt-2 font-medium">
              Complete your clearance request to proceed with department verification
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-800 flex items-start gap-3 animate-in">
              <span className="text-lg flex-shrink-0">❌</span>
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-800 flex items-start gap-3 animate-in">
              <span className="text-lg flex-shrink-0">✅</span>
              <span className="text-sm">{success.split('\n')[0]}</span>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION 1: FACULTY INFORMATION */}
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MdPerson className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Faculty Information</h2>
                    <p className="text-sm text-gray-600">Your profile details (auto-filled from your account)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Faculty ID <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdChecklistRtl className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="faculty_id"
                        value={formData.faculty_id}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdPerson className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="faculty_name"
                        value={formData.faculty_name}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Designation <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdPeople className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Professor"
                        required
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Department <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdInfo className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Department Name"
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION */}
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <MdPhone className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                    <p className="text-sm text-gray-600">Provide your current contact details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Office Location <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdLocationOn className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="office_location"
                        value={formData.office_location}
                        onChange={handleChange}
                        placeholder="e.g., Building A, Room 201"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Enter your office building and room number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Contact Number <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <MdPhone className="absolute left-4 top-3 text-gray-400 text-lg" />
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="e.g., 03001234567"
                        pattern="\d*"
                        inputMode="numeric"
                        title="Only digits are allowed"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Your active mobile number</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EMPLOYMENT STATUS */}
              <div className="pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <MdChecklistRtl className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Employment Status</h2>
                    <p className="text-sm text-gray-600">Select your current employment status</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current Status <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <MdInfo className="absolute left-4 top-3 text-gray-400 text-lg" />
                    <select
                      name="degree_status"
                      value={formData.degree_status}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white cursor-pointer"
                      style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: "40px"
                      }}
                    >
                      <option value="">-- Select Your Current Status --</option>
                      <option value="Active">✓ Active Faculty</option>
                      <option value="On Leave">⏸ On Leave</option>
                      <option value="Resigned">✕ Resigned</option>
                      <option value="Retired">⭐ Retired</option>
                      <option value="Sabbatical">📚 Sabbatical</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Select your current employment status</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button 
                  type="submit" 
                  disabled={isSubmitting || hasActiveRequest || fetchingRequests}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : hasActiveRequest ? (
                    <>🔒 Request Already Submitted</>
                  ) : fetchingRequests ? (
                    <>Loading...</>
                  ) : (
                    <>✅ Submit Clearance Request</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/faculty-dashboard")}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Resubmit Section */}
            {hasRejectedRequests && (
              <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                <h3 className="text-lg font-bold text-red-900 mb-2">🔄 Resubmit Rejected Requests</h3>
                <p className="text-red-700 text-sm mb-4">The following departments rejected your initial request. Revise your information and resubmit:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(departmentStatuses).map(([dept, status]) => 
                    status === "Rejected" ? (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleResubmit(dept)}
                        disabled={resubmittingDept !== null}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                      >
                        {resubmittingDept === dept ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Resubmitting...
                          </>
                        ) : (
                          <>🔄 Resubmit to {dept}</>
                        )}
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Important Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MdInfo className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Important Information</h3>
            </div>

            {existingRequests.length > 0 ? (
              <div>
                <p className="font-semibold text-gray-900 mb-4">📌 Your Current Request Status:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {existingRequests.map((req, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                      req.status === "Pending" ? "bg-amber-50 border-amber-500" :
                      req.status === "Approved" ? "bg-green-50 border-green-500" :
                      "bg-red-50 border-red-500"
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{req.department}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
                          req.status === "Pending" ? "bg-amber-500" :
                          req.status === "Approved" ? "bg-green-500" :
                          "bg-red-500"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border-l-2 border-blue-500">
                  ℹ️ You cannot submit a new request until all departments respond. If a department rejects your request, you can resubmit to that department only.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-gray-900 mb-4">📌 Your clearance request will be processed by these departments:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {["🧪 Laboratory", "📚 Library", "💊 Pharmacy", "💰 Finance", "👥 HR", "📋 Records", "💻 IT", "⚙️ Admin", "🔬 ORIC", "🛡️ Warden", "👨‍💼 HOD", "👔 Dean"].map((dept, idx) => (
                    <div key={idx} className="p-3 bg-gray-100 rounded-lg text-center font-medium text-gray-900 hover:bg-gray-200 transition hover:scale-105">
                      {dept}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border-l-2 border-blue-500 mb-6">
                  Each department will review and approve/reject your request independently.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { phase: "Phase 1", items: "Library, Pharmacy, Lab" },
                    { phase: "Phase 2", items: "Finance, HR, Records" },
                    { phase: "Phase 3", items: "Admin, IT, ORIC" },
                    { phase: "Phase 4", items: "Warden, HOD, Dean" }
                  ].map((stage, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                      <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold mb-2">
                        {stage.phase}
                      </div>
                      <p className="text-sm text-gray-700">{stage.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !isSubmitting && setShowConfirmModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Submission</h2>
              <button 
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">📋</div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure you want to submit your clearance request?
              </p>
              <p className="text-gray-600">
                Once submitted, your request will be sent to all departments for review. This action cannot be undone.
              </p>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>✓ Confirm & Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
