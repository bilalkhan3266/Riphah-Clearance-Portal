/**
 * SIMPLE INDEX FIX - Drop the problematic unique index
 * This removes the E11000 error
 * 
 * Run: node fix-index-simple.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty_clearance';

async function fixIndex() {
  console.log('\n🔧 Removing problematic unique index...\n');
  
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the conversations collection directly
    const db = mongoose.connection.db;
    const coll = db.collection('conversations');

    // Try to drop the problematic index
    try {
      await coll.dropIndex('faculty_id_1_department_1');
      console.log('✅ Successfully dropped index: faculty_id_1_department_1\n');
    } catch (indexErr) {
      if (indexErr.message.includes('index not found')) {
        console.log('ℹ️  Index not found - already removed or doesn\'t exist\n');
      } else {
        throw indexErr;
      }
    }

    // Show current indexes
    const indexes = await coll.getIndexes();
    console.log('📋 Current indexes on conversations collection:');
    Object.entries(indexes).forEach(([key, val]) => {
      console.log(`   • ${JSON.stringify(val.key)}`);
    });

    console.log('\n✅ FIX COMPLETE!\n');
    console.log('Now restart your backend and try broadcasting again:\n');
    console.log('   npm start\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndex();
