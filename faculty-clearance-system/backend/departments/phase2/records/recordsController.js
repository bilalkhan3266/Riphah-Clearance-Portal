const ClearanceRequest = require('../../models/ClearanceRequest_ENHANCED');

// Records Clearance Controller - Phase 2, 50% completion marker
exports.getRequirements = async (req, res) => {
  try {
    res.json({
      department: 'Records',
      phase: 2,
      completionPercentage: 50,
      requirements: [
        { item: 'Academic Records Complete', description: 'All academic records and grades recorded', verified: false },
        { item: 'No Outstanding Fines', description: 'No outstanding fines or record processing fees', verified: false },
        { item: 'Grades Submitted', description: 'All final grades and marks submitted', verified: false },
        { item: 'Transcripts Ready', description: 'Official transcripts and certificates ready for issuance', verified: false }
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
    if (!checklist.academicRecordsComplete || !checklist.noOutstandingFines || !checklist.gradesSubmitted) {
      return res.status(400).json({
        status: 'rejected',
        message: '❌ Records clearance incomplete - All academic records must be verified'
      });
    }

    // Update clearance request
    const clearance = await ClearanceRequest.findOneAndUpdate(
      { facultyId },
      {
        recordsStatus: 'approved',
        recordsApprovalDate: new Date(),
        completionPercentage: 50,
        currentPhase: 2
      },
      { new: true }
    );

    res.json({
      status: 'approved',
      message: '✅ Records clearance approved',
      phase: 2,
      nextSteps: ['proceed_to_phase_3_departments']
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
        recordsStatus: 'on-hold',
        recordsHoldReason: reason,
        recordsHoldDate: new Date()
      },
      { new: true }
    );

    res.json({
      status: 'on-hold',
      message: '❌ Records clearance placed on hold',
      reason: reason,
      instructions: 'Complete missing academic records and resubmit'
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
      department: 'Records',
      status: clearance.recordsStatus,
      approvalDate: clearance.recordsApprovalDate,
      holdReason: clearance.recordsHoldReason,
      completionPercentage: clearance.completionPercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
