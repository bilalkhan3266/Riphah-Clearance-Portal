const Return = require('../models/Return');
const Issue = require('../models/Issue');
const { validationResult } = require('express-validator');
const { processClearance, DEPARTMENT_ORDER } = require('../services/sequentialClearanceService');
const { generateAndSendCertificate } = require('../services/certificateService');
const ClearanceRequest = require('../models/ClearanceRequest');

/**
 * Create a Return record (Clear an issue)
 * POST /api/departments/:departmentName/return
 */
exports.createReturn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { departmentName } = req.params;
    const { facultyId, facultyName, facultyEmail, referenceIssueId, quantityReturned, condition, notes } = req.body;

    // Validate required fields
    if (!facultyId || !referenceIssueId || !quantityReturned) {
      return res.status(400).json({
        success: false,
        message: 'facultyId, referenceIssueId, and quantityReturned are required'
      });
    }

    // Check if issue exists and belongs to this department
    const issue = await Issue.findById(referenceIssueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Referenced issue not found'
      });
    }

    if (issue.departmentName !== departmentName || issue.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Issue does not match department or faculty'
      });
    }

    // Create return record
    const newReturn = new Return({
      facultyId,
      facultyName: facultyName || issue.facultyName,
      facultyEmail: facultyEmail || issue.facultyEmail,
      departmentName,
      referenceIssueId,
      issueReferenceNumber: issue.issueReferenceNumber,
      itemType: issue.itemType,
      quantityReturned,
      returnDate: Date.now(),
      status: quantityReturned === issue.quantity ? 'Cleared' : 'Partial Return',
      receivedBy: req.user.id,
      condition: condition || 'Good',
      notes
    });

    const savedReturn = await newReturn.save();

    // Update issue status
    if (quantityReturned === issue.quantity) {
      issue.status = 'Cleared';
    } else {
      issue.status = 'Partially Returned';
    }
    await issue.save();

    console.log(`📦 Return recorded for ${facultyId} in ${departmentName}`);

    // ===============================================
    // 🔄 SEQUENTIAL AUTO-RECHECK AFTER RETURN
    // ===============================================
    console.log(`🤖 Re-checking clearance for ${facultyId} after return...`);
    
    try {
      const result = await processClearance(facultyId);
      console.log('✅ Auto re-check result:', result.overallStatus);

      // Update clearance request with new sequential results
      const clearanceRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
        .sort({ created_at: -1 });
      if (clearanceRequest) {
        // Reset all then update from result
        for (const dept of DEPARTMENT_ORDER) {
          clearanceRequest.departments[dept].status = 'Pending';
          clearanceRequest.departments[dept].checked_at = null;
          clearanceRequest.departments[dept].remarks = null;
        }
        for (const phase of result.phases) {
          clearanceRequest.departments[phase.name].status = phase.status;
          clearanceRequest.departments[phase.name].checked_at = new Date();
          clearanceRequest.departments[phase.name].remarks = phase.remarks;
        }

        if (result.overallStatus === 'Completed') {
          clearanceRequest.overall_status = 'Cleared';
          clearanceRequest.status = 'Approved';
          clearanceRequest.cleared_at = new Date();
          console.log('✅ FACULTY FULLY CLEARED by sequential re-verification!');

          try {
            const cert = await generateAndSendCertificate({
              _id: clearanceRequest._id,
              facultyName: result.facultyName,
              facultyEmail: result.facultyEmail,
              queryId: result.queryId,
              phases: result.phases
            });
            clearanceRequest.qr_code = cert.qrDataUrl;
          } catch (certErr) {
            console.error('⚠️ Certificate error:', certErr.message);
          }
        } else {
          clearanceRequest.overall_status = 'In Progress';
          clearanceRequest.status = 'Pending';
        }

        await clearanceRequest.save();
      }
    } catch (autoCheckError) {
      console.error('⚠️ Auto re-check failed:', autoCheckError.message);
    }

    res.status(201).json({
      success: true,
      message: `Return processed successfully in ${departmentName}. Auto-verification running...`,
      data: savedReturn
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing return',
      error: error.message
    });
  }
};

