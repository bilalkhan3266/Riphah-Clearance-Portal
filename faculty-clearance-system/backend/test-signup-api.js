require('dotenv').config();
const axios = require('axios');

async function testSignup() {
  const API_URL = 'http://localhost:5001';
  
  const testData = {
    full_name: 'Test Faculty',
    email: `testfaculty${Date.now()}@test.edu`,
    password: 'TestPassword123',
    employee_id: `EMP-${Date.now()}`,
    designation: 'Professor',
    department: 'Computer Science'
  };

  console.log('📝 Testing Signup API');
  console.log('   API URL:', API_URL + '/api/signup');
  console.log('   Test Data:', JSON.stringify(testData, null, 2));

  try {
    console.log('\n🚀 Sending POST request...');
    const response = await axios.post(`${API_URL}/api/signup`, testData);
    
    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log('\n❌ Error! Details:');
    console.log('   Status:', err.response?.status);
    console.log('   Status Text:', err.response?.statusText);
    console.log('   Response Data:', JSON.stringify(err.response?.data, null, 2));
    console.log('   Error Message:', err.message);
  }
}

testSignup();
