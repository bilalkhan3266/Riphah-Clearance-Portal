const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

async function cleanupConversations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find conversations without department
    const nullDeptConvs = await Conversation.find({ 
      $or: [
        { department: null },
        { department: undefined },
        { department: '' }
      ]
    });
    
    console.log(`Found ${nullDeptConvs.length} conversations without department field\n`);

    if (nullDeptConvs.length > 0) {
      console.log('Checking which ones have messages...\n');
      
      let deletedCount = 0;
      for (const conv of nullDeptConvs) {
        const messageCount = await Message.countDocuments({ conversation_id: conv._id });
        
        if (messageCount === 0) {
          // Delete orphaned conversations with no messages
          await Conversation.deleteOne({ _id: conv._id });
          deletedCount++;
          console.log(`✅ Deleted orphaned conversation: ${conv.faculty_name || 'Unknown'}`);
        } else {
          console.log(`⚠️  Conversation for ${conv.faculty_name || 'Unknown'} has ${messageCount} messages but no department!`);
        }
      }
      
      console.log(`\n📊 Deleted ${deletedCount} orphaned conversations`);
    }

    // Summary
    const remainingConvs = await Conversation.find({});
    console.log(`\n✅ Total remaining conversations: ${remainingConvs.length}`);
    
    // Group by department
    const byDept = {};
    remainingConvs.forEach(c => {
      const d = c.department || 'NULL';
      byDept[d] = (byDept[d] || 0) + 1;
    });
    
    console.log('\nConversations by department:');
    Object.entries(byDept).sort((a, b) => b[1] - a[1]).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanupConversations();
