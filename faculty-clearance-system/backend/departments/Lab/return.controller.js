/**
 * Lab Department - Return Controller
 * Handles return operations - NO manual approval (automatic via autoClearanceService)
 */

const Return = require('../../models/Return');
const Issue = require('../../models/Issue');
const autoClearanceService = require('../../services/autoClearanceService');

/**
 * Create a new return record for faculty
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.createReturn = async (req, res) => {
  try {
    const {
      facultyId,
      facultyName,
      facultyEmail,
      referenceIssueId,
      itemType,
      quantityReturned,
      receivedBy,
      condition,
      notes
    } = req.body;

    // Validate required fields
    if (!facultyId || !referenceIssueId || !quantityReturned || !receivedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: facultyId, referenceIssueId, quantityReturned, receivedBy'
      });
    }

    // Verify issue exists
    const relatedIssue = await Issue.findById(referenceIssueId);
    if (!relatedIssue) {
      return res.status(404).json({
        success: false,
        message: 'Referenced issue not found'
      });
    }

    // Create return record
    const newReturn = new Return({
      facultyId,
      facultyName,
      facultyEmail,
      departmentName: 'Lab',
      referenceIssueId,
      itemType: itemType || relatedIssue.itemType,
      issueReferenceNumber: relatedIssue.issueReferenceNumber,
      quantityReturned,
      receivedBy,
      condition: condition || 'Good',
      notes,
      status: 'Returned',
      verificationDate: new Date(),
      verifiedBy: receivedBy
    });

    const savedReturn = await newReturn.save();

    // Update related issue status
    if (quantityReturned >= relatedIssue.quantity) {
      await Issue.findByIdAndUpdate(referenceIssueId, { status: 'Cleared' });
    } else {
      await Issue.findByIdAndUpdate(referenceIssueId, { status: 'Partially Returned' });
    }

    res.status(201).json({
      success: true,
      message: 'Return recorded successfully',
      return: {
        id: savedReturn._id,
        facultyId: savedReturn.facultyId,
        itemType: savedReturn.itemType,
        quantityReturned: savedReturn.quantityReturned,
        status: savedReturn.status,
        returnDate: savedReturn.returnDate
      }
    });
  } catch (error) {
    console.error('Create Return Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create return record',
      error: error.message
    });
  }
};

/**
 * Get all returns for a faculty
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getFacultyReturns = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required'
      });
    }

    const returns = await Return.find({
      facultyId,
      departmentName: 'Lab'
    })
      .populate('referenceIssueId', 'description itemType quantity')
      .sort({ returnDate: -1 });

    res.status(200).json({
      success: true,
      facultyId,
      department: 'Lab',
      totalReturns: returns.length,
      returns: returns.map(ret => ({
        id: ret._id,
        itemType: ret.itemType,
        quantityReturned: ret.quantityReturned,
        status: ret.status,
        condition: ret.condition,
        returnDate: ret.returnDate,
        issueReference: ret.issueReferenceNumber
      }))
    });
  } catch (error) {
    console.error('Get Faculty Returns Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve returns',
      error: error.message
    });
  }
};

/**
 * Get all returns in Lab department
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllLabReturns = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: Returned, Cleared, Partial Return

    let query = { departmentName: 'Lab' };
    if (status) {
      query.status = status;
    }

    const returns = await Return.find(query)
      .populate('referenceIssueId', 'description itemType quantity')
      .sort({ returnDate: -1 });

    res.status(200).json({
      success: true,
      department: 'Lab',
      filter: status ? `status=${status}` : 'all',
      totalReturns: returns.length,
      returns: returns.map(ret => ({
        id: ret._id,
        facultyId: ret.facultyId,
        itemType: ret.itemType,
        quantityReturned: ret.quantityReturned,
        status: ret.status,
        returnDate: ret.returnDate
      }))
    });
  } catch (error) {
    console.error('Get All Lab Returns Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lab returns',
      error: error.message
    });
  }
};

/**
 * Verify return and mark as cleared
 * NO manual approval - automatic detection via status checking
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.verifyReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { verificationNotes } = req.body;

    if (!returnId) {
      return res.status(400).json({
        success: false,
        message: 'Return ID is required'
      });
    }

    const returnRecord = await Return.findByIdAndUpdate(
      returnId,
      {
        status: 'Cleared',
        verificationDate: new Date(),
        notes: verificationNotes || returnRecord.notes
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
      message: 'Return verified and marked as cleared',
      return: {
        id: returnRecord._id,
        status: returnRecord.status,
        verificationDate: returnRecord.verificationDate
      }
    });
  } catch (error) {
    console.error('Verify Return Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify return',
      error: error.message
    });
  }
};

/**
 * Check clearance status for this department
 * Automatic - system decides based on Return/Issue data only
 * NO HUMAN APPROVAL INVOLVED
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.checkDepartmentClearance = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required'
      });
    }

    // Get Lab clearance status (AUTOMATIC - no human approval)
    const clearanceStatus = await autoClearanceService.checkDepartmentClearance(
      facultyId,
      'Lab'
    );

    res.status(200).json(clearanceStatus);
  } catch (error) {
    console.error('Department Clearance Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check clearance status',
      error: error.message
    });
  }
};

/**
 * Get statistics for Lab department returns
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getLabStatistics = async (req, res) => {
  try {
    const totalReturns = await Return.countDocuments({ departmentName: 'Lab' });
    const clearedReturns = await Return.countDocuments({
      departmentName: 'Lab',
      status: 'Cleared'
    });

    const pendingIssues = await Issue.countDocuments({
      departmentName: 'Lab',
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    });

    res.status(200).json({
      success: true,
      department: 'Lab',
      statistics: {
        totalReturnsRecorded: totalReturns,
        clearedReturns,
        pendingIssuesInLab: pendingIssues,
        returnClearanceRate: totalReturns > 0 ? ((clearedReturns / totalReturns) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    console.error('Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
};

module.exports = exports;
