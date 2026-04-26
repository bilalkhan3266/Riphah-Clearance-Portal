/**
 * Direct Database Diagnostic for Library Department
 * Shows exactly what status the issues have
 */

const mongoose = require('mongoose');

// Simple Issue schema to match database
const issueSchema = new mongoose.Schema({
  facultyId: String,
  departmentName: String,
  itemType: String,
  description: String,
  quantity: Number,
  status: String,
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  issuedBy: mongoose.Schema.Types.ObjectId,
  referenceIssueId: mongoose.Schema.Types.ObjectId,
  notes: String,
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);

async function diagnoseLibrary() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   LIBRARY DEPARTMENT DATABASE DIAGNOSTIC                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected\n');

    // Query 1: Total count
    console.log('📋 Query 1: Total Library Issues');
    console.log('─'.repeat(60));
    const totalCount = await Issue.countDocuments({ departmentName: 'Library' });
    console.log(`✅ Total: ${totalCount} issues\n`);

    // Query 2: Status breakdown
    console.log('📊 Query 2: Status Distribution');
    console.log('─'.repeat(60));
    const statusBreakdown = await Issue.aggregate([
      { $match: { departmentName: 'Library' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('Status Breakdown:');
    for (const item of statusBreakdown) {
      console.log(`  ${item._id || 'NULL'}: ${item.count} issues`);
    }
    console.log();

    // Query 3: Sample issues
    console.log('📝 Query 3: Sample Library Issues (First 5)');
    console.log('─'.repeat(60));
    const samples = await Issue.find({ departmentName: 'Library' }).limit(5);
    
    for (let i = 0; i < samples.length; i++) {
      const issue = samples[i];
      console.log(`\nIssue ${i + 1}:`);
      console.log(`  Faculty ID: ${issue.facultyId}`);
      console.log(`  Department: ${issue.departmentName}`);
      console.log(`  Item Type: ${issue.itemType}`);
      console.log(`  Description: ${issue.description}`);
      console.log(`  Status: "${issue.status}"`);
      console.log(`  Quantity: ${issue.quantity}`);
      console.log(`  Issue Date: ${issue.issueDate}`);
      console.log(`  Due Date: ${issue.dueDate}`);
    }

    // Query 4: What statuses exist?
    console.log('\n\n🔍 Query 4: Unique Status Values');
    console.log('─'.repeat(60));
    const uniqueStatuses = await Issue.distinct('status', { departmentName: 'Library' });
    console.log(`\nUnique statuses in Library: [${uniqueStatuses.map(s => `"${s}"`).join(', ')}]\n`);

    // Query 5: API query simulation
    console.log('🧪 Query 5: Simulating API Query');
    console.log('─'.repeat(60));
    const apiQuery = { departmentName: 'Library' };
    const apiResults = await Issue.find(apiQuery).sort({ issueDate: -1 });
    console.log(`\nAPI Query (no filters):`);
    console.log(`  Query: ${JSON.stringify(apiQuery)}`);
    console.log(`  Result Count: ${apiResults.length}`);
    console.log(`  Expected Display: "${apiResults.length} pending"\n`);

    // Query 6: Pending filter simulation
    console.log('🔎 Query 6: If Frontend Filters for "Pending" Status');
    console.log('─'.repeat(60));
    const pendingFilter = await Issue.find({
      departmentName: 'Library',
      status: 'Pending'
    });
    console.log(`\nWith status="Pending" filter:`);
    console.log(`  Result Count: ${pendingFilter.length}`);
    console.log(`  Would Display: "${pendingFilter.length} pending"\n`);

    // Analysis
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   ANALYSIS                                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (totalCount === 0) {
      console.log('❌ NO DATA: Library collection has 0 issues');
      console.log('   Action: Run create-bulk-issues.js to create test data');
    } else if (totalCount > 0 && pendingFilter.length === 0) {
      console.log(`✅ DATA EXISTS: ${totalCount} Library issues found`);
      console.log(`❌ STATUS MISMATCH: All issues are "${samples[0].status}" status`);
      console.log('   Frontend expects "Pending" but issues are "Issued"');
      console.log('\n   Fix Options:');
      console.log('   A) Update issue status to "Pending"');
      console.log('   B) Fix frontend to show "Issued" status too');
    } else {
      console.log(`✅ DATA EXISTS: ${totalCount} Library issues found`);
      console.log(`✅ STATUS MATCH: Pending items: ${pendingFilter.length}`);
    }

    console.log('\n');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

diagnoseLibrary();
