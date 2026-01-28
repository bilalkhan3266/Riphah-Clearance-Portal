const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fixUserIndexesProperly() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected\n');

    // Check current documents with null faculty_id
    const nullFaculty = await User.find({ faculty_id: null });
    console.log('Documents with null faculty_id:', nullFaculty.length);
    nullFaculty.forEach(u => console.log('  -', u.email, 'faculty_id:', u.faculty_id));

    // Update them to remove the field entirely (not set to null)
    if (nullFaculty.length > 0) {
      await User.updateMany({ faculty_id: null }, { $unset: { faculty_id: '' } });
      console.log('\n✅ Removed null faculty_id values');
    }

    // Drop all indexes except _id
    const indexes = await User.collection.getIndexes();
    console.log('\nDropping old indexes:');
    for (const indexName of Object.keys(indexes)) {
      if (indexName !== '_id_') {
        try {
          await User.collection.dropIndex(indexName);
          console.log('  ✅ Dropped:', indexName);
        } catch (e) {
          console.log('  ℹ️ Could not drop:', indexName, '-', e.message);
        }
      }
    }

    // Recreate with sparse
    console.log('\nCreating indexes:');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✅ email index');
    
    await User.collection.createIndex({ faculty_id: 1 }, { unique: true, sparse: true });
    console.log('  ✅ faculty_id sparse index');
    
    await User.collection.createIndex({ employee_id: 1 }, { unique: true, sparse: true });
    console.log('  ✅ employee_id sparse index');

    // Verify
    const newIndexes = await User.collection.getIndexes();
    console.log('\n✅ Final indexes:', Object.keys(newIndexes).join(', '));

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

fixUserIndexesProperly();
