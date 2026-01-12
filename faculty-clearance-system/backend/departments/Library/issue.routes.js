const express = require('express');
const router = express.Router();
const issueController = require('./issue.controller');

router.post('/', issueController.createIssue);
router.get('/faculty/:facultyId', issueController.getFacultyIssues);
router.get('/all', issueController.getAllDeptIssues);
router.put('/:issueId/status', issueController.updateIssueStatus);
router.get('/clearance/:facultyId', issueController.checkDepartmentClearance);
router.get('/stats', issueController.getStats);

module.exports = router;
