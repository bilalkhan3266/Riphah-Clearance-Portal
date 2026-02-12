const axios = require('axios');

async function testUsersEndpoint() {
  try {
    console.log('\n🔐 Getting admin token...\n');

    // Login with admin credentials
    const loginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'zainab@admin.edu',
      password: 'Department@123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Got admin token\n');

    // Test /api/admin/users
    console.log('Testing GET /api/admin/users...');
    try {
      const usersResponse = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /api/admin/users response:');
      console.log(JSON.stringify(usersResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Error fetching users:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data);
      console.error('Full error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
  }
}

testUsersEndpoint();
