/**
 * UNIFIED DEPARTMENT DASHBOARD
 * Issue + Return + Messages + Edit
 * Used by all 12 department components
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { 
  RiLogoutBoxLine, RiMessage2Line, RiEditLine, RiRefreshLine, RiCheckDoubleLine, 
  RiCloseCircleLine, RiAlertFill, RiCheckFill, RiAddLine, RiLoaderLine, RiInboxLine,
  RiFileTextLine, RiListCheck2
} from 'react-icons/ri';
import axios from 'axios';
import './EnhancedDepartmentClearance.css';
import DepartmentMessages from './DepartmentMessages';
import EditIssueModal from './EditIssueModal';
import EditReturnModal from './EditReturnModal';

const DEPARTMENT_ITEM_TYPES = {
  Library: [
    { value: 'book', label: 'Book' },
    { value: 'journal', label: 'Journal' },
    { value: 'thesis', label: 'Thesis / Dissertation' },
    { value: 'magazine', label: 'Magazine / Periodical' },
    { value: 'cd-dvd', label: 'CD / DVD' },
    { value: 'library-card', label: 'Library Card' },
    { value: 'reference-material', label: 'Reference Material' },
    { value: 'e-resource-access', label: 'E-Resource Access' },
    { value: 'fine', label: 'Library Fine / Dues' },
    { value: 'other', label: 'Other' },
  ],
  Lab: [
    { value: 'equipment', label: 'Lab Equipment' },
    { value: 'chemical', label: 'Chemical / Reagent' },
    { value: 'glassware', label: 'Glassware' },
    { value: 'instrument', label: 'Instrument' },
    { value: 'lab-key', label: 'Lab Key' },
    { value: 'lab-coat', label: 'Lab Coat / Safety Gear' },
    { value: 'sample', label: 'Sample / Specimen' },
    { value: 'tool', label: 'Tool' },
    { value: 'breakage-fine', label: 'Breakage Fine' },
    { value: 'other', label: 'Other' },
  ],
  Pharmacy: [
    { value: 'medicine-sample', label: 'Medicine Sample' },
    { value: 'drug', label: 'Drug / Pharmaceutical' },
    { value: 'lab-kit', label: 'Pharmacy Lab Kit' },
    { value: 'equipment', label: 'Pharmacy Equipment' },
    { value: 'chemical', label: 'Chemical / Compound' },
    { value: 'reference-book', label: 'Reference Book' },
    { value: 'safety-gear', label: 'Safety Gear' },
    { value: 'fine', label: 'Fine / Dues' },
    { value: 'other', label: 'Other' },
  ],
  Finance: [
    { value: 'fee-dues', label: 'Fee Dues' },
    { value: 'tuition', label: 'Tuition Fee' },
    { value: 'exam-fee', label: 'Exam Fee' },
    { value: 'library-fine', label: 'Library Fine' },
    { value: 'lab-fine', label: 'Lab Fine' },
    { value: 'hostel-dues', label: 'Hostel Dues' },
    { value: 'transport-dues', label: 'Transport Dues' },
    { value: 'advance', label: 'Advance / Loan' },
    { value: 'salary-adjustment', label: 'Salary Adjustment' },
    { value: 'reimbursement', label: 'Reimbursement Pending' },
    { value: 'other', label: 'Other' },
  ],
  HR: [
    { value: 'id-card', label: 'ID Card' },
    { value: 'contract', label: 'Employment Contract' },
    { value: 'leave-record', label: 'Leave Record' },
    { value: 'experience-letter', label: 'Experience Letter' },
    { value: 'noc', label: 'NOC (No Objection Certificate)' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'handbook', label: 'Employee Handbook' },
    { value: 'training-material', label: 'Training Material' },
    { value: 'access-card', label: 'Access Card / Badge' },
    { value: 'other', label: 'Other' },
  ],
  Records: [
    { value: 'transcript', label: 'Transcript' },
    { value: 'degree', label: 'Degree / Certificate' },
    { value: 'admission-file', label: 'Admission File' },
    { value: 'academic-record', label: 'Academic Record' },
    { value: 'enrollment-form', label: 'Enrollment Form' },
    { value: 'migration-cert', label: 'Migration Certificate' },
    { value: 'character-cert', label: 'Character Certificate' },
    { value: 'document', label: 'Document' },
    { value: 'other', label: 'Other' },
  ],
  IT: [
    { value: 'laptop', label: 'Laptop' },
    { value: 'desktop', label: 'Desktop / PC' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'keyboard-mouse', label: 'Keyboard / Mouse' },
    { value: 'printer', label: 'Printer / Scanner' },
    { value: 'usb-drive', label: 'USB Drive' },
    { value: 'software-license', label: 'Software License' },
    { value: 'email-account', label: 'Email Account' },
    { value: 'network-access', label: 'Network / WiFi Access' },
    { value: 'projector', label: 'Projector' },
    { value: 'charger-cable', label: 'Charger / Cable' },
    { value: 'other', label: 'Other' },
  ],
  ORIC: [
    { value: 'research-grant', label: 'Research Grant' },
    { value: 'research-equipment', label: 'Research Equipment' },
    { value: 'project-file', label: 'Project File' },
    { value: 'publication-record', label: 'Publication Record' },
    { value: 'patent-file', label: 'Patent File' },
    { value: 'funding-document', label: 'Funding Document' },
    { value: 'collaboration-mou', label: 'Collaboration MOU' },
    { value: 'lab-access', label: 'Research Lab Access' },
    { value: 'report', label: 'Research Report' },
    { value: 'other', label: 'Other' },
  ],
  Admin: [
    { value: 'office-key', label: 'Office Key' },
    { value: 'parking-card', label: 'Parking Card' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'access-card', label: 'Access Card / Gate Pass' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'property', label: 'University Property' },
    { value: 'vehicle-pass', label: 'Vehicle Pass' },
    { value: 'locker-key', label: 'Locker Key' },
    { value: 'other', label: 'Other' },
  ],
  Warden: [
    { value: 'room-key', label: 'Room Key' },
    { value: 'hostel-card', label: 'Hostel Card' },
    { value: 'mattress', label: 'Mattress / Bedding' },
    { value: 'furniture', label: 'Room Furniture' },
    { value: 'mess-card', label: 'Mess Card' },
    { value: 'hostel-dues', label: 'Hostel Dues' },
    { value: 'damage-fine', label: 'Damage Fine' },
    { value: 'appliance', label: 'Appliance (Fan, Heater, etc.)' },
    { value: 'locker', label: 'Locker' },
    { value: 'other', label: 'Other' },
  ],
  HOD: [
    { value: 'project-report', label: 'Project Report' },
    { value: 'thesis', label: 'Thesis / Dissertation' },
    { value: 'department-equipment', label: 'Department Equipment' },
    { value: 'course-material', label: 'Course Material' },
    { value: 'lab-manual', label: 'Lab Manual' },
    { value: 'assignment-record', label: 'Assignment Record' },
    { value: 'department-key', label: 'Department Key' },
    { value: 'noc', label: 'Departmental NOC' },
    { value: 'attendance-record', label: 'Attendance Record' },
    { value: 'other', label: 'Other' },
  ],
  Dean: [
    { value: 'approval-letter', label: 'Approval Letter' },
    { value: 'recommendation', label: 'Recommendation Letter' },
    { value: 'noc', label: 'Dean NOC' },
    { value: 'academic-report', label: 'Academic Report' },
    { value: 'disciplinary-record', label: 'Disciplinary Record' },
    { value: 'scholarship-doc', label: 'Scholarship Document' },
    { value: 'faculty-evaluation', label: 'Faculty Evaluation' },
    { value: 'final-clearance', label: 'Final Clearance Form' },
    { value: 'other', label: 'Other' },
  ],
};

export default function DepartmentDashboard({ departmentName, icon }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const itemTypes = DEPARTMENT_ITEM_TYPES[departmentName] || DEPARTMENT_ITEM_TYPES.Library;

  const [activeTab, setActiveTab] = useState('issues');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Issues and Returns state
  const [departmentIssues, setDepartmentIssues] = useState([]);
  const [departmentReturns, setDepartmentReturns] = useState([]);
  const [approvedRecords, setApprovedRecords] = useState([]);

  // Forms
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    facultyId: '', facultyName: '', itemType: itemTypes[0].value, description: '', quantity: 1, dueDate: '', notes: ''
  });
  const [returnFormData, setReturnFormData] = useState({
    facultyId: '', referenceIssueId: '', quantityReturned: 1, condition: 'Good', notes: ''
  });

  // Edit modals
  const [editingIssue, setEditingIssue] = useState(null);
  const [editingReturn, setEditingReturn] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchDepartmentIssues();
    fetchDepartmentReturns();
    fetchApprovedRecords();
    const interval = setInterval(() => {
      fetchDepartmentIssues();
      fetchDepartmentReturns();
      fetchApprovedRecords();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDepartmentIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/departments/${departmentName}/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setDepartmentIssues(response.data.data || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const fetchDepartmentReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/departments/${departmentName}/returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setDepartmentReturns(response.data.data || []);
    } catch (err) {
      console.error('Error fetching returns:', err);
    }
  };

  const fetchApprovedRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/departments/approved-records/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Approved Records API Response:', response.data);
      if (response.data.success) {
        setApprovedRecords(response.data.data || []);
        console.log('✅ Approved Records loaded:', response.data.data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Error fetching approved records:', err.response?.data || err.message);
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    if (!issueFormData.facultyId || !issueFormData.description) {
      setError('Please fill Faculty ID and Description'); return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/departments/${departmentName}/issue`, issueFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Issue created successfully!');
        setIssueFormData({ facultyId: '', facultyName: '', itemType: 'book', description: '', quantity: 1, dueDate: '', notes: '' });
        setShowIssueForm(false);
        fetchDepartmentIssues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating issue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReturn = async (e) => {
    e.preventDefault();
    if (!returnFormData.facultyId || !returnFormData.referenceIssueId) {
      setError('Please fill Faculty ID and select an Issue'); return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/departments/${departmentName}/return`, returnFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Return recorded! Auto-clearance re-check triggered.');
        setReturnFormData({ facultyId: '', referenceIssueId: '', quantityReturned: 1, condition: 'Good', notes: '' });
        setShowReturnForm(false);
        fetchDepartmentReturns();
        fetchDepartmentIssues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording return');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const displayName = user?.full_name || 'Staff';

  const pendingIssues = departmentIssues.filter(i => i.status !== 'Cleared');
  const clearedIssues = departmentIssues.filter(i => i.status === 'Cleared');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 font-sans text-gray-800 overflow-hidden">
      {/* PROFESSIONAL SIDEBAR */}
      <aside className="w-[300px] flex flex-col bg-gradient-to-b from-blue-600 to-blue-800 text-white py-6 px-5 shadow-2xl overflow-y-auto shrink-0 border-r-4 border-blue-900">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b-3 border-blue-400">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white shadow-lg shadow-blue-400/30 hover:shadow-blue-400/50 transition-all duration-300 font-bold text-xl">
            D
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Department</h1>
            <p className="text-xs font-semibold text-blue-100">Clearance System</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-blue-400 hover:border-blue-300 transition-all duration-200 shadow-md">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-300 to-purple-400 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-purple-400/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-white truncate">{displayName}</h3>
            <p className="text-xs font-bold text-blue-50 truncate">{departmentName}</p>
            <p className="text-[11px] font-semibold text-blue-100 truncate">Riphah International</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => { fetchDepartmentIssues(); fetchDepartmentReturns(); setSuccess('Data refreshed'); setTimeout(() => setSuccess(''), 2000); }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white hover:bg-blue-500 hover:text-white transition-all duration-200 group border-2 border-transparent hover:border-yellow-300"
            title="Refresh Data"
          >
            <RiRefreshLine size={20} className="group-hover:rotate-180 transition-transform duration-500 text-yellow-300 group-hover:text-yellow-100 font-bold" /> Refresh
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === 'issues'
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900 shadow-lg shadow-yellow-300/50 border-yellow-500'
                : 'text-white border-blue-400 hover:bg-blue-500 hover:border-yellow-300 hover:text-white'
            }`}
          >
            <RiListCheck2 size={20} className={activeTab === 'issues' ? 'text-gray-900 font-bold' : 'text-yellow-300 font-bold'} /> Issues
            {pendingIssues.length > 0 && <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingIssues.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === 'returns'
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-400/50 border-green-600'
                : 'text-white border-blue-400 hover:bg-blue-500 hover:border-green-400 hover:text-white'
            }`}
          >
            <RiCheckDoubleLine size={20} className={activeTab === 'returns' ? 'text-white font-bold' : 'text-green-300 font-bold'} /> Returns
            {departmentReturns.length > 0 && <span className="ml-auto bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">{departmentReturns.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === 'approved'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-400/50 border-emerald-700'
                : 'text-white border-blue-400 hover:bg-blue-500 hover:border-emerald-400 hover:text-white'
            }`}
          >
            <RiCheckFill size={20} className={activeTab === 'approved' ? 'text-white font-bold' : 'text-emerald-300 font-bold'} /> Approved
            {approvedRecords.length > 0 && <span className="ml-auto bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">{approvedRecords.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-400/50 border-purple-700'
                : 'text-white border-blue-400 hover:bg-blue-500 hover:border-purple-400 hover:text-white'
            }`}
          >
            <RiMessage2Line size={20} className={activeTab === 'messages' ? 'text-white font-bold' : 'text-purple-300 font-bold'} /> Messages
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === 'edit'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-400/50 border-blue-700'
                : 'text-white border-blue-400 hover:bg-blue-500 hover:border-cyan-400 hover:text-white'
            }`}
          >
            <RiEditLine size={20} className={activeTab === 'edit' ? 'text-white font-bold' : 'text-cyan-300 font-bold'} /> Edit Records
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-300 hover:bg-red-600/20 hover:text-red-100 transition-all duration-200 mt-6 group border-2 border-red-400 hover:border-red-300 shadow-md"
        >
          <RiLogoutBoxLine size={20} className="group-hover:animate-pulse text-red-300 font-bold group-hover:text-red-100" /> Logout
        </button>

        {/* Footer */}
        <footer className="text-[11px] font-bold text-blue-100 text-center pt-4 mt-6 border-t-3 border-blue-400">© 2026 Riphah</footer>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        {/* Modern Header Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-2xl p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <RiFileTextLine size={40} className="text-white font-bold" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">{departmentName} Department</h1>
              <p className="text-blue-100 mt-2 text-lg font-medium">Manage issued items and returns with auto-validation</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 mb-6 p-5 rounded-2xl bg-red-50 border-l-4 border-red-500 text-red-900 text-sm shadow-md animate-fadeIn">
            <RiAlertFill size={24} className="shrink-0 mt-0.5 text-red-600 font-bold" />
            <span className="flex-1 font-semibold">{error}</span>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 transition-colors ml-4">
              <RiCloseCircleLine size={24} className="font-bold" />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 text-emerald-900 text-sm shadow-md animate-fadeIn">
            <RiCheckFill size={24} className="shrink-0 mt-0.5 text-emerald-600 font-bold" />
            <span className="font-semibold flex-1">{success}</span>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-600 shadow-lg p-6 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-lg">
            ℹ
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Auto-Validation System Active</h3>
            <p className="text-gray-700 font-medium">Clearance is processed automatically. Create an Issue when faculty has pending items. Record a Return when items are returned — the system re-validates clearance automatically.</p>
          </div>
        </div>

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    📋
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">Issues</h2>
                </div>
                <p className="text-gray-600 font-medium ml-13">
                  <span className="font-bold text-blue-600">{departmentIssues.filter(i => i.status !== 'Cleared').length}</span> pending • 
                  <span className="font-bold text-purple-600 ml-1">{departmentIssues.filter(i => i.status === 'Cleared').length}</span> cleared
                </p>
              </div>
              <button
                onClick={() => setShowIssueForm(!showIssueForm)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                  showIssueForm
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white hover:shadow-2xl'
                }`}
              >
                {showIssueForm ? (
                  <>
                    <RiCloseCircleLine size={20} className="font-bold" /> Cancel
                  </>
                ) : (
                  <>
                    <RiAddLine size={20} className="font-bold" /> Create Issue
                  </>
                )}
              </button>
            </div>

            {showIssueForm && (
              <form onSubmit={handleAddIssue} className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 shadow-xl">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-blue-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    📝
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Create New Issue</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Faculty ID *</label>
                    <input
                      type="text"
                      required
                      value={issueFormData.facultyId}
                      onChange={(e) => setIssueFormData({...issueFormData, facultyId: e.target.value})}
                      placeholder="e.g. E12345"
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Faculty Name</label>
                    <input
                      type="text"
                      value={issueFormData.facultyName}
                      onChange={(e) => setIssueFormData({...issueFormData, facultyName: e.target.value})}
                      placeholder="Optional"
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Item Type *</label>
                    <select
                      required
                      value={issueFormData.itemType}
                      onChange={(e) => setIssueFormData({...issueFormData, itemType: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium"
                    >
                      {itemTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={issueFormData.quantity}
                      onChange={(e) => setIssueFormData({...issueFormData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={issueFormData.dueDate}
                      onChange={(e) => setIssueFormData({...issueFormData, dueDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium"
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    value={issueFormData.description}
                    onChange={(e) => setIssueFormData({...issueFormData, description: e.target.value})}
                    placeholder="Describe the issued item in detail"
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-900 font-medium placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 hover:shadow-2xl active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <RiLoaderLine size={22} className="animate-spin font-bold" /> Creating...
                    </>
                  ) : (
                    <>
                      <RiAddLine size={20} className="text-white font-bold" /> Create Issue
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Search Bar */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Faculty ID, description, item type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3 pl-12 rounded-xl border-2 border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium placeholder-gray-500 shadow-lg"
                />
                <div className="absolute left-4 top-3.5 text-blue-500 font-bold text-xl">
                  🔍
                </div>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all duration-200 shadow-lg"
                >
                  Clear
                </button>
              )}
            </div>

            {departmentIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentIssues
                  .filter((issue) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      issue.facultyId.toLowerCase().includes(query) ||
                      issue.description.toLowerCase().includes(query) ||
                      issue.itemType.toLowerCase().includes(query) ||
                      (issue.facultyName && issue.facultyName.toLowerCase().includes(query))
                    );
                  })
                  .map((issue) => (
                  <div key={issue._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 overflow-hidden group hover:scale-105 transform">
                    {/* Card Header with Status */}
                    <div className={`px-6 py-4 border-b-2 ${
                      issue.status === 'Cleared'
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300'
                        : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Faculty ID</p>
                          <h3 className="font-bold text-gray-900 text-lg mt-1">{issue.facultyId}</h3>
                          {issue.facultyName && <p className="text-sm text-gray-600 mt-0.5">{issue.facultyName}</p>}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          issue.status === 'Cleared'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {issue.status === 'Cleared' ? <RiCheckFill size={14} className="mr-1 font-bold" /> : <RiAlertFill size={14} className="mr-1" />}
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Item Information */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Item Description</p>
                          <p className="text-sm font-medium text-gray-900">{issue.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">{issue.itemType}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                            <p className="text-sm font-medium text-gray-900">{issue.quantity} pcs</p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issued</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(issue.issueDate).toLocaleDateString()}</p>
                        </div>
                        {issue.dueDate && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-300">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Due Date</p>
                            <p className="text-sm font-bold text-blue-900">{new Date(issue.dueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer with Actions */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between gap-3">
                      <button
                        onClick={() => {
                          setReturnFormData({ 
                            facultyId: issue.facultyId, 
                            referenceIssueId: issue._id, 
                            quantityReturned: issue.quantity, 
                            condition: 'Good', 
                            notes: '' 
                          });
                          setShowReturnForm(true);
                          setActiveTab('returns');
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 border-2 border-green-600 hover:from-green-600 hover:to-emerald-700 hover:border-green-700 transition-all duration-200 shadow-md"
                      >
                        <RiCheckDoubleLine size={16} className="font-bold" /> Return
                      </button>
                      <button
                        onClick={() => setEditingIssue(issue)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-blue-700 bg-white border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 shadow-sm"
                      >
                        <RiEditLine size={16} className="font-bold" /> Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center mb-6">
                  <RiInboxLine size={40} className="text-blue-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'No issues found 🔍' : 'No Issues Found 🎉'}
                </p>
                <p className="text-sm text-gray-600">
                  {searchQuery 
                    ? `No results match "${searchQuery}". Try a different search.` 
                    : 'All items are cleared for this department'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* RETURNS TAB */}
        {activeTab === 'returns' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    ✅
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">Returns</h2>
                </div>
                <p className="text-gray-600 font-medium">{departmentReturns.length} returns recorded</p>
              </div>
              <button
                onClick={() => setShowReturnForm(!showReturnForm)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                  showReturnForm
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white hover:shadow-2xl'
                }`}
              >
                {showReturnForm ? (
                  <>
                    <RiCloseCircleLine size={20} className="font-bold" /> Cancel
                  </>
                ) : (
                  <>
                    <RiAddLine size={20} className="font-bold" /> Record Return
                  </>
                )}
              </button>
            </div>

            {showReturnForm && (
              <form onSubmit={handleAddReturn} className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-300 shadow-xl">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-purple-300">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    📋
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Record Item Return</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Faculty ID *</label>
                    <input
                      type="text"
                      required
                      value={returnFormData.facultyId}
                      onChange={(e) => setReturnFormData({...returnFormData, facultyId: e.target.value})}
                      placeholder="e.g. E12345"
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 font-medium placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Issue Reference *</label>
                    <select
                      required
                      value={returnFormData.referenceIssueId}
                      onChange={(e) => setReturnFormData({...returnFormData, referenceIssueId: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 font-medium"
                    >
                      <option value="">-- Select issue to return --</option>
                      {departmentIssues.filter(i => i.status !== 'Cleared').map(issue => (
                        <option key={issue._id} value={issue._id}>
                          {issue.issueReferenceNumber || issue._id.slice(-6)} - {issue.itemType} ({issue.quantity} qty) - {issue.facultyId}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity Returned</label>
                    <input
                      type="number"
                      min="1"
                      value={returnFormData.quantityReturned}
                      onChange={(e) => setReturnFormData({...returnFormData, quantityReturned: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                    <select
                      value={returnFormData.condition}
                      onChange={(e) => setReturnFormData({...returnFormData, condition: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 font-medium"
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Return Date</label>
                    <input
                      type="date"
                      value={returnFormData.returnDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setReturnFormData({...returnFormData, returnDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 font-medium"
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={returnFormData.notes}
                    onChange={(e) => setReturnFormData({...returnFormData, notes: e.target.value})}
                    placeholder="Optional notes about the return"
                    rows="2"
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none text-gray-900 font-medium placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-4 rounded-xl text-white font-bold transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-600 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-700 hover:shadow-2xl active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <RiLoaderLine size={22} className="animate-spin font-bold" /> Processing...
                    </>
                  ) : (
                    <>
                      <RiCheckDoubleLine size={22} className="font-bold" /> Record Return
                    </>
                  )}
                </button>
              </form>
            )}

            {departmentReturns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentReturns.map((ret) => (
                  <div key={ret._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden group hover:scale-105 transform">
                    {/* Card Header with Status */}
                    <div className={`px-6 py-4 border-b-2 ${
                      ret.status === 'Cleared'
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                        : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Faculty ID</p>
                          <h3 className="font-bold text-gray-900 text-lg mt-1">{ret.facultyId}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">Return Record</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          ret.status === 'Cleared'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {ret.status === 'Cleared' ? <RiCheckFill size={14} className="mr-1 font-bold" /> : <RiAlertFill size={14} className="mr-1" />}
                          {ret.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Item Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Item Type</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{ret.itemType}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                          <p className="text-sm font-medium text-gray-900">{ret.quantityReturned} pcs</p>
                        </div>
                      </div>

                      {/* Condition and Date */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Condition</p>
                          <p className={`text-sm font-bold ${
                            ret.condition === 'Good' ? 'text-emerald-600' :
                            ret.condition === 'Fair' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>{ret.condition || 'Good'}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Return Date</p>
                          <p className="text-sm font-bold text-emerald-900">{new Date(ret.returnDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Notes if available */}
                      {ret.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-sm text-gray-700">{ret.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer with Action */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => setEditingReturn(ret)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-white border-2 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200 shadow-sm"
                      >
                        <RiEditLine size={16} className="font-bold" /> Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center mb-6">
                  <RiInboxLine size={40} className="text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No Returns Yet 🎯</p>
                <p className="text-sm text-gray-600">Returns will appear here when recorded</p>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <DepartmentMessages departmentName={departmentName} />
          </div>
        )}

        {/* APPROVED RECORDS TAB */}
        {activeTab === 'approved' && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <h2 className="text-3xl font-black text-gray-900">Approved Faculty</h2>
              </div>
              <p className="text-gray-600 font-medium ml-13">
                <span className="font-bold text-emerald-600">{approvedRecords.length}</span> faculty members with complete clearance
              </p>
            </div>

            {approvedRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedRecords.map(record => (
                  <div 
                    key={record._id}
                    className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform flex flex-col"
                  >
                    {/* Header */}
                    <div className="mb-4 pb-4 border-b-2 border-emerald-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                          {String(record.employeeId || record.facultyName || '?')[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-gray-900 truncate">{record.employeeId || 'N/A'}</p>
                          <p className="text-xs font-semibold text-emerald-700 truncate">{record.facultyName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        <RiCheckFill size={14} /> Approved
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4 flex-1">
                      {record.clearanceDate && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Approval Date</p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(record.clearanceDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {record.department && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Last Department</p>
                          <p className="text-sm font-bold text-gray-900">{record.department}</p>
                        </div>
                      )}
                      {record.totalIssues && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Total Issues</p>
                          <p className="text-sm font-bold text-gray-900">{record.totalIssues}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Badge */}
                    <div className="pt-4 border-t-2 border-emerald-200">
                      <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                        Early Clearance Status
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center mb-6">
                  <RiInboxLine size={40} className="text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No Approved Faculty Yet</p>
                <p className="text-gray-600 text-center">Faculty members will appear here once their clearance is approved from all departments</p>
              </div>
            )}
          </div>
        )}

        {/* EDIT RECORDS TAB */}
        {activeTab === 'edit' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <RiEditLine size={28} className="text-purple-600" /> Edit Records
              </h2>
              <p className="text-gray-600 text-sm">Modify issue or return records below. Changes automatically trigger clearance re-evaluation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Issues Column */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RiListCheck2 size={22} className="text-blue-600" /> Issues ({departmentIssues.length})
                </h3>
                {departmentIssues.length > 0 ? (
                  <div className="space-y-3">
                    {departmentIssues.map(issue => (
                      <div key={issue._id} className="bg-white rounded-lg border border-blue-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{issue.facultyId}</p>
                            {issue.facultyName && <p className="text-xs text-gray-600">{issue.facultyName}</p>}
                            <p className="text-xs text-gray-600 mt-1">{issue.itemType} · {issue.description?.substring(0, 40)}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap ml-2 ${
                            issue.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingIssue(issue)}
                          className="w-full mt-3 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 active:scale-95"
                        >
                          <RiEditLine size={14} /> Edit Issue
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-blue-50 border border-blue-200">
                    <RiInboxLine size={32} className="text-blue-300 mb-2" />
                    <p className="text-sm text-gray-600">No issues to edit</p>
                  </div>
                )}
              </div>

              {/* Returns Column */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RiCheckDoubleLine size={22} className="text-emerald-600" /> Returns ({departmentReturns.length})
                </h3>
                {departmentReturns.length > 0 ? (
                  <div className="space-y-3">
                    {departmentReturns.map(ret => (
                      <div key={ret._id} className="bg-white rounded-lg border border-emerald-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{ret.facultyId}</p>
                            <p className="text-xs text-gray-600 mt-1">{ret.itemType} · Qty: {ret.quantityReturned} · {ret.condition}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap ml-2 ${
                            ret.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ret.status}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingReturn(ret)}
                          className="w-full mt-3 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 active:scale-95"
                        >
                          <RiEditLine size={14} /> Edit Return
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-emerald-50 border border-emerald-200">
                    <RiInboxLine size={32} className="text-emerald-300 mb-2" />
                    <p className="text-sm text-gray-600">No returns to edit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modals */}
        {editingIssue && (
          <EditIssueModal
            issue={editingIssue}
            departmentName={departmentName}
            onClose={() => setEditingIssue(null)}
            onUpdated={(updated, clearanceStatus) => {
              setEditingIssue(null);
              setSuccess(`Issue updated successfully!${clearanceStatus ? ` Clearance: ${clearanceStatus}` : ''}`);
              fetchDepartmentIssues();
              fetchDepartmentReturns();
              setTimeout(() => setSuccess(''), 4000);
            }}
          />
        )}
        {editingReturn && (
          <EditReturnModal
            returnRecord={editingReturn}
            departmentName={departmentName}
            onClose={() => setEditingReturn(null)}
            onUpdated={(updated, clearanceStatus) => {
              setEditingReturn(null);
              setSuccess(`Return updated successfully!${clearanceStatus ? ` Clearance: ${clearanceStatus}` : ''}`);
              fetchDepartmentIssues();
              fetchDepartmentReturns();
              setTimeout(() => setSuccess(''), 4000);
            }}
          />
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        `}</style>
      </main>
    </div>
  );
}
