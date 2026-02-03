/**
 * CLEARANCE-ISSUES INTEGRATION
 * Check pending issues before clearance submission
 */

const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const verifyToken = require('../middleware/verifyToken');
const autoClearanceService = require('../services/autoClearanceService');

/**
 * GET /api/clearance-issues/check-pending
 * CRITICAL: Check if faculty has any pending issues
 * Used before clearance submission to block submission if items not returned
 */
router.get('/check-pending', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.id || req.user.faculty_id;

    console.log(`\n🔍 Checking pending issues for ${employeeId}`);

    // Get all ISSUED items (not yet returned)
    const pendingIssues = await Issue.find({
      employeeId,
      status: 'ISSUED'
    }).sort({ issueDate: -1 });

    console.log(`   Found ${pendingIssues.length} pending issue(s)`);

    // Group by department
    const byDepartment = {};
    pendingIssues.forEach(issue => {
      if (!byDepartment[issue.department]) {
        byDepartment[issue.department] = [];
      }
      byDepartment[issue.department].push({
        id: issue._id,
        itemName: issue.itemName,
        issueDate: issue.issueDate
      });
    });

    res.json({
      success: true,
      employeeId,
      hasPendingIssues: pendingIssues.length > 0,
      totalPending: pendingIssues.length,
      pendingByDepartment: byDepartment,
      canSubmitClearance: pendingIssues.length === 0,
      message: pendingIssues.length === 0 
        ? '✅ All items returned! Ready to submit clearance.'
        : `❌ ${pendingIssues.length} item(s) not yet returned. Please return before clearance submission.`,
      details: pendingIssues
    });

  } catch (error) {
    console.error('Error checking pending issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking pending issues',
      error: error.message
    });
  }
});

/**
 * GET /api/clearance-issues/department/:department
 * Get pending issues for a faculty in a specific department
 */
router.get('/department/:department', verifyToken, async (req, res) => {
  try {
    const employeeId = req.user.id || req.user.faculty_id;
    const { department } = req.params;

    const pendingIssues = await Issue.find({
      employeeId,
      department,
      status: 'ISSUED'
    }).sort({ issueDate: -1 });

    res.json({
      success: true,
      employeeId,
      department,
      pendingCount: pendingIssues.length,
      hasPending: pendingIssues.length > 0,
      pending: pendingIssues
    });

  } catch (error) {
    console.error('Error checking department issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking issues',
      error: error.message
    });
  }
});

module.exports = router;
