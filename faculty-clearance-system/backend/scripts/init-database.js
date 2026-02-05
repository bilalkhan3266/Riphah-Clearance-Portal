// MongoDB Database Setup Script
// Run this file to initialize the faculty-clearance database with proper collections and indexes

const mongoose = require('mongoose');
const path = require('path');

// Models - correct paths from scripts folder
const Message = require(path.join(__dirname, '../models/Message'));
const Conversation = require(path.join(__dirname, '../models/Conversation'));

/**
 * Initialize database with collections and indexes
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing MongoDB database...');
    
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create Message collection and indexes
    console.log('\n📋 Setting up Message collection...');
    await setupMessageCollection();
    console.log('✅ Message collection ready');

    // Create Conversation collection and indexes
    console.log('\n📋 Setting up Conversation collection...');
    await setupConversationCollection();
    console.log('✅ Conversation collection ready');

    // Display collection stats
    console.log('\n📊 Database Statistics:');
    await displayCollectionStats();

    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

/**
 * Setup Message collection with indexes
 */
async function setupMessageCollection() {
  try {
    // Ensure collection exists
    await Message.collection.createIndex({ conversation_id: 1, created_at: -1 });
    console.log('  ✓ Index: conversation_id + created_at');

    await Message.collection.createIndex({ sender_id: 1, created_at: -1 });
    console.log('  ✓ Index: sender_id + created_at');

    await Message.collection.createIndex({ conversation_id: 1, is_read: 1 });
    console.log('  ✓ Index: conversation_id + is_read');

    await Message.collection.createIndex({ created_at: -1 });
    console.log('  ✓ Index: created_at (descending)');

    await Message.collection.createIndex({ is_read: 1 });
    console.log('  ✓ Index: is_read');

    // TTL index for optional cleanup of very old messages
    await Message.collection.createIndex(
      { created_at: 1 },
      { expireAfterSeconds: 15552000 } // 180 days
    );
    console.log('  ✓ TTL Index: auto-delete after 180 days (optional)');

    const messageStats = await Message.collection.stats();
    console.log(`  📊 Documents: ${messageStats.count} | Size: ${Math.round(messageStats.size / 1024 / 1024 * 100) / 100} MB`);
  } catch (err) {
    if (err.code === 85) {
      console.log('  ℹ️  Indexes already exist');
    } else {
      throw err;
    }
  }
}

/**
 * Setup Conversation collection with indexes
 */
async function setupConversationCollection() {
  try {
    // UNIQUE index - one conversation per faculty-department pair
    await Conversation.collection.createIndex(
      { faculty_id: 1, department: 1 },
      { unique: true, sparse: true }
    );
    console.log('  ✓ Index: faculty_id + department (UNIQUE)');

    // Sorting indexes for list views
    await Conversation.collection.createIndex({ faculty_id: 1, last_message_at: -1 });
    console.log('  ✓ Index: faculty_id + last_message_at');

    await Conversation.collection.createIndex({ department: 1, last_message_at: -1 });
    console.log('  ✓ Index: department + last_message_at');

    // Status and time filtering
    await Conversation.collection.createIndex({ status: 1, updated_at: -1 });
    console.log('  ✓ Index: status + updated_at');

    await Conversation.collection.createIndex({ faculty_id: 1, status: 1 });
    console.log('  ✓ Index: faculty_id + status');

    // Additional indexes for filtering
    await Conversation.collection.createIndex({ created_at: -1 });
    console.log('  ✓ Index: created_at (descending)');

    await Conversation.collection.createIndex({ unread_by_faculty: 1 });
    console.log('  ✓ Index: unread_by_faculty');

    await Conversation.collection.createIndex({ unread_by_department: 1 });
    console.log('  ✓ Index: unread_by_department');

    const convStats = await Conversation.collection.stats();
    console.log(`  📊 Documents: ${convStats.count} | Size: ${Math.round(convStats.size / 1024 / 1024 * 100) / 100} MB`);
  } catch (err) {
    if (err.code === 85) {
      console.log('  ℹ️  Indexes already exist');
    } else {
      throw err;
    }
  }
}

/**
 * Display database statistics
 */
async function displayCollectionStats() {
  try {
    const messageCount = await Message.countDocuments();
    const conversationCount = await Conversation.countDocuments();
    
    const activeConvCount = await Conversation.countDocuments({ status: 'active' });
    const unreadMessageCount = await Message.countDocuments({ is_read: false });

    console.log(`  📧 Messages: ${messageCount}`);
    console.log(`  💬 Conversations: ${conversationCount}`);
    console.log(`  ✨ Active Conversations: ${activeConvCount}`);
    console.log(`  📌 Unread Messages: ${unreadMessageCount}`);
  } catch (err) {
    console.log('  ℹ️  No data yet (collections are empty)');
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
