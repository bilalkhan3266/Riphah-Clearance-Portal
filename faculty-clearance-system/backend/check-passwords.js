/**
 * Check user password fields
 */

const mongoose = require('mongoose');

async function checkPasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');

    const User = require('./models/User');
    
    console.log('\n📝 User Password Fields:');
    console.log('─'.repeat(70));

    const users = await User.find({}).select('email password role');
    
    users.forEach(user => {
      const passwordStatus = user.password 
        ? `EXISTS (${user.password.substring(0, 20)}...)`
        : 'MISSING';
      console.log(`${user.email.padEnd(30)} | ${passwordStatus}`);
    });

    console.log('\n🔐 Password Analysis:');
    console.log('─'.repeat(70));

    const withPassword = users.filter(u => u.password);
    const withoutPassword = users.filter(u => !u.password);

    console.log(`Users WITH password: ${withPassword.length}`);
    console.log(`Users WITHOUT password: ${withoutPassword.length}`);

    if (withoutPassword.length > 0) {
      console.log('\n❌ PROBLEM: Some users have no password!');
      console.log('   These users cannot login');
      console.log('\n🔧 Solution: Set passwords for these users');
    }

    if (withPassword.length > 0) {
      console.log('\nFirst user password hash:');
      console.log(withPassword[0].password);
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPasswords();
