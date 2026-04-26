/**
 * CRITICAL DIAGNOSTIC: Test API is actually working
 * This will tell us if the backend is running and responding
 */

const axios = require('axios');

async function criticalDiagnostic() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   CRITICAL DIAGNOSTIC: API TEST                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const API_URL = 'http://localhost:5001';

    // Test 1: Is server alive?
    console.log('Test 1: Server Connectivity');
    console.log('─'.repeat(60));
    try {
      console.log('Connecting to http://localhost:5001...');
      const pingResponse = await axios.get(`${API_URL}/api/login`, { timeout: 5000 });
      console.log('✅ Server is responsive');
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        console.error('❌ Connection refused - Backend is NOT running!');
        console.error('\n🔧 ACTION NEEDED:');
        console.error('   1. Open a terminal');
        console.error('   2. cd backend');
        console.error('   3. node server.js');
        console.error('   4. Wait for: ✅ Server running on port 5001');
        process.exit(1);
      } else if (err.code === 'ENOTFOUND') {
        console.error('❌ Cannot find localhost - check network');
        process.exit(1);
      } else {
        console.log('✅ Server exists (returned error as expected for GET /login)\n');
      }
    }

    // Test 2: Login
    console.log('Test 2: Authentication');
    console.log('─'.repeat(60));
    console.log('Logging in as library@test.edu...');
    
    let token;
    try {
      const loginRes = await axios.post(`${API_URL}/api/login`, {
        email: 'library@test.edu',
        password: 'Test@123'
      });

      if (!loginRes.data.success) {
        console.error('❌ Login failed:', loginRes.data.message);
        process.exit(1);
      }

      token = loginRes.data.token;
      console.log('✅ Login successful');
      console.log(`Token: ${token.substring(0, 30)}...\n`);
    } catch (err) {
      console.error('❌ Login error:', err.response?.data?.message || err.message);
      process.exit(1);
    }

    // Test 3: API Request for Library Issues
    console.log('Test 3: Library Issues API');
    console.log('─'.repeat(60));
    console.log('Calling: GET /api/departments/Library/issues\n');

    try {
      const issuesRes = await axios.get(`${API_URL}/api/departments/Library/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ API Response received');
      console.log('\nResponse:');
      console.log(JSON.stringify(issuesRes.data, null, 2));

      if (issuesRes.data.count === 0) {
        console.log('\n⚠️  API returned 0 issues');
        console.log('\nThis could mean:');
        console.log('  1. departmentName parameter is wrong');
        console.log('  2. Database query is filtering out all results');
        console.log('  3. No issues exist for Library department');
      } else {
        console.log(`\n✅ API returned ${issuesRes.data.count} issues`);
      }
    } catch (err) {
      console.error('❌ API call failed:', err.response?.data?.message || err.message);
      if (err.response?.status === 401) {
        console.error('   Token might be expired or invalid');
      }
      process.exit(1);
    }

    // Test 4: Check database
    console.log('\n\nTest 4: Database Direct Check');
    console.log('─'.repeat(60));

    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');

    const Issue = require('./models/Issue');
    const count = await Issue.countDocuments({ departmentName: 'Library' });
    
    console.log(`Database has ${count} Library issues`);

    if (count === 0) {
      console.error('\n❌ NO DATA in database!');
      console.error('\n🔧 ACTION NEEDED:');
      console.error('   Run: node create-bulk-issues.js');
    } else {
      console.log('✅ Database has data');
    }

    await mongoose.connection.close();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60) + '\n');

    if (issuesRes.data.count === count) {
      console.log('✅ API matches database');
    } else {
      console.log(`❌ Mismatch: API=${issuesRes.data.count}, DB=${count}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

criticalDiagnostic();
