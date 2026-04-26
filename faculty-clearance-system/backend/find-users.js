/**
 * Find valid test users
 */

const mongoose = require('mongoose');

async function findUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');

    const User = require('./models/User');
    
    console.log('\n📋 All Users in Database:');
    console.log('─'.repeat(60));

    const users = await User.find({}).select('email role full_name');
    
    if (users.length === 0) {
      console.log('❌ No users found!');
    } else {
      users.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.email.padEnd(30)} | Role: ${(user.role || 'N/A').padEnd(15)}`);
      });
    }

    console.log('\n✅ Test these credentials:');
    console.log('   Password: Test@123');
    console.log('\nUsage: node critical-api-diagnostic-2.js EMAIL\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findUsers();
