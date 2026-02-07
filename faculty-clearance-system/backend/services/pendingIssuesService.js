/**
 * PENDING ISSUES SERVICE
 * Functions to check and retrieve pending issues for faculty members
 */

const Issue = require('../models/Issue');
const Return = require('../models/Return');

/**
 * Get pending issues for a specific faculty member
 * @param {String} facultyId - Faculty employee ID
 * @returns {Object} Pending issues grouped by department
 */
exports.getPendingIssuesByFaculty = async (facultyId) => {
  try {
    const pendingIssues = await Issue.find({
      facultyId,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    }).sort({ issueDate: -1 });

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

    return {
      success: true,
      facultyId,
      totalPendingItems: pendingIssues.length,
      departmentsWithIssues: Object.keys(issuesByDept).length,
      issuesByDepartment: issuesByDept
    };
  } catch (error) {
    console.error('Error getting pending issues:', error);
    throw new Error('Error retrieving pending issues: ' + error.message);
  }
};

/**
 * Get pending issues for a specific faculty in a specific department
 * @param {String} facultyId - Faculty employee ID
 * @param {String} departmentName - Department name
 * @returns {Array} Pending issues in that department
 */
exports.getPendingIssuesInDepartment = async (facultyId, departmentName) => {
  try {
    const pendingIssues = await Issue.find({
      facultyId,
      departmentName,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    }).sort({ issueDate: -1 });

    return {
      success: true,
      facultyId,
      departmentName,
      totalPending: pendingIssues.length,
      issues: pendingIssues.map(issue => ({
        id: issue._id,
        description: issue.description,
        itemType: issue.itemType,
        quantity: issue.quantity,
        status: issue.status,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        issuedBy: issue.issuedBy
      }))
    };
  } catch (error) {
    console.error('Error getting pending issues in department:', error);
    throw new Error('Error retrieving pending issues: ' + error.message);
  }
};

/**
 * Check if faculty has pending issues in a department
 * @param {String} facultyId - Faculty employee ID
 * @param {String} departmentName - Department name
 * @returns {Boolean} True if there are pending issues
 */
exports.hasPendingIssues = async (facultyId, departmentName) => {
  try {
    const count = await Issue.countDocuments({
      facultyId,
      departmentName,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    });

    return count > 0;
  } catch (error) {
    console.error('Error checking pending issues:', error);
    throw new Error('Error checking pending issues: ' + error.message);
  }
};

/**
 * Get pending issues count by department for a faculty
 * @param {String} facultyId - Faculty employee ID
 * @returns {Object} Count of pending issues per department
 */
exports.getPendingIssuesCount = async (facultyId) => {
  try {
    const issues = await Issue.aggregate([
      {
        $match: {
          facultyId,
          status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
        }
      },
      {
        $group: {
          _id: '$departmentName',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const countByDept = {};
    issues.forEach(doc => {
      countByDept[doc._id] = {
        count: doc.count,
        totalQuantity: doc.totalQuantity
      };
    });

    return {
      success: true,
      facultyId,
      pendingByDepartment: countByDept,
      totalPendingIssues: issues.reduce((sum, doc) => sum + doc.count, 0),
      totalPendingQuantity: issues.reduce((sum, doc) => sum + doc.totalQuantity, 0)
    };
  } catch (error) {
    console.error('Error getting pending issues count:', error);
    throw new Error('Error counting pending issues: ' + error.message);
  }
};

/**
 * Get blocked clearance reasons (what items need to be returned to clear)
 * @param {String} facultyId - Faculty employee ID
 * @param {String} departmentName - Department name (optional)
 * @returns {Object} Clearance blocking information
 */
exports.getClearanceBlockingIssues = async (facultyId, departmentName) => {
  try {
    let query = {
      facultyId,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    };

    if (departmentName) {
      query.departmentName = departmentName;
    }

    const blockedIssues = await Issue.find(query)
      .sort({ dueDate: 1, issueDate: -1 })
      .select('departmentName description quantity status issueDate dueDate');

    return {
      success: true,
      facultyId,
      blockedByDepartment: departmentName || 'all',
      blockerCount: blockedIssues.length,
      blockers: blockedIssues.map(issue => ({
        department: issue.departmentName,
        item: issue.description,
        quantity: issue.quantity,
        status: issue.status,
        dueDate: issue.dueDate,
        isOverdue: issue.dueDate && issue.dueDate < new Date()
      }))
    };
  } catch (error) {
    console.error('Error getting clearance blocking issues:', error);
    throw new Error('Error retrieving blocking issues: ' + error.message);
  }
};
