const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/Conversation');

async function migrateIndex() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected to MongoDB');

    // Get all indexes
    const indexes = await Conversation.collection.getIndexes();
    console.log('\n📋 Current indexes:');
    Object.keys(indexes).forEach(key => {
      console.log(`   - ${key}:`, indexes[key]);
    });

    // Drop the old non-sparse unique index if it exists
    if (indexes['faculty_id_1_department_1']) {
      console.log('\n🗑️  Dropping old unique index: faculty_id_1_department_1');
      await Conversation.collection.dropIndex('faculty_id_1_department_1');
      console.log('   ✅ Old index dropped');
    }

    // Create the new sparse unique index
    console.log('\n➕ Creating new sparse unique index...');
    await Conversation.collection.createIndex(
      { faculty_id: 1, department: 1 },
      { unique: true, sparse: true }
    );
    console.log('   ✅ New sparse index created');

    // Show new indexes
    const newIndexes = await Conversation.collection.getIndexes();
    console.log('\n📋 Updated indexes:');
    Object.keys(newIndexes).forEach(key => {
      console.log(`   - ${key}:`, newIndexes[key]);
    });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateIndex();
