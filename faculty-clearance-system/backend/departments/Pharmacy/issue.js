const Issue = require('../../models/Issue');
const { validationResult } = require('express-validator');

/**
 * Pharmacy Department - Issue Management
 */

exports.createIssue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { facultyId, itemType, description, quantity, dueDate } = req.body;
    const newIssue = new Issue({
      facultyId, departmentName: 'Pharmacy', itemType: itemType || 'medication', description, quantity: quantity || 1,
      dueDate, issueDate: Date.now(), status: 'Issued', issuedBy: req.user?.employeeId || 'system'
    });
    await newIssue.save();
    res.status(201).json({ success: true, message: 'Issue created in Pharmacy', data: newIssue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating issue', error: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { facultyId, status } = req.query;
    let query = { departmentName: 'Pharmacy' };
    if (facultyId) query.facultyId = facultyId;
    if (status) query.status = status;
    const issues = await Issue.find(query).sort({ issueDate: -1 });
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving issues', error: error.message });
  }
};

exports.getFacultyIssues = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const issues = await Issue.find({ departmentName: 'Pharmacy', facultyId, status: { $nin: ['Cleared'] } });
    res.status(200).json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving faculty issues', error: error.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, remarks } = req.body;
    const issue = await Issue.findByIdAndUpdate(issueId, { status, remarks, updatedAt: Date.now() }, { new: true });
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.status(200).json({ success: true, message: 'Issue status updated', data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating issue', error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await Issue.aggregate([{ $match: { departmentName: 'Pharmacy' } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    res.status(200).json({ success: true, departmentName: 'Pharmacy', total, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving statistics', error: error.message });
  }
};
