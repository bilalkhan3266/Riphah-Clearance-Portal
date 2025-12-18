/**
 * Lab Department - Issue Controller
 * Handles issue operations - NO manual approval (automatic via autoClearanceService)
 */

const Issue = require('../../models/Issue');
const autoClearanceService = require('../../services/autoClearanceService');

/**
 * Create a new issue for faculty
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.createIssue = async (req, res) => {
  try {
    const {
      facultyId,
      facultyName,
      facultyEmail,
      itemType,
      description,
      quantity,
      dueDate,
      issuedBy,
      notes
    } = req.body;

    // Validate required fields
    if (!facultyId || !itemType || !description || !issuedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: facultyId, itemType, description, issuedBy'
      });
    }

    // Generate unique reference number
    const referenceNumber = `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create issue record
    const newIssue = new Issue({
      facultyId,
      facultyName,
      facultyEmail,
      departmentName: 'Lab',
      itemType,
      description,
      quantity: quantity || 1,
      dueDate,
      issuedBy,
      issueReferenceNumber: referenceNumber,
      notes,
      status: 'Issued'
    });

    const savedIssue = await newIssue.save();

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue: {
        id: savedIssue._id,
        referenceNumber: savedIssue.issueReferenceNumber,
        facultyId: savedIssue.facultyId,
        itemType: savedIssue.itemType,
        description: savedIssue.description,
        status: savedIssue.status,
        issueDate: savedIssue.issueDate
      }
    });
  } catch (error) {
    console.error('Create Issue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create issue',
      error: error.message
    });
  }
};

/**
 * Get all issues for a faculty
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getFacultyIssues = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required'
      });
    }

    const issues = await Issue.find({
      facultyId,
      departmentName: 'Lab'
    }).sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      facultyId,
      department: 'Lab',
      totalIssues: issues.length,
      issues: issues.map(issue => ({
        id: issue._id,
        referenceNumber: issue.issueReferenceNumber,
        itemType: issue.itemType,
        description: issue.description,
        quantity: issue.quantity,
        status: issue.status,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate
      }))
    });
  } catch (error) {
    console.error('Get Faculty Issues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve issues',
      error: error.message
    });
  }
};

/**
 * Get all issues in Lab department
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getAllLabIssues = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: Issued, Pending, Cleared, etc.

    let query = { departmentName: 'Lab' };
    if (status) {
      query.status = status;
    }

    const issues = await Issue.find(query).sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      department: 'Lab',
      filter: status ? `status=${status}` : 'all',
      totalIssues: issues.length,
      issues: issues.map(issue => ({
        id: issue._id,
        facultyId: issue.facultyId,
        facultyName: issue.facultyName,
        itemType: issue.itemType,
        description: issue.description,
        status: issue.status,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate
      }))
    });
  } catch (error) {
    console.error('Get All Lab Issues Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lab issues',
      error: error.message
    });
  }
};

/**
 * Update issue status
 * NO manual approval - only update status field when item is returned/cleared
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!issueId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID and status are required'
      });
    }

    // Only allow valid status transitions
    const validStatuses = ['Issued', 'Pending', 'Uncleared', 'Partially Returned', 'Cleared'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`
      });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue status updated',
      issue: {
        id: updatedIssue._id,
        status: updatedIssue.status,
        description: updatedIssue.description,
        facultyId: updatedIssue.facultyId
      }
    });
  } catch (error) {
    console.error('Update Issue Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue status',
      error: error.message
    });
  }
};

/**
 * Check clearance status for this department
 * Automatic - system decides based on Issue data only
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

    // Get Lab clearance status
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
 * Get statistics for Lab department
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getLabStatistics = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments({ departmentName: 'Lab' });
    const clearedCount = await Issue.countDocuments({
      departmentName: 'Lab',
      status: 'Cleared'
    });
    const pendingCount = await Issue.countDocuments({
      departmentName: 'Lab',
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    });

    const avgTimeToCleared = await Issue.aggregate([
      { $match: { departmentName: 'Lab', status: 'Cleared' } },
      {
        $group: {
          _id: null,
          avgDays: {
            $avg: {
              $divide: [
                { $subtract: [{ $toDate: '$updatedAt' }, '$issueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      department: 'Lab',
      statistics: {
        totalIssuesRecorded: totalIssues,
        clearedCount,
        pendingCount,
        clearanceRate: totalIssues > 0 ? ((clearedCount / totalIssues) * 100).toFixed(2) + '%' : '0%',
        averageDaysToClear: avgTimeToCleared.length > 0 ? avgTimeToCleared[0].avgDays.toFixed(2) : 'N/A'
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
