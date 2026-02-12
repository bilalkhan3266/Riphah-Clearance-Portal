const mongoose = require('mongoose');
require('dotenv').config();
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');

async function testSparseIndex() {
  try {
    console.log('🧪 Testing Sparse Index for Broadcast Messages\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found');
      process.exit(1);
    }

    console.log('👤 Admin user:', admin.full_name, `(${admin.email})\n`);

    // Get non-admin users
    const recipients = await User.find({ role: { $ne: 'admin' } }).limit(3);
    console.log(`📧 Found ${recipients.length} recipients for broadcast\n`);

    // Test 1: Create conversations for multiple users with sparse index
    console.log('1️⃣  Testing conversation creation with sparse index...');
    const conversations = [];
    for (const recipient of recipients) {
      try {
        const convo = new Conversation({
          sender_id: admin._id,
          recipient_id: recipient._id,
          faculty_id: null,  // Sparse index should ignore these nulls
          department: null,  // Sparse index should ignore these nulls
          subject: 'Broadcast Test',
          type: 'broadcast',
          created_at: new Date()
        });
        const savedConvo = await convo.save();
        conversations.push(savedConvo);
        console.log(`   ✅ Conversation created for: ${recipient.full_name}`);
      } catch (error) {
        console.error(`   ❌ Failed for ${recipient.full_name}:`, error.message);
        throw error;
      }
    }

    console.log(`\n   ✅ Successfully created ${conversations.length} conversations with sparse index`);
    console.log('   (No E11000 error despite multiple null values)\n');

    // Test 2: Create messages for each conversation
    console.log('2️⃣  Testing message creation for broadcasts...');
    for (let i = 0; i < conversations.length; i++) {
      const message = new Message({
        conversation_id: conversations[i]._id,
        sender_id: admin._id,
        sender_name: admin.full_name,
        sender_role: admin.role,
        sender_email: admin.email,
        subject: 'System Announcement: Broadcast Test',
        message: `This is a test broadcast message. Admin: ${admin.full_name}`,
        type: 'message',
        created_at: new Date()
      });
      const savedMsg = await message.save();
      console.log(`   ✅ Message created for conversation ${i + 1}`);
    }

    console.log('\n✅ SPARSE INDEX TEST PASSED');
    console.log('\n📊 Summary:');
    console.log(`   • Created ${conversations.length} broadcast conversations`);
    console.log(`   • Created ${conversations.length} messages`);
    console.log('   • All with faculty_id: null and department: null');
    console.log('   • No E11000 duplicate key error');
    console.log('\n✨ The sparse index successfully allows multiple null values in unique constraint!');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 11000) {
      console.error('   ERROR CODE: E11000 (Duplicate Key)');
      console.error('   This means the sparse index is NOT working correctly');
    }
    mongoose.connection.close();
    process.exit(1);
  }
}

testSparseIndex();
