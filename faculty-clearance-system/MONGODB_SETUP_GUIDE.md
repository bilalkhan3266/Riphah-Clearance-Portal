# MongoDB Migration Setup Guide

## Quick Start: Enabling MongoDB Storage

You've successfully migrated the Faculty Clearance System message storage from in-memory to MongoDB!

### What Changed?
✅ **Before**: Messages stored in JavaScript objects (lost on server restart)
✅ **After**: Messages stored in MongoDB collections (persistent, indexed, scalable)

---

## Step 1: Verify MongoDB Connection

Make sure MongoDB is running:

```bash
# Windows (if using local MongoDB)
mongod

# Or verify connection string in .env file
MONGO_URI=mongodb://localhost:27017/faculty_clearance
```

---

## Step 2: Initialize Database Collections & Indexes

Run the initialization script to create all necessary collections and indexes:

**Option A: Using npm script** (recommended)
```bash
cd backend
npm run db:init
```

**Option B: Direct node command**
```bash
cd backend
node scripts/init-database.js
```

**Output should show:**
```
✅ Connected to MongoDB
✓ Index: conversation_id + created_at
✓ Index: sender_id + created_at
✓ Index: conversation_id + is_read
... (more indexes)
✅ Message collection ready
✅ Conversation collection ready
✨ Database initialization complete!
```

---

## Step 3: Update package.json (if not already done)

Add the database init script to your `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:init": "node scripts/init-database.js",
    "db:clear": "node scripts/clear-database.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## Step 4: Start Your Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will now use MongoDB for all message storage!

---

## Database Collections

### messages Collection
**Stores**: Individual messages and replies
- Message ID, Sender, Recipient, Content
- Read status, Timestamps, Threading info
- Indexed for fast queries

### conversations Collection  
**Stores**: Conversation metadata
- Faculty-Department pairs
- Message counts, Last message info
- Unread counters, Status tracking
- UNIQUE index: one conversation per faculty-department pair

---

## API Endpoints (Now Using MongoDB)

### Send Message
```
POST /api/send
Content-Type: application/json

{
  "recipientDepartment": "Library",
  "subject": "Clearance Request",
  "message": "Please sign my clearance form"
}
```

### Get Messages
```
GET /api/my-messages
Authorization: Bearer <token>
```

### Reply to Message
```
POST /api/messages/reply/:messageId
Content-Type: application/json

{
  "message": "Thank you for approving!"
}
```

### Mark as Read
```
PUT /api/mark-message-read/:messageId
Authorization: Bearer <token>
```

### Get Unread Count
```
GET /api/unread-count
Authorization: Bearer <token>
```

---

## Testing the MongoDB Integration

### 1. Check MongoDB Collections Exist
In MongoDB shell or MongoDB Compass:
```javascript
use faculty_clearance_db
show collections

// Should show:
// conversations
// messages
// users
// (and other collections)
```

### 2. Monitor Messages Being Created
```javascript
// In MongoDB Compass
db.messages.find()

// Should show messages as they're sent:
{
  "_id": ObjectId("..."),
  "conversation_id": ObjectId("..."),
  "sender_id": ObjectId("..."),
  "sender_name": "Ahmed Ali",
  "message": "Please sign my clearance form",
  "type": "message",
  "is_read": false,
  "created_at": ISODate("2025-03-10T10:30:00.000Z")
}
```

### 3. Check Conversation Metadata
```javascript
db.conversations.find()

