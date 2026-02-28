import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  MdDashboard,
  MdPerson,
  MdMail,
  MdGroup,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md';
import './styles/AdminModern.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: MdDashboard },
    { path: '/admin/users', label: 'User Management', icon: MdGroup },
    { path: '/admin/messages', label: 'Messages', icon: MdMail },
    { path: '/admin/profile', label: 'Edit Profile', icon: MdPerson }
  ];

  const isActive = (path) => location.pathname === path;
  const getPageTitle = () => {
    const item = menuItems.find(m => isActive(m.path));
    return item?.label || 'Dashboard';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo-icon">FC</div>
          <h2 className="admin-logo">FCS Admin</h2>
          <button
            className="admin-sidebar-toggle-close"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose />
          </button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.path}
                className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <IconComponent className="admin-nav-icon" />
                <span className="admin-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-mini">
            <div className="admin-avatar">{user?.full_name?.[0] || 'A'}</div>
            <div className="admin-profile-info">
              <p className="admin-profile-name">{user?.full_name || 'Admin'}</p>
              <p className="admin-profile-email">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <MdLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MdMenu />
          </button>
          <div className="admin-header-content">
            <h1>{getPageTitle()}</h1>
            <p className="admin-header-subtitle">Faculty Clearance System</p>
          </div>
          <div className="admin-header-actions">
            <div className="admin-header-profile" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }} title="Edit Profile">
              <span className="admin-header-profile-name">{user?.full_name || 'Admin'}</span>
              <div className="admin-header-profile-avatar">
                {user?.full_name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
