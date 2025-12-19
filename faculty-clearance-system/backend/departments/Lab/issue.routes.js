/**
 * Lab Department - Issue Routes
 * NO manual approval endpoints
 */

const express = require('express');
const router = express.Router();
const issueController = require('./issue.controller');

/**
 * POST /departments/lab/issues
 * Create a new issue for faculty
 */
router.post('/', issueController.createIssue);

/**
 * GET /departments/lab/issues/faculty/:facultyId
 * Get all issues for a specific faculty
 */
router.get('/faculty/:facultyId', issueController.getFacultyIssues);

/**
 * GET /departments/lab/issues/all
 * Get all issues in Lab (with optional status filter)
 * Query params: ?status=Issued | Pending | Cleared | etc.
 */
router.get('/all', issueController.getAllLabIssues);

/**
 * PUT /departments/lab/issues/:issueId/status
 * Update issue status (NOT manual approval, only status tracking)
 * Body: { status: "Issued" | "Pending" | "Uncleared" | "Partially Returned" | "Cleared" }
 */
router.put('/:issueId/status', issueController.updateIssueStatus);

/**
 * GET /departments/lab/issues/clearance/:facultyId
 * Check clearance status for Lab - AUTOMATIC
 * NO manual approval, system decides based on Issue data
 */
router.get('/clearance/:facultyId', issueController.checkDepartmentClearance);

/**
 * GET /departments/lab/issues/stats
 * Get Lab department statistics
 */
router.get('/stats', issueController.getLabStatistics);

module.exports = router;
