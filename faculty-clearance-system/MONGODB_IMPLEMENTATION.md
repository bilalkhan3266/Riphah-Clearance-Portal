# MongoDB Storage Implementation - Faculty Clearance System

## Overview
Successfully migrated message and conversation storage from in-memory JavaScript objects to MongoDB with well-structured collections and proper indexing.

---

## Database Collections

### 1. **messages** Collection
Stores all individual messages and replies in the system.

#### Schema Structure:
```javascript
{
  _id: ObjectId,                    // Unique message ID
  
  // Conversation Reference
  conversation_id: ObjectId,        // Reference to Conversation document
  
  // Sender Information
  sender_id: ObjectId,              // Reference to User document
  sender_name: String,              // Full name of sender
  sender_role: String,              // Role: 'faculty', 'Library', 'Finance', etc.
  sender_email: String,             // Email of sender
  
  // Message Content
  subject: String,                  // Message subject (max 255 chars)
  message: String,                  // Message body (trimmed)
  type: String,                     // 'message' or 'reply'
  
  // Thread Management
  reply_to: ObjectId (optional),    // Reference to parent message (if reply)
  
  // Status Tracking
  is_read: Boolean,                 // Default: false
  read_by: [{                       // Track who read it and when
    user_id: ObjectId,
    read_at: Date
  }],
  status: String,                   // 'sent', 'delivered', 'read', 'failed'
  
  // Attachments (future)
  attachments: [{
    filename: String,
    url: String,
    uploaded_at: Date
  }],
  
  // Timestamps
  created_at: Date,                 // Auto-generated
  updated_at: Date                  // Auto-generated
}
```

#### Indexes:
- `{ conversation_id: 1, created_at: -1 }` - Efficient conversation message retrieval
- `{ sender_id: 1, created_at: -1 }` - Find all messages from a user
- `{ conversation_id: 1, is_read: 1 }` - Find unread messages in conversation
- `{ created_at: 1 }` - Sort by latest/oldest
- `{ is_read: 1 }` - Quick unread filtering

---

### 2. **conversations** Collection
Stores conversation metadata and participant information.

#### Schema Structure:
```javascript
{
  _id: ObjectId,                    // Unique conversation ID
  
  // Primary Participants
  faculty_id: ObjectId,             // Reference to User (faculty member)
  faculty_name: String,
  faculty_email: String,
  
  department: String,               // Department name (Library, Finance, etc.)
  department_email: String,         // Department contact email
  
  // Conversation Metadata
  subject: String,                  // Conversation topic
  description: String,              // Optional description
  
  // Message Tracking
  message_count: Number,            // Total messages in this conversation
  unread_by_faculty: Number,        // Messages unread by faculty
  unread_by_department: Number,     // Messages unread by department
  
  // Last Message Info
  last_message: ObjectId,           // Reference to Message
  last_message_at: Date,            // Timestamp of last message
  last_message_preview: String,     // First 50 chars of last message
  last_message_sender_role: String, // 'faculty' or 'department'
  
  // Status & Organization
  status: String,                   // 'active', 'archived', 'resolved', 'closed'
  is_pinned: Boolean,               // User can pin important conversations
  
  // Related Request
  clearance_request_id: ObjectId,   // Link to ClearanceRequest if applicable
  
  // Participants List
  participants: [{
    user_id: ObjectId,
    name: String,
    email: String,
    role: String,
    joined_at: Date
  }],
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  archived_at: Date                 // When archived/closed
}
```

#### Unique Constraint:
- `{ faculty_id: 1, department: 1 }` - One conversation per faculty-department pair

#### Indexes:
- `{ faculty_id: 1, department: 1 }` - UNIQUE - Find faculty's conversation with department
- `{ faculty_id: 1, last_message_at: -1 }` - Get faculty's conversations (newest first)
- `{ department: 1, last_message_at: -1 }` - Get department's conversations (newest first)
- `{ status: 1, updated_at: -1 }` - Filter by status and sort
- `{ faculty_id: 1, status: 1 }` - Find active/archived conversations for faculty

---

## API Endpoints

### Send Message
**Endpoint**: `POST /api/send`

