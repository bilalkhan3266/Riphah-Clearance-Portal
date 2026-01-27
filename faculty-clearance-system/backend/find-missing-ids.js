const mongoose = require('mongoose');

async function findMissingIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    
    const db = mongoose.connection.db;
    const users = await db.collection('users').find(
      { faculty_id: { $in: [null, ''] } }
    ).project({
      _id: 1,
      full_name: 1,
      faculty_id: 1,
      role: 1,
      department: 1,
      employee_id: 1
    }).toArray();
    
    console.log('\n📋 Faculty Records with Missing Faculty IDs:\n');
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.full_name}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Employee ID: ${user.employee_id || 'N/A'}`);
      console.log(`   Faculty ID: ${user.faculty_id || 'EMPTY'}`);
      console.log('');
    });
    
    console.log(`\nTotal records with missing faculty_id: ${users.length}`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

findMissingIds();
