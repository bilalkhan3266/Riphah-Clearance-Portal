const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// =============================================
// DEPARTMENT TWO-WAY MESSAGING ROUTES
// =============================================

/**
 * GET /api/department-messages/:departmentName
 * Get all conversations & messages for a department
 */
router.get('/:departmentName', verifyToken, async (req, res) => {
  try {
    const { departmentName } = req.params;
    const userRole = req.user.role;

    // Only the department's own staff can view
    if (userRole !== departmentName && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Find all conversations for this department
    const conversations = await Conversation.find({
      department: departmentName,
      status: { $ne: 'archived' }
    })
      .populate('faculty_id', 'full_name email faculty_id')
      .populate('last_message')
      .sort({ last_message_at: -1 })
      .lean();

    const conversationIds = conversations.map(c => c._id);

    // Get all messages
    const messages = await Message.find({
      conversation_id: { $in: conversationIds }
    })
      .sort({ created_at: 1 })
      .lean();

    // Group messages by conversation
    const conversationsWithMessages = conversations.map(conv => ({
      ...conv,
      messages: messages.filter(m => m.conversation_id.toString() === conv._id.toString())
    }));

    res.json({
      success: true,
      data: conversationsWithMessages,
      totalConversations: conversations.length
    });
  } catch (err) {
    console.error('Error fetching department messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/department-messages/:departmentName/faculty/:facultyId
 * Get conversation between department and specific faculty
 */
router.get('/:departmentName/faculty/:facultyId', verifyToken, async (req, res) => {
  try {
    const { departmentName, facultyId } = req.params;

    const conversation = await Conversation.findOne({
      department: departmentName,
      faculty_id: facultyId
    }).lean();

    if (!conversation) {
      return res.json({ success: true, data: { conversation: null, messages: [] } });
    }

    const messages = await Message.find({
      conversation_id: conversation._id
    })
      .sort({ created_at: 1 })
      .lean();

    res.json({
      success: true,
      data: { conversation, messages }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/department-messages/:departmentName/send
 * Department sends a message to a faculty member
 */
router.post('/:departmentName/send', verifyToken, async (req, res) => {
  try {
    const { departmentName } = req.params;
    const { facultyId, message, subject } = req.body;
    const userId = req.user.id;
    const userName = req.user.full_name;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    // Authorization
    if (userRole !== departmentName && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!facultyId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'facultyId and message are required' });
    }

    // Try to find the faculty user by MongoDB _id first, then by faculty_id string
    let facultyUser = null;
    
    // Check if facultyId looks like a MongoDB ObjectId
    if (facultyId.match(/^[0-9a-fA-F]{24}$/)) {
      facultyUser = await User.findById(facultyId);
    }
    
    // If not found or not a valid ObjectId, try searching by faculty_id field
    if (!facultyUser) {
      facultyUser = await User.findOne({ 
        $or: [
          { faculty_id: facultyId },
          { employee_id: facultyId },
          { email: facultyId }
        ]
      });
    }

    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty member not found. Please verify the faculty ID.' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      faculty_id: facultyUser._id,
      department: departmentName
    });

    if (!conversation) {
      conversation = new Conversation({
        sender_id: userId,
        faculty_id: facultyUser._id,
        faculty_name: facultyUser.full_name,
        faculty_email: facultyUser.email,
        department: departmentName,
        subject: subject || 'Department Communication',
        participants: [
          { user_id: userId, name: userName, email: userEmail, role: userRole },
          { user_id: facultyUser._id, name: facultyUser.full_name, email: facultyUser.email, role: 'faculty' }
        ]
      });
      await conversation.save();
    }

    // Create message
    const newMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      sender_name: userName || departmentName + ' Department',
      sender_email: userEmail,
      sender_role: departmentName,
      message: message.trim(),
      subject: subject || conversation.subject || 'Department Communication',
      type: 'message',
      is_read: false,
      status: 'sent'
    });

    await newMessage.save();

    // Update conversation
    conversation.message_count = (conversation.message_count || 0) + 1;
    conversation.last_message = newMessage._id;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    conversation.last_message_sender_role = 'department';
    conversation.unread_by_faculty = (conversation.unread_by_faculty || 0) + 1;
    await conversation.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (err) {
    console.error('❌ Error sending department message:', err.message);
    console.error('   Stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message: ' + err.message,
      error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
    });
  }
});

/**
 * POST /api/department-messages/:departmentName/reply/:conversationId
 * Department replies in an existing conversation
 */
router.post('/:departmentName/reply/:conversationId', verifyToken, async (req, res) => {
  try {
    const { departmentName, conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userName = req.user.full_name;
    const userEmail = req.user.email;
    const userRole = req.user.role;

    if (userRole !== departmentName && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const newMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      sender_name: userName || departmentName + ' Department',
      sender_email: userEmail,
      sender_role: departmentName,
      message: message.trim(),
      type: 'reply',
      is_read: false,
      status: 'sent'
    });

    await newMessage.save();

    // Update conversation
    conversation.message_count = (conversation.message_count || 0) + 1;
    conversation.last_message = newMessage._id;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    conversation.last_message_sender_role = 'department';
    conversation.unread_by_faculty = (conversation.unread_by_faculty || 0) + 1;
    await conversation.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: newMessage
    });
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/department-messages/:departmentName/read/:conversationId
 * Mark all messages in a conversation as read (by department)
 */
router.put('/:departmentName/read/:conversationId', verifyToken, async (req, res) => {
  try {
    const { departmentName, conversationId } = req.params;

    // Mark all messages as read where sender is faculty (department reading faculty messages)
    await Message.updateMany(
      {
        conversation_id: conversationId,
        sender_role: 'faculty',
        is_read: false
      },
      { $set: { is_read: true } }
    );

    // Reset unread counter
    await Conversation.findByIdAndUpdate(conversationId, { unread_by_department: 0 });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
