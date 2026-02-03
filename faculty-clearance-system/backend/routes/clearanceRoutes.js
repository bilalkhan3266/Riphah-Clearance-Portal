const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/verifyToken');
const { processClearance, DEPARTMENT_ORDER } = require('../services/sequentialClearanceService');
const { generateAndSendCertificate } = require('../services/certificateService');

// Import MongoDB models
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const ClearanceRequest = require('../models/ClearanceRequest');

// ============= FACULTY LIST =============

// GET all faculty members (for department staff to process clearances)
router.get('/faculty-list', verifyToken, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }, 'faculty_id full_name email designation department');
    res.json({
      success: true,
      faculty: faculty || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============= CLEARANCE REQUESTS =============

// GET all clearance requests (for faculty personal or for department staff)
router.get('/clearance-requests', verifyToken, async (req, res) => {
  try {
    const departmentFilter = req.query.department;
    const facultyId = req.user.id;

    // If department filter is provided (department staff viewing)
    if (departmentFilter) {
      const filteredRequests = await ClearanceRequest.find({
        [`departments.${departmentFilter}`]: { $exists: true }
      })
        .populate('faculty_id', 'full_name email faculty_id designation department office_location')
        .sort({ created_at: -1 });

      return res.json({
        success: true,
        requests: filteredRequests || [],
        department: departmentFilter
      });
    }

    // Faculty viewing their own requests
    const requests = await ClearanceRequest.find({ faculty_id: facultyId })
      .populate('faculty_id', 'full_name email faculty_id designation department office_location')
      .sort({ created_at: -1 });
    res.json({
      success: true,
      requests: requests || []
    });
  } catch (err) {
    console.error('Error fetching clearance requests:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Check items that need to be returned before clearance submission
router.get('/clearance-submission-check', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const Issue = require('../models/Issue');

    // Find all pending issues
    const pendingIssues = await Issue.find({
      facultyId,
      status: { $in: ['Issued', 'Pending', 'Uncleared', 'Partially Returned'] }
    }).sort({ departmentName: 1, issueDate: -1 });

    // Group by department
    const issuesByDept = {};
    const departments = [];
    
    pendingIssues.forEach(issue => {
      if (!issuesByDept[issue.departmentName]) {
        issuesByDept[issue.departmentName] = [];
        departments.push(issue.departmentName);
      }
      issuesByDept[issue.departmentName].push({
        id: issue._id,
        description: issue.description,
        itemType: issue.itemType,
        quantity: issue.quantity,
        status: issue.status,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        isOverdue: issue.dueDate && issue.dueDate < new Date()
      });
    });

    const canSubmitClearance = pendingIssues.length === 0;

    res.json({
      success: true,
      facultyId,
      canSubmitClearance,
      totalPendingItems: pendingIssues.length,
      departmentsWithPendingIssues: departments,
      issuesByDepartment: issuesByDept,
      message: canSubmitClearance 
        ? 'All items returned! Ready to submit clearance.'
        : `You have ${pendingIssues.length} item(s) to return before clearance submission.`
    });
  } catch (error) {
    console.error('Error checking submission requirements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking clearance submission status',
      error: error.message 
    });
  }
});

// POST - Submit new clearance request
router.post('/clearance-requests', verifyToken, async (req, res) => {
  try {
    const {
      designation,
      office_location,
      contact_number,
      degree_status,
      department
    } = req.body;

    const facultyId = req.user.id;

    console.log(`\n📋 [POST /clearance-requests] Faculty ${facultyId} submitting clearance`);

    // Initialize all departments as Pending
    const departments = {};
    DEPARTMENT_ORDER.forEach(dept => {
      departments[dept] = { 
        status: 'Pending', 
        checked_at: null,
        approved_by: null,
        remarks: null
      };
    });

    // Create new clearance request in MongoDB
    const newRequest = new ClearanceRequest({
      faculty_id: facultyId,
      faculty_name: req.user.full_name,
      email: req.user.email,
      designation: designation || req.user.designation,
      office_location,
      contact_number,
      degree_status,
      department: department || 'All Departments',
      status: 'Pending',
      current_phase: 'Phase 1',
      overall_status: 'In Progress',
      departments: departments,
      qr_code: null,
      cleared_at: null
    });

    await newRequest.save();

    console.log(`✅ Clearance request saved for faculty: ${req.user.full_name}`);

    // ===============================================
    // 🔄 SEQUENTIAL AUTO-VALIDATION — NO MANUAL
    // ===============================================
    console.log(`🤖 Starting SEQUENTIAL AUTO-VALIDATION...`);
    
    try {
      const result = await processClearance(facultyId);

      // Update each department status from sequential result
      for (const phase of result.phases) {
        newRequest.departments[phase.name].status = phase.status;
        newRequest.departments[phase.name].checked_at = new Date();
        newRequest.departments[phase.name].remarks = phase.remarks;
      }

      if (result.overallStatus === 'Completed') {
        newRequest.overall_status = 'Cleared';
        newRequest.status = 'Approved';
        newRequest.cleared_at = new Date();
        console.log('\n🎉 FACULTY FULLY CLEARED!');

        // Generate QR, PDF, Email
        try {
          const cert = await generateAndSendCertificate({
            _id: newRequest._id,
            facultyName: result.facultyName,
            facultyEmail: result.facultyEmail,
            queryId: result.queryId,
            phases: result.phases
          });
          newRequest.qr_code = cert.qrDataUrl;
          console.log('📄 Certificate generated and emailed.');
        } catch (certErr) {
          console.error('⚠️ Certificate generation error:', certErr.message);
        }
      } else {
        newRequest.overall_status = 'In Progress';
        newRequest.status = 'Pending';
        console.log(`⏳ Stopped at ${result.stoppedAt}. Awaiting returns...`);
      }

      await newRequest.save();

    } catch (autoCheckError) {
      console.error('⚠️ Auto-check error:', autoCheckError.message);
      newRequest.overall_status = 'In Progress';
      newRequest.status = 'Pending';
      await newRequest.save();
    }

    res.json({
      success: true,
      message: 'Clearance request submitted! Sequential auto-validation complete.',
      request: newRequest
    });
  } catch (err) {
    console.error('Error submitting clearance request:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ MANUAL APPROVE/REJECT ENDPOINTS REMOVED
// System is 100% AUTOMATED - No human approval decisions

// POST - Resubmit clearance request (re-run sequential auto-validation)
router.post('/clearance-requests/resubmit', verifyToken, async (req, res) => {
  try {
    console.log('\n🔄 [POST /clearance-requests/resubmit] Request received');
    
    const facultyId = req.user.id;
    
    // Find the latest clearance request for this faculty
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });
    
    if (!latestRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'No clearance request found to resubmit' 
      });
    }

    // Re-run sequential auto-validation
    const result = await processClearance(facultyId);

    // Reset ALL departments then update from result
    for (const dept of DEPARTMENT_ORDER) {
      latestRequest.departments[dept].status = 'Pending';
      latestRequest.departments[dept].checked_at = null;
      latestRequest.departments[dept].remarks = null;
    }

    for (const phase of result.phases) {
      latestRequest.departments[phase.name].status = phase.status;
      latestRequest.departments[phase.name].checked_at = new Date();
      latestRequest.departments[phase.name].remarks = phase.remarks;
    }

    latestRequest.resubmitted_at = new Date();
    latestRequest.updated_at = new Date();

    if (result.overallStatus === 'Completed') {
      latestRequest.overall_status = 'Cleared';
      latestRequest.status = 'Approved';
      latestRequest.cleared_at = new Date();

      // Generate certificate
      try {
        const cert = await generateAndSendCertificate({
          _id: latestRequest._id,
          facultyName: result.facultyName,
          facultyEmail: result.facultyEmail,
          queryId: result.queryId,
          phases: result.phases
        });
        latestRequest.qr_code = cert.qrDataUrl;
      } catch (certErr) {
        console.error('⚠️ Certificate error:', certErr.message);
      }
    } else {
      latestRequest.overall_status = 'In Progress';
      latestRequest.status = 'Pending';
    }

    await latestRequest.save();

    console.log(`   ✅ Re-validation complete: ${result.overallStatus}`);

    res.json({
      success: true,
      message: result.overallStatus === 'Completed'
        ? 'All departments cleared! Certificate generated.'
        : `Stopped at ${result.stoppedAt}. Please return pending items.`,
      data: latestRequest,
      stoppedAt: result.stoppedAt
    });
  } catch (err) {
    console.error('   ❌ Resubmit Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resubmit: ' + err.message 
    });
  }
});

// GET - Get sequential department status
router.get('/clearance-requests/:facultyId/phase-status', verifyToken, async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    
    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.json({
        success: true,
        phaseStatus: {
          current_phase: null,
          overall_status: 'Not Submitted',
          departments: [],
          qr_code: null,
          cleared_at: null,
          message: 'You have not submitted a clearance request yet.'
        }
      });
    }

    // Build sequential status for all 12 departments
    const departmentStatuses = DEPARTMENT_ORDER.map((dept, index) => ({
      order: index + 1,
      name: dept,
      status: latestRequest.departments[dept]?.status || 'Pending',
      remarks: latestRequest.departments[dept]?.remarks || null,
      checked_at: latestRequest.departments[dept]?.checked_at || null
    }));

    // Find where it stopped (first non-Approved)
    const stoppedAt = departmentStatuses.find(d => d.status !== 'Approved');

    res.json({
      success: true,
      phaseStatus: {
        overall_status: latestRequest.overall_status,
        departments: departmentStatuses,
        stoppedAt: stoppedAt ? stoppedAt.name : null,
        qr_code: latestRequest.qr_code,
        cleared_at: latestRequest.cleared_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============= MESSAGES =============

// GET all messages for faculty or department users
router.get('/my-messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;

    // Build conversation filter based on user role
    let conversationFilter = { status: { $ne: 'archived' } };
    
    if (userRole === 'faculty') {
      // Faculty sees conversations where they are the faculty member
      conversationFilter.faculty_id = userId;
    } else {
      // Department staff (role contains department name) sees conversations for their department
      conversationFilter.department = userRole;
    }

    // Find all conversations for this user
    const conversations = await Conversation.find(conversationFilter)
      .populate('faculty_id', 'full_name email')
      .populate('last_message')
      .sort({ last_message_at: -1 })
      .lean();

    // Get IDs of all conversations
    const conversationIds = conversations.map(c => c._id);

    // Get all messages for this user's conversations
    const messages = await Message.find({
      conversation_id: { $in: conversationIds }
    })
      .populate('sender_id', 'full_name email role')
      .populate('reply_to')
      .sort({ created_at: -1 })
      .lean();

    // Add conversation context to messages
    const messagesWithContext = messages.map(msg => {
      const conv = conversations.find(c => c._id.toString() === msg.conversation_id.toString());
      return {
        ...msg,
        conversation: conv,
        _id: msg._id.toString(),
        receiver_department: conv?.department || 'Unknown',
        recipient_department: conv?.department || 'Unknown',
        created_at: msg.created_at,
        is_read: msg.is_read,
        sender_id: typeof msg.sender_id === 'object' ? msg.sender_id?._id?.toString() : msg.sender_id,
        sender_name: msg.sender_name || msg.sender_id?.full_name,
        sender_email: msg.sender_email || msg.sender_id?.email,
        sender_role: msg.sender_role || msg.sender_id?.role,
        message: msg.message,
        subject: msg.subject,
        type: msg.type,
        reply_to: msg.reply_to,
        status: msg.status
      };
    });

    res.json({
      success: true,
      data: messagesWithContext,
      messages: messagesWithContext,
      conversations: conversations
    });
  } catch (err) {
    console.error('Fetch Messages Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Send message (primary endpoint)
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { recipientDepartment, subject, message } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.full_name;
    const userRole = req.user.role;

    // Fetch user to get employee_id
    const user = await User.findById(userId);
    const userEmployeeId = user?.employee_id || 'N/A';

    console.log('📨 [POST /send] Incoming request:');
    console.log('   userId:', userId);
    console.log('   employeeId:', userEmployeeId);
    console.log('   userName:', userName);
    console.log('   recipientDepartment:', recipientDepartment);
    console.log('   subject:', subject);
    console.log('   message:', message?.substring(0, 30) + '...');

    // Validate inputs
    if (!recipientDepartment || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientDepartment, message'
      });
    }

    // Ensure recipientDepartment is not null/undefined before querying
    if (!recipientDepartment || recipientDepartment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'recipientDepartment cannot be empty'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      faculty_id: userId,
      department: recipientDepartment
    });

    if (!conversation) {
      // Create new conversation - ENSURE department is set
      conversation = new Conversation({
        sender_id: userId,
        faculty_id: userId,
        faculty_name: userName,
        faculty_email: userEmail,
        department: recipientDepartment,  // EXPLICITLY SET DEPARTMENT
        subject: subject || 'Clearance Discussion',
        status: 'active',  // EXPLICITLY SET STATUS
        participants: [
          {
            user_id: userId,
            name: userName,
            email: userEmail,
            role: userRole
          }
        ]
      });
      console.log('   ✅ New conversation created');
      console.log('       Department:', conversation.department);
      await conversation.save();
      
      // Verify it was saved
      const saved = await Conversation.findById(conversation._id);
      if (!saved.department) {
        console.error('   ❌ WARNING: Department not saved! Saved As:', saved.department);
      }
    } else {
      console.log('   ℹ️  Existing conversation found');
      console.log('       Department:', conversation.department);
    }

    // Create message
    const newMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      sender_name: userName,
      sender_email: userEmail,
      sender_role: userRole,
      subject: subject?.trim() || 'No Subject',
      message: message.trim(),
      type: 'message',
      is_read: false,
      status: 'sent'
    });

    await newMessage.save();
    console.log('   ✅ Message created for employee:', userEmployeeId);

    // Ensure conversation has all required fields before save
    if (!conversation.faculty_name) {
      conversation.faculty_name = userName || 'Faculty Member';
    }
    if (!conversation.faculty_email) {
      conversation.faculty_email = userEmail || 'unknown@example.com';
    }
    
    // CRITICAL: Ensure department is set
    if (!conversation.department) {
      conversation.department = recipientDepartment;
      console.log('   ⚠️  Re-setting department field:', recipientDepartment);
    }
    if (!conversation.status) {
      conversation.status = 'active';
    }

    // Update conversation
    conversation.message_count = (conversation.message_count || 0) + 1;
    conversation.last_message = newMessage._id;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    conversation.last_message_sender_role = 'faculty';
    conversation.unread_by_department = (conversation.unread_by_department || 0) + 1;
    await conversation.save();
    console.log('   ✅ Conversation updated');
    console.log('       Final Department:', conversation.department);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: newMessage._id,
        conversation_id: newMessage.conversation_id,
        sender_id: newMessage.sender_id,
        sender_employee_id: userEmployeeId,
        sender_name: newMessage.sender_name,
        sender_email: newMessage.sender_email,
        sender_role: newMessage.sender_role,
        receiver_department: recipientDepartment,
        subject: newMessage.subject,
        message: newMessage.message,
        type: 'message',
        is_read: false,
        created_at: newMessage.created_at,
        status: 'sent'
      }
    });
  } catch (err) {
    console.error('❌ Send Message Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ success: false, message: err.message, error: err.toString() });
  }
});

