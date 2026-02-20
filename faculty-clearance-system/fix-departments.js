/**
 * Batch Fix Script for Department Clearance Components
 * This script removes manual approval/rejection and adds issue/return forms
 * Run with: node fix-departments.js
 */

const fs = require('fs');
const path = require('path');

const departments = [
  { path: 'frontend/src/components/Departments/Phase1/Library/LibraryClearanceEnhanced.js', name: 'Library' },
  { path: 'frontend/src/components/Departments/Phase1/Pharmacy/PharmacyClearanceEnhanced.js', name: 'Pharmacy' },
  { path: 'frontend/src/components/Departments/Phase2/Finance/FinanceClearanceEnhanced.js', name: 'Finance' },
  { path: 'frontend/src/components/Departments/Phase2/HR/HRClearanceEnhanced.js', name: 'HR' },
  { path: 'frontend/src/components/Departments/Phase2/Records/RecordsClearanceEnhanced.js', name: 'Records' },
  { path: 'frontend/src/components/Departments/Phase3/IT/ITClearanceEnhanced.js', name: 'IT' },
  { path: 'frontend/src/components/Departments/Phase3/ORIC/ORICClearanceEnhanced.js', name: 'ORIC' },
  { path: 'frontend/src/components/Departments/Phase3/Admin/AdminClearanceEnhanced.js', name: 'Admin' },
  { path: 'frontend/src/components/Departments/Phase4/Warden/WardenClearanceEnhanced.js', name: 'Warden' },
  { path: 'frontend/src/components/Departments/Phase4/HOD/HODClearanceEnhanced.js', name: 'HOD' },
  { path: 'frontend/src/components/Departments/Phase4/Dean/DeanClearanceEnhanced.js', name: 'Dean' }
];

// Key replacements needed for each department
const replacements = [
  {
    name: 'Remove Manual Approval Handlers',
    find: /const handleApproveClearance[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};\s*const handleRejectClearance[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/,
    replace: '// Manual approval/rejection removed - System is now fully automatic'
  },
  {
    name: 'Replace Remarks State with Forms',
    find: /const \[remarks, setRemarks\] = useState\(''\);/,
    replace: `const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    facultyId: '',
    facultyName: '',
    itemType: 'book',
    description: '',
    quantity: 1,
    dueDate: '',
    notes: ''
  });
  const [returnFormData, setReturnFormData] = useState({
    facultyId: '',
    referenceIssueId: '',
    quantityReturned: 1,
    condition: 'Good',
    notes: ''
  });`
  }
];

console.log('🔧 Starting Department Component Fix...\n');

departments.forEach(dept => {
  const filePath = path.join(__dirname, dept.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${dept.name}: File not found at ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;

  replacements.forEach(replacement => {
    if (replacement.find.test(content)) {
      content = content.replace(replacement.find, replacement.replace);
      updated = true;
      console.log(`✅ ${dept.name}: ${replacement.name}`);
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`💾 ${dept.name}: Saved changes\n`);
  } else {
    console.log(`⚠️  ${dept.name}: No changes needed\n`);
  }
});

console.log('✨ Fix script completed!');
console.log('\nNext steps:');
console.log('1. Run: npm start (in frontend directory)');
console.log('2. Test the department clearance pages');
console.log('3. Verify automation is working properly');
