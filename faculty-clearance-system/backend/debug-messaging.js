const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

async function debugMessaging() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all conversations
    console.log('📋 ===== ALL CONVERSATIONS =====');
    const conversations = await Conversation.find().lean();
    console.log(`Found ${conversations.length} conversations\n`);

    if (conversations.length === 0) {
      console.log('⚠️  No conversations found!');
      console.log('\nThis means:');
      console.log('  1. Faculty have not sent messages yet, OR');
      console.log('  2. Messages are being sent but conversations are not being created/saved');
      await mongoose.connection.close();
      return;
    }

    // Display conversations grouped by department
    const byDept = {};
    conversations.forEach(conv => {
      const dept = conv.department || 'NO_DEPARTMENT';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(conv);
    });

    console.log('📍 Conversations by Department:');
    Object.entries(byDept).forEach(([dept, convs]) => {
      console.log(`\n  ${dept}: ${convs.length} conversation(s)`);
      convs.forEach(conv => {
        console.log(`    • Faculty: ${conv.faculty_name || 'Unknown'}`);
        console.log(`      Status: ${conv.status || 'N/A'}`);
        console.log(`      Messages: ${conv.message_count || 0}`);
        console.log(`      Unread by department: ${conv.unread_by_department || 0}`);
        console.log(`      Last message at: ${conv.last_message_at || 'N/A'}`);
        console.log();
      });
    });

    // Count messages by department
    console.log('\n📊 ===== MESSAGES COUNT BY DEPARTMENT =====');
    for (const [dept, convs] of Object.entries(byDept)) {
      const convIds = convs.map(c => c._id);
      const messageCount = await Message.countDocuments({
        conversation_id: { $in: convIds }
      });
      console.log(`${dept}: ${messageCount} message(s)`);
    }

    // Check if querying by department works
    console.log('\n🔍 ===== TESTING DEPARTMENT QUERIES =====');
    const testDepts = ['HOD', 'Lab', 'Library', 'Pharmacy', 'HR', 'Finance'];
    
    for (const deptName of testDepts) {
      const found = await Conversation.countDocuments({
        department: deptName,
        status: { $ne: 'archived' }
      });
      console.log(`Query for "${deptName}": Found ${found} conversation(s)`);
    }

    // Check Message collection
    console.log('\n💬 ===== ALL MESSAGES =====');
    const messages = await Message.find().lean();
    console.log(`Total messages in database: ${messages.length}`);
    
    if (messages.length > 0) {
      console.log('\nSample messages:');
      messages.slice(0, 3).forEach((msg, i) => {
        console.log(`\n  Message ${i + 1}:`);
        console.log(`    From: ${msg.sender_name} (${msg.sender_role})`);
        console.log(`    Conversation ID: ${msg.conversation_id}`);
        console.log(`    Text: "${msg.message?.substring(0, 50)}..."`);
        console.log(`    Created: ${msg.created_at}`);
      });
    }

    // Check if there's a mismatch between conversations and messages
    console.log('\n⚠️  ===== DATA INTEGRITY CHECK =====');
    const orphanedMessages = await Message.find({
      conversation_id: { $nin: conversations.map(c => c._id) }
    }).lean();
    console.log(`Orphaned messages (not linked to conversations): ${orphanedMessages.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Debugging complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

debugMessaging();
