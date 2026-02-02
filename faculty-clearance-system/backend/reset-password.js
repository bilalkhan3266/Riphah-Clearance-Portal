const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/User');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    console.log('🔗 Connected to MongoDB\n');
    
    const email = 'ahmed@faculty.edu';
    const newPassword = 'Faculty@123';
    
    console.log(`🔄 Resetting password for ${email}...`);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    // Update password directly (pre-save hook should hash it)
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password updated successfully\n');
    
    // Verify it works
    const testMatch = await bcryptjs.compare(newPassword, user.password);
    console.log(`✅ Verification: Password matches = ${testMatch}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
