/**
 * FINAL VERIFICATION: Library Issues Status Check
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

async function finalCheck() {
  try {
    await mongoose.connect('mongodb://localhost:27017/faculty-clearance');
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   FINAL VERIFICATION - LIBRARY ISSUES                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // All library issues
    const allLibrary = await Issue.countDocuments({ departmentName: 'Library' });
    const libraryPending = await Issue.countDocuments({ departmentName: 'Library', status: 'Pending' });
    const libraryIssued = await Issue.countDocuments({ departmentName: 'Library', status: 'Issued' });
    const libraryOther = allLibrary - libraryPending - libraryIssued;

    console.log('📊 Library Issue Count:');
    console.log(`  Total: ${allLibrary}`);
    console.log(`  Pending: ${libraryPending}`);
    console.log(`  Issued: ${libraryIssued}`);
    console.log(`  Other: ${libraryOther}`);

    // Sample issue
    console.log('\n📝 Sample Library Issue:');
    const sample = await Issue.findOne({ departmentName: 'Library' });
    if (sample) {
      console.log(`  Faculty: ${sample.facultyId}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Item: ${sample.itemType}`);
      console.log(`  Qty: ${sample.quantity}`);
    }

    // Check all departments
    console.log('\n📋 All Departments Summary:');
    const depts = ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'];
    
    for (const dept of depts) {
      const pending = await Issue.countDocuments({ departmentName: dept, status: 'Pending' });
      const total = await Issue.countDocuments({ departmentName: dept });
      console.log(`  ${dept.padEnd(12)}: ${pending.toString().padStart(3)} pending / ${total.toString().padStart(3)} total`);
    }

    console.log('\n✅ Verification complete\n');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

finalCheck();
