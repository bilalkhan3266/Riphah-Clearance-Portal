const express = require('express');
const router = express.Router();
const ClearanceRequest = require('../models/ClearanceRequest');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// ==================== ADMIN STATISTICS ====================

// GET - Overall admin statistics
router.get('/admin/stats', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/stats] Request received');
    console.log('   User Role:', req.user.role);
    
    // Check if user is admin
    if (req.user.role.toLowerCase() !== 'admin') {
      console.log('   ❌ Error: User is not admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access statistics' 
      });
    }

    // Get total clearance requests
    const totalRequests = await ClearanceRequest.countDocuments();
    
    // Get requests by status
    const approvedRequests = await ClearanceRequest.countDocuments({ overall_status: 'Cleared' });
    const pendingRequests = await ClearanceRequest.countDocuments({ overall_status: 'In Progress' });
    
    // Count rejected (departments with rejected status)
    const allRequests = await ClearanceRequest.find({});
    let rejectedCount = 0;
    allRequests.forEach(req => {
      if (req.departments && typeof req.departments === 'object') {
        Object.values(req.departments).forEach(dept => {
          if (dept && dept.status === 'Rejected') {
            rejectedCount++;
          }
        });
      }
    });

    const stats = {
      totalRequests: totalRequests,
      approvedCount: approvedRequests,
      pendingCount: pendingRequests,
      rejectedCount: rejectedCount
    };

    console.log('   ✅ Stats retrieved successfully');
    console.log('   Total:', totalRequests, 'Approved:', approvedRequests, 'Pending:', pendingRequests, 'Rejected:', rejectedCount);

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('   ❌ Error fetching stats:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics: ' + err.message 
    });
  }
});

// GET - Department-wise statistics
router.get('/admin/department-stats', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/department-stats] Request received');
    console.log('   User Role:', req.user.role);
    
    // Check if user is admin
    if (req.user.role.toLowerCase() !== 'admin') {
      console.log('   ❌ Error: User is not admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access statistics' 
      });
    }

    const allDepartments = [
      'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 
      'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'
    ];

    const departmentStats = {};
    const allRequests = await ClearanceRequest.find({});

    // Initialize stats for all departments
    allDepartments.forEach(dept => {
      departmentStats[dept] = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      };
    });

    // Count statuses for each department
    allRequests.forEach(req => {
      if (req.departments) {
        allDepartments.forEach(dept => {
          if (req.departments[dept]) {
            departmentStats[dept].total++;
            
            if (req.departments[dept].status === 'Pending') {
              departmentStats[dept].pending++;
            } else if (req.departments[dept].status === 'Approved') {
              departmentStats[dept].approved++;
            } else if (req.departments[dept].status === 'Rejected') {
              departmentStats[dept].rejected++;
            }
          }
        });
      }
    });

    console.log('   ✅ Department stats retrieved successfully');

    res.json({
      success: true,
      data: {
        stats: departmentStats,
        departments: allDepartments
      }
    });
  } catch (err) {
    console.error('   ❌ Error fetching department stats:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department statistics: ' + err.message 
    });
  }
});

// ==================== USER MANAGEMENT ====================

// GET - All users
router.get('/admin/users', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/users] Request received');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access user management' 
      });
    }

    const users = await User.find({}).select('-password').lean();
    
    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('   ❌ Error fetching users:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users: ' + err.message 
    });
  }
});

// POST - Create user
router.post('/admin/users', verifyToken, async (req, res) => {
  try {
    console.log('\n📝 [POST /admin/users] Create user request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can create users' 
      });
    }

    const { full_name, email, password, phone, department, role } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      full_name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      department: department || 'General',
      role: role || 'faculty'
    });

    await newUser.save();
    const savedUser = newUser.toObject();
    delete savedUser.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser
    });
  } catch (err) {
    console.error('   ❌ Error creating user:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user: ' + err.message 
    });
  }
});

// PUT - Update user
router.put('/admin/users/:userId', verifyToken, async (req, res) => {
  try {
    console.log('\n📝 [PUT /admin/users/:userId] Update user request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can update users' 
      });
    }

    const { userId } = req.params;
    const { full_name, email, phone, department, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (full_name) user.full_name = full_name;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (role) user.role = role;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('   ❌ Error updating user:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user: ' + err.message 
    });
  }
});

