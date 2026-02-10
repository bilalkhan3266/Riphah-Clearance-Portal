const axios = require('axios');

const tests = [];

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  FULL SYSTEM ENDPOINT TEST                     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  let token = null;

  // Test 1: Health Check
  try {
    console.log('Test 1: Health Check');
    const response = await axios.get('http://localhost:5001/api/health');
    console.log('✅ PASS - Backend is running\n');
    tests.push({ name: 'Health Check', status: 'PASS' });
  } catch (err) {
    console.log('❌ FAIL - Backend health check failed\n');
    tests.push({ name: 'Health Check', status: 'FAIL' });
    return;
  }

  // Test 2: Departments Endpoint
  try {
    console.log('Test 2: Get Departments');
    const response = await axios.get('http://localhost:5001/api/departments');
    if (response.data.success && response.data.data.length === 11) {
      console.log(`✅ PASS - Found ${response.data.data.length} departments\n`);
      tests.push({ name: 'Get Departments', status: 'PASS' });
    } else {
      console.log('❌ FAIL - Unexpected response\n');
      tests.push({ name: 'Get Departments', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`❌ FAIL - ${err.message}\n`);
    tests.push({ name: 'Get Departments', status: 'FAIL' });
  }

  // Test 3: Login
  try {
    console.log('Test 3: Faculty Login');
    const response = await axios.post('http://localhost:5001/api/login', {
      email: 'ahmed@faculty.edu',
      password: 'Faculty@123'
    });
    
    if (response.data.success && response.data.token) {
      token = response.data.token;
      console.log(`✅ PASS - Login successful (Token: ${token.substring(0, 20)}...)\n`);
      tests.push({ name: 'Faculty Login', status: 'PASS' });
    } else {
      console.log('❌ FAIL - No token in response\n');
      tests.push({ name: 'Faculty Login', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`❌ FAIL - ${err.response?.data?.message || err.message}\n`);
    tests.push({ name: 'Faculty Login', status: 'FAIL' });
  }

  if (!token) {
    console.log('Cannot continue - login failed');
    return;
  }

  // Test 4: Send Message
  try {
    console.log('Test 4: Send Message to Library');
    const response = await axios.post(
      'http://localhost:5001/api/send',
      {
        recipientDepartment: 'Library',
        subject: 'System Test Message',
        message: 'This is an automated system test message'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      console.log(`✅ PASS - Message sent (ID: ${response.data.data._id})\n`);
      tests.push({ name: 'Send Message', status: 'PASS' });
    } else {
      console.log('❌ FAIL - Send failed\n');
      tests.push({ name: 'Send Message', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`❌ FAIL - ${err.response?.data?.message || err.message}\n`);
    tests.push({ name: 'Send Message', status: 'FAIL' });
  }

  // Test 5: Get Messages
  try {
    console.log('Test 5: Get My Messages');
    const response = await axios.get(
      'http://localhost:5001/api/my-messages',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log(`✅ PASS - Found ${response.data.data.length} messages\n`);
      tests.push({ name: 'Get Messages', status: 'PASS' });
    } else {
      console.log('❌ FAIL - Unexpected response\n');
      tests.push({ name: 'Get Messages', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`❌ FAIL - ${err.message}\n`);
    tests.push({ name: 'Get Messages', status: 'FAIL' });
  }

  // Test 6: Department Login
  try {
    console.log('Test 6: Department Staff Login');
    const response = await axios.post('http://localhost:5001/api/login', {
      email: 'ahmed@library.edu',
      password: 'Department@123'
    });
    
    if (response.data.success && response.data.token) {
      const deptToken = response.data.token;
      console.log(`✅ PASS - Login successful (Token: ${deptToken.substring(0, 20)}...)\n`);
      tests.push({ name: 'Department Login', status: 'PASS' });

      // Test 7: Department See Messages
      try {
        console.log('Test 7: Department Receives Faculty Messages');
        const msgResponse = await axios.get(
          'http://localhost:5001/api/my-messages',
          { headers: { Authorization: `Bearer ${deptToken}` } }
        );
        
        if (msgResponse.data.success && msgResponse.data.data.length > 0) {
          const hasLibraryMsg = msgResponse.data.data.some(m => 
            m.receiver_department === 'Library' || m.conversation?.department === 'Library'
          );
          if (hasLibraryMsg) {
            console.log(`✅ PASS - Department can see messages from faculty\n`);
            tests.push({ name: 'Department Receives Messages', status: 'PASS' });
          } else {
            console.log(`⚠️ PARTIAL - Messages exist but not from faculty\n`);
            tests.push({ name: 'Department Receives Messages', status: 'PARTIAL' });
          }
        }
      } catch (err) {
        console.log(`❌ FAIL - ${err.message}\n`);
        tests.push({ name: 'Department Receives Messages', status: 'FAIL' });
      }
    } else {
      console.log('❌ FAIL - No token in response\n');
      tests.push({ name: 'Department Login', status: 'FAIL' });
    }
  } catch (err) {
    console.log(`❌ FAIL - ${err.message}\n`);
    tests.push({ name: 'Department Login', status: 'FAIL' });
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  TEST SUMMARY                                  ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const passed = tests.filter(t => t.status === 'PASS').length;
  const failed = tests.filter(t => t.status === 'FAIL').length;
  const partial = tests.filter(t => t.status === 'PARTIAL').length;

  tests.forEach(t => {
    const icon = t.status === 'PASS' ? '✅' : t.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${t.name}: ${t.status}`);
  });

  console.log(`\nTotal: ${passed} passed, ${failed} failed, ${partial} partial`);
  
  if (failed === 0) {
    console.log('\n🎉 All critical tests passed! System ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

runTests();
