// Finance Department Clearance Controller
// PHASE 2: Financial & HR (Day 2-3)
// What to Check: Dues, fees, ledger payments
// ⚠️ HIGH PRIORITY - Often causes delays

const financeChecklist = {
  name: 'Finance',
  phase: 2,
  percentage: 50,
  priority: 'HIGH', // Often delays other departments
  checks: {
    tuitionFeesPaid: {
      label: 'All tuition/lab fees paid?',
      required: true,
      type: 'checkbox'
    },
    noPendingDues: {
      label: 'No pending dues or charges?',
      required: true,
      type: 'checkbox'
    },
    advancesSettled: {
      label: 'All advances/loans settled?',
      required: true,
      type: 'checkbox'
    },
    expenseClaimsProcessed: {
      label: 'Expense claims processed and settled?',
      required: false,
      type: 'checkbox'
    }
  }
};

exports.getFinanceClearanceRequirements = (req, res) => {
  res.json({
    success: true,
    department: 'Finance',
    phase: 2,
    priority: 'HIGH',
    data: financeChecklist
  });
};

exports.approveFinanceClearance = async (req, res) => {
  try {
    const { facultyId, checklist, remarks, paymentDetails } = req.body;
    
    if (!checklist.tuitionFeesPaid || !checklist.noPendingDues || !checklist.advancesSettled) {
      return res.status(400).json({
        success: false,
        message: 'Faculty must have all fees paid and no outstanding dues'
      });
    }

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.finance = {
      status: 'approved',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || 'All financial obligations cleared',
      checklist: checklist,
      paymentDetails: paymentDetails
    };
    await clearance.save();

    res.json({
      success: true,
      message: 'Finance clearance approved - Faculty has no outstanding dues'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectFinanceClearance = async (req, res) => {
  try {
    const { facultyId, outstandingAmount, remarks } = req.body;

    const clearance = await ClearanceRequest.findOne({ faculty_id: facultyId });
    clearance.clearanceStatuses.finance = {
      status: 'rejected',
      signedBy: req.user.name,
      signatureDate: new Date(),
      remarks: remarks || `Outstanding amount: ${outstandingAmount}`
    };
    clearance.isOnHold = true;
    clearance.holdReason = `Finance: Outstanding amount of ${outstandingAmount}. Reason: ${remarks}`;
    await clearance.save();

    res.json({
      success: true,
      message: 'Finance clearance rejected - Outstanding dues must be paid',
      outstandingAmount: outstandingAmount,
      instructions: 'Faculty must pay the outstanding amount and resubmit for approval'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
