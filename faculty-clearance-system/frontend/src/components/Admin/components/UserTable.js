import React, { useState } from 'react';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

export default function UserTable({
  users = [],
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  searchTerm = ''
}) {
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <h3 className="empty-state-title">No users found</h3>
        <p className="empty-state-description">
          {searchTerm ? 'Try adjusting your search filters' : 'Start by adding a new user'}
        </p>
        {onAdd && (
          <button className="btn btn-primary" onClick={onAdd}>
            <MdAdd /> Add User
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id || user.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      flexShrink: 0
                    }}
                  >
                    {user.full_name?.[0] || 'U'}
                  </div>
                  <span>{user.full_name}</span>
                </div>
              </td>
              <td>{user.email}</td>
              <td>{user.department || 'N/A'}</td>
              <td>
                <span style={{ textTransform: 'capitalize' }}>
                  {user.role || 'faculty'}
                </span>
              </td>
              <td>
                <span className={`table-status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  {onEdit && (
                    <button 
                      className="table-action-btn edit btn-small"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                    >
                      <MdEdit /> Edit
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="table-action-btn delete btn-small"
                      onClick={() => {
                        if (window.confirm(`Delete ${user.full_name}?`)) {
                          onDelete(user._id || user.id);
                        }
                      }}
                      title="Delete user"
                    >
                      <MdDelete /> Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
