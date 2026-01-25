const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/faculty_clearance')
  .then(async () => {
    console.log('🔍 Checking for issues with user records...\n');

    try {
      // Test the exact query from the endpoint
      console.log('Testing: User.find({}).select("-password").lean()');
      const users = await User.find({}).select('-password').lean();
      console.log(`✅ Query successful! Found ${users.length} users\n`);

      // Check for potential issues
      console.log('Checking for problematic records...');
      
      let problemsFound = 0;
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        // Check for circular references or weird JSON
        if (typeof user !== 'object' || user === null) {
          console.log(`⚠️  User ${i}: Invalid object structure`);
          problemsFound++;
        }
        
        // Check for missing required fields
        if (!user._id || !user.email || !user.full_name) {
          console.log(`⚠️  User ${i}: Missing required fields`);
          problemsFound++;
        }
      }

      if (problemsFound === 0) {
        console.log('✅ No problematic records found\n');
      } else {
        console.log(`⚠️  Found ${problemsFound} problematic records\n`);
      }

      // Try to serialize to JSON (simulate response)
      console.log('Testing JSON serialization...');
      try {
        const json = JSON.stringify({ success: true, data: users });
        console.log(`✅ JSON serialization successful (${Math.round(json.length / 1024)}KB)`);
      } catch (err) {
        console.log(`❌ JSON serialization failed: ${err.message}`);
      }

    } catch (error) {
      console.log(`❌ Query error: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
