const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function fixUserIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected\n');

    // Get all indexes
    const indexes = await User.collection.getIndexes();
    console.log('📋 Current User indexes:');
    Object.keys(indexes).forEach(key => {
      console.log(`   - ${key}:`, indexes[key]);
    });

    // Drop and recreate unique non-sparse indexes
    const indexesToFix = ['faculty_id_1', 'employee_id_1'];
    for (const indexName of indexesToFix) {
      if (indexes[indexName]) {
        console.log(`\n🗑️  Dropping index: ${indexName}`);
        await User.collection.dropIndex(indexName);
        console.log(`   ✅ Dropped`);
      }
    }

    // Recreate with sparse option
    console.log('\n➕ Creating sparse indexes...');
    await User.collection.createIndex({ faculty_id: 1 }, { unique: true, sparse: true });
    console.log('   ✅ faculty_id sparse index created');
    
    await User.collection.createIndex({ employee_id: 1 }, { unique: true, sparse: true });
    console.log('   ✅ employee_id sparse index created');

    const newIndexes = await User.collection.getIndexes();
    console.log('\n📋 Updated User indexes:');
    Object.keys(newIndexes).forEach(key => {
      console.log(`   - ${key}:`, newIndexes[key]);
    });

    console.log('\n✅ User indexes fixed!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

fixUserIndexes();
