const express = require('express');
const router = express.Router();
const issueController = require('../modules/issueController');
const returnController = require('../modules/returnController');
const departmentStaffController = require('../modules/departmentStaffController');
const clearanceController = require('../controllers/clearanceController');
const authenticateToken = require('../middleware/verifyToken');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateIssueCreation = [
  body('facultyId').notEmpty().withMessage('Faculty ID is required'),
  body('itemType').notEmpty().withMessage('Item type is required'),
  body('description').notEmpty().withMessage('Description is required')
];

const validateReturnCreation = [
  body('facultyId').notEmpty().withMessage('Faculty ID is required'),
  body('referenceIssueId').notEmpty().withMessage('Issue ID is required'),
  body('quantityReturned').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
];

// =====================================================
// APPROVED FACULTY RECORDS (SPECIFIC ROUTES FIRST!)
// Get all faculty with complete/approved clearance
// =====================================================

router.get(
  '/departments/approved-records/all',
  authenticateToken,
  clearanceController.getApprovedRecords
);

// =====================
// ISSUE ROUTES
// =====================

// Create issue (Department Admin Only)
router.post(
  '/departments/:departmentName/issue',
  authenticateToken,
  validateIssueCreation,
  issueController.createIssue
);

// Get all issues for a department
router.get(
  '/departments/:departmentName/issues',
  authenticateToken,
  issueController.getDepartmentIssues
);

// Get issues for a specific faculty in a department
router.get(
  '/departments/:departmentName/faculty/:facultyId/issues',
  authenticateToken,
  issueController.getFacultyIssuesInDepartment
);

// Update issue status
router.put(
  '/departments/:departmentName/issues/:issueId',
  authenticateToken,
  issueController.updateIssueStatus
);

// Delete issue
router.delete(
  '/departments/:departmentName/issues/:issueId',
  authenticateToken,
  issueController.deleteIssue
);

// Get issue statistics
router.get(
  '/departments/:departmentName/issue-stats',
  authenticateToken,
  issueController.getIssueStats
);

// =====================
// RETURN ROUTES
// =====================

// Create return record (clear an issue)
router.post(
  '/departments/:departmentName/return',
  authenticateToken,
  validateReturnCreation,
  returnController.createReturn
);

// Get all returns for a department
router.get(
  '/departments/:departmentName/returns',
  authenticateToken,
  returnController.getDepartmentReturns
);

// Get returns for a specific faculty in a department
router.get(
  '/departments/:departmentName/faculty/:facultyId/returns',
  authenticateToken,
  returnController.getFacultyReturnsInDepartment
);

// Verify a return
router.put(
  '/departments/:departmentName/returns/:returnId/verify',
  authenticateToken,
  returnController.verifyReturn
);

// Delete return record
router.delete(
  '/departments/:departmentName/returns/:returnId',
  authenticateToken,
  returnController.deleteReturn
);

// Get return statistics
router.get(
  '/departments/:departmentName/return-stats',
  authenticateToken,
  returnController.getReturnStats
);

// Check faculty clearance status in a department
router.get(
  '/departments/:departmentName/faculty/:facultyId/clearance-status',
  authenticateToken,
  returnController.checkFacultyClearanceStatus
);

// =====================================================
// DEPARTMENT STAFF OPERATIONS
// Simple workflow for issuing and accepting returns
// =====================================================

// Issue an item to faculty (Department Staff)
router.post(
  '/departments/:departmentName/issue-item',
  authenticateToken,
  departmentStaffController.issueItem
);

// Accept a return from faculty (Department Staff)
router.post(
  '/departments/:departmentName/accept-return',
  authenticateToken,
  departmentStaffController.acceptReturn
);

// Get pending issues for a faculty in department
router.get(
  '/departments/:departmentName/faculty/:facultyId/pending-issues',
  authenticateToken,
  departmentStaffController.getFacultyPendingIssues
);

module.exports = router;
