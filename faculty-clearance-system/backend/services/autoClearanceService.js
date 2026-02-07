/**
 * AUTO-CLEARANCE SERVICE - PHASE-BASED WORKFLOW
 * ✅ FULLY AUTOMATED - NO MANUAL APPROVAL
 * System decides based on Issue/Return records ONLY
 */

const Issue = require('../models/Issue');
const Return = require('../models/Return');

// ==========================================
// PHASE STRUCTURE (STRICT ORDER)
// ==========================================
const PHASES = {
  'Phase 1': ['Lab', 'Library', 'Pharmacy'],
  'Phase 2': ['Finance', 'HR', 'Records'],
  'Phase 3': ['IT', 'ORIC', 'Admin'],
  'Phase 4': ['Warden', 'HOD', 'Dean']
};

const PHASE_ORDER = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
const ALL_DEPARTMENTS = ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'];

/**
 * Get phase for a department
 */
function getPhaseForDepartment(deptName) {
  for (const [phase, depts] of Object.entries(PHASES)) {
    if (depts.includes(deptName)) return phase;
  }
  return null;
}

/**
 * Check faculty clearance with PHASE-BASED WORKFLOW
 * ✅ Phase 1 must pass before Phase 2
 * ✅ All departments in phase must approve before next phase
 * @param {String} facultyId - Faculty MongoDB ID (ObjectId from req.user.id)
 * @returns {Object} Clearance decision with phase-based progress
 */
exports.checkFacultyClearance = async (facultyId) => {
  try {
    const User = require('../models/User');
    
    // Get user record to extract faculty_id string
    const user = await User.findOne({ 
      $or: [
        { _id: facultyId },
        { faculty_id: facultyId }
      ]
    });
    
    if (!user) {
      throw new Error(`User not found for ID: ${facultyId}`);
    }
    
    // Use the faculty_id string for Issue queries (or fallback to employee_id)
    const queryFacultyId = user.faculty_id || user.employee_id || facultyId;
    
    console.log(`🤖 Checking clearance for faculty: ${user.full_name} (${queryFacultyId})`);
    console.log(`   User Reference: ${user._id} | Faculty ID: ${user.faculty_id} | Employee ID: ${user.employee_id}`);
    console.log(`   Using faculty ID for queries: ${queryFacultyId}`);

    const phaseResults = {};
    const departmentDetails = {};
    let currentPhase = null;
    let overallStatus = 'APPROVED'; // Assume success unless rejected

    // ==========================================
    // CHECK EACH PHASE IN ORDER
    // ==========================================
    for (const phase of PHASE_ORDER) {
      const departments = PHASES[phase];
      const phaseStatusList = [];
      let phaseHasRejection = false;

      // Check each department in this phase
      for (const deptName of departments) {
        const deptStatus = await checkDepartmentClearance(queryFacultyId, deptName);
        
        phaseStatusList.push({
          name: deptName,
          status: deptStatus.isCleared ? 'APPROVED' : 'REJECTED',
          pendingItems: deptStatus.pendingItems,
          pendingCount: deptStatus.pendingItems.length
        });

        departmentDetails[deptName] = deptStatus;

        if (!deptStatus.isCleared) {
          phaseHasRejection = true;
        }
      }

      // Determine phase status
      phaseResults[phase] = {
        status: phaseHasRejection ? 'BLOCKED' : 'APPROVED',
        departments: phaseStatusList,
        allApproved: !phaseHasRejection
      };

      // CRITICAL: If phase is blocked, stop here
      if (phaseHasRejection) {
        currentPhase = phase;
        overallStatus = 'BLOCKED_AT_PHASE';
        break;
      } else {
        currentPhase = phase;
      }
    }

    // ==========================================
    // FINAL RESULT
    // ==========================================
    const result = {
      success: true,
      facultyId,
      overallStatus:  overallStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      currentPhase,
      phaseProgress: `${Object.entries(phaseResults).filter(p => p[1].allApproved).length}/${PHASE_ORDER.length}`,
      phases: phaseResults,
      departmentDetails,
      timestamp: new Date(),
      decidedBy: 'AUTOMATED_SYSTEM',
      automationRules: {
        phase1Required: 'All Phase 1 depts must approve before Phase 2',
        phase2Required: 'All Phase 2 depts must approve before Phase 3',
        noManualOverride: 'Decision is FINAL - based on issue/return records'
      }
    };

    // Log final result
    console.log(`🤖 [AUTO-CLEARANCE] Faculty: ${queryFacultyId} | Status: ${result.overallStatus} | Current Phase: ${currentPhase}`);

    return result;
  } catch (error) {
    console.error('❌ Auto-Clearance Service Error:', error);
    throw new Error('Clearance checking failed: ' + error.message);
  }
};

