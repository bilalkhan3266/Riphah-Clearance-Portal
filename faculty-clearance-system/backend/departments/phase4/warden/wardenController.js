const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// Warden Clearance Controller - Phase 4, Optional 92% marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'Warden',
      phase: 4,
      completionPercentage: 92,
      optional: true,
      requirements: [
        { item: 'Hostel Dues Cleared', description: 'No outstanding hostel or residence dues', verified: false },
        { item: 'Property Returned', description: 'All hostel property and belongings returned', verified: false },
        { item: 'Room Inspection', description: 'Final room inspection and clearance completed', verified: false },
        { item: 'No Pending Cases', description: 'No pending discipline or conduct cases', verified: false }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveClearance = async (req, res) => {
  try {
    const { facultyId, checklist } = req.body;

    // Validate all required items if Warden clearance is applicable
    if (!checklist.hostelDuesCleared || !checklist.propertyReturned || !checklist.roomInspection) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ Warden clearance incomplete - All hostel requirements must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        wardenStatus: 'approved',
        wardenApprovalDate: new Date(),
        completionPercentage: 92
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ Warden clearance approved (optional)',
      phase: 4,
      nextSteps: ['proceed_to_hod']
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
        wardenStatus: 'on-hold',
        wardenHoldReason: reason,
        wardenHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ Warden clearance placed on hold',
      reason: reason,
      instructions: 'Resolve hostel/residence issues and resubmit'
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
      department: 'Warden',
      status: clearance.wardenStatus,
      approvalDate: clearance.wardenApprovalDate,
      holdReason: clearance.wardenHoldReason,
      optional: true,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
