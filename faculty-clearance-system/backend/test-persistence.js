const mongoose = require('mongoose');
const ClearanceRequest = require('./models/ClearanceRequest');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/faculty_clearance';

async function testPersistence() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Check existing clearance requests
    const allRequests = await ClearanceRequest.find().sort({ created_at: -1 });
    console.log(`\n📊 Total clearance requests in database: ${allRequests.length}\n`);

    if (allRequests.length > 0) {
      console.log('📋 Latest clearance requests:');
      allRequests.slice(0, 5).forEach((req, idx) => {
        console.log(`\n${idx + 1}. Faculty: ${req.faculty_name}`);
        console.log(`   ID: ${req._id}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Current Phase: ${req.current_phase}`);
        console.log(`   Submitted: ${new Date(req.created_at).toLocaleString()}`);
        console.log(`   Departments Status:`);
        
        ['Library', 'Pharmacy', 'Finance', 'HR'].forEach(dept => {
          if (req.departments[dept]) {
            console.log(`     - ${dept}: ${req.departments[dept].status}`);
          }
        });
      });
    } else {
      console.log('❌ No clearance requests found in database');
    }

    // Check faculty count
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    console.log(`\n👥 Total faculty members: ${facultyCount}`);

    console.log('\n✅ Persistence test completed!');
    console.log('\n💡 Tip: Submit a new clearance request from the web app,');
    console.log('   then run this test again to verify it was saved!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testPersistence();
