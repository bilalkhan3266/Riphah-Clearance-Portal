import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, isAuthenticated, token } = useAuthContext();

  // Fallback to localStorage if state hasn't updated yet
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let localUser = null;
  
  try {
    if (storedUser) {
      localUser = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Error parsing stored user:', err);
  }

  // Use state if available, otherwise use localStorage
  const isAuth = isAuthenticated || (!!storedToken && !!localUser);
  const currentUser = user || localUser;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser) {
    const userRole = currentUser.role || '';
    const requiredRoleLower = requiredRole.toLowerCase();
    const userRoleLower = userRole.toLowerCase();
    
    if (userRoleLower !== requiredRoleLower) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
