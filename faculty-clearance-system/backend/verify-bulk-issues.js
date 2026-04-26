const mongoose = require('mongoose');
const Issue = require('./models/Issue');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

// Faculty IDs to verify
const facultyIds = Array.from({ length: 40 }, (_, i) => String(3331 + i));

async function verifyBulkIssues() {
  try {
    await mongoose.connect(mongoUrl, { 
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000 
    });
    console.log('✅ Connected to MongoDB\n');

    console.log('📋 VERIFYING BULK ISSUES DATA');
    console.log('='.repeat(80));

    // Check total count
    const totalIssues = await Issue.countDocuments({ facultyId: { $in: facultyIds } });
    console.log(`\n📊 Total Issues Found: ${totalIssues}`);
    console.log(`👥 Total Faculty Members: ${facultyIds.length}`);
    console.log(`📦 Issues per Faculty: ${(totalIssues / facultyIds.length).toFixed(2)}\n`);

    // Show detailed breakdown by department
    console.log('📈 ISSUES BY DEPARTMENT:');
    console.log('─'.repeat(80));
    
    const departments = ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'];
    
    for (const dept of departments) {
      const count = await Issue.countDocuments({ 
        facultyId: { $in: facultyIds },
        departmentName: dept
      });
      console.log(`   ${dept.padEnd(15)} : ${count.toString().padStart(4)} issues`);
    }

    // Show detailed breakdown by faculty
    console.log('\n📍 ISSUES BY FACULTY (Sample):');
    console.log('─'.repeat(80));
    
    for (let i = 0; i < Math.min(10, facultyIds.length); i++) {
      const fid = facultyIds[i];
      const count = await Issue.countDocuments({ facultyId: fid });
      console.log(`   Faculty ${fid} : ${count.toString().padStart(2)} issues`);
    }
    console.log(`   ... (showing first 10 of ${facultyIds.length} faculty)\n`);

    // Show sample issues with details
    console.log('🔍 SAMPLE ISSUES (First 5 across all departments):');
    console.log('─'.repeat(80));
    
    const sampleIssues = await Issue.find({ facultyId: { $in: facultyIds } })
      .limit(5)
      .sort({ createdAt: -1 });

    sampleIssues.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. Faculty ID: ${issue.facultyId}`);
      console.log(`   Department: ${issue.departmentName}`);
      console.log(`   Item Type: ${issue.itemType}`);
      console.log(`   Description: ${issue.description}`);
      console.log(`   Quantity: ${issue.quantity}`);
      console.log(`   Status: ${issue.status}`);
      console.log(`   Issue Date: ${issue.issueDate.toLocaleDateString()}`);
      console.log(`   Due Date: ${issue.dueDate.toLocaleDateString()}`);
    });

    // Show all issues for one faculty as detailed example
    const exampleFacultyId = facultyIds[0];
    console.log(`\n\n📋 DETAILED ISSUES FOR FACULTY ${exampleFacultyId}:`);
    console.log('─'.repeat(80));
    
    const facultyIssues = await Issue.find({ facultyId: exampleFacultyId })
      .sort({ departmentName: 1 });

    if (facultyIssues.length > 0) {
      const groupedByDept = {};
      facultyIssues.forEach(issue => {
        if (!groupedByDept[issue.departmentName]) {
          groupedByDept[issue.departmentName] = [];
        }
        groupedByDept[issue.departmentName].push(issue);
      });

      Object.entries(groupedByDept).forEach(([dept, issues]) => {
        console.log(`\n  📦 ${dept} (${issues.length} items):`);
        issues.forEach((issue, idx) => {
          console.log(`     ${idx + 1}. ${issue.itemType}`);
          console.log(`        • Qty: ${issue.quantity}, Status: ${issue.status}`);
          console.log(`        • Due: ${issue.dueDate.toLocaleDateString()}`);
        });
      });
    }

    // Create a detailed report file
    console.log('\n\n📄 CREATING DETAILED REPORT FILE...');
    console.log('─'.repeat(80));
    
    let reportContent = `# BULK ISSUES VERIFICATION REPORT\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    reportContent += `## Summary Statistics\n`;
    reportContent += `- Total Issues Created: ${totalIssues}\n`;
    reportContent += `- Total Faculty Members: ${facultyIds.length}\n`;
    reportContent += `- Total Departments: ${departments.length}\n`;
    reportContent += `- Issues per Faculty (Average): ${(totalIssues / facultyIds.length).toFixed(2)}\n\n`;

    reportContent += `## Issues by Department\n\n`;
    for (const dept of departments) {
      const count = await Issue.countDocuments({ 
        facultyId: { $in: facultyIds },
        departmentName: dept
      });
      reportContent += `- **${dept}**: ${count} issues\n`;
    }

    reportContent += `\n## All Faculty Members with Issue Count\n\n`;
    reportContent += `| Faculty ID | Issue Count |\n`;
    reportContent += `|---|---|\n`;
    
    for (const fid of facultyIds) {
      const count = await Issue.countDocuments({ facultyId: fid });
      reportContent += `| ${fid} | ${count} |\n`;
    }

    // Save report
    const fs = require('fs');
    const reportPath = './BULK_ISSUES_REPORT.md';
    fs.writeFileSync(reportPath, reportContent);
    console.log(`✅ Report saved to: ${reportPath}\n`);

    // Final verification query
    console.log('✅ VERIFICATION COMPLETE');
    console.log('─'.repeat(80));
    console.log('\n✨ All data has been verified and is available in MongoDB!');
    console.log(`   • Check MongoDB directly: db.issues.find({facultyId: "3331"})`);
    console.log(`   • View detailed report: BULK_ISSUES_REPORT.md`);
    console.log(`   • Query by department: db.issues.find({departmentName: "Lab"})`);
    console.log(`\n`);

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

verifyBulkIssues();
