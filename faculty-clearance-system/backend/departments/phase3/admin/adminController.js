const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// Admin Clearance Controller - Phase 3, 75% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'Admin',
      phase: 3,
      completionPercentage: 75,
      requirements: [
        { item: 'Official ID Returned', description: 'Official faculty ID and access badges returned', verified: false },
        { item: 'No Outstanding Tasks', description: 'All administrative and committee tasks completed or transferred', verified: false },
        { item: 'Office Cleared', description: 'Office/lab space cleared and keys returned', verified: false },
        { item: 'Certifications Issued', description: 'Experience and service certificates issued', verified: false }
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
    if (!checklist.idReturned || !checklist.noOutstandingTasks || !checklist.officeCleared) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ Admin clearance incomplete - All administrative requirements must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        adminStatus: 'approved',
        adminApprovalDate: new Date(),
        completionPercentage: 75,
        currentPhase: 3
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ Admin clearance approved',
      phase: 3,
      nextSteps: ['proceed_to_oric_then_hod']
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
        adminStatus: 'on-hold',
        adminHoldReason: reason,
        adminHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ Admin clearance placed on hold',
      reason: reason,
      instructions: 'Complete administrative requirements and resubmit'
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
      department: 'Admin',
      status: clearance.adminStatus,
      approvalDate: clearance.adminApprovalDate,
      holdReason: clearance.adminHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
