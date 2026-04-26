const mongoose = require('mongoose');
const fs = require('fs');
const Issue = require('./models/Issue');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

async function displayAllIssues() {
  try {
    await mongoose.connect(mongoUrl, { connectTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    console.log('📋 COMPLETE ISSUES DISPLAY - ALL 981 ITEMS');
    console.log('═'.repeat(100));

    // Get all issues
    const allIssues = await Issue.find()
      .sort({ facultyId: 1, departmentName: 1 })
      .lean();

    console.log(`\n📊 TOTAL ISSUES: ${allIssues.length}`);
    console.log(`👥 TOTAL FACULTY MEMBERS: ${new Set(allIssues.map(i => i.facultyId)).size}`);
    console.log(`🏢 TOTAL DEPARTMENTS: ${new Set(allIssues.map(i => i.departmentName)).size}\n`);

    // Display by department
    console.log('═'.repeat(100));
    console.log('ISSUES GROUPED BY DEPARTMENT');
    console.log('═'.repeat(100));

    const departments = [
      'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records',
      'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'
    ];

    let issueCounter = 1;
    let departmentFile = '';
    departmentFile += `# 📋 COMPLETE DEPARTMENT ISSUES REPORT\n`;
    departmentFile += `Generated: ${new Date().toLocaleString()}\n\n`;
    departmentFile += `**Total Issues**: ${allIssues.length}\n`;
    departmentFile += `**Total Faculty**: ${new Set(allIssues.map(i => i.facultyId)).size}\n`;
    departmentFile += `**Departments**: ${departments.length}\n\n`;
    departmentFile += `---\n\n`;

    for (const dept of departments) {
      const deptIssues = allIssues.filter(i => i.departmentName === dept);
      
      console.log(`\n📦 ${dept.toUpperCase()} (${deptIssues.length} issues)`);
      console.log('─'.repeat(100));

      departmentFile += `## ${dept} Department (${deptIssues.length} issues)\n\n`;
      departmentFile += `| # | Faculty ID | Item Type | Description | Qty | Status | Due Date |\n`;
      departmentFile += `|---|---|---|---|---|---|---|\n`;

      const facultyGroups = {};
      deptIssues.forEach(issue => {
        if (!facultyGroups[issue.facultyId]) {
          facultyGroups[issue.facultyId] = [];
        }
        facultyGroups[issue.facultyId].push(issue);
      });

      Object.entries(facultyGroups).forEach(([fid, issues]) => {
        console.log(`  Faculty ${fid}: ${issues.length} items`);
        issues.forEach((issue, idx) => {
          const dueDateStr = issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A';
          console.log(`     ${idx + 1}. ${issue.itemType} (Qty: ${issue.quantity}, Status: ${issue.status}, Due: ${dueDateStr})`);
          
          departmentFile += `| ${issueCounter++} | ${fid} | ${issue.itemType} | ${issue.description} | ${issue.quantity} | ${issue.status} | ${dueDateStr} |\n`;
        });
      });

      departmentFile += `\n`;
    }

    // Display by faculty
    console.log('\n\n═'.repeat(100));
    console.log('ISSUES GROUPED BY FACULTY');
    console.log('═'.repeat(100));

    let facultyFile = '';
    facultyFile += `# 📋 FACULTY ISSUES REPORT\n`;
    facultyFile += `Generated: ${new Date().toLocaleString()}\n\n`;

    const facultyIds = Array.from({ length: 40 }, (_, i) => String(3331 + i));
    
    for (const fid of facultyIds) {
      const facultyIssues = allIssues.filter(i => i.facultyId === fid);
      
      console.log(`\n👤 Faculty ${fid}: ${facultyIssues.length} items`);
      
      facultyFile += `## Faculty ${fid} (${facultyIssues.length} items)\n\n`;
      facultyFile += `| Department | Item Type | Description | Qty | Status | Issue Date | Due Date |\n`;
      facultyFile += `|---|---|---|---|---|---|---|\n`;

      const deptGroups = {};
      facultyIssues.forEach(issue => {
        if (!deptGroups[issue.departmentName]) {
          deptGroups[issue.departmentName] = [];
        }
        deptGroups[issue.departmentName].push(issue);
      });

      Object.entries(deptGroups).sort().forEach(([dept, issues]) => {
        console.log(`  📦 ${dept}: ${issues.length} items`);
        issues.forEach(issue => {
          const issueDateStr = new Date(issue.issueDate).toLocaleDateString();
          const dueDateStr = issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A';
          facultyFile += `| ${dept} | ${issue.itemType} | ${issue.description} | ${issue.quantity} | ${issue.status} | ${issueDateStr} | ${dueDateStr} |\n`;
        });
      });

      facultyFile += `\n`;
    }

    // Save files
    console.log('\n\n📁 SAVING REPORT FILES...');
    console.log('─'.repeat(100));

    fs.writeFileSync('./DEPARTMENT_ISSUES_REPORT.md', departmentFile);
    console.log('✅ Saved: DEPARTMENT_ISSUES_REPORT.md');

    fs.writeFileSync('./FACULTY_ISSUES_REPORT.md', facultyFile);
    console.log('✅ Saved: FACULTY_ISSUES_REPORT.md');

    // Create summary statistics file
    let summaryFile = `# 📊 ISSUES SUMMARY STATISTICS\n`;
    summaryFile += `Generated: ${new Date().toLocaleString()}\n\n`;
    summaryFile += `## Overview\n`;
    summaryFile += `- **Total Issues Created**: ${allIssues.length}\n`;
    summaryFile += `- **Total Faculty Members**: ${new Set(allIssues.map(i => i.facultyId)).size}\n`;
    summaryFile += `- **Total Departments**: ${departments.length}\n`;
    summaryFile += `- **Average Issues per Faculty**: ${(allIssues.length / 40).toFixed(2)}\n\n`;

    summaryFile += `## Issues by Status\n`;
    const statusCounts = {};
    allIssues.forEach(issue => {
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      summaryFile += `- **${status}**: ${count} items\n`;
    });

    summaryFile += `\n## Issues by Department\n\n`;
    summaryFile += `| Department | Count | Percentage |\n`;
    summaryFile += `|---|---|---|\n`;
    
    departments.forEach(dept => {
      const count = allIssues.filter(i => i.departmentName === dept).length;
      const percentage = ((count / allIssues.length) * 100).toFixed(1);
      summaryFile += `| ${dept} | ${count} | ${percentage}% |\n`;
    });

    summaryFile += `\n## Issues by Faculty\n\n`;
    summaryFile += `| Faculty ID | Count |\n`;
    summaryFile += `|---|---|\n`;
    
    for (const fid of facultyIds) {
      const count = allIssues.filter(i => i.facultyId === fid).length;
      summaryFile += `| ${fid} | ${count} |\n`;
    }

    fs.writeFileSync('./ISSUES_SUMMARY.md', summaryFile);
    console.log('✅ Saved: ISSUES_SUMMARY.md');

    // Create API test guide
    let apiGuide = `# 🌐 API ENDPOINTS FOR VIEWING ISSUES\n\n`;
    apiGuide += `## Available Endpoints\n\n`;
    
    apiGuide += `### 1. Get All Pending Issues for Faculty\n`;
    apiGuide += `\`\`\`bash\n`;
    apiGuide += `curl -X GET http://localhost:5001/api/department-issues/my-pending-issues \\\n`;
    apiGuide += `  -H "Authorization: Bearer YOUR_TOKEN"\n`;
    apiGuide += `\`\`\`\n\n`;

    apiGuide += `### 2. Get Phase Status\n`;
    apiGuide += `\`\`\`bash\n`;
    apiGuide += `curl -X GET http://localhost:5001/api/department-issues/phase-status \\\n`;
    apiGuide += `  -H "Authorization: Bearer YOUR_TOKEN"\n`;
    apiGuide += `\`\`\`\n\n`;

    apiGuide += `### 3. Get Clearance Requirements\n`;
    apiGuide += `\`\`\`bash\n`;
    apiGuide += `curl -X GET http://localhost:5001/api/department-issues/clearance-requirements \\\n`;
    apiGuide += `  -H "Authorization: Bearer YOUR_TOKEN"\n`;
    apiGuide += `\`\`\`\n\n`;

    apiGuide += `### 4. Get Issues by Department\n`;
    apiGuide += `\`\`\`bash\n`;
    apiGuide += `curl -X GET "http://localhost:5001/api/department-issues/pending/Lab" \\\n`;
    apiGuide += `  -H "Authorization: Bearer YOUR_TOKEN"\n`;
    apiGuide += `\`\`\`\n\n`;

    apiGuide += `## How to Get a Token\n`;
    apiGuide += `\`\`\`bash\n`;
    apiGuide += `curl -X POST http://localhost:5001/api/login \\\n`;
    apiGuide += `  -H "Content-Type: application/json" \\\n`;
    apiGuide += `  -d '{"email":"faculty1@test.edu","password":"Test@123"}'\n`;
    apiGuide += `\`\`\`\n\n`;

    apiGuide += `## Response Example\n`;
    apiGuide += `The response will contain all issues grouped by department.\n\n`;

    fs.writeFileSync('./API_ENDPOINTS_GUIDE.md', apiGuide);
    console.log('✅ Saved: API_ENDPOINTS_GUIDE.md');

    console.log('\n✨ ALL REPORT FILES CREATED SUCCESSFULLY!\n');
    console.log('Files created:');
    console.log('  1. DEPARTMENT_ISSUES_REPORT.md - Issues grouped by department');
    console.log('  2. FACULTY_ISSUES_REPORT.md - Issues grouped by faculty');
    console.log('  3. ISSUES_SUMMARY.md - Statistical summary');
    console.log('  4. API_ENDPOINTS_GUIDE.md - How to query via API');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
  }
}

displayAllIssues();
