// ==========================================
// models/AuditLog.js
// ==========================================
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.action !== 'register'; // userId not available during registration
    }
  },
  action: {
    type: String,
    required: true,
    enum: [
      'register',
      'login_success',
      'login_failed',
      'logout',
      'token_refresh',
      'password_reset_request',
      'password_reset_complete',
      'account_locked',
      'role_changed'
    ]
  },
  email: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Store additional context
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ email: 1, createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.log = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break app flow
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);