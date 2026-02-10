const axios = require('axios');

async function testDepartmentsAndSend() {
  console.log('🧪 Testing Departments and Message Send...\n');
  
  try {
    // Step 1: Test departments endpoint
    console.log('Step 1: Testing /api/departments endpoint...');
    const deptResponse = await axios.get('http://localhost:5001/api/departments');
    
    if (deptResponse.data.success) {
      console.log('✅ Departments endpoint works!');
      console.log(`   Found ${deptResponse.data.data.length} departments:`);
      deptResponse.data.data.forEach(dept => console.log(`   - ${dept}`));
    } else {
      console.log('❌ Departments endpoint failed');
    }
    
    // Step 2: Login as faculty
    console.log('\nStep 2: Logging in as faculty...');
    let loginResponse;
    try {
      loginResponse = await axios.post('http://localhost:5001/api/login', {
        email: 'ahmed@faculty.edu',
        password: 'Faculty@123'
      });
      console.log('✅ Login successful');
      console.log(`   Token: ${loginResponse.data.token?.substring(0, 30)}...`);
      console.log(`   User: ${loginResponse.data.user?.full_name}`);
    } catch (err) {
      console.log('❌ Login failed:', err.response?.data?.message);
      return;
    }
    
    const token = loginResponse.data.token;
    
    // Step 3: Send a message
    console.log('\nStep 3: Sending message to Library...');
    try {
      const sendResponse = await axios.post(
        'http://localhost:5001/api/send',
        {
          recipientDepartment: 'Library',
          subject: 'Test Message',
          message: 'This is a test message to verify the endpoint works'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (sendResponse.data.success) {
        console.log('✅ Message sent successfully!');
        console.log(`   Message ID: ${sendResponse.data.data._id}`);
        console.log(`   Department: ${sendResponse.data.data.receiver_department}`);
      } else {
        console.log('❌ Message send failed:', sendResponse.data.message);
      }
    } catch (err) {
      console.log('❌ Message send error:', err.response?.data?.message || err.message);
      console.log('   Full error:', err.response?.data);
    }
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testDepartmentsAndSend();
