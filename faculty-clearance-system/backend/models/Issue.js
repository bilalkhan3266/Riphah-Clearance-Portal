const mongoose = require('mongoose');

/**
 * SIMPLE ISSUE SCHEMA
 * Tracks items issued to faculty and their return status
 */
const IssueSchema = new mongoose.Schema(
  {
    // Faculty ID - CRITICAL for clearance checking
    facultyId: {
      type: String,
      required: true,
      index: true
    },

    facultyName: {
      type: String,
      default: null
    },

    facultyEmail: {
      type: String,
      default: null
    },
    
    // Department (Lab, Library, Pharmacy, etc)
    departmentName: {
      type: String,
      required: true,
      enum: ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'],
      index: true
    },
    
    // Item Type
    itemType: {
      type: String,
      required: true
    },

    // Description of the issue
    description: {
      type: String,
      required: true
    },

    // Quantity of items
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    // Due date for return
    dueDate: {
      type: Date,
      default: null
    },

    // Additional notes
    notes: {
      type: String,
      default: null
    },

    // Issue reference number
    issueReferenceNumber: {
      type: String,
      unique: true,
      sparse: true
    },

    // Staff who issued the item
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // Status: Issued, Cleared, Pending, Partially Returned
    status: {
      type: String,
      enum: ['Issued', 'Cleared', 'Pending', 'Partially Returned'],
      default: 'Issued',
      index: true
    },
    
    // Dates
    issueDate: {
      type: Date,
      default: Date.now
    },
    
    returnDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance and clearance checking
IssueSchema.index({ facultyId: 1 });
IssueSchema.index({ facultyId: 1, departmentName: 1 });
IssueSchema.index({ facultyId: 1, status: 1 });
IssueSchema.index({ departmentName: 1, status: 1 });
IssueSchema.index({ issueDate: -1 });

module.exports = mongoose.model('Issue', IssueSchema);
