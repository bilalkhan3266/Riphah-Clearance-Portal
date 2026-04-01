import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  RiListCheck2, RiCheckDoubleLine, RiCloseCircleLine, RiMessage2Line, 
  RiUserSettingsLine, RiLogoutBoxLine, RiMedicineBotLine, RiAlertFill, 
  RiCheckFill, RiInboxLine, RiSpinnerLine
} from "react-icons/ri";
import axios from "axios";
import "./PharmacyDashboard.css";

export default function PharmacyDashboard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [modalRequestId, setModalRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.get(apiUrl + "/api/clearance/department", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        const data = response.data[activeTab] || [];
        setRequests(data.map(r => ({
          _id: r._id,
          student_name: r.studentName,
          sapid: r.sapid,
          program: r.program,
          semester: r.semester,
          status: r.pharmacyStatus,
          remarks: r.pharmacyRemarks,
          createdAt: r.submittedAt,
        })));
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleOpenRemarksModal = (requestId, action) => {
    setModalRequestId(requestId);
    setModalAction(action);
    setRemarks("");
    setShowRemarksModal(true);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.put(
        apiUrl + `/api/clearance/${modalRequestId}/approve`,
        { remarks: remarks.trim() },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setSuccess("Request approved successfully!");
        setShowRemarksModal(false);
        setRemarks("");
        await fetchRequests();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.put(
        apiUrl + `/api/clearance/${modalRequestId}/reject`,
        { remarks: remarks.trim() },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setSuccess("Request rejected successfully!");
        setShowRemarksModal(false);
        setRemarks("");
        await fetchRequests();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || "Pharmacy Staff";
  const displaySap = user?.sap || "N/A";

  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    setStats({
      pending: requests.filter(r => (r.status || "pending").toLowerCase() === "pending").length,
      approved: requests.filter(r => (r.status || "").toLowerCase() === "approved").length,
      rejected: requests.filter(r => (r.status || "").toLowerCase() === "rejected").length,
    });
  }, [requests]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <aside className="w-[280px] flex flex-col bg-gradient-to-b from-[#0a0f24] via-[#1b2a56] to-[#182848] text-white py-6 px-4 shadow-xl overflow-y-auto shrink-0">
        <div className="flex items-center gap-3 mb-8 pb-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300">
            <RiMedicineBotLine size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Pharmacy</h1>
        </div>

        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-purple-500/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{displayName}</h3>
            <p className="text-[11px] text-gray-300 truncate">{displaySap} • Pharmacy</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "pending" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
          >
            <RiListCheck2 size={18} /> Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "approved" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
          >
            <RiCheckDoubleLine size={18} /> Approved
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "rejected" ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
          >
            <RiCloseCircleLine size={18} /> Rejected
          </button>
          <hr className="my-3 border-white/10" />
          <button onClick={() => navigate("/pharmacy-messages")} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200">
            <RiMessage2Line size={18} /> Messages
          </button>
          <button onClick={() => navigate("/pharmacy-edit-profile")} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200">
            <RiUserSettingsLine size={18} /> Edit Profile
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200 mt-4 group">
          <RiLogoutBoxLine size={18} className="group-hover:animate-pulse" /> Logout
        </button>

        <footer className="text-[11px] text-gray-500 text-center pt-4 mt-4 border-t border-white/10">© 2026 Riphah</footer>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110">
              <RiMedicineBotLine size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pharmacy Clearance Management</h1>
              <p className="text-gray-600 mt-1">Review and manage student clearance requests</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-[fadeIn_0.3s_ease]">
            <RiAlertFill size={18} className="shrink-0 mt-0.5 flex-shrink-0 animate-pulse" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-[fadeIn_0.3s_ease]">
            <RiCheckFill size={18} className="shrink-0 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-200/50">
                <RiListCheck2 size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-200/50">
                <RiCheckDoubleLine size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-200/50">
                <RiCloseCircleLine size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="animate-spin mb-4 text-purple-500">
                <RiSpinnerLine size={32} />
              </div>
              <p className="text-sm font-medium">Loading {activeTab} requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <RiInboxLine size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">No {activeTab} requests found</p>
              <p className="text-sm text-gray-400 mt-1">All clearance requests have been processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">SAP ID</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                    {activeTab === "pending" && <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req, index) => (
                    <tr key={req._id || req.id} className="hover:bg-purple-50/30 transition-colors duration-150">
                      <td className="px-5 py-4 text-gray-600 text-xs font-medium">{index + 1}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{req.student_name || "N/A"}</td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-xs">{req.sapid || "N/A"}</td>
                      <td className="px-5 py-4 text-gray-600">{req.program || "N/A"}</td>
                      <td className="px-5 py-4 text-gray-600 text-center">{req.semester || "N/A"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          (req.status || "pending").toLowerCase() === "pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                          (req.status || "").toLowerCase() === "approved" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                          "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                          {req.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs max-w-[200px] truncate">{req.remarks || "—"}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                      {activeTab === "pending" && (
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenRemarksModal(req._id, "approve")}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                              <RiCheckDoubleLine size={14} className="group-hover:scale-110 transition-transform" /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenRemarksModal(req._id, "reject")}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                              <RiCloseCircleLine size={14} className="group-hover:scale-110 transition-transform" /> Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showRemarksModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" onClick={() => setShowRemarksModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-[slideUp_0.3s_ease]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${modalAction === "approve" ? "bg-emerald-100" : "bg-red-100"} flex items-center justify-center text-lg`}>
                    {modalAction === "approve" ? <RiCheckDoubleLine className="text-emerald-600" size={20} /> : <RiCloseCircleLine className="text-red-600" size={20} />}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {modalAction === "approve" ? "Approve Request" : "Reject Request"}
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {modalAction === "approve" ? "Approval Comments" : "Rejection Reason"}
                    {modalAction === "reject" && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={modalAction === "approve" ? "Enter any additional comments (optional)..." : "Please explain why this request is being rejected..."}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder:text-gray-400 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowRemarksModal(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={modalAction === "approve" ? handleApprove : handleReject}
                  disabled={actionLoading || (modalAction === "reject" && !remarks.trim())}
                  className={`flex-1 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 ${
                    modalAction === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <RiSpinnerLine size={16} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {modalAction === "approve" ? <RiCheckDoubleLine size={16} /> : <RiCloseCircleLine size={16} />}
                      {modalAction === "approve" ? "Approve" : "Reject"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
          @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        `}</style>
      </main>
    </div>
  );
}
