import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

// Re-export AdminLayout as Dashboard for backward compatibility
export default function Dashboard() {
  const { user } = useAuthContext();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