// DELETE - Delete user
router.delete('/admin/users/:userId', verifyToken, async (req, res) => {
  try {
    console.log('\n🗑️ [DELETE /admin/users/:userId] Delete user request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can delete users' 
      });
    }

    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('   ❌ Error deleting user:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user: ' + err.message 
    });
  }
});

// ==================== DEPARTMENTS ====================

// GET - All departments
router.get('/admin/departments', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/departments] Request received');
    
    const allDepartments = [
      'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 
      'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'
    ];

    res.json({
      success: true,
      data: allDepartments
    });
  } catch (err) {
    console.error('   ❌ Error fetching departments:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments: ' + err.message 
    });
  }
});

// GET - Department users
router.get('/admin/departments/:departmentId/users', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/departments/:departmentId/users] Request received');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access department users' 
      });
    }

    const { departmentId } = req.params;
    const users = await User.find({ department: departmentId }).select('-password').lean();

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('   ❌ Error fetching department users:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch department users: ' + err.message 
    });
  }
});

// ==================== ADMIN PROFILE ====================

// GET - Admin profile
router.get('/admin/profile', verifyToken, async (req, res) => {
  try {
    console.log('\n🔍 [GET /admin/profile] Request received');
    console.log('   User ID:', req.user.id);
    console.log('   User Role:', req.user.role);
    
    if (req.user.role.toLowerCase() !== 'admin') {
      console.log('   ❌ User is not admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access their profile' 
      });
    }

    const user = await User.findById(req.user.id).select('-password').lean();
    console.log('   User found:', !!user);
    
    if (!user) {
      console.log('   ❌ Admin user not found in database');
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    console.log('   ✅ Profile retrieved successfully');
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('   ❌ Error fetching admin profile:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile: ' + err.message 
    });
  }
});

// PUT - Update admin profile
router.put('/admin/profile', verifyToken, async (req, res) => {
  try {
    console.log('\n📝 [PUT /admin/profile] Update profile request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can update their profile' 
      });
    }

    const { full_name, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // If email is changing, check for duplicates
    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('   ❌ Error updating profile:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile: ' + err.message 
    });
  }
});

// PUT - Change password
router.put('/admin/change-password', verifyToken, async (req, res) => {
  try {
    console.log('\n🔐 [PUT /admin/change-password] Change password request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can change their password' 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('   ❌ Error changing password:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password: ' + err.message 
    });
  }
});

// ==================== ADMIN MESSAGES ====================

// GET - Inbox
router.get('/admin/messages/inbox', verifyToken, async (req, res) => {
  try {
    console.log('\n💬 [GET /admin/messages/inbox] Request received');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access messages' 
      });
    }

    const Conversation = require('../models/Conversation');
    const messages = await Conversation.find({ recipient_id: req.user.id })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    console.error('   ❌ Error fetching inbox:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch inbox: ' + err.message 
    });
  }
});

// GET - Sent messages
router.get('/admin/messages/sent', verifyToken, async (req, res) => {
  try {
    console.log('\n💬 [GET /admin/messages/sent] Request received');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can access messages' 
      });
    }

    const Conversation = require('../models/Conversation');
    const messages = await Conversation.find({ sender_id: req.user.id })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    console.error('   ❌ Error fetching sent messages:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sent messages: ' + err.message 
    });
  }
});

