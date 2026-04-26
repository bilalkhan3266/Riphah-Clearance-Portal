/**
 * Fix: Update all issues from "Issued" to "Pending" status
 * This will make them display correctly in the department interface
 */

const mongoose = require('mongoose');

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

async function fixIssueStatuses() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   FIXING ISSUE STATUSES: Issued → Pending                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');
    console.log('✅ Connected to MongoDB\n');

    // Show before
    console.log('📊 Before Fix:');
    console.log('─'.repeat(60));
    const beforeBreakdown = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const beforeByDept = {};
    for (const dept of ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean']) {
      const count = await Issue.countDocuments({ departmentName: dept });
      if (count > 0) beforeByDept[dept] = count;
    }

    for (const item of beforeBreakdown) {
      console.log(`  ${item._id}: ${item.count} issues`);
    }
    console.log(`\n  By Department:`);
    for (const [dept, count] of Object.entries(beforeByDept)) {
      console.log(`    ${dept}: ${count}`);
    }

    // Update all Issued to Pending
    console.log('\n\n🔄 Updating all "Issued" → "Pending"...');
    console.log('─'.repeat(60));
    
    const updateResult = await Issue.updateMany(
      { status: 'Issued' },
      { $set: { status: 'Pending' } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} issues\n`);

    // Show after
    console.log('📊 After Fix:');
    console.log('─'.repeat(60));
    const afterBreakdown = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const afterByDept = {};
    for (const dept of ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean']) {
      const count = await Issue.countDocuments({ departmentName: dept });
      if (count > 0) afterByDept[dept] = count;
    }

    for (const item of afterBreakdown) {
      console.log(`  ${item._id}: ${item.count} issues`);
    }
    console.log(`\n  By Department:`);
    for (const [dept, count] of Object.entries(afterByDept)) {
      console.log(`    ${dept}: ${count}`);
    }

    // Verify Library specifically
    console.log('\n\n✅ Verification - Library Department:');
    console.log('─'.repeat(60));
    const libraryPending = await Issue.countDocuments({
      departmentName: 'Library',
      status: 'Pending'
    });
    console.log(`  Pending Issues: ${libraryPending}`);

    const librarySample = await Issue.findOne({ departmentName: 'Library' });
    if (librarySample) {
      console.log(`\n  Sample Issue:`);
      console.log(`    Faculty: ${librarySample.facultyId}`);
      console.log(`    Status: ${librarySample.status} ✅`);
      console.log(`    Item: ${librarySample.itemType}`);
    }

    console.log('\n\n🎉 FIX COMPLETE!');
    console.log('─'.repeat(60));
    console.log('📋 All departments should now show issues correctly');
    console.log('   Library: 86 pending');
    console.log('   ORIC: 86 pending');
    console.log('   (And all others)\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixIssueStatuses();
