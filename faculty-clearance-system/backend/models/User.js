const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  faculty_id: { 
    type: String, 
    // unique: true,  // Commented out due to sparse index issues with null values
    sparse: true,
    uppercase: true,
    default: null
  },
  employee_id: {
    type: String,
    // unique: true,  // Commented out due to sparse index issues with null values
    sparse: true,
    default: null
  },
  role: { 
    type: String, 
    enum: ['faculty', 'admin', 'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'],
    default: 'faculty' 
  },
  designation: String,
  department: String,
  office_location: String,
  verified: { type: Boolean, default: false },
  verification_code: String,
  reset_code: String,
  reset_code_expires: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