**Request**:
```json
{
  "recipientDepartment": "Library",
  "subject": "Clearance Request",
  "message": "Please sign my clearance form"
}
```

**Process**:
1. Validate inputs (recipientDepartment, message required)
2. Find or create conversation between faculty and department
3. Create message in `messages` collection
4. Update `conversations`: increment message_count, update last_message, increment unread_by_department
5. Return success with message ID

**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "ObjectId",
    "conversation_id": "ObjectId",
    "sender_name": "Ahmed Ali",
    "message": "Message content...",
    "created_at": "2025-03-10T10:30:00Z"
  }
}
```

---

### Get Messages
**Endpoint**: `GET /api/my-messages`

**Process**:
1. Find all conversations for the user
2. Populate last_message details
3. Find all messages across those conversations
4. Add conversation context to each message
5. Return sorted by date (newest first)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "conversation_id": "ObjectId",
      "sender_name": "Library Department",
      "message": "Your clearance is approved",
      "receiver_department": "Library",
      "created_at": "2025-03-10T11:00:00Z",
      "is_read": false,
      "conversation": { /* full conversation data */ }
    }
  ],
  "conversations": [ /* array of all conversations */ ]
}
```

---

### Reply to Message
**Endpoint**: `POST /api/messages/reply/:messageId`

**Request**:
```json
{
  "message": "Thank you for the approval!"
}
```

**Process**:
1. Find original message and its conversation
2. Create reply message (type: 'reply', reply_to: messageId)
3. Update conversation: increment message_count, update last_message
4. Update unread counts based on replier role
5. Return created reply

**Response**:
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "_id": "ObjectId",
    "conversation_id": "ObjectId",
    "reply_to": "ObjectId",
    "message": "Thank you...",
    "sender_name": "Ahmed Ali",
    "created_at": "2025-03-10T11:05:00Z"
  }
}
```

---

### Mark Message as Read
**Endpoint**: `PUT /api/mark-message-read/:messageId`

**Process**:
1. Find message by ID
2. Set is_read = true
3. Add reader info to read_by array
4. Decrement appropriate unread count in conversation
5. Return success

**Response**:
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

### Get Unread Count
**Endpoint**: `GET /api/unread-count`

**Process**:
1. Count unread messages for user
2. Count unread conversations
3. Return both counts

**Response**:
```json
{
  "success": true,
  "unreadCount": 5,
  "unreadConversations": 2
}
```

---

## Data Flow Diagram

### Sending a Message:
```
Faculty submits form with:
  - Department: "Library"
  - Subject: "Clearance"
  - Message: "Please sign..."
        ↓
Check/Create Conversation:
  - Find { faculty_id: "...", department: "Library" }
  - If not exists, create new
        ↓
Create Message:
  - Insert into messages collection
  - conversation_id: <conversation._id>
  - sender_id: <faculty_id>
  - type: "message"
        ↓
Update Conversation:
  - Increment message_count
  - Set last_message = <message._id>
  - Set last_message_at = now
  - Increment unread_by_department
        ↓
Return success response
```

### Receiving & Replying:
```
Department views conversation
  → GET /my-messages returns all their conversations

Department sees unread message
  → Clicks to view (auto calls mark-message-read)
        ↓
message.is_read = true
conversation.unread_by_department--
        ↓
Department types reply and submits
  → POST /messages/reply/:messageId
        ↓
Create Reply Message:
  - Insert into messages collection
  - reply_to: <original_message._id>
  - type: "reply"
  - conversation_id: <original_conversation._id>
        ↓
Update Conversation:
  - Increment message_count
  - Set last_message = <reply._id>
  - Increment unread_by_faculty
        ↓
Faculty gets notified of unread reply
  → Unread count increments
  → Reply appears in their messages
