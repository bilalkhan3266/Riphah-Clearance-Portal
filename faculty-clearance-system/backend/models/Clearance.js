const mongoose = require('mongoose');

const ClearanceSchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    facultyName: String,
    facultyEmail: String,
    department: String,
    submissionDate: {
      type: Date,
      default: Date.now
    },
    phases: [
      {
        name: {
          type: String,
          enum: ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Record', 'Admin', 'IT', 'ORIC', 'Warden', 'HOD', 'Dean'],
          required: true
        },
        status: {
          type: String,
          enum: ['Approved', 'Rejected', 'Pending'],
          default: 'Pending'
        },
        remarks: String,
        approvedDate: Date
      }
    ],
    overallStatus: {
      type: String,
      enum: ['Completed', 'Rejected', 'In Progress'],
      default: 'In Progress'
    },
    rejectedDepartments: [
      {
        name: String,
        reason: String
      }
    ],
    qrCode: {
      type: String,
      data: Buffer, // Base64 encoded QR code
      publicId: String
    },
    certificateUrl: {
      type: String,
      data: Buffer, // PDF binary
      publicId: String,
      generatedDate: Date
    },
    certificatePath: String, // Server file path
    completionDate: Date,
    verificationToken: {
      type: String,
      unique: true,
      sparse: true
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      submittedFrom: String
    }
  },
  {
    timestamps: true,
    collection: 'clearances'
  }
);

// Index for faster queries
ClearanceSchema.index({ facultyId: 1, createdAt: -1 });
ClearanceSchema.index({ 'phases.status': 1 });
ClearanceSchema.index({ overallStatus: 1 });

// Virtual for checking if clearance is complete
ClearanceSchema.virtual('isComplete').get(function() {
  return this.overallStatus === 'Completed';
});

// Virtual for pending departments count
ClearanceSchema.virtual('pendingDepartmentsCount').get(function() {
  return this.phases.filter(p => p.status === 'Rejected').length;
});

// Ensure virtuals are included in JSON
ClearanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Clearance', ClearanceSchema);
