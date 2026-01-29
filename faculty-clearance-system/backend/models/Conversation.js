const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Participants (optional for admin broadcasts, required for faculty conversations)
  faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  
  faculty_name: {
    type: String,
    required: false
  },
  
  faculty_email: {
    type: String,
    required: false,
    lowercase: true
  },
  
  department: {
    type: String,
    required: false,
    index: true
  },
  
  // For admin broadcasts/messages
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  
  department_email: {
    type: String,
    lowercase: true
  },
  
  // Conversation metadata
  subject: {
    type: String,
    default: 'Clearance Discussion'
  },
  
  description: {
    type: String
  },
  
  // Message tracking
  message_count: {
    type: Number,
    default: 0
  },
  
  unread_by_faculty: {
    type: Number,
    default: 0
  },
  
  unread_by_department: {
    type: Number,
    default: 0
  },
  
  // Last message info
  last_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  last_message_at: {
    type: Date,
    default: null,
    index: true
  },
  
  last_message_preview: {
    type: String,
    default: null
  },
  
  last_message_sender_role: {
    type: String,
    enum: ['faculty', 'department'],
    default: null
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'archived', 'resolved', 'closed'],
    default: 'active',
    index: true
  },
  
  // Related clearance request (if any)
  clearance_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClearanceRequest_ENHANCED',
    default: null
  },
  
  // Participants list
  participants: [{
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    role: String,
    joined_at: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Pins and important markers
  is_pinned: {
    type: Boolean,
    default: false
  },
  
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
  
  archived_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound indexes for efficient querying
conversationSchema.index({ faculty_id: 1, department: 1 });  // Removed unique constraint to allow broadcasts
conversationSchema.index({ faculty_id: 1, last_message_at: -1 });
conversationSchema.index({ department: 1, last_message_at: -1 });
conversationSchema.index({ status: 1, updated_at: -1 });
conversationSchema.index({ faculty_id: 1, status: 1 });

// Pre-save middleware
conversationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Instance method to add participant
conversationSchema.methods.addParticipant = function(userId, name, email, role) {
  const existingParticipant = this.participants.find(p => p.user_id?.toString() === userId?.toString());
  if (!existingParticipant) {
    this.participants.push({
      user_id: userId,
      name,
      email,
      role,
      joined_at: new Date()
    });
  }
  return this;
};

// Instance method to get unread count for user
conversationSchema.methods.getUnreadCount = function(userId, userRole) {
  if (userRole === 'faculty') {
    return this.unread_by_faculty;
  } else {
    return this.unread_by_department;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);