// POST - Send broadcast message
router.post('/admin/messages/broadcast', verifyToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('\n📤 [POST /admin/messages/broadcast] Send broadcast request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      console.log('   ❌ Unauthorized: User is not admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can send broadcast messages' 
      });
    }

    const { subject, content } = req.body;
    if (!subject || !content) {
      console.log('   ❌ Validation failed: Missing subject or content');
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get admin user info
    const admin = await User.findById(req.user.id).select('full_name email role').lean();
    if (!admin) {
      console.log(`   ❌ Admin not found: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    
    console.log('   📋 Fetching all non-admin users...');
    // Get all users (excluding admins)
    const allUsers = await User.find({ role: { $ne: 'admin' } }).select('_id').lean();
    console.log(`   ✓ Found ${allUsers.length} users to broadcast to`);
    
    if (allUsers.length === 0) {
      console.log('   ⚠️  No users found to broadcast to');
      return res.status(400).json({
        success: false,
        message: 'No users available to send broadcast to'
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const failedUsers = [];

    console.log('   📨 Creating conversations and messages...\n');

    // Process users in batches to avoid overwhelming the database
    const BATCH_SIZE = 10;
    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
      const batch = allUsers.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (user) => {
        try {
          // Check if conversation already exists for this sender-recipient pair
          let conversation = await Conversation.findOne({
            sender_id: req.user.id,
            recipient_id: user._id
          }).lean();

          // Only create conversation if it doesn't exist
          if (!conversation) {
            const newConversation = new Conversation({
              sender_id: req.user.id,
              recipient_id: user._id,
              subject,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            conversation = await newConversation.save();
          }

          // Create message with all required fields
          const message = new Message({
            conversation_id: conversation._id,
            sender_id: req.user.id,
            sender_name: admin.full_name,
            sender_role: admin.role,
            sender_email: admin.email,
            subject: subject,
            message: content,
            type: 'broadcast',  // Mark as broadcast for tracking
            read: false,
            created_at: new Date()
          });

          await message.save();

          // Update conversation's last message info
          await Conversation.findByIdAndUpdate(conversation._id, {
            last_message: message._id,
            last_message_at: new Date(),
            last_message_preview: content.substring(0, 100),
            last_message_sender_role: 'admin',
            message_count: (conversation.message_count || 0) + 1,
            unread_by_faculty: (conversation.unread_by_faculty || 0) + 1,
            updated_at: new Date()
          });

          successCount++;
          return { success: true, userId: user._id };

        } catch (userError) {
          console.error(`   ❌ Error for user ${user._id}: ${userError.message}`);
          errorCount++;
          failedUsers.push({ userId: user._id, error: userError.message });
          return { success: false, userId: user._id, error: userError.message };
        }
      });

      await Promise.all(batchPromises);
      console.log(`   ✓ Batch ${Math.ceil(i / BATCH_SIZE)} processed (${successCount}/${allUsers.length})`);
    }

    const duration = Date.now() - startTime;
    console.log(`\n   ✅ Broadcast completed in ${duration}ms`);
    console.log(`   📊 Results: ${successCount} successful, ${errorCount} failed`);

    if (errorCount > 0) {
      console.log(`   ⚠️  Failed users: ${failedUsers.length}`);
    }

    res.status(201).json({
      success: true,
      message: `Broadcast sent to ${successCount} users${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      data: {
        totalUsers: allUsers.length,
        successful: successCount,
        failed: errorCount,
        duration: `${duration}ms`,
        failedUsers: errorCount > 0 ? failedUsers : undefined
      }
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`   ❌ Error sending broadcast: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to send broadcast';
    let statusCode = 500;

    if (err.message.includes('E11000')) {
      errorMessage = 'Database constraint violation - please ensure indexes are properly configured';
      statusCode = 409;
      console.error('   💡 Hint: Run "node fix-index-simple.js" in the backend directory');
    } else if (err.message.includes('No database connection')) {
      errorMessage = 'Database connection lost';
      statusCode = 503;
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: err.message,
      duration: `${duration}ms`
    });
  }
});

// POST - Send message to specific department
router.post('/admin/messages/send-to-department', verifyToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('\n📤 [POST /admin/messages/send-to-department] Send to department request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      console.log('   ❌ Unauthorized: User is not admin');
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can send messages' 
      });
    }

    const { department, subject, content } = req.body;
    if (!department || !subject || !content) {
      console.log('   ❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Department, subject, and content are required'
      });
    }

    // Get admin user info
    const admin = await User.findById(req.user.id).select('full_name email role').lean();
    if (!admin) {
      console.log(`   ❌ Admin not found: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    
    console.log(`   📋 Fetching users from ${department} department...`);
    // Get users from specific department
    const departmentUsers = await User.find({ department: department }).select('_id').lean();
    console.log(`   ✓ Found ${departmentUsers.length} users in ${department}`);
    
    if (departmentUsers.length === 0) {
      console.log(`   ⚠️  No users found in ${department} department`);
      return res.status(400).json({
        success: false,
        message: `No users found in ${department} department`
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const failedUsers = [];

    console.log(`   📨 Creating conversations and messages for ${department}...\n`);

    // Process users in batches
    const BATCH_SIZE = 10;
    for (let i = 0; i < departmentUsers.length; i += BATCH_SIZE) {
      const batch = departmentUsers.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (user) => {
        try {
          // Check if conversation already exists for this sender-recipient pair
          let conversation = await Conversation.findOne({
            sender_id: req.user.id,
            recipient_id: user._id,
            department: department
          }).lean();

          // Only create conversation if it doesn't exist
          if (!conversation) {
            const newConversation = new Conversation({
              sender_id: req.user.id,
              recipient_id: user._id,
              subject,
              department: department,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            conversation = await newConversation.save();
          }

          // Create message with all required fields
          const message = new Message({
            conversation_id: conversation._id,
            sender_id: req.user.id,
            sender_name: admin.full_name,
            sender_role: admin.role,
            sender_email: admin.email,
            subject: subject,
            message: content,
            type: 'department',  // Mark as department-specific message
            read: false,
            created_at: new Date()
          });

          await message.save();

          // Update conversation's last message info
          await Conversation.findByIdAndUpdate(conversation._id, {
            last_message: message._id,
            last_message_at: new Date(),
            last_message_preview: content.substring(0, 100),
            last_message_sender_role: 'admin',
            message_count: (conversation.message_count || 0) + 1,
            unread_by_faculty: (conversation.unread_by_faculty || 0) + 1,
            updated_at: new Date()
          });

          successCount++;
          return { success: true, userId: user._id };

        } catch (userError) {
          console.error(`   ❌ Error for user ${user._id}: ${userError.message}`);
          errorCount++;
          failedUsers.push({ userId: user._id, error: userError.message });
          return { success: false, userId: user._id, error: userError.message };
        }
      });

      await Promise.all(batchPromises);
      console.log(`   ✓ Batch ${Math.ceil((i + BATCH_SIZE) / BATCH_SIZE)} processed (${successCount}/${departmentUsers.length})`);
    }

    const duration = Date.now() - startTime;
    console.log(`\n   ✅ Department message completed in ${duration}ms`);
    console.log(`   📊 Results: ${successCount} successful, ${errorCount} failed`);

    if (errorCount > 0) {
      console.log(`   ⚠️  Failed users: ${failedUsers.length}`);
    }

    res.status(201).json({
      success: true,
      message: `Message sent to ${successCount} users in ${department}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      data: {
        department: department,
        totalUsers: departmentUsers.length,
        successful: successCount,
        failed: errorCount,
        duration: `${duration}ms`,
        failedUsers: errorCount > 0 ? failedUsers : undefined
      }
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`   ❌ Error sending message to department: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to send message';
    let statusCode = 500;

    if (err.message.includes('E11000')) {
      errorMessage = 'Database constraint violation - please ensure indexes are properly configured';
      statusCode = 409;
      console.error('   💡 Hint: Run "node fix-index-simple.js" in the backend directory');
    } else if (err.message.includes('No database connection')) {
      errorMessage = 'Database connection lost';
      statusCode = 503;
    }

    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: err.message,
      duration: `${duration}ms`
    });
  }
});

// POST - Reply to message
router.post('/admin/messages/:messageId/reply', verifyToken, async (req, res) => {
  try {
    console.log('\n💬 [POST /admin/messages/:messageId/reply] Reply to message request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can reply to messages' 
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const Message = require('../models/Message');

    // Find the original message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Get admin user info
    const admin = await User.findById(req.user.id).select('full_name email role').lean();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Create reply message with all required fields
    const replyMessage = new Message({
      conversation_id: originalMessage.conversation_id,
      sender_id: req.user.id,
      sender_name: admin.full_name,
      sender_role: admin.role,
      sender_email: admin.email,
      subject: `Re: ${originalMessage.subject || 'No Subject'}`,
      message: content,
      type: 'reply',
      reply_to: messageId,
      created_at: new Date()
    });

    const savedReply = await replyMessage.save();

    console.log('   ✅ Reply sent successfully');
    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: savedReply
    });
  } catch (err) {
    console.error('   ❌ Error replying to message:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reply to message: ' + err.message 
    });
  }
});

// DELETE - Delete message
router.delete('/admin/messages/:messageId', verifyToken, async (req, res) => {
  try {
    console.log('\n🗑️ [DELETE /admin/messages/:messageId] Delete message request');
    
    if (req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can delete messages' 
      });
    }

    const { messageId } = req.params;
    const Message = require('../models/Message');

    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error('   ❌ Error deleting message:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message: ' + err.message 
    });
  }
});

module.exports = router;
