const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Issue = require('../models/Issue');
const Return = require('../models/Return');
const ClearanceRequest = require('../models/ClearanceRequest');
const { processClearance, DEPARTMENT_ORDER } = require('../services/sequentialClearanceService');

// =============================================
// DEPARTMENT EDIT ROUTES
// Edit Issues & Returns (same as admin access)
// =============================================

/**
 * PUT /api/department-edit/:departmentName/issue/:issueId
 * Edit an issue record — updates automatically affect clearance
 */
router.put('/:departmentName/issue/:issueId', verifyToken, async (req, res) => {
  try {
    const { departmentName, issueId } = req.params;
    const userRole = req.user.role;

    // Authorization: only same department or admin
    if (userRole !== departmentName && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only department staff can edit records' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    if (issue.departmentName !== departmentName) {
      return res.status(403).json({ success: false, message: 'Issue does not belong to this department' });
    }

    const { itemType, description, status, quantity, dueDate, notes } = req.body;

    // Update allowed fields
    if (itemType) issue.itemType = itemType;
    if (description) issue.description = description;
    if (status) issue.status = status;
    if (quantity !== undefined) issue.quantity = quantity;
    if (dueDate !== undefined) issue.dueDate = dueDate || null;
    if (notes !== undefined) issue.notes = notes;

    const updatedIssue = await issue.save();

    console.log(`✏️ Issue ${issueId} edited in ${departmentName}: status=${updatedIssue.status}`);

    // ===============================================
    // 🔄 AUTO RE-CHECK CLEARANCE AFTER EDIT
    // If status changed to Cleared → may unlock clearance
    // If status changed to Issued/Pending → may block clearance
    // ===============================================
    let clearanceResult = null;
    try {
      clearanceResult = await processClearance(issue.facultyId);
      console.log(`🤖 Auto re-check after issue edit: ${clearanceResult.overallStatus}`);

      // Update clearance request
      const clearanceRequest = await ClearanceRequest.findOne({ faculty_id: issue.facultyId })
        .sort({ created_at: -1 });

      if (clearanceRequest) {
        for (const dept of DEPARTMENT_ORDER) {
          clearanceRequest.departments[dept].status = 'Pending';
          clearanceRequest.departments[dept].checked_at = null;
          clearanceRequest.departments[dept].remarks = null;
        }
        for (const phase of clearanceResult.phases) {
          clearanceRequest.departments[phase.name].status = phase.status;
          clearanceRequest.departments[phase.name].checked_at = new Date();
          clearanceRequest.departments[phase.name].remarks = phase.remarks;
        }

        if (clearanceResult.overallStatus === 'Completed') {
          clearanceRequest.overall_status = 'Approved';
          clearanceRequest.cleared_at = new Date();
        } else {
          clearanceRequest.overall_status = 'Pending';
          clearanceRequest.cleared_at = null;
        }
        await clearanceRequest.save();
      }
    } catch (reCheckErr) {
      console.error('Auto re-check error:', reCheckErr.message);
    }

    res.json({
      success: true,
      message: 'Issue updated successfully. Clearance re-evaluated.',
      data: updatedIssue,
      clearanceStatus: clearanceResult?.overallStatus || null
    });
  } catch (err) {
    console.error('Error editing issue:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/department-edit/:departmentName/return/:returnId
 * Edit a return record
 */
router.put('/:departmentName/return/:returnId', verifyToken, async (req, res) => {
  try {
    const { departmentName, returnId } = req.params;
    const userRole = req.user.role;

    if (userRole !== departmentName && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only department staff can edit records' });
    }

    const returnRecord = await Return.findById(returnId);
    if (!returnRecord) {
      return res.status(404).json({ success: false, message: 'Return record not found' });
    }

    if (returnRecord.departmentName !== departmentName) {
      return res.status(403).json({ success: false, message: 'Return does not belong to this department' });
    }

    const { status, returnDate, condition, quantityReturned, notes } = req.body;

    if (status) returnRecord.status = status;
    if (returnDate) returnRecord.returnDate = returnDate;
    if (condition) returnRecord.condition = condition;
    if (quantityReturned !== undefined) returnRecord.quantityReturned = quantityReturned;
    if (notes !== undefined) returnRecord.notes = notes;

    const updatedReturn = await returnRecord.save();

    console.log(`✏️ Return ${returnId} edited in ${departmentName}: status=${updatedReturn.status}`);

    // Auto re-check clearance
    let clearanceResult = null;
    try {
      clearanceResult = await processClearance(returnRecord.facultyId);
      console.log(`🤖 Auto re-check after return edit: ${clearanceResult.overallStatus}`);

      const clearanceRequest = await ClearanceRequest.findOne({ faculty_id: returnRecord.facultyId })
        .sort({ created_at: -1 });

      if (clearanceRequest) {
        for (const dept of DEPARTMENT_ORDER) {
          clearanceRequest.departments[dept].status = 'Pending';
          clearanceRequest.departments[dept].checked_at = null;
          clearanceRequest.departments[dept].remarks = null;
        }
        for (const phase of clearanceResult.phases) {
          clearanceRequest.departments[phase.name].status = phase.status;
          clearanceRequest.departments[phase.name].checked_at = new Date();
          clearanceRequest.departments[phase.name].remarks = phase.remarks;
        }

        if (clearanceResult.overallStatus === 'Completed') {
          clearanceRequest.overall_status = 'Approved';
          clearanceRequest.cleared_at = new Date();
        } else {
          clearanceRequest.overall_status = 'Pending';
          clearanceRequest.cleared_at = null;
        }
        await clearanceRequest.save();
      }
    } catch (reCheckErr) {
      console.error('Auto re-check error:', reCheckErr.message);
    }

    res.json({
      success: true,
      message: 'Return updated successfully. Clearance re-evaluated.',
      data: updatedReturn,
      clearanceStatus: clearanceResult?.overallStatus || null
    });
  } catch (err) {
    console.error('Error editing return:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
