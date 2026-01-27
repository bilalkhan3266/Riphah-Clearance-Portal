/**
 * FIX: Drop old unique index and recreate as non-unique
 * This fixes the E11000 duplicate key error on broadcast messages
 * 
 * Run: node fix-conversations-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty_clearance';

async function fixConversationsIndex() {
  try {
    console.log('🔧 Starting index fix for conversations collection...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const conversationsCollection = db.collection('conversations');

    // Step 1: List existing indexes
    console.log('📋 Listing existing indexes on conversations collection:\n');
    const existingIndexes = await conversationsCollection.indexes();
    
    existingIndexes.forEach((index, i) => {
      console.log(`   ${i}. ${JSON.stringify(index.key)} - ${index.unique ? '🔒 UNIQUE' : '🔓 NON-UNIQUE'}`);
    });
    console.log();

    // Step 2: Find and drop the old unique index
    const oldIndexName = 'faculty_id_1_department_1';
    const hasOldIndex = existingIndexes.some(idx => idx.name === oldIndexName && idx.unique);
    
    if (hasOldIndex) {
      console.log(`⚠️  Found old unique index: ${oldIndexName}`);
      console.log('   Dropping it...\n');
      
      await conversationsCollection.dropIndex(oldIndexName);
      console.log(`   ✅ Dropped index: ${oldIndexName}\n`);
    } else {
      console.log(`ℹ️  Old unique index not found (might already be fixed)\n`);
    }

    // Step 3: Recreate as non-unique index
    console.log('Creating new non-unique compound index...\n');
    
    await conversationsCollection.createIndex(
      { faculty_id: 1, department: 1 },
      { unique: false }  // Non-unique allows multiple null combinations
    );
    
    console.log('   ✅ Created: { faculty_id: 1, department: 1 } (NON-UNIQUE)\n');

    // Step 4: Verify the fix
    console.log('📋 Updated indexes on conversations collection:\n');
    const updatedIndexes = await conversationsCollection.indexes();
    
    updatedIndexes.forEach((index, i) => {
      console.log(`   ${i}. ${JSON.stringify(index.key)} - ${index.unique ? '🔒 UNIQUE' : '🔓 NON-UNIQUE'}`);
    });

    console.log('\n✅ INDEX FIX COMPLETE!');
    console.log('\n📝 Summary:');
    console.log('   • Dropped unique constraint on (faculty_id, department)');
    console.log('   • Created non-unique compound index for query efficiency');
    console.log('   • Broadcast messages can now have null values without E11000 error');
    console.log('\n▶️  You can now send broadcast messages without errors!\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during index fix:');
    console.error(error.message);
    
    if (error.message.includes('index not found')) {
      console.log('\nℹ️  Note: Index might already be non-unique or doesn\'t exist.');
      console.log('   This is okay - broadcast should work fine now.\n');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    process.exit(1);
  }
}

fixConversationsIndex();
