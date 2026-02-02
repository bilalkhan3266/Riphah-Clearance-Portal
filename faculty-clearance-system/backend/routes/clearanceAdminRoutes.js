const express = require('express');
const router = express.Router();
const Clearance = require('../models/Clearance');
const clearanceController = require('../controllers/clearanceController');
const authenticateToken = require('../middleware/verifyToken');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateClearanceRequest = [
  body('facultyId')
    .notEmpty()
    .withMessage('Faculty ID is required')
    .isString()
    .trim()
];

// =====================
// CLEARANCE ENDPOINTS
// =====================

/**
 * POST /api/clearance/submit
 * Submit clearance request - Automatic verification runs
 * Only Faculty can submit their own clearance
 */
router.post('/clearance/submit', authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { facultyId } = req.body;

    // Verify faculty is submitting for themselves
    // Check against employee_id or faculty_id from JWT, or allow admins
    const isOwnSubmission = req.user.employee_id === facultyId || req.user.faculty_id === facultyId;
    if (!isOwnSubmission && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only submit clearance for yourself'
      });
    }

    // Call clearance controller
    await clearanceController.submitClearanceRequest(req, res);
  } catch (error) {
    console.error('Error in clearance submit route:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing clearance request',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance/:facultyId
 * Get clearance status for a faculty
 */
router.get('/clearance/:facultyId', authenticateToken, async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Verify faculty can view their own clearance
    if (req.user.employeeId !== facultyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own clearance'
      });
    }

    await clearanceController.getClearanceStatus(req, res);
  } catch (error) {
    console.error('Error fetching clearance status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearance status',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance
 * Get all clearance records (Admin Only)
 */
router.get('/clearance', authenticateToken, async (req, res) => {
  try {
    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view all clearances'
      });
    }

    await clearanceController.getAllClearances(req, res);
  } catch (error) {
    console.error('Error fetching all clearances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearances',
      error: error.message
    });
  }
});

/**
 * POST /api/clearance/:facultyId/re-evaluate
 * Re-evaluate clearance (useful if issues are resolved)
 */
router.post('/clearance/:facultyId/re-evaluate', authenticateToken, async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Verify faculty is re-evaluating for themselves or is admin
    if (req.user.employeeId !== facultyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only re-evaluate your own clearance'
      });
    }

    req.body.facultyId = facultyId;
    await clearanceController.reEvaluateClearance(req, res);
  } catch (error) {
    console.error('Error re-evaluating clearance:', error);
    res.status(500).json({
      success: false,
      message: 'Error re-evaluating clearance',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance/verify/:token
 * Verify clearance using token (Public endpoint)
 */
router.get('/clearance/verify/:token', async (req, res) => {
  try {
    await clearanceController.verifyClearance(req, res);
  } catch (error) {
    console.error('Error verifying clearance:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying clearance',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance/:facultyId/certificate
 * Download certificate PDF
 */
router.get('/clearance/:facultyId/certificate', authenticateToken, async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Verify faculty can download their own certificate
    if (req.user.employeeId !== facultyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only download your own certificate'
      });
    }

    await clearanceController.downloadCertificate(req, res);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance/stats/dashboard
 * Get clearance statistics (Admin Only)
 */
router.get('/clearance/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view clearance statistics'
      });
    }

    await clearanceController.getClearanceStats(req, res);
  } catch (error) {
    console.error('Error fetching clearance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance/faculty/:facultyId/all-phases
 * Get all clearance phases for a faculty
 */
router.get('/clearance/faculty/:facultyId/all-phases', authenticateToken, async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Verify faculty can view their own clearance
    if (req.user.employeeId !== facultyId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own clearance'
      });
    }

    const clearance = await Clearance.findOne({ facultyId }).sort({ createdAt: -1 });

    if (!clearance) {
      return res.status(404).json({
        success: false,
        message: 'No clearance record found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        facultyId: clearance.facultyId,
        facultyName: clearance.facultyName,
        overallStatus: clearance.overallStatus,
        phases: clearance.phases,
        completionDate: clearance.completionDate,
        submissionDate: clearance.submissionDate
      }
    });
  } catch (error) {
    console.error('Error fetching phases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearance phases',
      error: error.message
    });
  }
});

module.exports = router;