// POST - Send message (alternate endpoint)
router.post('/messages/send', verifyToken, async (req, res) => {
  try {
    const { recipientDepartment, subject, message } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.full_name;
    const userRole = req.user.role;

    // Fetch user to get employee_id
    const user = await User.findById(userId);
    const userEmployeeId = user?.employee_id || 'N/A';

    // Validate inputs
    if (!recipientDepartment || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientDepartment, message'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      faculty_id: userId,
      department: recipientDepartment
    });

    if (!conversation) {
      conversation = new Conversation({
        faculty_id: userId,
        faculty_name: userName,
        faculty_email: userEmail,
        department: recipientDepartment,
        subject: subject || 'Clearance Discussion',
        participants: [
          {
            user_id: userId,
            name: userName,
            email: userEmail,
            role: userRole
          }
        ]
      });
      await conversation.save();
    }

    // Create message
    const newMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      sender_name: userName,
      sender_email: userEmail,
      sender_role: userRole,
      subject: subject?.trim() || 'No Subject',
      message: message.trim(),
      type: 'message',
      is_read: false,
      status: 'sent'
    });

    await newMessage.save();

    // Ensure conversation has all required fields before save
    if (!conversation.faculty_name) {
      conversation.faculty_name = userName || 'Faculty Member';
    }
    if (!conversation.faculty_email) {
      conversation.faculty_email = userEmail || 'unknown@example.com';
    }

    // Update conversation
    conversation.message_count = (conversation.message_count || 0) + 1;
    conversation.last_message = newMessage._id;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    conversation.last_message_sender_role = 'faculty';
    conversation.unread_by_department = (conversation.unread_by_department || 0) + 1;
    await conversation.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        ...newMessage.toObject(),
        sender_employee_id: userEmployeeId
      }
    });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Reply to message
