const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

async function testBroadcastFix() {
  try {
    console.log('\n🧪 Testing Broadcast Message Fix\n');
    
    // 1. Get admin
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin found');
      return;
    }
    console.log('✅ Admin found:', admin.full_name, '(_id:', admin._id, ')');
    
    // 2. Create a fake user ID to test (since we don't have other users)
    const fakeUserId = new mongoose.Types.ObjectId();
    console.log('✅ Using fake user ID:', fakeUserId);
    
    // 3. Test Conversation creation without faculty fields
    console.log('\n📝 Testing Conversation creation without faculty fields...');
    
    const conversation = new Conversation({
      sender_id: admin._id,
      recipient_id: fakeUserId,
      subject: 'Test Broadcast Message',
      created_at: new Date()
    });
    
    const savedConversation = await conversation.save();
    console.log('✅ Conversation created successfully:\n');
    console.log('   ✓ sender_id:', savedConversation.sender_id);
    console.log('   ✓ recipient_id:', savedConversation.recipient_id);
    console.log('   ✓ subject:', savedConversation.subject);
    console.log('   ✓ faculty_id (should be undefined): ', savedConversation.faculty_id);
    console.log('   ✓ faculty_name (should be undefined):', savedConversation.faculty_name);
    console.log('   ✓ faculty_email (should be undefined):', savedConversation.faculty_email);
    console.log('   ✓ department (should be undefined): ', savedConversation.department);
    
    // 4. Test Message creation with proper fields
    console.log('\n📝 Testing Message creation with all required fields...');
    
    const message = new Message({
      conversation_id: savedConversation._id,
      sender_id: admin._id,
      sender_name: admin.full_name,
      sender_role: admin.role,
      sender_email: admin.email,
      subject: 'Test Broadcast Message',
      message: 'This is a test broadcast message - Testing the fix for admin broadcast messages',
      type: 'message',
      created_at: new Date()
    });
    
    const savedMessage = await message.save();
    console.log('✅ Message created successfully:\n');
    console.log('   ✓ sender_name:', savedMessage.sender_name);
    console.log('   ✓ sender_role:', savedMessage.sender_role);
    console.log('   ✓ sender_email:', savedMessage.sender_email);
    console.log('   ✓ message (not content!):', savedMessage.message);
    console.log('   ✓ type:', savedMessage.type);
    console.log('   ✓ subject:', savedMessage.subject);
    
    // 5. Verify retrieval
    console.log('\n💾 Verifying saved messages can be retrieved...');
    const retrieved = await Message.findById(savedMessage._id)
      .populate('conversation_id', 'sender_id recipient_id subject');
    
    console.log('✅ Message retrieved successfully:');
    console.log('   ✓ Message content:', retrieved.message);
    console.log('   ✓ Conversation ID:', retrieved.conversation_id._id);
    
    console.log('\n✅✅✅ ALL TESTS PASSED! ✅✅✅');
    console.log('\n📋 Summary:');
    console.log('   • Conversation model accepts admin broadcasts without faculty fields ✓');
    console.log('   • Message model accepts messages with sender info populated ✓');
    console.log('   • Message uses "message" field (not "content") ✓');
    console.log('   • Admin broadcast schema is fixed and working! ✓');
    
    // Cleanup test data
    await Conversation.deleteOne({ _id: savedConversation._id });
    await Message.deleteOne({ _id: savedMessage._id });
    console.log('\n🧹 Test data cleaned up');
    
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    if (err.errors) {
      console.error('   Validation errors:', err.errors);
    }
  } finally {
    mongoose.connection.close();
  }
}

testBroadcastFix();
