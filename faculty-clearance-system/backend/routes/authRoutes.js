const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 [POST /login] Request received');
    console.log('   Email:', email);
    console.log('   Password length:', password?.length);
    console.log('   Headers:', {
      'Content-Type': req.headers['content-type'],
      'Origin': req.headers['origin']
    });
    
    if (!email || !password) {
      console.log('   ❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('   ❌ User not found:', email.toLowerCase());
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('   ✅ User found:', user.full_name);

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log('   ❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('   ✅ Password matched');

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        faculty_id: user.faculty_id,
        employee_id: user.employee_id
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    console.log('   ✅ Token generated');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        faculty_id: user.faculty_id,
        employee_id: user.employee_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation
      }
    });

    console.log('   ✅ Login response sent successfully');

  } catch (err) {
    console.error('❌ Login error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: err.message
    });
  }
});

// SIGNUP - Faculty Only
router.post('/signup', async (req, res) => {
  try {
    console.log('🔐 [POST /signup] Request received');
    console.log('   Body:', JSON.stringify(req.body, null, 2));
    
    const { full_name, email, password, employee_id, designation, department } = req.body;

    console.log('   Parsed fields:');
    console.log('     full_name:', full_name);
    console.log('     email:', email);
    console.log('     password: [hidden]');
    console.log('     employee_id:', employee_id);
    console.log('     designation:', designation);
    console.log('     department:', department);

    if (!full_name || !email || !password || !employee_id || !designation || !department) {
      console.log('   ❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: full_name, email, password, employee_id, designation, department',
        received: { full_name, email, employee_id, designation, department },
        missing: {
          full_name: !full_name,
          email: !email,
          password: !password,
          employee_id: !employee_id,
          designation: !designation,
          department: !department
        }
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('   ❌ Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if employee_id already exists
    const existingEmployeeId = await User.findOne({ employee_id: employee_id.toUpperCase() });
    if (existingEmployeeId) {
      console.log('   ❌ Employee ID already registered:', employee_id);
      return res.status(400).json({
        success: false,
        message: 'Employee ID already registered'
      });
    }

    console.log('   ✅ Validation passed, creating user');


    // Create faculty user
    const user = new User({
      full_name,
      email: email.toLowerCase(),
      password,
      employee_id: employee_id.toUpperCase(),
      faculty_id: employee_id.toUpperCase(),  // Set faculty_id equal to employee_id
      role: 'faculty',  // Always faculty
      designation,      // Required for faculty
      department,       // Required for faculty
      verified: true
    });

    await user.save();
    console.log('   ✅ Faculty user created:', user._id);

    res.json({
      success: true,
      message: 'Faculty account created successfully',
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        employee_id: user.employee_id,
        faculty_id: user.faculty_id
      }
    });
    console.log('   ✅ Signup response sent successfully');

  } catch (err) {
    console.error('❌ Signup error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup: ' + err.message
    });
  }
});

// FORGOT PASSWORD - Send 6-digit code via email
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('🔐 [POST /forgot-password] Request received');
    const { email } = req.body;

    if (!email) {
      console.log('   ❌ Email is required');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('   ℹ️ Email not found (not revealing for security):', email.toLowerCase());
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset code shortly.'
      });
    }

    console.log('   ✅ User found:', user.full_name);

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes

    // Save code to user
    user.reset_code = resetCode;
    user.reset_code_expires = codeExpiry;
    await user.save();

    console.log('   ✅ Reset code generated:', resetCode);
    console.log('   ⏰ Code expires at:', codeExpiry);

    // Try to send email if configured
    try {
      const { sendPasswordResetCodeEmail } = require('../utils/emailService');
      await sendPasswordResetCodeEmail(user.email, user.full_name, resetCode);
      console.log('   ✅ Reset code email sent to:', user.email);
    } catch (emailErr) {
      console.warn('   ⚠️ Email service failed:', emailErr.message);
      // Still consider this success since code is saved
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, you will receive a password reset code shortly.'
    });

  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// VERIFY RESET CODE - Verify the 6-digit code
router.post('/verify-reset-code', async (req, res) => {
  try {
    console.log('🔐 [POST /verify-reset-code] Request received');
    const { email, code } = req.body;

    if (!email || !code) {
      console.log('   ❌ Email and code required');
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('   ❌ User not found:', email.toLowerCase());
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if code exists and hasn't expired
    if (!user.reset_code) {
      console.log('   ❌ No reset code found for user');
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new one.'
      });
    }

    if (new Date() > user.reset_code_expires) {
      console.log('   ❌ Reset code expired');
      user.reset_code = undefined;
      user.reset_code_expires = undefined;
      await user.save();
      return res.status(401).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    // Verify code
    if (user.reset_code !== code.trim()) {
      console.log('   ❌ Invalid code provided');
      return res.status(401).json({
        success: false,
        message: 'Invalid code. Please try again.'
      });
    }

    console.log('   ✅ Code verified for user:', user.full_name);

    res.json({
      success: true,
      message: 'Code verified. You can now set a new password.'
    });

  } catch (err) {
    console.error('❌ Verify reset code error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the code.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// SET NEW PASSWORD - Update password after code verification
router.post('/set-new-password', async (req, res) => {
  try {
    console.log('🔐 [POST /set-new-password] Request received');
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      console.log('   ❌ Email, code and password required');
      return res.status(400).json({
        success: false,
        message: 'Email, code, and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('   ❌ User not found:', email.toLowerCase());
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify code is still valid
    if (!user.reset_code || user.reset_code !== code.trim()) {
      console.log('   ❌ Invalid or expired code');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired code. Please request a new reset.'
      });
    }

    if (new Date() > user.reset_code_expires) {
      console.log('   ❌ Reset code expired');
      user.reset_code = undefined;
      user.reset_code_expires = undefined;
      await user.save();
      return res.status(401).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      console.log('   ❌ Password too weak');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Update password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_code = undefined;
    user.reset_code_expires = undefined;
    await user.save();

    console.log('   ✅ Password updated for user:', user.full_name);

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });

  } catch (err) {
    console.error('❌ Set new password error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// RESET PASSWORD - Keep for backward compatibility (will use code system)
router.post('/reset-password', async (req, res) => {
  try {
    console.log('🔐 [POST /reset-password] Request received');
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      console.log('   ❌ Token and password required');
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
    } catch (err) {
      console.log('   ❌ Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('   ❌ User not found for token:', decoded.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      console.log('   ❌ Password too weak');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Update password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log('   ✅ Password updated for user:', user.full_name);

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });

  } catch (err) {
    console.error('❌ Reset password error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