router.post('/messages/reply/:messageId', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const messageId = req.params.messageId;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.full_name;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message cannot be empty'
      });
    }

    // Find original message
    const originalMessage = await Message.findById(messageId)
      .populate('conversation_id');

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    // Get conversation
    const conversation = originalMessage.conversation_id;

    // Ensure conversation has all required fields (for updates)
    if (!conversation.faculty_name || !conversation.faculty_email) {
      const facultyUser = await User.findById(conversation.faculty_id);
      if (facultyUser) {
        if (!conversation.faculty_name) {
          conversation.faculty_name = facultyUser.full_name || 'Faculty Member';
        }
        if (!conversation.faculty_email) {
          conversation.faculty_email = facultyUser.email || 'unknown@example.com';
        }
      }
    }

    // Create reply
    const replyMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      sender_name: userName,
      sender_email: userEmail,
      sender_role: userRole,
      message: message.trim(),
      type: 'reply',
      reply_to: messageId,
      is_read: false,
      status: 'sent'
    });

    await replyMessage.save();

    // Update conversation
    conversation.message_count = (conversation.message_count || 0) + 1;
    conversation.last_message = replyMessage._id;
    conversation.last_message_at = new Date();
    conversation.last_message_preview = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    
    // Determine who needs to be notified
    if (userRole === 'faculty') {
      conversation.last_message_sender_role = 'faculty';
      conversation.unread_by_department = (conversation.unread_by_department || 0) + 1;
    } else {
      conversation.last_message_sender_role = 'department';
      conversation.unread_by_faculty = (conversation.unread_by_faculty || 0) + 1;
    }
    
    await conversation.save();

    // Populate for response
    await replyMessage.populate('sender_id', 'full_name email');

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: replyMessage
    });
  } catch (err) {
    console.error('Reply Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============= PROFILE =============

// PUT - Update profile
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const User = require('../models/User');
    const bcryptjs = require('bcryptjs');
    const { email, full_name, designation, password } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!full_name && !email && !password && !designation) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Find user in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (full_name) {
      user.full_name = full_name.trim();
    }
    if (email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email.toLowerCase().trim();
    }
    if (designation) {
      user.designation = designation.trim();
    }
    if (password) {
      user.password = password; // Password will be hashed by schema pre-save hook
    }

    user.updated_at = new Date();
    await user.save();

    // Return updated user object
    const updatedUser = {
      id: user._id,
      faculty_id: user.faculty_id,
      employee_id: user.employee_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT - Mark message as read
router.put('/mark-message-read/:messageId', verifyToken, async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    // Find and update message
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        is_read: true,
        $push: {
          read_by: {
            user_id: userId,
            read_at: new Date()
          }
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update conversation unread count
    const conversation = await Conversation.findById(message.conversation_id);
    if (conversation) {
      // Decrease unread count based on user role
      if (req.user.role === 'faculty') {
        conversation.unread_by_faculty = Math.max(0, (conversation.unread_by_faculty || 0) - 1);
      } else {
        conversation.unread_by_department = Math.max(0, (conversation.unread_by_department || 0) - 1);
      }
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (err) {
    console.error('Mark Read Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - Unread count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Count unread messages for this user
    const unreadCount = await Message.countDocuments({
      $and: [
        { is_read: false },
        {
          $or: [
            { sender_id: { $ne: userId } },  // Messages not sent by this user
            { reply_to: { $exists: true } }   // Or replies
          ]
        }
      ]
    });

    // Get unread conversations count
    let unreadConversations = 0;
    if (userRole === 'faculty') {
      unreadConversations = await Conversation.countDocuments({
        faculty_id: userId,
        unread_by_faculty: { $gt: 0 }
      });
    } else {
      unreadConversations = await Conversation.countDocuments({
        department: userRole,
        unread_by_department: { $gt: 0 }
      });
    }

    res.json({
      success: true,
      unreadCount: unreadCount,
      unreadConversations: unreadConversations
    });
  } catch (err) {
    console.error('Unread Count Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - List all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = [
      'Library',
      'Pharmacy',
      'Finance & Accounts',
      'Human Resources',
      'Records Office',
      'IT Department',
      'ORIC',
      'Administration',
      'Warden Office',
      'HOD Office',
      'Dean Office'
    ];

    res.json({
      success: true,
      data: departments,
      departments: departments,
      count: departments.length
    });
  } catch (err) {
    console.error('Get Departments Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Send clearance certificate email
router.post('/send-certificate', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;
    console.log('📧 Send Certificate Request from faculty:', facultyId);

    // Find the latest clearance request from this faculty
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.status(404).json({ success: false, message: 'No clearance request found' });
    }

    if (latestRequest.overall_status !== 'Cleared') {
      return res.status(400).json({ 
        success: false, 
        message: `Certificate can only be sent when clearance is complete. Current status: ${latestRequest.overall_status}` 
      });
    }

    // Build phases from departments
    const phases = DEPARTMENT_ORDER.map(dept => ({
      name: dept,
      status: latestRequest.departments[dept]?.status || 'Pending',
      remarks: latestRequest.departments[dept]?.remarks || ''
    }));

    const cert = await generateAndSendCertificate({
      _id: latestRequest._id,
      facultyName: latestRequest.faculty_name,
      facultyEmail: latestRequest.email,
      queryId: latestRequest.faculty_id,
      phases
    });

    latestRequest.qr_code = cert.qrDataUrl;
    await latestRequest.save();

    res.json({
      success: true,
      message: `Certificate sent to ${latestRequest.email}`
    });
  } catch (err) {
    console.error('❌ Send Certificate Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET - View clearance certificate
router.get('/clearance-certificate/:clearanceId', async (req, res) => {
  try {
    const { clearanceId } = req.params;
    const ClearanceRequest = require('../models/ClearanceRequest');

    console.log(`📄 Certificate request: ${clearanceId}`);

    // Find the clearance request
    const clearanceRequest = await ClearanceRequest.findById(clearanceId);

    if (!clearanceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Clearance record not found'
      });
    }

    // Check if faculty is fully cleared
    if (clearanceRequest.overall_status !== 'Cleared') {
      return res.status(403).json({
        success: false,
        message: 'Certificate is not available - clearance not yet complete'
      });
    }

    // Return certificate data
    console.log(`✅ Certificate retrieved for: ${clearanceRequest.faculty_name}`);
    
    res.json({
      success: true,
      certificate: {
        id: clearanceRequest._id,
        faculty_name: clearanceRequest.faculty_name,
        faculty_email: clearanceRequest.email,
        designation: clearanceRequest.designation,
        department: clearanceRequest.department,
        cleared_at: clearanceRequest.cleared_at,
        overall_status: clearanceRequest.overall_status,
        qr_code: clearanceRequest.qr_code,
        departments: clearanceRequest.departments
      }
    });
  } catch (err) {
    console.error('Certificate retrieval error:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving certificate: ' + err.message
    });
  }
});

// GET - Full clearance status with certificate link (for email links)
router.get('/certificate-view/:clearanceId', async (req, res) => {
  try {
    const { clearanceId } = req.params;
    const ClearanceRequest = require('../models/ClearanceRequest');

    const clearanceRequest = await ClearanceRequest.findById(clearanceId);

    if (!clearanceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (clearanceRequest.overall_status !== 'Cleared') {
      return res.status(403).json({
        success: false,
        message: 'This clearance is not yet complete'
      });
    }

    res.json({
      success: true,
      data: {
        id: clearanceRequest._id,
        faculty_name: clearanceRequest.faculty_name,
        designation: clearanceRequest.designation,
        email: clearanceRequest.email,
        cleared_at: clearanceRequest.cleared_at,
        qr_code: clearanceRequest.qr_code,
        all_departments: Object.keys(clearanceRequest.departments).map(dept => ({
          name: dept,
          status: clearanceRequest.departments[dept]?.status,
          approved_by: clearanceRequest.departments[dept]?.approved_by,
          checked_at: clearanceRequest.departments[dept]?.checked_at
        }))
      }
    });
  } catch (err) {
    console.error('Error retrieving certificate view:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET - Clearance Status for Faculty Dashboard
router.get('/clearance-status', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    // Fetch user to get employee_id
    const user = await User.findById(facultyId);
    const employeeId = user?.employee_id || 'N/A';
    
    console.log('📊 Fetching clearance status for faculty:', employeeId, `(ID: ${facultyId})`);

    // Find the latest clearance request for this faculty
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      console.log('⚠️ No clearance request found for faculty:', employeeId);
      return res.json({
        success: true,
        data: [],
        qr_code: null
      });
    }

    console.log('✅ Latest request found for employee:', employeeId);

    // Convert departments object to array format
    const departmentStatus = Object.keys(latestRequest.departments).map(deptName => ({
      department: deptName,
      status: latestRequest.departments[deptName]?.status || 'Pending',
      remarks: latestRequest.departments[deptName]?.remarks || '',
      checked_at: latestRequest.departments[deptName]?.checked_at,
      approved_by: latestRequest.departments[deptName]?.approved_by || latestRequest.departments[deptName]?.rejected_by
    }));

    console.log('📋 Department statuses for', employeeId + ':', departmentStatus.map(d => `${d.department}: ${d.status}`).join(', '));

    // Include QR code if all phases are complete
    const qrCode = latestRequest.overall_status === 'Cleared' ? latestRequest.qr_code : null;

    res.json({
      success: true,
      data: departmentStatus,
      qr_code: qrCode,
      overall_status: latestRequest.overall_status || 'Pending',
      employee_id: employeeId
    });
  } catch (err) {
    console.error('❌ Error fetching clearance status:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearance status: ' + err.message
    });
  }
});

// ============= ISSUE-BASED CLEARANCE CHECKING =============

// GET - Check if faculty has any unresolved issues blocking clearance
// This endpoint returns reason why faculty can't be cleared (if they're blocked)
router.get('/check-issues/:facultyId', async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    console.log(`🔍 [GET /check-issues] Checking issues for faculty: ${facultyId}`);

    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.json({
        success: true,
        hasPendingIssues: false,
        blockingIssues: [],
        message: 'No clearance request found'
      });
    }

    // Check for unresolved issues
    const blockingIssues = [];

    // Check returned items in departments
    for (const [deptName, deptData] of Object.entries(latestRequest.departments)) {
      if (deptData.status === 'Rejected') {
        blockingIssues.push({
          type: 'returned_items',
          department: deptName,
          message: `Items must be returned to ${deptName}`,
          remarks: deptData.remarks || 'No details provided'
        });
      }
    }

    // Check any pending items flag if it exists
    if (latestRequest.has_pending_items === true) {
      blockingIssues.push({
        type: 'pending_items',
        message: 'Faculty has pending items that need clearance',
        details: latestRequest.pending_items_details || []
      });
    }

    const hasPendingIssues = blockingIssues.length > 0;

    console.log(`   Blocking issues found: ${blockingIssues.length}`);

    res.json({
      success: true,
      hasPendingIssues: hasPendingIssues,
      blockingIssues: blockingIssues,
      totalBlockingIssues: blockingIssues.length,
      clearanceId: latestRequest._id,
      currentStatus: latestRequest.overall_status
    });
  } catch (err) {
    console.error('❌ Check Issues Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error checking issues: ' + err.message
    });
  }
});

// GET - Get detailed issue information for a specific department
// Returns what items need to be returned or what's blocking clearance
router.get('/check-issues/:facultyId/department/:department', async (req, res) => {
  try {
    const { facultyId, department } = req.params;
    console.log(`🔍 [GET /check-issues] Checking issues for ${facultyId} in ${department}`);

    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.status(404).json({
        success: false,
        message: 'No clearance request found'
      });
    }

    if (!latestRequest.departments[department]) {
      return res.status(404).json({
        success: false,
        message: `Department '${department}' not found in clearance request`
      });
    }

    const deptData = latestRequest.departments[department];

    // Build detailed issue information
    const issueDetails = {
      department: department,
      currentStatus: deptData.status,
      lastCheckedAt: deptData.checked_at,
      approvedBy: deptData.approved_by || null,
      checkedBy: deptData.checked_by || null,
      remarks: deptData.remarks || 'No remarks provided',
      isBlocking: deptData.status === 'Rejected'
    };

    // If rejected, provide more details about what's needed
    if (deptData.status === 'Rejected') {
      issueDetails.actionRequired = 'Items must be returned to this department';
      issueDetails.nextStep = `Visit ${department} office and resolve the issue`;
      issueDetails.canResubmit = true;
      issueDetails.resubmissionInstructions = `Once items are returned, use the 'Resubmit Clearance' option`;
    }

    console.log(`   ${department} status: ${deptData.status}`);

    res.json({
      success: true,
      issue: issueDetails,
      clearanceId: latestRequest._id
    });
  } catch (err) {
    console.error('❌ Check Department Issues Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error checking department issues: ' + err.message
    });
  }
});

// POST - Report uncleared items for a department
// Faculty can report items that they haven't cleared with a department
router.post('/report-pending-item', verifyToken, async (req, res) => {
  try {
    const {
      department,
      itemDescription,
      itemType,
      reportedDate
    } = req.body;

    const facultyId = req.user.id;

    console.log(`📝 [POST /report-pending-item] New report from ${facultyId}`);
    console.log(`   Department: ${department}, Item: ${itemDescription}`);

    if (!department || !itemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Department and item description are required'
      });
    }

    // Find the latest clearance request
    let latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.status(404).json({
        success: false,
        message: 'No clearance request found. Please submit a clearance request first.'
      });
    }

    // Initialize pending items array if it doesn't exist
    if (!latestRequest.pending_items) {
      latestRequest.pending_items = [];
    }

    // Add the new pending item
    const pendingItem = {
      _id: new mongoose.Types.ObjectId(),
      department,
      itemDescription,
      itemType: itemType || 'general',
      reportedDate: reportedDate || new Date(),
      createdAt: new Date(),
      status: 'pending',
      resolved: false
    };

    latestRequest.pending_items.push(pendingItem);
    latestRequest.has_pending_items = true;

    // Update the department status to reflect pending items
    if (latestRequest.departments[department]) {
      latestRequest.departments[department].hasPendingItems = true;
      latestRequest.departments[department].remarks = `Faculty has reported ${latestRequest.pending_items.filter(p => p.department === department).length} pending item(s)`;
    }

    await latestRequest.save();

    console.log(`✅ Pending item reported and saved`);

    res.json({
      success: true,
      message: 'Pending item reported successfully',
      pendingItem: pendingItem,
      totalPendingItems: latestRequest.pending_items.length
    });
  } catch (err) {
    console.error('❌ Report Pending Item Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error reporting pending item: ' + err.message
    });
  }
});