// Should show:
{
  "_id": ObjectId("..."),
  "faculty_id": ObjectId("..."),
  "faculty_name": "Ahmed Ali",
  "department": "Library",
  "message_count": 5,
  "unread_by_faculty": 2,
  "unread_by_department": 1,
  "last_message_at": ISODate("2025-03-10T11:05:00.000Z")
}
```

### 4. Test Complete Message Flow
1. **Faculty sends message** → Check created in messages collection
2. **Message count updates** → Check conversation.message_count increments
3. **Unread count updates** → Check conversation.unread_by_department increments
4. **Department replies** → Check new message with type: 'reply'
5. **Faculty marks as read** → Check is_read becomes true and unread_by_faculty decrements

---

## Data Persistence Verification

### Before: In-Memory (Lost Data)
```
1. Server running → messages work
2. Server restarts → ALL messages LOST ❌
3. Check MongoDB → Empty collections
```

### After: MongoDB (Persistent)
```
1. Server running → messages work
2. Server restarts → messages STILL THERE ✅
3. Check MongoDB → Messages persist
```

**To verify persistence:**
1. Send a message (as faculty to Library)
2. Restart the backend server: `Ctrl+C` then `npm run dev`
3. Refresh browser
4. **Message should still be visible** ✅

---

## Performance Improvements

### Query Performance
- **Before**: Search through JavaScript objects (O(n))
- **After**: Indexed database queries (O(log n))

### Scalability
- **Before**: All data in RAM (limited by server memory)
- **After**: Unlimited storage on disk (scalable to millions)

### Reliabil ity
- **Before**: Data lost on crash (no backup)
- **After**: Persistent storage with backup capability

---

## Troubleshooting

### Issue: "Cannot find module 'Conversation'"
**Solution**: Make sure Conversation.js is in `backend/models/`
```bash
ls backend/models/
# Should show: Conversation.js, Message.js, User.js, ClearanceRequest*.js
```

### Issue: "MongoDB connection failed"
**Solution**: Check .env file and MongoDB connection string
```
# .env should have:
MONGO_URI=mongodb://localhost:27017/faculty_clearance
```

### Issue: "Indexes already exist"
**Solution**: This is normal! The script detects existing indexes
Just run the init script again:
```bash
npm run db:init
```

### Issue: "Messages not appearing for department"
**Solution**: Check if conversation exists in MongoDB
```javascript
db.conversations.findOne({
  faculty_id: ObjectId("..."),
  department: "Library"
})
```

### Issue: "Unread count not updating"
**Solution**: Verify the mark-message-read endpoint was called
```javascript
db.messages.findById(ObjectId("..."))
// Check if is_read is true and read_by array is populated
```

---

## Next Steps

### Optional: Add Database Cleanup Script
Create `backend/scripts/clear-database.js` for development:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

async function clearDatabase() {
  await mongoose.connect(process.env.MONGO_URI);
  await Message.deleteMany({});
  await Conversation.deleteMany({});
  console.log('✅ Database cleared');
  process.exit(0);
}

clearDatabase();
```

Then add to package.json:
```json
"db:clear": "node scripts/clear-database.js"
```

### Future: Migrate Clearance Data to MongoDB
Currently using in-memory for clearance requests. Consider migrating to MongoDB:
- Create `ClearanceRequest.js` model in models/
- Update routes to use MongoDB
- Add proper indexes

### Real-Time Features (Future)
Consider adding:
- **Socket.io**: For real-time message delivery notifications
- **Redis**: For quick unread count caching
- **Message Search**: Full-text search on message content

---

## Success Checklist

✅ MongoDB is running
✅ Database initialized with `npm run db:init`
✅ Collections created: messages, conversations
✅ Indexes created for performance
✅ Backend server starts without errors
✅ Messages can be sent and received
✅ Messages persist after server restart
✅ Unread counts update correctly
✅ Frontend displays messages properly

---

## Monitoring & Maintenance

### Check Database Health
```bash
# In MongoDB shell
db.adminCommand({ ping: 1 })

# Check collection stats
db.messages.stats()
db.conversations.stats()
```

### Monitor Query Performance
```javascript
// Set profiling to log slow queries
db.setProfilingLevel(1)

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### Regular Health Checks
```bash
# Add to your monitoring dashboard
GET /api/health
```

---

## Summary

✅ **MongoDB Enabled**: Your Faculty Clearance System now uses persistent database storage
✅ **Auto-Failover**: Run init script to recreate all collections if needed  
✅ **Scalable**: Can handle millions of messages without performance degradation
✅ **Reliable**: Data persists across server restarts and crashes
✅ **Indexed**: All queries optimized for fast performance

**You're ready to go! Start the server and test the full two-way messaging system.** 🚀

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Database Design Best Practices](https://docs.mongodb.com/manual/core/schema-design-process/)

---

For questions or issues, check the detailed implementation guide: `MONGODB_IMPLEMENTATION.md`
