const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// IT Clearance Controller - Phase 3, 75% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'IT',
      phase: 3,
      completionPercentage: 75,
      requirements: [
        { item: 'System Access Revoked', description: 'All system and network access accounts deactivated', verified: false },
        { item: 'Equipment Returned', description: 'All IT equipment (laptop, phone, security tokens) returned', verified: false },
        { item: 'Data Transfer', description: 'All personal data and files transferred or archived', verified: false },
        { item: 'Email Access', description: 'Email account transferred to archive or management', verified: false }
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
    if (!checklist.systemAccessRevoked || !checklist.equipmentReturned || !checklist.dataTransferred) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ IT clearance incomplete - All system and equipment items must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        itStatus: 'approved',
        itApprovalDate: new Date(),
        completionPercentage: 75,
        currentPhase: 3
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ IT clearance approved',
      phase: 3,
      nextSteps: ['continue_phase_3_with_admin_and_oric']
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
        itStatus: 'on-hold',
        itHoldReason: reason,
        itHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ IT clearance placed on hold',
      reason: reason,
      instructions: 'Return all IT equipment and ensure system access is revoked'
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
      department: 'IT',
      status: clearance.itStatus,
      approvalDate: clearance.itApprovalDate,
      holdReason: clearance.itHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
