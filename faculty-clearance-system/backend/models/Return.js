const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      index: true
    },
    facultyName: String,
    facultyEmail: String,
    departmentName: {
      type: String,
      enum: ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'Admin', 'IT', 'ORIC', 'Warden', 'HOD', 'Dean'],
      required: true,
      index: true
    },
    referenceIssueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true
    },
    issueReferenceNumber: String,
    itemType: {
      type: String,
      required: true
    },
    quantityReturned: {
      type: Number,
      required: true,
      default: 1
    },
    returnDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Returned', 'Cleared', 'Partial Return'],
      default: 'Returned'
    },
    condition: {
      type: String,
      enum: ['Good', 'Fair', 'Damaged', 'Lost'],
      default: 'Good'
    },
    receivedBy: {
      type: String, // Department staff ID
      default: null
    },
    verifiedBy: String
  },
  {
    timestamps: true,
    discriminatorKey: 'departmentName',
    strictPopulate: false
  }
);

// Indexes for performance
ReturnSchema.index({ facultyId: 1, departmentName: 1 });
ReturnSchema.index({ referenceIssueId: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ returnDate: -1 });
ReturnSchema.index({ facultyId: 1, status: 1 });

module.exports = mongoose.model('Return', ReturnSchema);
