const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/faculty_clearance')
  .then(async () => {
    console.log('Checking for test users...\n');
    
    const user = await User.findOne({ email: 'ahmed@faculty.edu' });
    if (user) {
      console.log('✅ Faculty user found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.full_name);
      console.log('   Role:', user.role);
      console.log('   Has password:', !!user.password);
    } else {
      console.log('❌ Faculty user not found at ahmed@faculty.edu');
    }
    
    // Check department staff
    const libStaff = await User.findOne({ email: 'ahmed@library.edu' });
    if (libStaff) {
      console.log('\n✅ Library staff found:');
      console.log('   Email:', libStaff.email);
      console.log('   Name:', libStaff.full_name);
      console.log('   Role:', libStaff.role);
      console.log('   Has password:', !!libStaff.password);
    } else {
      console.log('\n❌ Library staff not found at ahmed@library.edu');
    }
    
    // List all users by role
    console.log('\n📋 Users by role:');
    const faculty = await User.countDocuments({ role: 'faculty' });
    const departmentStaff = await User.countDocuments({ role: { $ne: 'faculty' } });
    console.log(`   Faculty: ${faculty}`);
    console.log(`   Department Staff: ${departmentStaff}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
