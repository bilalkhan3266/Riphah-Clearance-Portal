const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message content and metadata
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  sender_name: {
    type: String,
    required: true
  },
  
  sender_role: {
    type: String,
    enum: ['faculty', 'admin', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'],
    required: true
  },
  
  sender_email: {
    type: String,
    required: true
  },
  
  subject: {
    type: String,
    default: 'No Subject'
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // For replies - link to parent message
  reply_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
    index: true
  },
  
  // Message type
  type: {
    type: String,
    enum: ['message', 'reply'],
    default: 'message'
  },
  
  // Read status for recipients
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  read_by: [{
    user_id: mongoose.Schema.Types.ObjectId,
    read_at: Date
  }],
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  },
  
  // Attachments (for future use)
  attachments: [{
    filename: String,
    url: String,
    uploaded_at: Date
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index for efficient querying
messageSchema.index({ conversation_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1, created_at: -1 });
messageSchema.index({ conversation_id: 1, is_read: 1 });

// Pre-save middleware to update updated_at
messageSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Message', messageSchema);
