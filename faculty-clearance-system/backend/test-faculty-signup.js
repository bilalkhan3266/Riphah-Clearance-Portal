require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/User');

async function testSignupFix() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected to MongoDB');

    // Check existing faculty user
    const existingFacultyUser = await User.findOne({ role: 'faculty' });
    if (existingFacultyUser) {
      console.log('\n📍 Existing Faculty User:');
      console.log('  Full Name:', existingFacultyUser.full_name);
      console.log('  Email:', existingFacultyUser.email);
      console.log('  Employee ID:', existingFacultyUser.employee_id);
      console.log('  Faculty ID:', existingFacultyUser.faculty_id);
      console.log('  Both IDs Match:', existingFacultyUser.faculty_id === existingFacultyUser.employee_id);
    }

    // Create a test faculty user to verify signup fix
    const testEmail = `test-faculty-${Date.now()}@test.edu`;
    const testEmployeeId = `EMP-${Date.now()}`;
    
    console.log('\n🆕 Creating Test Faculty User:');
    console.log('  Email:', testEmail);
    console.log('  Employee ID:', testEmployeeId);

    const newUser = new User({
      full_name: 'Test Faculty',
      email: testEmail,
      password: await bcryptjs.hash('Password123', 10),
      employee_id: testEmployeeId.toUpperCase(),
      faculty_id: testEmployeeId.toUpperCase(),  // This is what signup route now does
      role: 'faculty',
      designation: 'Associate Professor',
      department: 'Computer Science',
      verified: true
    });

    await newUser.save();
    console.log('✅ Test user created successfully');

    const savedUser = await User.findById(newUser._id);
    console.log('\n📊 Saved User Verification:');
    console.log('  Employee ID:', savedUser.employee_id);
    console.log('  Faculty ID:', savedUser.faculty_id);
    console.log('  IDs Match:', savedUser.faculty_id === savedUser.employee_id);

    // Cleanup
    await User.deleteOne({ _id: newUser._id });
    console.log('\n✅ Test completed and cleaned up');

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testSignupFix();
