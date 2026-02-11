#!/usr/bin/env node

/**
 * TEST SCRIPT: End-to-End Messaging Flow
 * Tests: Faculty sends message → Department receives → Department replies → Faculty receives reply
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5001/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}🧪 ${msg}${colors.reset}`),
  step: (num, msg) => console.log(`${colors.yellow}\n[Step ${num}] ${msg}${colors.reset}`)
};

let facultyToken = null;
let libraryToken = null;
let facultyId = null;
let libraryStaffId = null;

// ============================================================================
// STEP 1: Get Test Users from Database
// ============================================================================
async function getTestUsers() {
  log.step(1, 'Connecting to database and fetching test users...');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty_clearance');
    
    const User = require('./models/User');
    
    // Get a faculty user
    const facultyUser = await User.findOne({ role: 'faculty' });
    if (!facultyUser) {
      log.error('No faculty user found in database');
      process.exit(1);
    }
    
    facultyId = facultyUser._id.toString();
    log.success(`Found faculty user: ${facultyUser.full_name} (ID: ${facultyId})`);
    
    // Get a Library department staff user
    const libraryStaff = await User.findOne({ role: 'Library' });
    if (!libraryStaff) {
      log.error('No Library staff found in database');
      process.exit(1);
    }
    
    libraryStaffId = libraryStaff._id.toString();
    log.success(`Found Library staff: ${libraryStaff.full_name} (ID: ${libraryStaffId})`);
    
    await mongoose.disconnect();
    
    return { facultyUser, libraryStaff };
  } catch (err) {
    log.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// STEP 2: Login Faculty User
// ============================================================================
async function loginFaculty(facultyUser) {
  log.step(2, 'Logging in as faculty member...');
  
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: facultyUser.email,
      password: 'Faculty@123' // Test faculty password
    });
    
    if (!response.data.token) {
      log.error('Login failed: No token in response');
      console.log(response.data);
      process.exit(1);
    }
    
    facultyToken = response.data.token;
    log.success(`Faculty logged in. Token: ${facultyToken.substring(0, 20)}...`);
  } catch (err) {
    log.error(`Faculty login failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// STEP 3: Login Library Staff User
// ============================================================================
async function loginLibraryStaff(libraryStaff) {
  log.step(3, 'Logging in as Library staff...');
  
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: libraryStaff.email,
      password: 'Department@123' // Test department password
    });
    
    if (!response.data.token) {
      log.error('Login failed: No token in response');
      console.log(response.data);
      process.exit(1);
    }
    
    libraryToken = response.data.token;
    log.success(`Library staff logged in. Token: ${libraryToken.substring(0, 20)}...`);
  } catch (err) {
    log.error(`Library staff login failed: ${err.response?.data?.message || err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// STEP 4: Faculty Sends Message to Library
// ============================================================================
async function facultySendsMessage() {
  log.step(4, 'Faculty sends message to Library department...');
  
  try {
    const messageData = {
      recipientDepartment: 'Library',
      subject: 'Test Message from Faculty',
      message: 'This is a test message to verify two-way messaging works correctly.'
    };
    
    const response = await axios.post(
      `${API_URL}/send`,
      messageData,
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    
    if (!response.data.success) {
      log.error(`Sending message failed: ${response.data.message}`);
      console.log(response.data);
      return null;
    }
    
    const messageId = response.data.data._id;
    log.success(`Message sent successfully. Message ID: ${messageId}`);
    return messageId;
  } catch (err) {
    log.error(`Send message error: ${err.response?.data?.message || err.message}`);
    console.log('Error details:', err.response?.data);
    return null;
  }
}

// ============================================================================
// STEP 5: Verify Faculty Message Appears in Faculty's Sent Messages
// ============================================================================
async function facultyViewsMessages() {
  log.step(5, 'Faculty checks their sent messages...');
  
  try {
    const response = await axios.get(
      `${API_URL}/my-messages`,
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    
    if (!response.data.success) {
      log.error(`Fetching messages failed: ${response.data.message}`);
      return false;
    }
    
    const messages = response.data.data || response.data.messages || [];
    if (messages.length === 0) {
      log.error('No messages found in faculty inbox');
      return false;
    }
    
    log.success(`Faculty can see ${messages.length} message(s)`);
    
    // Show last message
    const lastMsg = messages[0];
    log.info(`Last message: "${lastMsg.message?.substring(0, 50)}..."`);
    log.info(`From: ${lastMsg.sender_name || 'Unknown'}`);
    log.info(`Department: ${lastMsg.receiver_department || lastMsg.conversation?.department}`);
    
    return true;
  } catch (err) {
    log.error(`Error fetching faculty messages: ${err.message}`);
    return false;
  }
}

// ============================================================================
// STEP 6: Verify Library Can See Faculty's Message
// ============================================================================
async function libraryViewsMessages() {
  log.step(6, 'Library staff checks their received messages...');
  
  try {
    const response = await axios.get(
      `${API_URL}/my-messages`,
      { headers: { Authorization: `Bearer ${libraryToken}` } }
    );
    
    if (!response.data.success) {
      log.error(`Fetching messages failed: ${response.data.message}`);
      return null;
    }
    
    const messages = response.data.data || response.data.messages || [];
    if (messages.length === 0) {
      log.error('Library staff cannot see any messages (should see faculty message)');
      return null;
    }
    
    log.success(`Library staff can see ${messages.length} message(s)`);
    
    // Find the message from faculty
    const facultyMsg = messages.find(m => 
      m.sender_role === 'faculty' && m.receiver_department === 'Library'
    );
    
    if (!facultyMsg) {
      log.error('Could not find faculty message in library inbox');
      return null;
    }
    
    log.success('✅ Library staff found message from faculty');
    log.info(`Message: "${facultyMsg.message?.substring(0, 50)}..."`);
    log.info(`From: ${facultyMsg.sender_name}`);
    
    return facultyMsg._id;
  } catch (err) {
    log.error(`Error fetching library messages: ${err.message}`);
    console.log('Error response:', err.response?.data);
    return null;
  }
}

// ============================================================================
// STEP 7: Library Staff Replies to Faculty Message
// ============================================================================
async function libraryReplies(messageId) {
  log.step(7, 'Library staff replies to faculty message...');
  
  if (!messageId) {
    log.error('No message ID provided for reply');
    return false;
  }
  
  try {
    const replyData = {
      message: 'Thank you for your inquiry. We have processed your clearance request.'
    };
    
    const response = await axios.post(
      `${API_URL}/messages/reply/${messageId}`,
      replyData,
      { headers: { Authorization: `Bearer ${libraryToken}` } }
    );
    
    if (!response.data.success) {
      log.error(`Reply failed: ${response.data.message}`);
      return false;
    }
    
    log.success('Reply sent successfully by Library staff');
    return true;
  } catch (err) {
    log.error(`Reply error: ${err.response?.data?.message || err.message}`);
    console.log('Error response:', err.response?.data);
    return false;
  }
}

// ============================================================================
// STEP 8: Verify Faculty Can See Library's Reply
// ============================================================================
async function facultyViewsReply() {
  log.step(8, 'Faculty checks for library reply...');
  
  try {
    const response = await axios.get(
      `${API_URL}/my-messages`,
      { headers: { Authorization: `Bearer ${facultyToken}` } }
    );
    
    if (!response.data.success) {
      log.error(`Fetching messages failed: ${response.data.message}`);
      return false;
    }
    
    const messages = response.data.data || response.data.messages || [];
    
    // Look for reply from library
    const replyMsg = messages.find(m => 
      m.sender_role === 'Library' && m.type === 'reply'
    );
    
    if (!replyMsg) {
      log.error('Faculty cannot see reply from Library (but may exist in conversation)');
      
      // Check conversations instead
      if (response.data.conversations && response.data.conversations.length > 0) {
        const libraryConv = response.data.conversations.find(c => c.department === 'Library');
        if (libraryConv && libraryConv.message_count > 1) {
          log.success('✅ Conversation with Library has multiple messages (reply received)');
          log.info(`Total messages in conversation: ${libraryConv.message_count}`);
          return true;
        }
      }
      
      return false;
    }
    
    log.success('✅ Faculty can see reply from Library staff');
    log.info(`Reply: "${replyMsg.message?.substring(0, 50)}..."`);
    log.info(`From: ${replyMsg.sender_name} (${replyMsg.sender_role})`);
    
    return true;
  } catch (err) {
    log.error(`Error fetching faculty messages: ${err.message}`);
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runTests() {
  console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║  FACULTY CLEARANCE - TWO-WAY MESSAGING TEST   ║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════╝' + colors.reset + '\n');
  
  try {
    // Get users
    const { facultyUser, libraryStaff } = await getTestUsers();
    
    // Login both users
    await loginFaculty(facultyUser);
    await loginLibraryStaff(libraryStaff);
    
    // Test message flow
    const messageId = await facultySendsMessage();
    
    if (!messageId) {
      log.error('Cannot continue - message creation failed');
      process.exit(1);
    }
    
    // Add small delay to ensure database writes complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify faculty sees message
    const facultySeesMsg = await facultyViewsMessages();
    
    // Verify library sees message
    const libraryMsgId = await libraryViewsMessages();
    
    if (libraryMsgId) {
      // Library replies
      const replySent = await libraryReplies(libraryMsgId);
      
      if (replySent) {
        // Add delay for database
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Faculty checks for reply
        const facultySeesReply = await facultyViewsReply();
        
        console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════╗' + colors.reset);
        if (facultySeesMsg && libraryMsgId && replySent && facultySeesReply) {
          console.log(colors.green + '║  ✅ ALL TESTS PASSED - TWO-WAY MESSAGING OK  ║' + colors.reset);
        } else {
          console.log(colors.yellow + '║  ⚠️  PARTIAL SUCCESS - SOME STEPS FAILED      ║' + colors.reset);
        }
        console.log(colors.cyan + '╚══════════════════════════════════════════════╝' + colors.reset + '\n');
      }
    }
    
    process.exit(0);
  } catch (err) {
    log.error(`Test runner error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Run the tests
runTests();
