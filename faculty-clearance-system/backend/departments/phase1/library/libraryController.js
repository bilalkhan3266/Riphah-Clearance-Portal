// Library Department Clearance Controller
// PHASE 1: Physical Assets (Day 1-2)
// What to Check: Books, fines, returns

const libraryChecklist = {
  name: 'Library',
  phase: 1,
  percentage: 25,
  checks: {
    booksReturned: {
      label: 'All books returned?',
      required: true,
      type: 'checkbox'
    },
    finesPaid: {
      label: 'All fines/dues paid?',
      required: true,
      type: 'checkbox'
    },
    libraryIdReturned: {
      label: 'Library ID card returned?',
      required: true,
      type: 'checkbox'
    },
    onlineResourcesDeactivated: {
      label: 'Online resources deactivated?',
      required: false,
      type: 'checkbox'
    }
  }
};

exports.getLibraryClearanceRequirements = (req, res) => {
  res.json({
    success: true,
    department: 'Library',
    phase: 1,
    data: libraryChecklist
  });
};

exports.approveLibraryClearance = async (req, res) => {
  try {
    const { facultyId, checklist, remarks } = req.body;
    
    // Validate all required checks are marked
    if (!checklist.booksReturned || !checklist.finesPaid || !checklist.libraryIdReturned) {
      return res.status(400).json({
        success: false,
        message: 'All required items must be verified before approval'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.library = {
      status: 'approved',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || 'All library items verified',
      checklist: checklist
    };
    await clearance.save();

    res.json({
      success: true,
      message: 'Library clearance approved',
      data: { status: 'approved', checklist: checklist }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectLibraryClearance = async (req, res) => {
  try {
    const { facultyId, issues, remarks } = req.body;

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.library = {
      status: 'rejected',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || 'Library clearance not approved'
    };
    clearance.isOnHold = true;
    clearance.holdReason = `Library: ${remarks}`;
    await clearance.save();

    res.json({
      success: true,
      message: 'Library clearance rejected. Faculty must resolve issues.',
      issues: issues
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
