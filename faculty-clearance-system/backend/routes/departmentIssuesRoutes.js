/**
 * DEPARTMENT ISSUES & RETURNS TRACKING
 * Shows faculty what items they need to return to clear each department
 */

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const Issue = require('../models/Issue');
const Return = require('../models/Return');
const autoClearanceService = require('../services/autoClearanceService');

// =====================================================
// GET - Get all pending issues for faculty
// =====================================================
router.get('/my-pending-issues', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    const pendingIssues = await Issue.find({
      facultyId,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    })
      .populate('referenceIssueId')
      .sort({ issueDate: -1 });

    // Group by department
    const issuesByDept = {};
    pendingIssues.forEach(issue => {
      if (!issuesByDept[issue.departmentName]) {
        issuesByDept[issue.departmentName] = [];
      }
      issuesByDept[issue.departmentName].push({
        id: issue._id,
        description: issue.description,
        itemType: issue.itemType,
        quantity: issue.quantity,
        status: issue.status,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        issuedBy: issue.issuedBy,
        notes: issue.notes
      });
    });

    res.json({
      success: true,
      totalPendingItems: pendingIssues.length,
      departmentsWithIssues: Object.keys(issuesByDept).length,
      issuesByDepartment: issuesByDept
    });
  } catch (error) {
    console.error('Error fetching pending issues:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET - Get pending issues for specific department
// =====================================================
router.get('/pending/:departmentName', verifyToken, async (req, res) => {
  try {
    const { departmentName } = req.params;
    const facultyId = req.user.id;

    // Check clearance for this specific department
    const deptStatus = await autoClearanceService.checkDepartmentClearance(
      facultyId,
      departmentName
    );

    res.json({
      success: true,
      facultyId,
      departmentName,
      status: deptStatus.isCleared ? 'CLEARED' : 'PENDING',
      pendingItems: deptStatus.pendingItems,
      pendingCount: deptStatus.pendingItems.length,
      decision: deptStatus.decision,
      reason: deptStatus.reason
    });
  } catch (error) {
    console.error('Error fetching department issues:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET - Get what items faculty needs to return
// (All departments that are blocking clearance)
// =====================================================
router.get('/clearance-requirements', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    const requirements = await autoClearanceService.getClearanceRequirements(facultyId);

    res.json(requirements);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET - Get phase-specific status
// Shows current phase and what's needed to move forward
// =====================================================
router.get('/phase-status', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    const phaseStatus = await autoClearanceService.getPhaseStatus(facultyId);

    res.json(phaseStatus);
  } catch (error) {
    console.error('Error fetching phase status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET - Get all returns for faculty
// Shows which items have been successfully returned
// =====================================================
router.get('/my-returns', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    const returns = await Return.find({ facultyId })
      .populate('referenceIssueId')
      .sort({ returnDate: -1 });

    // Group by department
    const returnsByDept = {};
    returns.forEach(ret => {
      if (!returnsByDept[ret.departmentName]) {
        returnsByDept[ret.departmentName] = [];
      }
      // Get description from populated Issue or use issue reference number
      const description = ret.referenceIssueId?.description || ret.issueReferenceNumber || 'Item';
      
      returnsByDept[ret.departmentName].push({
        id: ret._id,
        description: description,
        itemType: ret.itemType,
        quantityReturned: ret.quantityReturned,
        returnDate: ret.returnDate,
        status: ret.status,
        condition: ret.condition.toLowerCase(), // Normalize for CSS
        receivedBy: ret.receivedBy
      });
    });

    res.json({
      success: true,
      totalReturned: returns.length,
      departmentsCleared: Object.keys(returnsByDept).length,
      returnsByDepartment: returnsByDept
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// GET - Get clearance summary
// Shows overall clearance progress and what's needed
// =====================================================
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    // Get clearance check
    const clearanceCheck = await autoClearanceService.checkFacultyClearance(facultyId);

    // Get requirements
    const requirements = await autoClearanceService.getClearanceRequirements(facultyId);

    // Calculate progress
    const totalPhases = 4;
    const completedPhases = Object.values(clearanceCheck.phases).filter(
      p => p.allApproved === true
    ).length;

    res.json({
      success: true,
      facultyId,
      overallStatus: clearanceCheck.overallStatus,
      currentPhase: clearanceCheck.currentPhase,
      phaseProgress: `${completedPhases}/${totalPhases}`,
      totalItemsToReturn: requirements.totalItemsToReturn,
      phaseDetails: clearanceCheck.phases,
      itemsToReturn: requirements.clearanceRequirements,
      readyForCertificate: clearanceCheck.overallStatus === 'APPROVED'
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
