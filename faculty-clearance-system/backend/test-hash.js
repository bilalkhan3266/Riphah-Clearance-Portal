const bcryptjs = require('bcryptjs');

async function testHash() {
  const password = 'Faculty@123';
  const testPassword = 'Faculty@123';
  
  console.log('Testing bcryptjs hashing...\n');
  
  try {
    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    
    console.log(`Original password: ${password}`);
    console.log(`Generated hash: ${hash}\n`);
    
    // Test comparison
    const isMatch = await bcryptjs.compare(testPassword, hash);
    console.log(`Password "${testPassword}" matches hash: ${isMatch ? '✅ YES' : '❌ NO'}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testHash();
