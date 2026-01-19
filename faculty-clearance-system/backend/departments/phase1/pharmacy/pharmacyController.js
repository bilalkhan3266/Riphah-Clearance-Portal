const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// Pharmacy Clearance Controller - Phase 1, 25% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'Pharmacy',
      phase: 1,
      completionPercentage: 25,
      requirements: [
        { item: 'Medicines/Drugs Accounted', description: 'All medicines and controlled substances inventoried and accounted for', verified: false },
        { item: 'Equipment Returned', description: 'All pharmacy equipment and measuring devices returned', verified: false },
        { item: 'Keys/Access Returned', description: 'Pharmacy keys, safes, and access credentials returned', verified: false },
        { item: 'Records Submitted', description: 'All dispensing records and logs submitted', verified: false }
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
    if (!checklist.medicinesAccounted || !checklist.equipmentReturned || !checklist.keysReturned) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ Pharmacy clearance incomplete - Required inventory and equipment must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        pharmacyStatus: 'approved',
        pharmacyApprovalDate: new Date(),
        completionPercentage: 25,
        currentPhase: 1
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ Pharmacy clearance approved',
      phase: 1,
      nextSteps: ['continue_phase_1_or_start_phase_2']
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
        pharmacyStatus: 'on-hold',
        pharmacyHoldReason: reason,
        pharmacyHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ Pharmacy clearance placed on hold',
      reason: reason,
      instructions: 'Please resolve the pharmacy issues and resubmit'
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
      department: 'Pharmacy',
      status: clearance.pharmacyStatus,
      approvalDate: clearance.pharmacyApprovalDate,
      holdReason: clearance.pharmacyHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