// GET - Get all pending items for a faculty member
router.get('/pending-items', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest || !latestRequest.pending_items) {
      return res.json({
        success: true,
        pendingItems: [],
        totalCount: 0,
        message: 'No pending items reported'
      });
    }

    // Group by department
    const itemsByDept = {};
    latestRequest.pending_items.forEach(item => {
      if (!itemsByDept[item.department]) {
        itemsByDept[item.department] = [];
      }
      itemsByDept[item.department].push(item);
    });

    res.json({
      success: true,
      pendingItems: latestRequest.pending_items,
      itemsByDepartment: itemsByDept,
      totalCount: latestRequest.pending_items.length,
      hasPendingItems: latestRequest.has_pending_items || false
    });
  } catch (err) {
    console.error('❌ Get Pending Items Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending items: ' + err.message
    });
  }
});

// PUT - Mark pending item as resolved
router.put('/pending-items/:itemId/resolve', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { resolvedDate, notes } = req.body;
    const facultyId = req.user.id;

    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.status(404).json({
        success: false,
        message: 'No clearance request found'
      });
    }

    // Find and update the pending item
    const item = latestRequest.pending_items.find(p => p._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Pending item not found'
      });
    }

    item.status = 'resolved';
    item.resolved = true;
    item.resolvedDate = resolvedDate || new Date();
    item.resolutionNotes = notes || 'Item resolved by faculty';

    await latestRequest.save();

    console.log(`✅ Pending item ${itemId} marked as resolved`);

    res.json({
      success: true,
      message: 'Item marked as resolved',
      item: item
    });
  } catch (err) {
    console.error('❌ Resolve Pending Item Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error resolving pending item: ' + err.message
    });
  }
});

