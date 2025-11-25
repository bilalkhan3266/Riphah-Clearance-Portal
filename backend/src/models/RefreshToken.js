
// ==========================================
// models/RefreshToken.js
// ==========================================
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete expired tokens (TTL index)
  },
  createdByIp: {
    type: String
  },
  replacedByToken: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });

// Method to revoke token
refreshTokenSchema.methods.revoke = function(replacedByToken = null) {
  this.revoked = true;
  this.revokedAt = Date.now();
  if (replacedByToken) {
    this.replacedByToken = replacedByToken;
  }
  return this.save();
};

// Static method to cleanup old tokens for a user (keep last 5)
refreshTokenSchema.statics.cleanupOldTokens = async function(userId) {
  const tokens = await this.find({ userId })
    .sort({ createdAt: -1 })
    .skip(5);
  
  const tokenIds = tokens.map(t => t._id);
  await this.deleteMany({ _id: { $in: tokenIds } });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);


