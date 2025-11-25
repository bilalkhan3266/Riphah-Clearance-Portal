// ==========================================
// middleware/auth.js
// JWT verification and RBAC
// ==========================================
const { verifyAccessToken } = require('../utils/generateToken');

/**
 * Middleware to authenticate JWT token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
}

/**
 * Middleware to authorize based on roles
 * Usage: authorize(['admin', 'department_officer'])
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  authorize
};


