// ==========================================
// routes/authRoutes.js
// Auth endpoints
// ==========================================
const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticateToken, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for auth endpoints (5 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register', 
  validate('register'), 
  authController.register
);

router.post('/login', 
  authLimiter,
  validate('login'), 
  authController.login
);

router.post('/refresh', 
  authController.refresh
);

// Protected routes
router.post('/logout', 
  authenticateToken, 
  authController.logout
);

router.get('/me', 
  authenticateToken, 
  authController.getMe
);

// Admin-only routes (example)
router.post('/admin/create-department',
  authenticateToken,
  authorize('admin'),
  (req, res) => {
    // TODO: Implement in next sprint
    res.json({
      success: true,
      message: 'Admin endpoint - to be implemented'
    });
  }
);

module.exports = router;