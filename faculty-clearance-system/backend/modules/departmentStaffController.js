/**
 * DEPARTMENT STAFF OPERATIONS
 * Handle issue creation and return acceptance by department staff
 * Integrates with automatic clearance system
 */

const Issue = require('../models/Issue');
const Return = require('../models/Return');
const User = require('../models/User');
const { processClearance, DEPARTMENT_ORDER } = require('../services/sequentialClearanceService');
const { generateAndSendCertificate } = require('../services/certificateService');
const ClearanceRequest = require('../models/ClearanceRequest');

/**
 * Issue an item to a faculty member
 * POST /api/departments/:departmentName/issue-item
 * 
 * Body:
 * - facultyId (required): Faculty employee ID
 * - itemType (required): Type of item (Equipment, Documents, etc.)
 * - description (required): What item is being issued
 * - quantity (optional, default 1): Amount being issued
 * - dueDate (optional): When it's due back
 */
exports.issueItem = async (req, res) => {
  try {
    const { departmentName } = req.params;
    const { facultyId, itemType, description, quantity = 1, dueDate } = req.body;

    // Validate required fields
    if (!facultyId || !itemType || !description) {
      return res.status(400).json({
        success: false,
        message: 'facultyId, itemType, and description are required'
      });
    }

    // Check if faculty exists
    const faculty = await User.findOne({ 
      $or: [
        { faculty_id: facultyId },
        { emp_id: facultyId },
        { _id: facultyId }
      ]
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: `Faculty with ID ${facultyId} not found`
      });
    }

    // Generate unique reference number
    const timestamp = Date.now();
    const referenceNumber = `${departmentName}-${timestamp}`;

    // Create the issue record
    const newIssue = new Issue({
      facultyId: facultyId,
      facultyName: faculty.full_name || faculty.name || '',
      facultyEmail: faculty.email || '',
      departmentName: departmentName,
      itemType: itemType,
      description: description,
      quantity: parseInt(quantity) || 1,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'Issued',
      issueReferenceNumber: referenceNumber,
      issuedBy: req.user._id || 'system',
      notes: ''
    });

    const savedIssue = await newIssue.save();

    console.log(`✅ [${departmentName}] Item issued to ${facultyId}: "${description}"`);

    res.status(201).json({
      success: true,
      message: `Item issued successfully to ${faculty.full_name || facultyId}`,
      data: {
        issueId: savedIssue._id,
        facultyId: facultyId,
        itemType: itemType,
        description: description,
        quantity: quantity,
        issueDate: savedIssue.issueDate,
        dueDate: dueDate,
        referenceNumber: referenceNumber
      }
    });

  } catch (error) {
    console.error(`❌ Error issuing item in ${req.params.departmentName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error issuing item',
      error: error.message
    });
  }
};

/**
 * Accept a return from faculty member
 * POST /api/departments/:departmentName/accept-return
 * 
 * Body:
 * - facultyId (required): Faculty employee ID
 * - referenceIssueId (required): The Issue ID being returned
 * - quantityReturned (required): How much is being returned
 * - condition (optional): Condition of returned item (Good/Fair/Damaged/Lost)
 */
exports.acceptReturn = async (req, res) => {
  try {
    const { departmentName } = req.params;
    const { facultyId, referenceIssueId, quantityReturned, condition = 'Good' } = req.body;

    // Validate required fields
    if (!facultyId || !referenceIssueId || quantityReturned === undefined) {
      return res.status(400).json({
        success: false,
        message: 'facultyId, referenceIssueId, and quantityReturned are required'
      });
    }

    // Find the issue
    const issue = await Issue.findById(referenceIssueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Referenced issue not found'
      });
    }

    // Verify the issue matches faculty and department
    if (issue.facultyId !== facultyId || issue.departmentName !== departmentName) {
      return res.status(403).json({
        success: false,
        message: 'Issue does not match faculty or department'
      });
    }

    // Verify the issue hasn't already been fully returned
    if (issue.status === 'Cleared') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been fully returned'
      });
    }

    // Get faculty info
    const faculty = await User.findOne({
      $or: [
        { faculty_id: facultyId },
        { emp_id: facultyId },
        { _id: facultyId }
      ]
    });

    // Create the return record
    const newReturn = new Return({
      facultyId: facultyId,
      facultyName: faculty?.full_name || issue.facultyName || '',
      facultyEmail: faculty?.email || issue.facultyEmail || '',
      departmentName: departmentName,
      referenceIssueId: referenceIssueId,
      issueReferenceNumber: issue.issueReferenceNumber,
      itemType: issue.itemType,
      quantityReturned: parseInt(quantityReturned),
      returnDate: new Date(),
      status: parseInt(quantityReturned) === issue.quantity ? 'Cleared' : 'Partial Return',
      receivedBy: req.user._id || 'system',
      condition: condition,
      notes: ''
    });

    const savedReturn = await newReturn.save();

    // Update the issue status
    if (parseInt(quantityReturned) === issue.quantity) {
      issue.status = 'Cleared';
    } else {
      issue.status = 'Partially Returned';
    }
    await issue.save();

    console.log(`📦 [${departmentName}] Return accepted from ${facultyId}: "${issue.description}"`);

    // ===============================================
    // 🔄 SEQUENTIAL AUTO-RECHECK AFTER RETURN
    // ===============================================
    console.log(`🤖 Re-checking clearance for ${facultyId} after return...`);
    
    let clearanceResult = null;
    try {
      const result = await processClearance(facultyId);
      clearanceResult = result;

      console.log('✅ Sequential auto-check result:', result.overallStatus);

      // Update clearance request if it exists
      const clearanceRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
        .sort({ created_at: -1 });
      if (clearanceRequest) {
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
          console.log('🎉 FACULTY FULLY CLEARED by sequential auto-verification!');

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
      console.error('⚠️ Auto-clearance check failed:', autoCheckError.message);
    }

    res.status(201).json({
      success: true,
      message: `Return processed successfully. ${parseInt(quantityReturned) === issue.quantity ? 'Item fully returned.' : 'Partial return recorded.'}`,
      data: {
        returnId: savedReturn._id,
        facultyId: facultyId,
        itemType: issue.itemType,
        quantityReturned: quantityReturned,
        condition: condition,
        returnDate: savedReturn.returnDate,
        issueFullyReturned: parseInt(quantityReturned) === issue.quantity
      },
      clearanceStatus: clearanceResult ? {
        overallStatus: clearanceResult.overallStatus,
        stoppedAt: clearanceResult.stoppedAt
      } : null
    });

  } catch (error) {
    console.error(`❌ Error accepting return in ${req.params.departmentName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error accepting return',
      error: error.message
    });
  }
};

