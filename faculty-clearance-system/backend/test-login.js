const axios = require('axios');

async function testLogin() {
  console.log('Testing login endpoint...\n');
  
  try {
    console.log('📤 Sending login request...');
    console.log('URL: http://localhost:5001/api/login');
    console.log('Email: ahmed@faculty.edu');
    console.log('Password: Faculty@123\n');
    
    const response = await axios.post('http://localhost:5001/api/login', {
      email: 'ahmed@faculty.edu',
      password: 'Faculty@123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
  } catch (err) {
    console.log('❌ Login failed');
    console.log('Status:', err.response?.status);
    console.log('Status Text:', err.response?.statusText);
    console.log('Error:', err.response?.data);
    
    if (err.message) {
      console.log('Message:', err.message);
    }
  }
}

testLogin();