/**
 * Get all returns for a department
 * GET /api/departments/:departmentName/returns
 */
exports.getDepartmentReturns = async (req, res) => {
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

    const returns = await Return.find(query)
      .sort({ returnDate: -1 })
      .populate('referenceIssueId', 'itemType quantity issueDate description');

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error fetching department returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department returns',
      error: error.message
    });
  }
};

/**
 * Get returns for a specific faculty in a department
 * GET /api/departments/:departmentName/faculty/:facultyId/returns
 */
exports.getFacultyReturnsInDepartment = async (req, res) => {
  try {
    const { departmentName, facultyId } = req.params;

    const returns = await Return.find({
      facultyId,
      departmentName
    })
      .sort({ returnDate: -1 })
      .populate('referenceIssueId', 'itemType quantity issueDate description');

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error fetching faculty returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty returns',
      error: error.message
    });
  }
};

/**
 * Verify a return (Department Admin Only)
 * PUT /api/departments/:departmentName/returns/:returnId/verify
 */
exports.verifyReturn = async (req, res) => {
  try {
    const { departmentName, returnId } = req.params;
    const { verificationNotes } = req.body;

    const returnRecord = await Return.findById(returnId);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.departmentName !== departmentName) {
      return res.status(403).json({
        success: false,
        message: 'Return does not belong to this department'
      });
    }

    returnRecord.status = 'Cleared';
    returnRecord.verificationDate = Date.now();
    returnRecord.verifiedBy = req.user.id;
    if (verificationNotes) returnRecord.notes = verificationNotes;

    const updatedReturn = await returnRecord.save();

    // Update issue status to Cleared
    const issue = await Issue.findById(returnRecord.referenceIssueId);
    if (issue) {
      issue.status = 'Cleared';
      await issue.save();
    }

    res.status(200).json({
      success: true,
      message: 'Return verified and cleared',
      data: updatedReturn
    });
  } catch (error) {
    console.error('Error verifying return:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying return',
      error: error.message
    });
  }
};

/**
 * Delete a return record
 * DELETE /api/departments/:departmentName/returns/:returnId
 */
exports.deleteReturn = async (req, res) => {
  try {
    const { departmentName, returnId } = req.params;

    const returnRecord = await Return.findById(returnId);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.departmentName !== departmentName) {
      return res.status(403).json({
        success: false,
        message: 'Return does not belong to this department'
      });
    }

    await Return.findByIdAndDelete(returnId);

    res.status(200).json({
      success: true,
      message: 'Return record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting return:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting return',
      error: error.message
    });
  }
};

/**
 * Get statistics for a department
 * GET /api/departments/:departmentName/return-stats
 */
exports.getReturnStats = async (req, res) => {
  try {
    const { departmentName } = req.params;

    const stats = await Return.aggregate([
      { $match: { departmentName } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReturns = await Return.countDocuments({ departmentName });
    const clearedCount = await Return.countDocuments({
      departmentName,
      status: 'Cleared'
    });

    res.status(200).json({
      success: true,
      data: {
        totalReturns,
        clearedCount,
        pendingCount: totalReturns - clearedCount,
        statsByStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching return stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Check clearance status for a faculty across all issues and returns
 * GET /api/departments/:departmentName/faculty/:facultyId/clearance-status
 */
exports.checkFacultyClearanceStatus = async (req, res) => {
  try {
    const { departmentName, facultyId } = req.params;

    // Get all uncleared issues
    const unclearedIssues = await Issue.find({
      facultyId,
      departmentName,
      status: { $nin: ['Cleared'] }
    });

    // Get all cleared items
    const clearedReturns = await Return.countDocuments({
      facultyId,
      departmentName,
      status: 'Cleared'
    });

    const isCleared = unclearedIssues.length === 0;

    res.status(200).json({
      success: true,
      data: {
        facultyId,
        departmentName,
        isCleared,
        pendingIssuesCount: unclearedIssues.length,
        clearedItemsCount: clearedReturns,
        pendingIssues: unclearedIssues
      }
    });
  } catch (error) {
    console.error('Error checking clearance status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking clearance status',
      error: error.message
    });
  }
};
