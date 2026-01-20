const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// ORIC Clearance Controller - Phase 3, 75% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'ORIC',
      phase: 3,
      completionPercentage: 75,
      requirements: [
        { item: 'Research Projects Closed', description: 'All research projects properly closed or transferred', verified: false },
        { item: 'Publications Updated', description: 'All publications and research records finalized', verified: false },
        { item: 'Ethics Compliance', description: 'All ethics approvals and compliances verified', verified: false },
        { item: 'Reports Submitted', description: 'Final research reports and data submitted', verified: false }
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
    if (!checklist.researchProjectsClosed || !checklist.publicationsUpdated || !checklist.ethicsCompliance) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ ORIC clearance incomplete - All research and ethics items must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        oricStatus: 'approved',
        oricApprovalDate: new Date(),
        completionPercentage: 75,
        currentPhase: 3
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ ORIC clearance approved',
      phase: 3,
      nextSteps: ['all_phase_3_complete_proceed_to_hod']
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
        oricStatus: 'on-hold',
        oricHoldReason: reason,
        oricHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ ORIC clearance placed on hold',
      reason: reason,
      instructions: 'Complete research project closure and ethics compliance'
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
      department: 'ORIC',
      status: clearance.oricStatus,
      approvalDate: clearance.oricApprovalDate,
      holdReason: clearance.oricHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
