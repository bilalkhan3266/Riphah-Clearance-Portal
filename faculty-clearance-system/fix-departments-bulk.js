#!/usr/bin/env node

/**
 * Fix Department Clearance Components - Remove Manual Approval UI
 * Usage: node fix-departments-bulk.js
 */

const fs = require('fs');
const path = require('path');

const DEPARTMENTS = [
  { 
    path: 'frontend/src/components/Departments/Phase1/Pharmacy/PharmacyClearanceEnhanced.js',
    name: 'Pharmacy',
    deptCode: 'Pharmacy'
  },
  { 
    path: 'frontend/src/components/Departments/Phase2/Finance/FinanceClearanceEnhanced.js',
    name: 'Finance',
    deptCode: 'Finance'
  },
  { 
    path: 'frontend/src/components/Departments/Phase2/HR/HRClearanceEnhanced.js',
    name: 'HR',
    deptCode: 'HR'
  },
  { 
    path: 'frontend/src/components/Departments/Phase2/Records/RecordsClearanceEnhanced.js',
    name: 'Records',
    deptCode: 'Record'
  },
  { 
    path: 'frontend/src/components/Departments/Phase3/Admin/AdminClearanceEnhanced.js',
    name: 'Admin',
    deptCode: 'Admin'
  },
  { 
    path: 'frontend/src/components/Departments/Phase3/IT/ITClearanceEnhanced.js',
    name: 'IT',
    deptCode: 'IT'
  },
  { 
    path: 'frontend/src/components/Departments/Phase3/ORIC/ORICClearanceEnhanced.js',
    name: 'ORIC',
    deptCode: 'ORIC'
  },
  { 
    path: 'frontend/src/components/Departments/Phase4/Dean/DeanClearanceEnhanced.js',
    name: 'Dean',
    deptCode: 'Dean'
  },
  { 
    path: 'frontend/src/components/Departments/Phase4/HOD/HODClearanceEnhanced.js',
    name: 'HOD',
    deptCode: 'HOD'
  },
  { 
    path: 'frontend/src/components/Departments/Phase4/Warden/WardenClearanceEnhanced.js',
    name: 'Warden',
    deptCode: 'Warden'
  }
];

function removeOldApprovalUI(content, deptName, deptCode) {
  // 1. Remove the remarks textarea div and button-group
  // This regex is more flexible to handle variations
  content = content.replace(
    /<div className="remarks-section">[\s\S]*?<\/div>\s*<div className="button-group">[\s\S]*?<\/div>/,
    ''
  );

  // 2. Also try alternative quote styles (single quotes)  
  content = content.replace(
    /<div className='remarks-section'>[\s\S]*?<\/div>\s*<div className='button-group'>[\s\S]*?<\/div>/,
    ''
  );

  // 3. Remove APPROVED REQUESTS TAB
  content = content.replace(
    /\{\s*\/\*\s*APPROVED REQUESTS TAB[\s\S]*?\n\s*\}\) \}\}\)/s,
    ''
  );

  // 4. Remove REJECTED REQUESTS TAB
  content = content.replace(
    /\{\s*\/\*\s*REJECTED REQUESTS TAB[\s\S]*?\n\s*\}\) \}\}\)/s,
    ''
  );

  return content;
}

console.log('🔧 Fixing Department Clearance Components...\n');

let successCount = 0;
let errorCount = 0;

DEPARTMENTS.forEach(dept => {
  const filePath = path.join(__dirname, dept.path);
  
  console.log(`📁 ${dept.name}...`);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found\n`);
      errorCount++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    
    // Apply fixes
    content = removeOldApprovalUI(content, dept.name, dept.deptCode);

    // Save back
    fs.writeFileSync(filePath, content, 'utf-8');
    
    const newLength = content.length;
    const removed = originalLength - newLength;
    
    console.log(`   ✅ Fixed (removed ${(removed / 1024).toFixed(1)}KB of old code)`);
    successCount++;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    errorCount++;
  }
});

console.log(`\n✨ Done!`);
console.log(`✅ Fixed: ${successCount} departments`);
console.log(`❌ Errors: ${errorCount} departments`);
console.log(`\nNext: Run 'npm start' in frontend directory to test`);
