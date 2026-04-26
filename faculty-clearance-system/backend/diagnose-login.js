const mongoose = require('mongoose');
const User = require('./models/User');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

async function diagnoseLoginIssues() {
  try {
    await mongoose.connect(mongoUrl, { connectTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 LOGIN AUTHENTICATION DIAGNOSTICS');
    console.log('='.repeat(80));

    // Check total users
    const totalUsers = await User.countDocuments({});
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // Check faculty users
    const facultyUsers = await User.countDocuments({ role: 'faculty' });
    console.log(`👥 Faculty users: ${facultyUsers}`);

    // List all users
    console.log('\n📋 ALL USERS IN DATABASE:');
    console.log('─'.repeat(80));
    
    const users = await User.find({}).select('email full_name role department');
    
    if (users.length === 0) {
      console.log('   ⚠️  No users found in database!');
      console.log('\n   🔧 TO FIX: Run the seed-test-users.js script');
      console.log('   Command: node seed-test-users.js\n');
    } else {
      users.forEach((user, idx) => {
        console.log(`   ${idx + 1}. Email: ${user.email}`);
        console.log(`      Name: ${user.full_name}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Department: ${user.department || 'N/A'}\n`);
      });
    }

    // Test credentials
    console.log('🧪 AVAILABLE TEST CREDENTIALS:');
    console.log('─'.repeat(80));
    
    if (users.length > 0) {
      console.log('\n   ✅ Login with any of these:');
      users.forEach((user, idx) => {
        console.log(`   ${idx + 1}. Email: ${user.email}`);
        console.log(`      Password: Test@123`);
      });
    } else {
      console.log('   ❌ No test users available');
    }

    // Show login endpoint info
    console.log('\n📡 LOGIN ENDPOINT INFORMATION:');
    console.log('─'.repeat(80));
    console.log('   URL: POST http://localhost:5001/api/login');
    console.log('   Content-Type: application/json');
    console.log('\n   Request Body Format:');
    console.log('   {');
    console.log('     "email": "faculty1@test.edu",');
    console.log('     "password": "Test@123"');
    console.log('   }');
    console.log('\n   Expected Response (Success):');
    console.log('   {');
    console.log('     "success": true,');
    console.log('     "message": "Login successful",');
    console.log('     "token": "eyJhbGci...",');
    console.log('     "user": { ... }');
    console.log('   }');

    // Common 401 causes
    console.log('\n❌ COMMON 401 UNAUTHORIZED CAUSES:');
    console.log('─'.repeat(80));
    console.log('   1. User not found - email doesn\'t exist in database');
    console.log('   2. Wrong password - credentials don\'t match');
    console.log('   3. Missing request body - email/password not sent');
    console.log('   4. Wrong Content-Type - should be application/json');
    console.log('   5. No users seeded - run seed-test-users.js first');

    // Verification steps
    console.log('\n✅ TROUBLESHOOTING STEPS:');
    console.log('─'.repeat(80));
    console.log('   Step 1: Verify users exist');
    console.log('           → Run this script to check: node diagnose-login.js');
    console.log('\n   Step 2: Seed test users (if none found)');
    console.log('           → Run: node seed-test-users.js');
    console.log('\n   Step 3: Test login with correct credentials');
    console.log('           → POST to http://localhost:5001/api/login');
    console.log('           → Body: {"email":"faculty1@test.edu","password":"Test@123"}');
    console.log('\n   Step 4: Check backend logs');
    console.log('           → Look for 401 reasons in terminal running npm run dev');

    console.log('\n');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

diagnoseLoginIssues();
