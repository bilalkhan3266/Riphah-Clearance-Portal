const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// HR Clearance Controller - Phase 2, 50% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'HR',
      phase: 2,
      completionPercentage: 50,
      requirements: [
        { item: 'Service Record', description: 'Service record and employment history verified', verified: false },
        { item: 'No Pending Issues', description: 'No disciplinary actions or pending HR issues', verified: false },
        { item: 'Benefits Settled', description: 'All benefits and entitlements properly settled', verified: false },
        { item: 'Final Documents', description: 'Final employment documents and certificates issued', verified: false }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveClearance = async (req, res) => {
  try {
    const { facultyId, checklist } = req.body;

    // Validate all required items are checked
    if (!checklist.serviceRecordVerified || !checklist.noPendingIssues || !checklist.benefitsSettled) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ HR clearance incomplete - All employment verifications must be completed'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        hrStatus: 'approved',
        hrApprovalDate: new Date(),
        completionPercentage: 50,
        currentPhase: 2
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ HR clearance approved',
      phase: 2,
      nextSteps: ['continue_phase_2_with_finance_and_records']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectClearance = async (req, res) => {
  try {
    const { facultyId, reason } = req.body;

    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        hrStatus: 'on-hold',
        hrHoldReason: reason,
        hrHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ HR clearance placed on hold',
      reason: reason,
      instructions: 'Resolve HR issues and resubmit for approval'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const clearance = await ClearanceRequest.findOne({ facultyId });

    if (!clearance) {
      return res.status(404).json({ error: 'Clearance record not found' });
    }

    res.json({
      department: 'HR',
      status: clearance.hrStatus,
      approvalDate: clearance.hrApprovalDate,
      holdReason: clearance.hrHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