/**
 * Check single department clearance
 * @private
 * CRITICAL: Checks if ALL items are RETURNED (not ISSUED)
 * Enhanced to handle multiple faculty ID formats
 */
async function checkDepartmentClearance(facultyId, departmentName) {
  try {
    // CRITICAL: Look for any ISSUED items (not yet returned)
    // Try multiple ID formats for flexibility in matching
    const pendingIssues = await Issue.find({
      $or: [
        { facultyId: facultyId },                             // Exact match
        { facultyId: facultyId.toString() },                 // String conversion
        { facultyId: String(facultyId) }                     // Safe string conversion
      ],
      departmentName: departmentName,
      status: 'Issued'  // Only check for Issued - if none, department is cleared
    }).select('_id itemType description issueDate');

    // Department is CLEARED only if NO ISSUED items exist
    const isCleared = pendingIssues.length === 0;

    console.log(`   [${departmentName}] Faculty ${facultyId}: ${pendingIssues.length} pending item(s)`);

    return {
      success: true,
      facultyId,
      departmentName,
      isCleared,
      pendingItems: pendingIssues.map(issue => ({
        id: issue._id,
        itemType: issue.itemType,
        description: issue.description,
        issueDate: issue.issueDate,
        status: 'Issued'
      })),
      pendingCount: pendingIssues.length,
      decision: isCleared ? '✅ AUTO-APPROVED' : '❌ AUTO-REJECTED',
      reason: isCleared ? 'All items returned' : `${pendingIssues.length} item(s) not returned`
    };
  } catch (error) {
    console.error(`Error checking ${departmentName}:`, error);
    throw error;
  }
}

/**
 * Get detailed clearance status for a specific department
 * @param {String} facultyId
 * @param {String} departmentName
 * @returns {Object} Department clearance status
 */
/**
 * Get detailed department clearance status (public export for routes)
 */
exports.checkDepartmentClearance = async (facultyId, departmentName) => {
  return await checkDepartmentClearance(facultyId, departmentName);
};

/**
 * Get clearance history for faculty
 * @param {String} facultyId
 * @returns {Array} List of past clearance attempts
 */
exports.getClearanceHistory = async (facultyId) => {
  try {
    const Clearance = require('../models/Clearance');
    
    const history = await Clearance.find({ facultyId })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      success: true,
      facultyId,
      totalAttempts: history.length,
      history: history.map(record => ({
        id: record._id,
        overallStatus: record.overallStatus,
        approvedCount: record.phases.filter(p => p.status === 'Approved').length,
        rejectedCount: record.phases.filter(p => p.status === 'Rejected').length,
        createdAt: record.createdAt,
        certificateAvailable: record.overallStatus === 'Completed'
      }))
    };
  } catch (error) {
    console.error('History Retrieval Error:', error);
    throw new Error('Failed to retrieve clearance history');
  }
};

/**
 * Validate that all required fields exist before clearance can be processed
 * @param {String} facultyId
 * @returns {Object} Validation result
 */
exports.validateFacultyForClearance = async (facultyId) => {
  try {
    const User = require('../models/User');
    
    const faculty = await User.findOne({ 
      $or: [
        { faculty_id: facultyId },
        { _id: facultyId }
      ]
    });
    
    if (!faculty) {
      return {
        valid: false,
        message: 'Faculty not found in system'
      };
    }

    return {
      valid: true,
      message: 'Faculty record exists',
      facultyName: faculty.name || `${faculty.firstName} ${faculty.lastName}`,
      email: faculty.email,
      department: faculty.department
    };
  } catch (error) {
    console.error('Faculty Validation Error:', error);
    return {
      valid: false,
      message: 'Validation failed: ' + error.message
    };
  }
};

