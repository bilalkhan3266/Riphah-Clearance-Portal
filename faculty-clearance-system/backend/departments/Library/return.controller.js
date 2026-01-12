const Return = require('../../models/Return');
const Issue = require('../../models/Issue');
const autoClearanceService = require('../../services/autoClearanceService');

const DEPT_NAME = 'Library';

exports.createReturn = async (req, res) => {
  try {
    const { facultyId, facultyName, facultyEmail, referenceIssueId, itemType, quantityReturned, receivedBy, condition, notes } = req.body;
    if (!facultyId || !referenceIssueId || !quantityReturned || !receivedBy) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const relatedIssue = await Issue.findById(referenceIssueId);
    if (!relatedIssue) return res.status(404).json({ success: false, message: 'Issue not found' });
    const newReturn = new Return({
      facultyId, facultyName, facultyEmail, departmentName: DEPT_NAME, referenceIssueId, itemType: itemType || relatedIssue.itemType,
      issueReferenceNumber: relatedIssue.issueReferenceNumber, quantityReturned, receivedBy, condition: condition || 'Good', notes, status: 'Returned',
      verificationDate: new Date(), verifiedBy: receivedBy
    });
    const saved = await newReturn.save();
    if (quantityReturned >= relatedIssue.quantity) {
      await Issue.findByIdAndUpdate(referenceIssueId, { status: 'Cleared' });
    } else {
      await Issue.findByIdAndUpdate(referenceIssueId, { status: 'Partially Returned' });
    }
    res.status(201).json({ success: true, message: 'Return recorded', return: { id: saved._id, quantityReturned: saved.quantityReturned, status: saved.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create return', error: error.message });
  }
};

exports.getFacultyReturns = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) return res.status(400).json({ success: false, message: 'Faculty ID required' });
    const returns = await Return.find({ facultyId, departmentName: DEPT_NAME }).populate('referenceIssueId', 'description itemType').sort({ returnDate: -1 });
    res.status(200).json({ success: true, facultyId, department: DEPT_NAME, totalReturns: returns.length, returns: returns.map(r => ({ id: r._id, type: r.itemType, qty: r.quantityReturned, status: r.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve returns', error: error.message });
  }
};

exports.getAllDeptReturns = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { departmentName: DEPT_NAME };
    if (status) query.status = status;
    const returns = await Return.find(query).populate('referenceIssueId').sort({ returnDate: -1 });
    res.status(200).json({ success: true, department: DEPT_NAME, totalReturns: returns.length, returns: returns.map(r => ({ id: r._id, facultyId: r.facultyId, type: r.itemType, status: r.status })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve returns', error: error.message });
  }
};

exports.verifyReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { notes } = req.body;
    if (!returnId) return res.status(400).json({ success: false, message: 'Return ID required' });
    const updated = await Return.findByIdAndUpdate(returnId, { status: 'Cleared', verificationDate: new Date() }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Return not found' });
    res.status(200).json({ success: true, message: 'Return verified', return: { id: updated._id, status: updated.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify', error: error.message });
  }
};

exports.checkDepartmentClearance = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) return res.status(400).json({ success: false, message: 'Faculty ID required' });
    const result = await autoClearanceService.checkDepartmentClearance(facultyId, DEPT_NAME);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalReturns = await Return.countDocuments({ departmentName: DEPT_NAME });
    const cleared = await Return.countDocuments({ departmentName: DEPT_NAME, status: 'Cleared' });
    res.status(200).json({ success: true, department: DEPT_NAME, stats: { totalReturns, cleared, rate: totalReturns > 0 ? ((cleared/totalReturns)*100).toFixed(2) + '%' : '0%' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
};

module.exports = exports;
