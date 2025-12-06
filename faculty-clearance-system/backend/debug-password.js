const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/User');

async function debugLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    console.log('🔗 Connected to MongoDB\n');
    
    // Find user
    const email = 'ahmed@faculty.edu';
    const password = 'Faculty@123';
    
    console.log(`👤 Looking for user: ${email}\n`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found in database');
      process.exit(1);
    }
    
    console.log('✅ User found!');
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...\n`);
    
    // Test password comparison
    console.log(`🔑 Testing password comparison...`);
    console.log(`   Provided password: ${password}`);
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log(`   Password matches: ${isMatch ? '✅ YES' : '❌ NO'}\n`);
    
    if (!isMatch) {
      // Try with different password casings
      console.log('🔍 Testing other password variations...');
      const variations = ['faculty@123', 'FACULTY@123', 'Faculty@123', 'faculty123', 'Faulty@123'];
      for (const pwd of variations) {
        const match = await bcryptjs.compare(pwd, user.password);
        if (match) {
          console.log(`   ✅ Found working password: ${pwd}`);
          break;
        }
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

debugLogin();
