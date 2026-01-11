const Issue = require('../../models/Issue');
const Return = require('../../models/Return');
const autoClearanceService = require('../../services/autoClearanceService');

// Generic issue controller for all departments
// Just change DEPT_NAME in each file
const DEPT_NAME = 'Library';

exports.createIssue = async (req, res) => {
  try {
    const { facultyId, facultyName, facultyEmail, itemType, description, quantity, dueDate, issuedBy, notes } = req.body;
    if (!facultyId || !itemType || !description || !issuedBy) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const refNum = `${DEPT_NAME.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newIssue = new Issue({
      facultyId, facultyName, facultyEmail, departmentName: DEPT_NAME, itemType, description,
      quantity: quantity || 1, dueDate, issuedBy, issueReferenceNumber: refNum, notes, status: 'Issued'
    });
    const saved = await newIssue.save();
    res.status(201).json({ success: true, issue: { id: saved._id, referenceNumber: saved.issueReferenceNumber, facultyId, status: saved.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create issue', error: error.message });
  }
};

exports.getFacultyIssues = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) return res.status(400).json({ success: false, message: 'Faculty ID required' });
    const issues = await Issue.find({ facultyId, departmentName: DEPT_NAME }).sort({ issueDate: -1 });
    res.status(200).json({ success: true, facultyId, department: DEPT_NAME, totalIssues: issues.length, issues: issues.map(i => ({ id: i._id, refNum: i.issueReferenceNumber, type: i.itemType, status: i.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve issues', error: error.message });
  }
};

exports.getAllDeptIssues = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { departmentName: DEPT_NAME };
    if (status) query.status = status;
    const issues = await Issue.find(query).sort({ issueDate: -1 });
    res.status(200).json({ success: true, department: DEPT_NAME, totalIssues: issues.length, issues: issues.map(i => ({ id: i._id, facultyId: i.facultyId, type: i.itemType, status: i.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve issues', error: error.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    if (!issueId || !status) return res.status(400).json({ success: false, message: 'Issue ID and status required' });
    const validStatuses = ['Issued', 'Pending', 'Uncleared', 'Partially Returned', 'Cleared'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: `Invalid status` });
    const updated = await Issue.findByIdAndUpdate(issueId, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.status(200).json({ success: true, message: 'Status updated', issue: { id: updated._id, status: updated.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update', error: error.message });
  }
};

exports.checkDepartmentClearance = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) return res.status(400).json({ success: false, message: 'Faculty ID required' });
    const result = await autoClearanceService.checkDepartmentClearance(facultyId, DEPT_NAME);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check clearance', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Issue.countDocuments({ departmentName: DEPT_NAME });
    const cleared = await Issue.countDocuments({ departmentName: DEPT_NAME, status: 'Cleared' });
    const pending = total - cleared;
    res.status(200).json({ success: true, department: DEPT_NAME, stats: { totalIssues: total, cleared, pending, rate: total > 0 ? ((cleared/total)*100).toFixed(2) + '%' : '0%' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
};

module.exports = exports;
