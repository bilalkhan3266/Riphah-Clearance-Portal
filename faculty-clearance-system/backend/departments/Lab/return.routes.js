/**
 * Lab Department - Return Routes
 * NO manual approval endpoints
 */

const express = require('express');
const router = express.Router();
const returnController = require('./return.controller');

/**
 * POST /departments/lab/returns
 * Create a new return record for faculty
 */
router.post('/', returnController.createReturn);

/**
 * GET /departments/lab/returns/faculty/:facultyId
 * Get all returns for a specific faculty
 */
router.get('/faculty/:facultyId', returnController.getFacultyReturns);

/**
 * GET /departments/lab/returns/all
 * Get all returns in Lab (with optional status filter)
 * Query params: ?status=Returned | Cleared | Partial Return
 */
router.get('/all', returnController.getAllLabReturns);

/**
 * PUT /departments/lab/returns/:returnId/verify
 * Verify return record (NOT manual approval, just data verification)
 * Body: { verificationNotes: "optional" }
 */
router.put('/:returnId/verify', returnController.verifyReturn);

/**
 * GET /departments/lab/returns/clearance/:facultyId
 * Check clearance status for Lab - AUTOMATIC
 * NO manual approval, system decides based on Return/Issue data
 */
router.get('/clearance/:facultyId', returnController.checkDepartmentClearance);

/**
 * GET /departments/lab/returns/stats
 * Get Lab department return statistics
 */
router.get('/stats', returnController.getLabStatistics);

module.exports = router;
