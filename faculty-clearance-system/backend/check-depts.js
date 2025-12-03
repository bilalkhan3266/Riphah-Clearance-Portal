const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/Conversation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

async function checkDepartments() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const convs = await Conversation.find({}, { department: 1, message_count: 1, unread_by_department: 1 }).lean();
    
    const depts = {};
    convs.forEach(c => {
      const d = c.department || 'NULL_DEPT';
      if (!depts[d]) {
        depts[d] = { count: 0, totalMessages: 0, withMessages: 0, totalUnread: 0 };
      }
      depts[d].count += 1;
      depts[d].totalMessages += c.message_count || 0;
      depts[d].totalUnread += c.unread_by_department || 0;
      if ((c.message_count || 0) > 0) depts[d].withMessages += 1;
    });
    
    console.log('\n📊 ===== DEPARTMENTS WITH MESSAGES =====\n');
    Object.entries(depts)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([dept, stats]) => {
        console.log(`${dept}:`);
        console.log(`  • Conversations: ${stats.count}`);
        console.log(`  • With messages: ${stats.withMessages}`);
        console.log(`  • Total messages: ${stats.totalMessages}`);
        console.log(`  • Unread messages: ${stats.totalUnread}`);
        console.log();
      });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDepartments();
