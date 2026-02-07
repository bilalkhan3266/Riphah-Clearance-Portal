/**
 * ISSUE-BASED AUTO CLEARANCE SERVICE
 * Automatically verifies faculty clearance based on issued items
 * 
 * Core Logic:
 * - If faculty has pending issued items (status = "Issued") → REJECTED
 * - If all items returned (status = "Cleared" or "Returned") → APPROVED
 */

const Issue = require('../models/Issue');
const Return = require('../models/Return');

const DEPARTMENTS = [
  'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 
  'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'
];

/**
 * Check if faculty has pending issued items in a department
 * @param {String} facultyId - Faculty ID (from User model)
 * @param {String} departmentName - Department name
 * @returns {Object} { status: 'APPROVED'|'REJECTED', reason: String, pendingItems: Array }
 */
async function checkDepartmentClearance(facultyId, departmentName) {
  try {
    // Fetch all issues for this faculty in this department
    const pendingIssues = await Issue.find({
      facultyId: facultyId,
      departmentName: departmentName,
      status: 'Issued' // Only pending/issued items
    }).lean();

    // If no pending issues, faculty can be cleared
    if (pendingIssues.length === 0) {
      return {
        status: 'APPROVED',
        reason: `All items cleared in ${departmentName}`,
        pendingItems: []
      };
    }

    // Build list of pending items with details
    const itemDetails = pendingIssues.map(item => ({
      itemId: item._id,
      itemName: item.description,
      itemType: item.itemType,
      quantity: item.quantity,
      issuedDate: item.issueDate,
      dueDate: item.dueDate,
      status: item.status
    }));

    // Create detailed rejection reason
    const itemList = itemDetails
      .map(item => `${item.itemName} (${item.quantity} unit(s))`)
      .join(', ');

    return {
      status: 'REJECTED',
      reason: `Pending issued item from ${departmentName}: ${itemList} not returned`,
      pendingItems: itemDetails,
      rejectionType: 'PENDING_ITEMS'
    };

  } catch (error) {
    console.error(`Error checking clearance for ${facultyId} in ${departmentName}:`, error);
    return {
      status: 'ERROR',
      reason: `Error verifying clearance: ${error.message}`,
      pendingItems: []
    };
  }
}

/**
 * Auto-verify clearance for all departments (Phase-based)
 * @param {String} facultyId - Faculty ID
 * @param {Array} phases - Array of department names to check
 * @returns {Object} { departmentResults: {}, overallStatus: 'CLEARED'|'NOT_CLEARED' }
 */
async function autoVerifyClearancePhases(facultyId, phases) {
  try {
    const departmentResults = {};
    let allApproved = true;

    // Check each department in the phase
    for (const deptName of phases) {
      const result = await checkDepartmentClearance(facultyId, deptName);
      departmentResults[deptName] = result;

      // If any department is rejected, overall status is not cleared
      if (result.status === 'REJECTED') {
        allApproved = false;
      }
    }

    return {
      departmentResults,
      overallStatus: allApproved ? 'CLEARED' : 'NOT_CLEARED'
    };

  } catch (error) {
    console.error(`Error in auto-verify clearance:`, error);
    throw error;
  }
}

/**
 * Get all pending items for a faculty
 * @param {String} facultyId - Faculty ID
 * @returns {Array} Array of pending items grouped by department
 */
async function getPendingItemsForFaculty(facultyId) {
  try {
    const pendingItems = await Issue.find({
      facultyId: facultyId,
      status: 'Issued'
    })
    .select('departmentName description itemType quantity issueDate dueDate status')
    .lean()
    .sort({ issueDate: -1 });

    // Group by department
    const grouped = {};
    for (const item of pendingItems) {
      if (!grouped[item.departmentName]) {
        grouped[item.departmentName] = [];
      }
      grouped[item.departmentName].push({
        itemId: item._id,
        itemName: item.description,
        itemType: item.itemType,
        quantity: item.quantity,
        issuedDate: item.issueDate,
        dueDate: item.dueDate,
        status: item.status
      });
    }

    return grouped;

  } catch (error) {
    console.error(`Error fetching pending items:`, error);
    return {};
  }
}

/**
 * Get clearance summary for faculty
 * Shows which departments approved/rejected and why
 * @param {String} facultyId - Faculty ID
 * @returns {Object} Summary with department statuses and reasons
 */
async function getClearanceSummary(facultyId) {
  try {
    const summary = {
      facultyId,
      departments: {},
      totalDepartments: DEPARTMENTS.length,
      approvedCount: 0,
      rejectedCount: 0,
      pendingItems: []
    };

    // Check each department
    for (const dept of DEPARTMENTS) {
      const result = await checkDepartmentClearance(facultyId, dept);
      
      summary.departments[dept] = {
        status: result.status,
        reason: result.reason,
        pendingItems: result.pendingItems || []
      };

      if (result.status === 'APPROVED') {
        summary.approvedCount++;
      } else if (result.status === 'REJECTED') {
        summary.rejectedCount++;
      }

      // Collect all pending items
      if (result.pendingItems && result.pendingItems.length > 0) {
        summary.pendingItems.push({
          department: dept,
          items: result.pendingItems
        });
      }
    }

    return summary;

  } catch (error) {
    console.error(`Error getting clearance summary:`, error);
    throw error;
  }
}

/**
 * Mark item as returned (close the issue)
 * @param {String} issueId - Issue ID
 * @param {String} receivedBy - Staff member receiving the item
 * @returns {Object} Updated issue
 */
async function markItemAsReturned(issueId, receivedBy) {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      {
        status: 'Cleared',
        updatedAt: new Date()
      },
      { new: true }
    );

    return updatedIssue;

  } catch (error) {
    console.error(`Error marking item as returned:`, error);
    throw error;
  }
}

module.exports = {
  checkDepartmentClearance,
  autoVerifyClearancePhases,
  getPendingItemsForFaculty,
  getClearanceSummary,
  markItemAsReturned
};
