const Return = require('../../models/Return');
const Issue = require('../../models/Issue');
const { validationResult } = require('express-validator');

/**
 * Lab Department - Return Management
 * Handles tracking of returned items and clearance
 */

// Process a return in Lab
exports.createReturn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { facultyId, referenceIssueId, quantityReturned, condition } = req.body;

    // Find the referenced issue
    const issue = await Issue.findById(referenceIssueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Referenced issue not found'
      });
    }

    // Create return record
    const newReturn = new Return({
      facultyId,
      departmentName: 'Lab',
      referenceIssueId,
      quantityReturned: quantityReturned || issue.quantity,
      returnDate: Date.now(),
      condition: condition || 'Good',
      status: 'Returned',
      receivedBy: req.user?.employeeId || 'system'
    });

    // Save return
    await newReturn.save();

    // Update issue status
    if (quantityReturned >= issue.quantity) {
      issue.status = 'Cleared';
    } else {
      issue.status = 'Partially Returned';
    }
    await issue.save();

    res.status(201).json({
      success: true,
      message: 'Return processed in Lab department',
      data: newReturn
    });
  } catch (error) {
    console.error('Lab Return Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing return',
      error: error.message
    });
  }
};

// Get all returns in Lab department
exports.getReturns = async (req, res) => {
  try {
    const { facultyId, status } = req.query;
    let query = { departmentName: 'Lab' };

    if (facultyId) query.facultyId = facultyId;
    if (status) query.status = status;

    const returns = await Return.find(query)
      .populate('referenceIssueId')
      .sort({ returnDate: -1 });

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Lab Returns Retrieval Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving returns',
      error: error.message
    });
  }
};

// Verify a return
exports.verifyReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { verificationNotes } = req.body;

    const returnRecord = await Return.findByIdAndUpdate(
      returnId,
      {
        status: 'Cleared',
        verifiedBy: req.user?.employeeId || 'system',
        verificationDate: Date.now(),
        verificationNotes
      },
      { new: true }
    );

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Return verified in Lab',
      data: returnRecord
    });
  } catch (error) {
    console.error('Lab Return Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying return',
      error: error.message
    });
  }
};

// Check faculty clearance status in Lab
exports.checkClearanceStatus = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const unclearedIssues = await Issue.find({
      facultyId,
      departmentName: 'Lab',
      status: { $nin: ['Cleared'] }
    });

    const isCleared = unclearedIssues.length === 0;

    res.status(200).json({
      success: true,
      departmentName: 'Lab',
      facultyId,
      isCleared,
      pendingItems: unclearedIssues.length,
      details: isCleared ? 'All items cleared' : `${unclearedIssues.length} uncleared items`
    });
  } catch (error) {
    console.error('Lab Clearance Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking clearance status',
      error: error.message
    });
  }
};

// Get Lab department return statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Return.aggregate([
      { $match: { departmentName: 'Lab' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);

    res.status(200).json({
      success: true,
      departmentName: 'Lab',
      total,
      stats
    });
  } catch (error) {
    console.error('Lab Return Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
};