/**
 * Get all issues for a department (with optional faculty filter)
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
      .sort({ issueDate: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues.map(issue => ({
        _id: issue._id,
        facultyId: issue.facultyId,
        facultyName: issue.facultyName,
        itemType: issue.itemType,
        description: issue.description,
        quantity: issue.quantity,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        status: issue.status,
        issueReferenceNumber: issue.issueReferenceNumber
      }))
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

/**
 * Get all returns for a department (with optional faculty filter)
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
      .limit(100);

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns.map(ret => ({
        _id: ret._id,
        facultyId: ret.facultyId,
        facultyName: ret.facultyName,
        itemType: ret.itemType,
        quantityReturned: ret.quantityReturned,
        returnDate: ret.returnDate,
        status: ret.status,
        condition: ret.condition,
        issueReferenceNumber: ret.issueReferenceNumber
      }))
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching returns',
      error: error.message
    });
  }
};

/**
 * Get pending issues for a specific faculty
 * GET /api/departments/:departmentName/faculty/:facultyId/pending-issues
 */
exports.getFacultyPendingIssues = async (req, res) => {
  try {
    const { departmentName, facultyId } = req.params;

    const pendingIssues = await Issue.find({
      facultyId: facultyId,
      departmentName: departmentName,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    }).sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      count: pendingIssues.length,
      data: pendingIssues
    });
  } catch (error) {
    console.error('Error fetching pending issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending issues',
      error: error.message
    });
  }
};
