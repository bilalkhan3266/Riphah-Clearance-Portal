const Return = require('../../models/Return');
const Issue = require('../../models/Issue');
const { validationResult } = require('express-validator');

/**
 * Library Department - Return Management
 */

exports.createReturn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { facultyId, referenceIssueId, quantityReturned, condition } = req.body;
    const issue = await Issue.findById(referenceIssueId);
    if (!issue) return res.status(404).json({ success: false, message: 'Referenced issue not found' });

    const newReturn = new Return({
      facultyId,
      departmentName: 'Library',
      referenceIssueId,
      quantityReturned: quantityReturned || issue.quantity,
      returnDate: Date.now(),
      condition: condition || 'Good',
      status: 'Returned',
      receivedBy: req.user?.employeeId || 'system'
    });

    await newReturn.save();

    if (quantityReturned >= issue.quantity) {
      issue.status = 'Cleared';
    } else {
      issue.status = 'Partially Returned';
    }
    await issue.save();

    res.status(201).json({ success: true, message: 'Return processed in Library', data: newReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing return', error: error.message });
  }
};

exports.getReturns = async (req, res) => {
  try {
    const { facultyId, status } = req.query;
    let query = { departmentName: 'Library' };
    if (facultyId) query.facultyId = facultyId;
    if (status) query.status = status;
    const returns = await Return.find(query).populate('referenceIssueId').sort({ returnDate: -1 });
    res.status(200).json({ success: true, count: returns.length, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving returns', error: error.message });
  }
};

exports.verifyReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { verificationNotes } = req.body;
    const returnRecord = await Return.findByIdAndUpdate(
      returnId,
      { status: 'Cleared', verifiedBy: req.user?.employeeId || 'system', verificationDate: Date.now(), verificationNotes },
      { new: true }
    );
    if (!returnRecord) return res.status(404).json({ success: false, message: 'Return record not found' });
    res.status(200).json({ success: true, message: 'Return verified in Library', data: returnRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying return', error: error.message });
  }
};

exports.checkClearanceStatus = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const unclearedIssues = await Issue.find({
      facultyId,
      departmentName: 'Library',
      status: { $nin: ['Cleared'] }
    });
    const isCleared = unclearedIssues.length === 0;
    res.status(200).json({ success: true, departmentName: 'Library', facultyId, isCleared, pendingItems: unclearedIssues.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking clearance status', error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await Return.aggregate([
      { $match: { departmentName: 'Library' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    res.status(200).json({ success: true, departmentName: 'Library', total, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving statistics', error: error.message });
  }
};
