const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a test token (you may need to adjust based on your auth setup)
const testToken = jwt.sign(
  { userId: 'test-user', role: 'department-admin' },
  process.env.JWT_SECRET || 'your-secret-key-here',
  { expiresIn: '1h' }
);

console.log('\n🧪 Testing Approved Records API\n');
console.log('Token:', testToken.substring(0, 20) + '...\n');

axios
  .get('http://localhost:5001/api/departments/approved-records/all', {
    headers: { Authorization: `Bearer ${testToken}` }
  })
  .then(response => {
    console.log('✅ API Response:');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(err => {
    console.log('❌ API Error:');
    console.log(err.response?.status, err.response?.statusText);
    console.log(err.response?.data || err.message);
  });
