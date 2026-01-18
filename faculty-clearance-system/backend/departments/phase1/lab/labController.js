// Lab Department Clearance Controller
// PHASE 1: Physical Assets (Day 1-2)
// What to Check: Equipment, safety, inventory

const labChecklist = {
  name: 'Lab',
  phase: 1,
  percentage: 25,
  checks: {
    equipmentInventoried: {
      label: 'Equipment inventory verified and accounted for?',
      required: true,
      type: 'checkbox'
    },
    safetyProtocolsComplete: {
      label: 'Safety protocols completed (training expired)?',
      required: true,
      type: 'checkbox'
    },
    labKeyReturned: {
      label: 'Lab access keys returned?',
      required: true,
      type: 'checkbox'
    },
    chemicalDisposalDone: {
      label: 'Chemical disposal documented?',
      required: false,
      type: 'checkbox'
    }
  }
};

exports.getLabClearanceRequirements = (req, res) => {
  res.json({
    success: true,
    department: 'Lab',
    phase: 1,
    data: labChecklist
  });
};

exports.approveLabClearance = async (req, res) => {
  try {
    const { facultyId, checklist, remarks } = req.body;
    
    if (!checklist.equipmentInventoried || !checklist.safetyProtocolsComplete || !checklist.labKeyReturned) {
      return res.status(400).json({
        success: false,
        message: 'All required items must be verified before approval'
      });
    }

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.lab = {
      status: 'approved',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || 'All lab equipment and safety verified',
      checklist: checklist
    };
    await clearance.save();

    res.json({
      success: true,
      message: 'Lab clearance approved',
      data: { status: 'approved' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectLabClearance = async (req, res) => {
  try {
    const { facultyId, issues, remarks } = req.body;

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.lab = {
      status: 'rejected',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks
    };
    clearance.isOnHold = true;
    clearance.holdReason = `Lab: ${remarks}`;
    await clearance.save();

    res.json({
      success: true,
      message: 'Lab clearance rejected. Faculty must resolve issues.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
