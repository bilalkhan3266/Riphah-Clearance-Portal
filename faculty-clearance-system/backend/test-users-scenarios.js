const axios = require('axios');

async function testVariousScenarios() {
  const testCases = [
    {
      name: 'Valid admin token',
      token: null,
      shouldWork: true
    },
    {
      name: 'Without token',
      token: 'none',
      shouldWork: false
    },
    {
      name: 'Invalid token',
      token: 'invalid.token.here',
      shouldWork: false
    }
  ];

  try {
    console.log('\n🔐 Getting admin token...\n');

    // Login with admin credentials first
    const loginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'zainab@admin.edu',
      password: 'Department@123'
    });

    const validToken = loginResponse.data.token;
    testCases[0].token = validToken;

    for (const testCase of testCases) {
      console.log(`\n📋 Test: ${testCase.name}`);
      try {
        const headers = testCase.token && testCase.token !== 'none' 
          ? { Authorization: `Bearer ${testCase.token}` }
          : {};
        
        const response = await axios.get('http://localhost:5001/api/admin/users', { headers });
        console.log(`✅ Status: ${response.status}`);
        console.log(`   Users count: ${response.data.data?.length || 0}`);
      } catch (error) {
        console.log(`❌ Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Setup error:');
    console.error('Message:', error.message);
  }
}

testVariousScenarios();
