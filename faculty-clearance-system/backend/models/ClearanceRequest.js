const mongoose = require('mongoose');

// Department status sub-schema
const departmentStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  checked_at: Date,
  approved_by: String,
  rejected_by: String,
  remarks: String,
  phase: String,
  checklist: mongoose.Schema.Types.Mixed,
  // Issue-based auto verification fields
  rejectionReason: String, // Detailed reason for rejection
  rejectionType: String, // Type: PENDING_ITEMS, MANUAL, etc.
  pendingItems: [ // Array of pending issued items
    {
      itemName: String,
      itemType: String,
      quantity: Number,
      issuedDate: Date,
      dueDate: Date,
      _id: false
    }
  ]
}, { _id: false });

const clearanceRequestSchema = new mongoose.Schema({
  // Faculty Information
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty_name: { type: String, required: true },
  email: String,
  designation: String,
  office_location: String,
  contact_number: String,
  degree_status: String,
  
  // Request Information
  department: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cleared'],
    default: 'Pending'
  },
  
  // Phase Management
  current_phase: {
    type: String,
    enum: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
    default: 'Phase 1'
  },
  overall_status: {
    type: String,
    enum: ['In Progress', 'Cleared'],
    default: 'In Progress'
  },
  
  // Department-wise Approvals
  departments: {
    Lab: departmentStatusSchema,
    Library: departmentStatusSchema,
    Pharmacy: departmentStatusSchema,
    Finance: departmentStatusSchema,
    HR: departmentStatusSchema,
    Records: departmentStatusSchema,
    IT: departmentStatusSchema,
    ORIC: departmentStatusSchema,
    Admin: departmentStatusSchema,
    Warden: departmentStatusSchema,
    HOD: departmentStatusSchema,
    Dean: departmentStatusSchema
  },
  
  // QR Code & Final Approval
  qr_code: String,
  cleared_at: Date,
  
  // Issue-based tracking
  has_pending_items: {
    type: Boolean,
    default: false
  },
  pending_items: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      department: String,
      itemDescription: String,
      itemType: String,
      reportedDate: Date,
      createdAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
      },
      resolved: Boolean,
      resolvedDate: Date,
      resolutionNotes: String
    }
  ],
  pending_items_details: mongoose.Schema.Types.Mixed,
  
  // Metadata
  submitted_at: { type: Date, default: Date.now },
  resubmitted_at: Date,
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
clearanceRequestSchema.index({ faculty_id: 1, created_at: -1 });
clearanceRequestSchema.index({ current_phase: 1, 'departments.Library.status': 1 });
clearanceRequestSchema.index({ overall_status: 1 });
clearanceRequestSchema.index({ created_at: -1 });

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);
