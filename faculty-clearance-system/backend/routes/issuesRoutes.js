/**
 * ISSUES API ROUTES
 * Simple endpoints for issue/return operations
 */

const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const verifyToken = require('../middleware/verifyToken');

/**
 * POST /api/issues/issue-item
 * Create a new issue record
 */
router.post('/issue-item', verifyToken, async (req, res) => {
  try {
    const { employeeId, itemName, department } = req.body;

    // Validate required fields
    if (!employeeId || !itemName || !department) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, itemName, and department are required'
      });
    }

    // Create new issue
    const newIssue = new Issue({
      employeeId,
      itemName,
      department,
      status: 'ISSUED',
      issueDate: new Date(),
      returnDate: null
    });

    const savedIssue = await newIssue.save();

    console.log(`✅ Issue created: ${employeeId} - ${itemName} (${department})`);

    res.status(201).json({
      success: true,
      message: `Item issued successfully to ${employeeId}`,
      data: savedIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
});

/**
 * POST /api/issues/return-item/:issueId
 * Mark an issue as returned
 */
router.post('/return-item/:issueId', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.params;

    // Find and update the issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update status
    issue.status = 'RETURNED';
    issue.returnDate = new Date();
    const updated = await issue.save();

    console.log(`✅ Item returned: ${issue.employeeId} - ${issue.itemName} (${issue.department})`);

    res.status(200).json({
      success: true,
      message: 'Item marked as returned',
      data: updated
    });
  } catch (error) {
    console.error('Error returning item:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning item',
      error: error.message
    });
  }
});

/**
 * GET /api/issues/pending/:department
 * Get all ISSUED (not yet returned) items for a department
 */
router.get('/pending/:department', async (req, res) => {
  try {
    const { department } = req.params;

    const issues = await Issue.find({
      department,
      status: 'ISSUED'
    }).sort({ issueDate: -1 });

    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching pending issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending issues',
      error: error.message
    });
  }
});

/**
 * GET /api/issues/returned/:department
 * Get all RETURNED items for a department
 */
router.get('/returned/:department', async (req, res) => {
  try {
    const { department } = req.params;

    const issues = await Issue.find({
      department,
      status: 'RETURNED'
    }).sort({ returnDate: -1 });

    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching returned issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching returned issues',
      error: error.message
    });
  }
});

/**
 * GET /api/issues/employee/:employeeId
 * Get all issues (pending + returned) for an employee
 */
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const issues = await Issue.find({ employeeId }).sort({ issueDate: -1 });

    // Separate pending and returned
    const pending = issues.filter(i => i.status === 'ISSUED');
    const returned = issues.filter(i => i.status === 'RETURNED');

    res.json({
      success: true,
      employeeId,
      pending,
      returned,
      hasPendingIssues: pending.length > 0
    });
  } catch (error) {
    console.error('Error fetching employee issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
});

/**
 * GET /api/issues/pending-by-employee/:employeeId
 * Get ONLY pending (ISSUED) items for an employee - used for clearance check
 */
router.get('/pending-by-employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // CRITICAL: Get all ISSUED items (not yet returned)
    const pendingIssues = await Issue.find({
      employeeId,
      status: 'ISSUED'
    }).sort({ issueDate: -1 });

    res.json({
      success: true,
      employeeId,
      pendingCount: pendingIssues.length,
      hasPendingIssues: pendingIssues.length > 0,
      pending: pendingIssues,
      message: pendingIssues.length === 0 
        ? 'No pending issues - ready for clearance'
        : `${pendingIssues.length} item(s) need to be returned`
    });
  } catch (error) {
    console.error('Error fetching pending issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending issues',
      error: error.message
    });
  }
});

/**
 * DELETE /api/issues/:issueId
 * Delete an issue (admin only)
 */
router.delete('/:issueId', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.params;

    const deleted = await Issue.findByIdAndDelete(issueId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      message: 'Issue deleted',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue',
      error: error.message
    });
  }
});

module.exports = router;
