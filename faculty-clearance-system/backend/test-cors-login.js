const axios = require('axios');

async function testLoginWithCORS() {
  try {
    console.log('Testing login with CORS headers...\n');
    
    const response = await axios.post(
      'http://localhost:5001/api/login',
      {
        email: 'ahmed@faculty.edu',
        password: 'Faculty@123'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        }
      }
    );
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Token:', response.data.token?.substring(0, 30) + '...');
    console.log('User:', response.data.user?.full_name);
  } catch (err) {
    console.log('❌ Login failed');
    console.log('Status:', err.response?.status);
    console.log('Status text:', err.response?.statusText);
    console.log('CORS Headers:', err.response?.headers);
    console.log('Data:', err.response?.data);
    console.log('Message:', err.message);
  }
}

testLoginWithCORS();