// GET - Check specific issue blocking clearance
// Returns the primary reason why clearance is blocked
router.get('/blocking-issue/:facultyId', async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    console.log(`🚫 [GET /blocking-issue] Finding blocker for: ${facultyId}`);

    // Find the latest clearance request
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.json({
        success: true,
        isBlocked: false,
        blockingIssue: null
      });
    }

    // Find the first blocking issue
    let blockingIssue = null;

    // Check for rejected departments first (most critical)
    for (const [deptName, deptData] of Object.entries(latestRequest.departments)) {
      if (deptData.status === 'Rejected') {
        blockingIssue = {
          type: 'department_rejection',
          severity: 'high',
          department: deptName,
          message: `Clearance blocked: Items must be returned to ${deptName}`,
          details: deptData.remarks || 'No details available',
          action: 'Return items and resubmit clearance'
        };
        break;
      }
    }

    // Check for pending items
    if (!blockingIssue && latestRequest.has_pending_items) {
      const itemCount = latestRequest.pending_items?.length || 0;
      blockingIssue = {
        type: 'pending_items',
        severity: 'medium',
        message: `Clearance blocked: ${itemCount} unresolved item(s)`,
        itemCount: itemCount,
        action: 'Resolve pending items'
      };
    }

    console.log(`   Blocking issue: ${blockingIssue?.type || 'none'}`);

    res.json({
      success: true,
      isBlocked: !!blockingIssue,
      blockingIssue: blockingIssue,
      clearanceId: latestRequest._id,
      currentStatus: latestRequest.overall_status
    });
  } catch (err) {
    console.error('❌ Blocking Issue Check Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error checking blocking issue: ' + err.message
    });
  }
});

