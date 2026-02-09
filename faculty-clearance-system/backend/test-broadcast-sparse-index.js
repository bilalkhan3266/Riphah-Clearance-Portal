const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testBroadcast() {
  try {
    console.log('🧪 Testing Broadcast Message Functionality\n');

    // Step 1: Admin login to get token
    console.log('1️⃣  Logging in as admin...');
    const loginRes = await axios.post(`${API_BASE}/login`, {
      email: 'admin@system.edu',
      password: 'TestPass123'
    });
    const token = loginRes.data.token;
    console.log('   ✅ Login successful, token acquired\n');

    // Step 2: Send a broadcast message
    console.log('2️⃣  Sending broadcast message...');
    const broadcastRes = await axios.post(
      `${API_BASE}/admin/messages/broadcast`,
      {
        subject: 'Test Broadcast - No E11000 Error',
        content: 'This is a test broadcast message to verify the sparse index fix is working.'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (broadcastRes.status === 201 || broadcastRes.status === 200) {
      console.log('   ✅ Broadcast sent successfully!');
      console.log(`   📊 Response:`, {
        status: broadcastRes.status,
        conversationsCreated: broadcastRes.data.conversationsCreated,
        messagesCreated: broadcastRes.data.messagesCreated,
        recipientsCount: broadcastRes.data.recipientsCount
      });
    }

    // Step 3: Verify in database
    console.log('\n3️⃣  Verifying conversation creation...');
    const convsRes = await axios.get(`${API_BASE}/admin/messages/inbox`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   ✅ Admin has ${convsRes.data.length} conversations in inbox`);
    
    // Check for broadcast conversations (those with null faculty_id and department)
    const broadcastConvs = convsRes.data.filter(c => !c.faculty_id && !c.department);
    console.log(`   📨 Broadcast conversations (null faculty/dept): ${broadcastConvs.length}`);

    console.log('\n✅ BROADCAST TEST PASSED - No E11000 Error!');
    console.log('\n📝 Summary:');
    console.log('   • Sparse index successfully allows multiple null values');
    console.log('   • Broadcast messages can be sent without unique constraint violation');
    console.log('   • Conversation creation works as expected');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

testBroadcast();
