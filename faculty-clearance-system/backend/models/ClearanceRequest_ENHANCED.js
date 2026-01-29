const mongoose = require('mongoose');

// Enhanced ClearanceRequest model with all 12 departments
const clearanceRequestSchema = new mongoose.Schema({
  faculty_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  faculty_name: String,
  faculty_email: String,
  department: String,
  designation: String,
  
  // Clearance Status for all 12 departments
  clearanceStatuses: {
    // PHASE 1: Library & Physical Assets
    library: {
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
      },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        booksReturned: Boolean,
        finesPaid: Boolean,
        libraryIdReturned: Boolean,
        onlineResourcesDeactivated: Boolean
      }
    },
    
    lab: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        equipmentInventoried: Boolean,
        safetyProtocolsComplete: Boolean,
        labKeyReturned: Boolean,
        chemicalDisposalDone: Boolean
      }
    },
    
    pharmacy: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        medicationStocksCounted: Boolean,
        equipmentsReturned: Boolean,
        accessCardReturned: Boolean
      }
    },
    
    // PHASE 2: Financial & HR
    hr: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        finalSalaryProcessed: Boolean,
        leaveBalanceSettled: Boolean,
        advanceRepaymentCleared: Boolean,
        serviceContractFinalized: Boolean
      }
    },
    
    finance: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        tuitionFeesPaid: Boolean,
        noPendingDues: Boolean,
        advancesSettled: Boolean,
        expenseClaimsProcessed: Boolean,
        accessCardsReturned: Boolean
      }
    },
    
    records: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        finalGradesSubmitted: Boolean,
        thesisSubmitted: Boolean,
        transcriptsGenerated: Boolean,
        degreeRequirementsComplete: Boolean
      }
    },
    
    // PHASE 3: Operational & Administrative
    it: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        emailClosed: Boolean,
        networkLoginDeactivated: Boolean,
        systemAccessRevoked: Boolean,
        computerReturned: Boolean,
        vpnAccessDisabled: Boolean
      }
    },
    
    admin: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        officeKeysReturned: Boolean,
        accessCardsReturned: Boolean,
        officeEquipmentReturned: Boolean,
        parkingPermitCancelled: Boolean
      }
    },
    
    oric: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        researchProjectsClosed: Boolean,
        publicationsFinalized: Boolean,
        intellectualPropertyResolved: Boolean,
        labMaterialsTransferred: Boolean
      }
    },
    
    // PHASE 4: Faculty Authority
    warden: {
      status: { type: String, enum: ['pending', 'approved', 'rejected', 'not-applicable'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      checklist: {
        hostelRoomVacated: Boolean,
        hostelDuesCleared: Boolean,
        roomKeysReturned: Boolean,
        furnitureReturned: Boolean,
        securityDepositRefunded: Boolean
      }
    },
    
    hod: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      notes: String,
      allPreviousClearancesReceived: Boolean,
      checklist: {
        departmentalVerification: Boolean,
        pendingCommitteesCleared: Boolean,
        departmentAssetsReturned: Boolean,
        allDocumentsCollected: Boolean
      }
    },
    
    dean: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      signedBy: String,
      approverEmail: String,
      signatureDate: Date,
      remarks: String,
      notes: String,
      degreeConferred: Boolean,
      checklist: {
        allDepartmentsClearanceVerified: Boolean,
        hodClearanceReceived: Boolean,
        noInstitutionalHolds: Boolean,
        graduationEligibilityConfirmed: Boolean,
        finalSignatureApproved: Boolean
      }
    }
  },
  
  // Overall tracking
  overallStatus: {
    type: String,
    enum: ['in-progress', 'completed', 'on-hold', 'rejected'],
    default: 'in-progress'
  },
  
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  currentPhase: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // 1=physical, 2=financial, 3=operational, 4=authority, 5=complete
    default: 1
  },
  
  // Tracking dates
  submissionDate: { type: Date, default: Date.now },
  completionDate: Date,
  expectedCompletionDate: Date,
  
  // Notes & history
  internalNotes: String,
  clearanceHistory: [{
    department: String,
    action: String, // 'submitted', 'approved', 'rejected', 'resubmitted'
    timestamp: Date,
    by: String
  }],
  
  // Flags
  isOnHold: { type: Boolean, default: false },
  holdReason: String,
  requiresResubmission: { type: Boolean, default: false },
  resubmissionReason: String,
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware to automatically calculate completion percentage
clearanceRequestSchema.pre('save', function(next) {
  const clearanceStatuses = this.clearanceStatuses;
  const departments = Object.keys(clearanceStatuses);
  
  let approvedCount = 0;
  let notApplicableCount = 0;
  
  departments.forEach(dept => {
    if (clearanceStatuses[dept].status === 'approved') {
      approvedCount++;
    } else if (clearanceStatuses[dept].status === 'not-applicable') {
      notApplicableCount++;
    }
  });
  
  const totalApplicable = departments.length - notApplicableCount;
  this.completionPercentage = Math.round((approvedCount / totalApplicable) * 100);
  
  // Update overall status
  if (this.completionPercentage === 100) {
    this.overallStatus = 'completed';
    this.completionDate = new Date();
  }
  
  // Update current phase based on which departments are cleared
  const phase1Clear = clearanceStatuses.library.status === 'approved' && 
                      clearanceStatuses.lab.status === 'approved';
  const phase2Clear = phase1Clear && 
                      clearanceStatuses.hr.status === 'approved' && 
                      clearanceStatuses.finance.status === 'approved' &&
                      clearanceStatuses.records.status === 'approved';
  const phase3Clear = phase2Clear && 
                      clearanceStatuses.it.status === 'approved' && 
                      clearanceStatuses.admin.status === 'approved' &&
                      clearanceStatuses.oric.status === 'approved';
  const phase4Clear = phase3Clear && 
                      clearanceStatuses.hod.status === 'approved';
  
  if (clearanceStatuses.dean.status === 'approved') {
    this.currentPhase = 5;
  } else if (phase4Clear) {
    this.currentPhase = 4;
  } else if (phase3Clear) {
    this.currentPhase = 3;
  } else if (phase2Clear) {
    this.currentPhase = 2;
  } else {
    this.currentPhase = 1;
  }
  
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);