```

---

## Performance Optimizations

### Database Indexes
✅ Compound indexes for common query patterns
✅ Separate reads and last_message tracking
✅ Efficient sorting with created_at indexes

### Query Optimization
- **Get user's conversations**: Use indexed `faculty_id` + `last_message_at` sort
- **Get conversation messages**: Use indexed `conversation_id` + `created_at` sort
- **Find unread**: Quick with `is_read: false` filter
- **Get last message preview**: Pre-computed in Conversation document

### Data Structure
- Denormalize frequently accessed data (last_message_preview, message_count)
- Store conversation metadata separately from messages
- Reference-based relationships for flexibility

---

## Database Statistics

### Collections Created:
1. ✅ **messages** - All message/reply documents
2. ✅ **conversations** - Conversation metadata

### Indexes Created:
- **messages**: 3 compound indexes + created_at
- **conversations**: 5 compound indexes + unique constraint

### Expected Growth:
- **Per message**: ~500 bytes (with proper indexing)
- **Per conversation**: ~1 KB
- **Per 100 faculty × 10 departments**: ~10,000 messages = ~5 MB

---

## Migration from In-Memory Storage

### Old System (In-Memory):
```javascript
// Lost on server restart
const messages = {
  "facultyId": [
    { _id: "MSG-timestamp", message: "...", replies: [] }
  ],
  "DEPT-Library": [
    { /* stored again */ }
  ]
};
```

### New System (MongoDB):
```javascript
// Persistent, indexed, queried efficiently
documents:
  - Message { conversation_id, sender_id, message, type, is_read, ... }
  - Conversation { faculty_id, department, message_count, unread_by_faculty, ... }
```

### Key Improvements:
✅ Data persistence across server restarts
✅ Efficient querying with proper indexing
✅ Scalable to millions of messages
✅ Proper relationship management
✅ Audit trail with timestamps
✅ Read status tracking
✅ Multiple department support
✅ Proper transaction support (future)

---

## Usage Examples

### Get all unread messages:
```javascript
const unreadMessages = await Message.find({
  is_read: false,
  conversation_id: { $in: myConversationIds }
});
```

### Get conversation thread:
```javascript
const conversation = await Conversation.findById(convId)
  .populate('last_message');

const messages = await Message.find({
  conversation_id: convId
}).sort({ created_at: 1 });
```

### Get user's active conversations:
```javascript
const conversations = await Conversation.find({
  faculty_id: userId,
  status: 'active'
}).sort({ last_message_at: -1 });
```

### Mark all messages in conversation as read:
```javascript
await Message.updateMany(
  { conversation_id: convId, is_read: false },
  { is_read: true, $push: { read_by: { user_id, read_at: new Date() } } }
);
```

---

## Future Enhancements

1. **Message Search**: Add text index on message field
2. **Message Attachments**: Store file references, implement upload API
3. **Typing Indicators**: Add Redis for real-time notifications
4. **Message Reactions**: Add reactions array to Message
5. **Scheduled Messages**: Add scheduled_for field
6. **Message Forwarding**: Add forwarded_from field
7. **Bulk Operations**: Add batch message creation
8. **Analytics**: Track message patterns, response times

---

## Troubleshooting

### Messages not appearing for department:
- Check `conversation_id` reference is correct
- Verify department name matches exactly
- Check `status` field is not 'archived'

### Unread count not updating:
- Verify `is_read` field is being updated
- Check `unread_by_faculty` and `unread_by_department` in conversation
- Ensure mark-message-read endpoint is being called

### Slow message retrieval:
- Verify indexes are created (check MongoDB)
- Consider pagination if conversation has 1000+ messages
- Use `lean()` for read-only queries

---

## Database Maintenance

### Monitor Performance:
```javascript
// Check index usage
db.messages.aggregate([{ $indexStats: {} }])

// Check collection size
db.messages.stats()

// Find slow queries
db.setProfilingLevel(1)
```

### Cleanup:
```javascript
// Archive old conversations
db.conversations.updateMany(
  { updated_at: { $lt: new Date(Date.now() - 90*24*60*60*1000) } },
  { status: 'archived' }
)
```

---

## Summary

✅ Fully implemented MongoDB storage for messages and conversations
✅ Well-indexed for efficient querying
✅ Maintains data relationships and integrity
✅ Scalable architecture for future growth
✅ Proper unread tracking and message threading
✅ Complete audit trail with timestamps

Migration complete! 🎉
