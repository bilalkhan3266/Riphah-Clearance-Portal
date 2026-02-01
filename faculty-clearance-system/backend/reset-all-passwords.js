const mongoose = require('mongoose');
const User = require('./models/User');

async function resetAllPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    console.log('🔗 Connected to MongoDB\n');
    
    const password = 'Faculty@123';
    
    // Reset all faculty passwords
    console.log('🔄 Resetting all faculty passwords...\n');
    const faculty = await User.find({ role: 'faculty' });
    
    for (const user of faculty) {
      user.password = password;
      await user.save();
      console.log(`✅ Updated: ${user.full_name} (${user.email})`);
    }
    
    console.log('\n✅ All faculty passwords reset successfully!');
    
    // Reset all department staff passwords
    console.log('\n🔄 Resetting all department staff passwords...\n');
    const deptPassword = 'Department@123';
    const deptStaff = await User.find({ role: { $ne: 'faculty' } });
    
    for (const user of deptStaff) {
      user.password = deptPassword;
      await user.save();
      console.log(`✅ Updated: ${user.full_name} (${user.email})`);
    }
    
    console.log('\n✅ All department staff passwords reset successfully!');
    console.log('\n📚 Summary:');
    console.log(`   Faculty (${faculty.length}): Password = Faculty@123`);
    console.log(`   Department (${deptStaff.length}): Password = Department@123`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAllPasswords();
