const mongoose = require('mongoose');
const Issue = require('./models/Issue');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

async function checkDepartmentIssues() {
  try {
    await mongoose.connect(mongoUrl, { connectTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 DEPARTMENT ISSUES ANALYSIS');
    console.log('═'.repeat(80));

    // Get all departments
    const departments = [
      'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records',
      'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'
    ];

    console.log('\n📊 ISSUES COUNT BY DEPARTMENT:\n');
    
    const summaryData = [];
    
    for (const dept of departments) {
      const count = await Issue.countDocuments({ departmentName: dept });
      const statuses = {};
      
      const issues = await Issue.find({ departmentName: dept });
      issues.forEach(issue => {
        statuses[issue.status] = (statuses[issue.status] || 0) + 1;
      });

      summaryData.push({
        dept,
        count,
        statuses
      });

      console.log(`${dept.padEnd(15)}: ${count.toString().padStart(3)} issues`);
      Object.entries(statuses).forEach(([status, cnt]) => {
        console.log(`${''.padEnd(17)}├─ ${status}: ${cnt}`);
      });
    }

    // Detailed ORIC analysis
    console.log('\n\n📦 DETAILED ORIC DEPARTMENT ANALYSIS:');
    console.log('═'.repeat(80));

    const oricIssues = await Issue.find({ departmentName: 'ORIC' })
      .sort({ facultyId: 1, issueDate: -1 });

    console.log(`\nTotal ORIC Issues: ${oricIssues.length}\n`);

    const oricByStatus = {};
    oricIssues.forEach(issue => {
      if (!oricByStatus[issue.status]) oricByStatus[issue.status] = [];
      oricByStatus[issue.status].push(issue);
    });

    Object.entries(oricByStatus).forEach(([status, issues]) => {
      console.log(`\n${status} (${issues.length} items):`);
      console.log('─'.repeat(80));
      
      const byFaculty = {};
      issues.forEach(issue => {
        if (!byFaculty[issue.facultyId]) byFaculty[issue.facultyId] = [];
        byFaculty[issue.facultyId].push(issue);
      });

      Object.entries(byFaculty).forEach(([fid, facultyIssues]) => {
        console.log(`  Faculty ${fid}: ${facultyIssues.length} items`);
        facultyIssues.forEach(issue => {
          console.log(`    • ${issue.itemType} (Qty: ${issue.quantity}) - ${issue.description}`);
        });
      });
    });

    // Display sample ORIC issues
    console.log('\n\n📋 SAMPLE ORIC ISSUES (First 10):\n');
    
    const sampleIssues = oricIssues.slice(0, 10);
    sampleIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. Faculty: ${issue.facultyId}`);
      console.log(`   Item: ${issue.itemType}`);
      console.log(`   Description: ${issue.description}`);
      console.log(`   Quantity: ${issue.quantity}`);
      console.log(`   Status: ${issue.status}`);
      console.log(`   Issue Date: ${new Date(issue.issueDate).toLocaleDateString()}`);
      console.log(`   Due Date: ${new Date(issue.dueDate).toLocaleDateString()}`);
      console.log('');
    });

    // Test API endpoint
    console.log('\n\n🌐 API ENDPOINT TEST:\n');
    console.log('To fetch ORIC issues via API, use:\n');
    console.log('GET http://localhost:5001/api/departments/ORIC/issues');
    console.log('Headers: Authorization: Bearer <TOKEN>\n');
    console.log('Expected Response:');
    console.log('{ "success": true, "count": ' + oricIssues.length + ', "data": [...] }\n');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

checkDepartmentIssues();
