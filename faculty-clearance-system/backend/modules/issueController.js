const Issue = require('../models/Issue');
const { validationResult } = require('express-validator');

/**
 * Create an Issue record (Department Admin Only)
 * POST /api/departments/:departmentName/issue
 */
exports.createIssue = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { departmentName } = req.params;
    const { facultyId, facultyName, facultyEmail, itemType, description, quantity, dueDate, notes, issueReferenceNumber } = req.body;

    // Validate required fields
    if (!facultyId || !itemType || !description) {
      return res.status(400).json({
        success: false,
        message: 'facultyId, itemType, and description are required'
      });
    }

    // Generate reference number if not provided
    const referenceNumber = issueReferenceNumber || `${departmentName}-${Date.now()}`;

    const newIssue = new Issue({
      facultyId,
      facultyName,
      facultyEmail,
      departmentName,
      itemType,
      description,
      quantity: quantity || 1,
      dueDate,
      status: 'Issued',
      issueReferenceNumber: referenceNumber,
      issuedBy: req.user._id, // Assuming JWT middleware gives us user info
      notes
    });

    const savedIssue = await newIssue.save();

    res.status(201).json({
      success: true,
      message: `Issue created successfully in ${departmentName}`,
      data: savedIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
};

/**
 * Get all issues for a department
 * GET /api/departments/:departmentName/issues
 */
exports.getDepartmentIssues = async (req, res) => {
  try {
    const { departmentName } = req.params;
    const { facultyId, status } = req.query;

    let query = { departmentName };

    if (facultyId) {
      query.facultyId = facultyId;
    }
    if (status) {
      query.status = status;
    }

    const issues = await Issue.find(query)
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching department issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department issues',
      error: error.message
    });
  }
};

/**
 * Get issues for a specific faculty in a department
 * GET /api/departments/:departmentName/faculty/:facultyId/issues
 */
exports.getFacultyIssuesInDepartment = async (req, res) => {
  try {
    const { departmentName, facultyId } = req.params;

    const issues = await Issue.find({
      facultyId,
      departmentName,
      status: { $nin: ['Cleared'] }
    }).sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching faculty issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty issues',
      error: error.message
    });
  }
};

/**
 * Update issue status
 * PUT /api/departments/:departmentName/issues/:issueId
 */
exports.updateIssueStatus = async (req, res) => {
  try {
    const { departmentName, issueId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (issue.departmentName !== departmentName) {
      return res.status(403).json({
        success: false,
        message: 'Issue does not belong to this department'
      });
    }

    issue.status = status;
    if (notes) issue.notes = notes;

    const updatedIssue = await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue status updated',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue',
      error: error.message
    });
  }
};

/**
 * Delete an issue (Department Admin Only)
 * DELETE /api/departments/:departmentName/issues/:issueId
 */
exports.deleteIssue = async (req, res) => {
  try {
    const { departmentName, issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (issue.departmentName !== departmentName) {
      return res.status(403).json({
        success: false,
        message: 'Issue does not belong to this department'
      });
    }

    await Issue.findByIdAndDelete(issueId);

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue',
      error: error.message
    });
  }
};

/**
 * Get statistics for a department
 * GET /api/departments/:departmentName/issue-stats
 */
exports.getIssueStats = async (req, res) => {
  try {
    const { departmentName } = req.params;

    const stats = await Issue.aggregate([
      { $match: { departmentName } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIssues = await Issue.countDocuments({ departmentName });
    const pendingCount = await Issue.countDocuments({
      departmentName,
      status: { $in: ['Issued', 'Pending', 'Uncleared'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalIssues,
        pendingCount,
        clearedCount: totalIssues - pendingCount,
        statsByStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching issue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
