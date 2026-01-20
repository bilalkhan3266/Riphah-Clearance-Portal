// Dean Clearance Controller (Final Approval)
// PHASE 4: Final Authority - ABSOLUTE LAST
// What to Check: Final institutional approval
// ⭐ DEAN IS FINAL: No signing without all 11 departments approved + HOD signed

const deanChecklist = {
  name: 'Dean',
  phase: 4,
  percentage: 100,
  priority: 'CRITICAL - FINAL',
  notes: '⭐⭐ FINAL AUTHORITY: Cannot sign until all 11 departments approved AND HOD approved. Dean signature = Clearance complete',
  checks: {
    allDepartmentsClearanceVerified: {
      label: 'All 11 department clearances verified and received?',
      required: true,
      type: 'checkbox',
      blocksApproval: true
    },
    hodClearanceReceived: {
      label: 'HOD clearance received and reviewed?',
      required: true,
      type: 'checkbox',
      blocksApproval: true
    },
    noInstitutionalHolds: {
      label: 'No institutional holds or flags?',
      required: true,
      type: 'checkbox'
    },
    graduationEligibilityConfirmed: {
      label: 'Graduation/exit eligibility confirmed?',
      required: true,
      type: 'checkbox'
    },
    finalSignatureApproved: {
      label: 'Final signature approved for degree conferment?',
      required: true,
      type: 'checkbox'
    }
  }
};

exports.getDeanClearanceRequirements = (req, res) => {
  res.json({
    success: true,
    department: 'Dean',
    phase: 4,
    priority: 'CRITICAL - FINAL',
    message: '⭐⭐ DEAN IS FINAL - Signature completes clearance',
    data: deanChecklist
  });
};

exports.canDeanApprove = async (facultyId) => {
  // Dean can ONLY approve if ALL 11 departments are approved AND HOD approved
  const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
  
  // Check all 9 Phase 1-3 departments
  const phase1_all = 
    clearance.clearanceStatuses.library.status === 'approved' &&
    clearance.clearanceStatuses.lab.status === 'approved' &&
    clearance.clearanceStatuses.pharmacy.status === 'approved';
  
  const phase2_all = 
    clearance.clearanceStatuses.hr.status === 'approved' &&
    clearance.clearanceStatuses.finance.status === 'approved' &&
    clearance.clearanceStatuses.records.status === 'approved';
  
  const phase3_all = 
    clearance.clearanceStatuses.it.status === 'approved' &&
    clearance.clearanceStatuses.admin.status === 'approved' &&
    clearance.clearanceStatuses.oric.status === 'approved';
  
  // Check Warden (if applicable)
  const wardenOK = clearance.clearanceStatuses.warden.status === 'approved' || 
                   clearance.clearanceStatuses.warden.status === 'not-applicable';
  
  // Check HOD (REQUIRED)
  const hodApproved = clearance.clearanceStatuses.hod.status === 'approved';
  
  return phase1_all && phase2_all && phase3_all && wardenOK && hodApproved;
};

exports.approveDeanClearance = async (req, res) => {
  try {
    const { facultyId, checklist, remarks, notes, degreeConferred } = req.body;
    
    // CRITICAL: Check if ALL 11 departments are approved + HOD
    const canApprove = await exports.canDeanApprove(facultyId);
    if (!canApprove) {
      const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
      
      const missing = [];
      if (clearance.clearanceStatuses.library.status !== 'approved') missing.push('Library');
      if (clearance.clearanceStatuses.lab.status !== 'approved') missing.push('Lab');
      if (clearance.clearanceStatuses.pharmacy.status !== 'approved') missing.push('Pharmacy');
      if (clearance.clearanceStatuses.hr.status !== 'approved') missing.push('HR');
      if (clearance.clearanceStatuses.finance.status !== 'approved') missing.push('Finance');
      if (clearance.clearanceStatuses.records.status !== 'approved') missing.push('Records');
      if (clearance.clearanceStatuses.it.status !== 'approved') missing.push('IT');
      if (clearance.clearanceStatuses.admin.status !== 'approved') missing.push('Admin');
      if (clearance.clearanceStatuses.oric.status !== 'approved') missing.push('ORIC');
      if (clearance.clearanceStatuses.hod.status !== 'approved') missing.push('HOD');
      
      return res.status(400).json({
        success: false,
        message: '❌ Dean CANNOT approve - Missing approvals',
        missingApprovals: missing,
        instruction: `ALL 12 departments must be approved before Dean can sign. Missing: ${missing.join(', ')}`
      });
    }

    if (!checklist.allDepartmentsClearanceVerified || !checklist.hodClearanceReceived) {
      return res.status(400).json({
        success: false,
        message: 'All required verifications must be checked'
      });
    }

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.dean = {
      status: 'approved',
      signedBy: req.user.name,
      approverEmail: req.user.email,
      signatureDate: new Date(),
      remarks: remarks || 'Final institutional clearance approved',
      notes: notes,
      degreeConferred: degreeConferred || true,
      checklist: checklist
    };
    
    // Mark as COMPLETE - No going back!
    clearance.overallStatus = 'completed';
    clearance.completionDate = new Date();
    clearance.completionPercentage = 100;
    clearance.currentPhase = 5; // Complete
    
    await clearance.save();

    res.json({
      success: true,
      message: '✅✅ CLEARANCE COMPLETE - Faculty is officially cleared for graduation/exit',
      status: 'COMPLETED',
      completionPercentage: 100,
      completionDate: clearance.completionDate,
      nextStep: 'Faculty may now graduate or exit the institution',
      importance: 'This is the final approval - No further modifications allowed'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectDeanClearance = async (req, res) => {
  try {
    const { facultyId, remarks } = req.body;

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.dean = {
      status: 'rejected',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || 'Dean clearance not approved'
    };
    clearance.isOnHold = true;
    clearance.holdReason = `Dean: ${remarks}`;
    await clearance.save();

    res.json({
      success: true,
      message: 'Dean clearance rejected. Faculty must resolve institutional issues.',
      importance: 'Dean rejection is rare and indicates serious institutional concerns'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
