const axios = require('axios');

async function testNonAdminUser() {
  try {
    console.log('\n🔐 Testing non-admin user access...\n');

    // Login with faculty user
    const facultyLoginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'testfaculty1@university.edu',
      password: 'testpass123'
    });

    const facultyToken = facultyLoginResponse.data.token;
    const facultyUser = facultyLoginResponse.data.user;
    console.log(`✅ Logged in as: ${facultyUser.full_name} (Role: ${facultyUser.role})`);

    // Try to access /api/admin/users with faculty token
    console.log('\nTesting GET /api/admin/users with faculty token...');
    try {
      const response = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${facultyToken}` }
      });
      console.log(`❌ Unexpected success! Status: ${response.status}`);
    } catch (error) {
      console.log(`✅ Expected error - Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

    // Now login as admin
    console.log('\n\n🔐 Testing admin user access...\n');
    const adminLoginResponse = await axios.post('http://localhost:5001/api/login', {
      email: 'zainab@admin.edu',
      password: 'Department@123'
    });

    const adminToken = adminLoginResponse.data.token;
    const adminUser = adminLoginResponse.data.user;
    console.log(`✅ Logged in as: ${adminUser.full_name} (Role: ${adminUser.role})`);

    // Try to access /api/admin/users with admin token
    console.log('\nTesting GET /api/admin/users with admin token...');
    try {
      const response = await axios.get('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Success! Status: ${response.status}`);
      console.log(`   Users returned: ${response.data.data?.length || 0}`);
    } catch (error) {
      console.log(`❌ Error - Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

  } catch (error) {
    console.error('❌ Setup error:');
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testNonAdminUser();
