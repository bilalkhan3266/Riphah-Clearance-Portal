const mongoose = require('mongoose');

async function assignMissingIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    
    const db = mongoose.connection.db;
    
    // Get all users with missing faculty_id
    const users = await db.collection('users').find(
      { faculty_id: { $in: [null, ''] } }
    ).toArray();
    
    console.log(`\nAssigning faculty_id to ${users.length} records...\n`);
    
    let updated = 0;
    for (let idx = 0; idx < users.length; idx++) {
      const user = users[idx];
      let newId;
      
      // Priority 1: Use employee_id if available
      if (user.employee_id && user.employee_id.trim()) {
        newId = user.employee_id.toString();
      } 
      // Priority 2: Generate ID based on role
      else if (user.role) {
        const deptCode = (user.department || user.role || 'STAFF').substring(0, 3).toUpperCase();
        // Use index to ensure uniqueness
        const uniqueSuffix = String(1000 + idx).substring(1); // Generates 001-999
        newId = `${deptCode}${uniqueSuffix}`;
      } 
      // Priority 3: Generate ID based on name
      else {
        const nameCode = (user.full_name || 'USER').substring(0, 2).toUpperCase();
        const uniqueSuffix = String(1000 + idx).substring(1);
        newId = `${nameCode}${uniqueSuffix}`;
      }
      
      const result = await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { faculty_id: newId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated "${user.full_name}" (${user.role}) -> ID: ${newId}`);
        updated++;
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} records\n`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

assignMissingIds();