/**
 * Re-check clearance for faculty (after items are cleared)
 * @param {String} facultyId
 * @returns {Object} Updated clearance status
 */
exports.reCheckFacultyClearance = async (facultyId) => {
  try {
    // Delete previous incomplete records
    const Clearance = require('../models/Clearance');
    await Clearance.deleteOne({
      facultyId,
      overallStatus: 'Rejected'
    });

    // Run fresh check
    return await this.checkFacultyClearance(facultyId);
  } catch (error) {
    console.error('Re-check Error:', error);
    throw new Error('Re-check failed');
  }
};

/**
 * Get all pending items for faculty across ALL departments
 * @param {String} facultyId
 * @returns {Array} All pending items grouped by department
 */
exports.getFacultyAllPendingItems = async (facultyId) => {
  try {
    const pendingByDept = {};

    for (const dept of ALL_DEPARTMENTS) {
      const issues = await Issue.find({
        facultyId,
        departmentName: dept,
        status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
      });

      if (issues.length > 0) {
        pendingByDept[dept] = issues.map(i => ({
          id: i._id,
          description: i.description,
          itemType: i.itemType,
          status: i.status,
          issueDate: i.issueDate
        }));
      }
    }

    return {
      success: true,
      facultyId,
      totalPendingItems: Object.values(pendingByDept).reduce((sum, items) => sum + items.length, 0),
      pendingByDepartment: pendingByDept
    };
  } catch (error) {
    console.error('Pending Items Error:', error);
    throw new Error('Failed to retrieve pending items');
  }
};

/**
 * Get what items faculty needs to return to clear each department
 * Helps faculty understand what's blocking them
 * @param {String} facultyId
 * @returns {Object} Detailed requirements for clearance
 */
exports.getClearanceRequirements = async (facultyId) => {
  try {
    const requirements = {};
    let totalItemsToReturn = 0;

    for (const dept of ALL_DEPARTMENTS) {
      const issues = await Issue.find({
        facultyId,
        departmentName: dept,
        status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
      });

      if (issues.length > 0) {
        requirements[dept] = {
          itemsToReturn: issues.length,
          items: issues.map(i => ({
            id: i._id,
            description: i.description,
            itemType: i.itemType,
            quantity: i.quantity,
            issueDate: i.issueDate,
            dueDate: i.dueDate || 'No due date'
          }))
        };
        totalItemsToReturn += issues.length;
      }
    }

    return {
      success: true,
      facultyId,
      totalItemsToReturn,
      departmentsAffected: Object.keys(requirements).length,
      clearanceRequirements: requirements,
      message: totalItemsToReturn > 0 
        ? `Return ${totalItemsToReturn} item(s) to clear all departments`
        : 'All items cleared - eligible for final certification'
    };
  } catch (error) {
    console.error('Requirements Error:', error);
    throw new Error('Failed to retrieve requirements');
  }
};

/**
 * Get phase-specific status
 * Shows which phase faculty is currently in and what's needed
 * @param {String} facultyId
 * @returns {Object} Current phase details
 */
exports.getPhaseStatus = async (facultyId) => {
  try {
    const clearanceResult = await exports.checkFacultyClearance(facultyId);
    const requirements = await exports.getClearanceRequirements(facultyId);

    return {
      success: true,
      facultyId,
      currentPhase: clearanceResult.currentPhase,
      phaseProgress: clearanceResult.phaseProgress,
      overallStatus: clearanceResult.overallStatus,
      phaseBreakdown: clearanceResult.phases,
      itemsToReturn: requirements.clearanceRequirements,
      readyForNextPhase: clearanceResult.currentPhase && 
                          clearanceResult.phases[clearanceResult.currentPhase]?.allApproved === true
    };
  } catch (error) {
    console.error('Phase Status Error:', error);
    throw new Error('Failed to get phase status');
  }
};

module.exports = exports;
