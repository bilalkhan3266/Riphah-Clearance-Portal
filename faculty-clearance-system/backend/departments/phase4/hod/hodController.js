// HOD (Head of Department) Clearance Controller
// PHASE 4: Final Authority - CRITICAL
// What to Check: Reviews ALL 9 departments from Phase 1-3
// ⭐ HOD CANNOT SIGN until Phase 1-3 ALL APPROVED

const hodChecklist = {
  name: 'HOD',
  phase: 4,
  percentage: 92,
  priority: 'CRITICAL',
  notes: '⭐ SECOND-TO-LAST: Reviews all departments, cannot sign until Phase 1-3 complete',
  checks: {
    allDepartmentsClearanceVerified: {
      label: 'All 9 departments (Phase 1-3) clearance verified?',
      required: true,
      type: 'checkbox',
      blocksApproval: true
    },
    departmentalVerification: {
      label: 'Final departmental verification complete?',
      required: true,
      type: 'checkbox'
    },
    pendingCommitteesCleared: {
      label: 'Pending committee duties transferred/cleared?',
      required: true,
      type: 'checkbox'
    },
    departmentAssetsReturned: {
      label: 'Department assets returned (lab equipment, computer, etc)?',
      required: false,
      type: 'checkbox'
    },
    allDocumentsCollected: {
      label: 'All clearance documents collected and verified?',
      required: true,
      type: 'checkbox'
    }
  }
};

exports.getHODClearanceRequirements = (req, res) => {
  res.json({
    success: true,
    department: 'HOD',
    phase: 4,
    priority: 'CRITICAL',
    message: '⭐ HOD must review all 9 departments before signing',
    data: hodChecklist
  });
};

exports.canHODApprove = async (facultyId) => {
  // HOD can ONLY approve if ALL Phase 1-3 departments are approved
  const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
  
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
  
  return phase1_all && phase2_all && phase3_all;
};

exports.approveHODClearance = async (req, res) => {
  try {
    const { facultyId, checklist, remarks, notes } = req.body;
    
    // Check if all 9 departments are approved first
    const canApprove = await exports.canHODApprove(facultyId);
    if (!canApprove) {
      return res.status(400).json({
        success: false,
        message: '❌ HOD cannot approve until ALL Phase 1-3 departments are approved (9 departments)',
        instruction: 'All of Library, Lab, Pharmacy, HR, Finance, Records, IT, Admin, and ORIC must be APPROVED first'
      });
    }

    if (!checklist.allDepartmentsClearanceVerified || !checklist.departmentalVerification) {
      return res.status(400).json({
        success: false,
        message: 'All required verifications must be checked'
      });
    }

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.hod = {
      status: 'approved',
      signedBy: req.user.name,
      approverEmail: req.user.email,
      signatureDate: new Date(),
      remarks: remarks || 'All departmental verification complete',
      notes: notes,
      checklist: checklist,
      allPreviousClearancesReceived: true
    };
    
    clearance.currentPhase = 4; // Move to Phase 4 (Dean)
    await clearance.save();

    res.json({
      success: true,
      message: '✅ HOD Clearance APPROVED - Faculty may now proceed to Dean',
      nextStep: 'Faculty must now visit Dean for final approval',
      completionPercentage: 92
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectHODClearance = async (req, res) => {
  try {
    const { facultyId, issues, remarks } = req.body;

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.hod = {
      status: 'rejected',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks
    };
    clearance.isOnHold = true;
    clearance.holdReason = `HOD: ${remarks}`;
    await clearance.save();

    res.json({
      success: true,
      message: 'HOD clearance rejected. Faculty must resolve issues.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
