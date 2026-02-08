/**
 * SEQUENTIAL CLEARANCE SERVICE
 * ✅ STRICT SEQUENTIAL (department by department) clearance
 * ✅ NO manual approval - 100% automatic based on Issue/Return records
 * 
 * Phase Order (STRICT):
 *  1. Lab  2. Library  3. Pharmacy  4. Finance  5. HR  6. Record
 *  7. Admin  8. IT  9. ORIC  10. Warden  11. HOD  12. Dean
 */

const Issue = require('../models/Issue');
const User = require('../models/User');

// Strict sequential order — each department is its own phase
const DEPARTMENT_ORDER = [
  'Lab',       // 1
  'Library',   // 2
  'Pharmacy',  // 3
  'Finance',   // 4
  'HR',        // 5
  'Records',   // 6
  'Admin',     // 7
  'IT',        // 8
  'ORIC',      // 9
  'Warden',    // 10
  'HOD',       // 11
  'Dean'       // 12
];

/**
 * Process clearance for a faculty member — strict sequential order.
 *
 * For each department (in order):
 *   - If NO Issue with status != 'Cleared' exists → Approved
 *   - If an Issue exists with status != 'Cleared' → Rejected, STOP immediately
 *
 * @param {string} facultyId  — User._id (MongoDB ObjectId) from req.user.id
 * @returns {Object} { overallStatus, stoppedAt, phases[] }
 */
async function processClearance(facultyId) {
  // Resolve the faculty_id string used in Issue collection
  const user = await User.findById(facultyId).lean();
  if (!user) {
    throw new Error(`Faculty not found for id: ${facultyId}`);
  }

  const queryId = user.faculty_id || user.employee_id || String(facultyId);

  console.log(`\n🔄 [Sequential Clearance] Processing: ${user.full_name} (${queryId})`);

  const phases = [];
  let overallStatus = 'Completed';
  let stoppedAt = null;

  for (const dept of DEPARTMENT_ORDER) {
    // Find any issue that is NOT cleared for this faculty+department
    const pendingIssue = await Issue.findOne({
      facultyId: queryId,
      departmentName: dept,
      status: { $ne: 'Cleared' }
    }).lean();

    if (!pendingIssue) {
      // No pending issue → approved
      phases.push({
        name: dept,
        status: 'Approved',
        remarks: 'No pending issues'
      });
      console.log(`   ✅ ${dept}: Approved`);
    } else {
      // Pending issue found → rejected, STOP
      phases.push({
        name: dept,
        status: 'Rejected',
        remarks: `Pending: ${pendingIssue.description || pendingIssue.itemType}`
      });
      overallStatus = 'Rejected';
      stoppedAt = dept;
      console.log(`   ❌ ${dept}: Rejected — ${pendingIssue.description}`);
      break; // STOP further processing
    }
  }

  console.log(`   Result: ${overallStatus}${stoppedAt ? ` (stopped at ${stoppedAt})` : ''}`);

  return {
    facultyId,
    queryId,
    facultyName: user.full_name,
    facultyEmail: user.email,
    overallStatus,
    stoppedAt,
    phases
  };
}

module.exports = { processClearance, DEPARTMENT_ORDER };
