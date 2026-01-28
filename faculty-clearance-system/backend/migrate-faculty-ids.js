require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrateFacultyIds() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected to MongoDB\n');

    // Find faculty users without faculty_id
    const facultyWithoutId = await User.find({
      role: 'faculty',
      $or: [
        { faculty_id: null },
        { faculty_id: undefined },
        { faculty_id: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${facultyWithoutId.length} faculty users without faculty_id\n`);

    if (facultyWithoutId.length === 0) {
      console.log('✅ All faculty users already have faculty_id set!');
      await mongoose.connection.close();
      return;
    }

    // For each faculty user without faculty_id, generate one based on email or name
    let updated = 0;
    for (const user of facultyWithoutId) {
      // Option 1: Use employee_id if available
      if (user.employee_id) {
        user.faculty_id = user.employee_id;
      } else {
        // Option 2: Generate from email (take part before @)
        const emailPrefix = user.email.split('@')[0].toUpperCase();
        user.faculty_id = emailPrefix;
      }

      await user.save();
      updated++;
      console.log(`  ✅ ${user.full_name} (${user.email}) → faculty_id: ${user.faculty_id}`);
    }

    console.log(`\n✅ Migration complete: Updated ${updated} faculty users`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrateFacultyIds();