// POST - Department staff approve clearance for a faculty member
router.post('/clearance-requests/:facultyId/approve', verifyToken, async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { department, remarks } = req.body;
    const approverStaffId = req.user.id;
    const approverName = req.user.full_name;

    console.log(`\n🔍 [POST /clearance-requests/:facultyId/approve]`);
    console.log(`   Faculty ID: ${facultyId}`);
    console.log(`   Department: ${department}`);
    console.log(`   Approver: ${approverName} (${approverStaffId})`);

    // Validate inputs
    if (!facultyId || !department) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID and department are required'
      });
    }

    // Find the latest clearance request for this faculty
    const latestRequest = await ClearanceRequest.findOne({ faculty_id: facultyId })
      .sort({ created_at: -1 });

    if (!latestRequest) {
      return res.status(404).json({
        success: false,
        message: `No clearance request found for faculty ${facultyId}`
      });
    }

    // Check if department exists in the request
    if (!latestRequest.departments[department]) {
      return res.status(404).json({
        success: false,
        message: `Department '${department}' not found in clearance request`
      });
    }

    // Update the department approval status
    latestRequest.departments[department].status = 'Approved';
    latestRequest.departments[department].approved_by = approverStaffId;
    latestRequest.departments[department].approved_by_name = approverName;
    latestRequest.departments[department].remarks = remarks || 'Clearance approved by department staff';
    latestRequest.departments[department].checked_at = new Date();

    // Check if all departments in current phase are approved
    const currentPhase = latestRequest.current_phase;
    const deptsInPhase = PHASES[currentPhase] || [];
    const allPhaseDeptsApproved = deptsInPhase.every(dept => 
      latestRequest.departments[dept]?.status === 'Approved'
    );

    // If all departments in current phase are approved, move to next phase
    if (allPhaseDeptsApproved) {
      const nextPhase = getNextPhase(currentPhase);
      if (nextPhase) {
        latestRequest.current_phase = nextPhase;
        console.log(`   ✅ Moving to ${nextPhase}`);
      } else {
        // All phases completed
        latestRequest.overall_status = 'Completed';
        latestRequest.status = 'Approved';
        latestRequest.cleared_at = new Date();
        
        // Generate QR code for certificate
        const qrCode = await generateQRCode(latestRequest._id, latestRequest.faculty_name);
        latestRequest.qr_code = qrCode;
        
        console.log(`   🎉 All phases completed! Certificate generated.`);
      }
    }

    // Save updated request
    await latestRequest.save();

    console.log(`   ✅ ${department} clearance approved successfully`);

    res.json({
      success: true,
      message: `${department} clearance approved successfully`,
      data: {
        facultyId: latestRequest.faculty_id,
        faculty_name: latestRequest.faculty_name,
        current_phase: latestRequest.current_phase,
        overall_status: latestRequest.overall_status,
        department: department,
        approval_status: 'Approved'
      }
    });
  } catch (err) {
    console.error('❌ Approval Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error approving clearance: ' + err.message
    });
  }
});

module.exports = router;
