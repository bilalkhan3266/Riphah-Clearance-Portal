const axios = require('axios');

async function getAdminToken() {
  try {
    console.log('\n🔐 Getting admin token...\n');

    // Login with admin credentials
    const loginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'zainab@admin.edu',
      password: 'Department@123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Got admin token\n');
    console.log('\n📊 Testing Admin Routes...\n');

    // Test /api/admin/stats
    console.log('Testing GET /api/admin/stats...');
    const statsResponse = await axios.get('http://localhost:5001/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ /api/admin/stats response:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

    // Test /api/admin/department-stats
    console.log('\nTesting GET /api/admin/department-stats...');
    const deptResponse = await axios.get('http://localhost:5001/api/admin/department-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ /api/admin/department-stats response:');
    console.log(JSON.stringify(deptResponse.data, null, 2));

    console.log('\n✅ All admin routes working correctly!');
  } catch (error) {
    console.error('❌ Error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
  }
}

getAdminToken();
