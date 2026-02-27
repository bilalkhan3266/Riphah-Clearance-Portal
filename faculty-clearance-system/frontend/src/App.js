import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';

// Certificate View (Public route)
import CertificateView from './components/Certificate/CertificateView';

// Protected Route
import ProtectedRoute from './routes/ProtectedRoute';

// Faculty Components
import FacultyDashboard from './components/Faculty/Dashboard';
import SubmitClearance from './components/Faculty/SubmitClearance';
import ClearanceStatus from './components/Faculty/ClearanceStatus';
import Messages from './components/Faculty/Messages';
import EditProfile from './components/Faculty/EditProfile';

// Admin Components
import AdminDashboard from './components/Admin/Dashboard';
import AdminLayoutDashboard from './components/Admin/pages/AdminDashboard';
import AdminEditProfile from './components/Admin/pages/AdminEditProfile';
import AdminMessages from './components/Admin/pages/AdminMessages';
import UserManagement from './components/Admin/pages/UserManagement';

// Department Components — Unified Dashboard (Issue + Return ONLY)
import DepartmentDashboard from './components/Departments/DepartmentDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/certificate-view/:clearanceId" element={<CertificateView />} />

          {/* Faculty Routes */}
          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-clearance"
            element={
              <ProtectedRoute requiredRole="faculty">
                <SubmitClearance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-clearance-status"
            element={
              <ProtectedRoute requiredRole="faculty">
                <ClearanceStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-messages"
            element={
              <ProtectedRoute requiredRole="faculty">
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-edit-profile"
            element={
              <ProtectedRoute requiredRole="faculty">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* New Modular Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminLayoutDashboard />} />
            <Route path="profile" element={<AdminEditProfile />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Department Staff Routes — Unified Dashboard (Issue + Return ONLY) */}
          <Route
            path="/library-clearance"
            element={
              <ProtectedRoute requiredRole="Library">
                <DepartmentDashboard departmentName="Library" icon="📚" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-clearance"
            element={
              <ProtectedRoute requiredRole="Lab">
                <DepartmentDashboard departmentName="Lab" icon="🔬" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy-clearance"
            element={
              <ProtectedRoute requiredRole="Pharmacy">
                <DepartmentDashboard departmentName="Pharmacy" icon="💊" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance-clearance"
            element={
              <ProtectedRoute requiredRole="Finance">
                <DepartmentDashboard departmentName="Finance" icon="💰" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-clearance"
            element={
              <ProtectedRoute requiredRole="HR">
                <DepartmentDashboard departmentName="HR" icon="👥" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records-clearance"
            element={
              <ProtectedRoute requiredRole="Records">
                <DepartmentDashboard departmentName="Records" icon="📁" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/it-clearance"
            element={
              <ProtectedRoute requiredRole="IT">
                <DepartmentDashboard departmentName="IT" icon="💻" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/oric-clearance"
            element={
              <ProtectedRoute requiredRole="ORIC">
                <DepartmentDashboard departmentName="ORIC" icon="🔬" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-clearance"
            element={
              <ProtectedRoute requiredRole="Admin">
                <DepartmentDashboard departmentName="Admin" icon="🏛️" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden-clearance"
            element={
              <ProtectedRoute requiredRole="Warden">
                <DepartmentDashboard departmentName="Warden" icon="🏠" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod-clearance"
            element={
              <ProtectedRoute requiredRole="HOD">
                <DepartmentDashboard departmentName="HOD" icon="👨‍💼" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean-clearance"
            element={
              <ProtectedRoute requiredRole="Dean">
                <DepartmentDashboard departmentName="Dean" icon="🎓" />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
