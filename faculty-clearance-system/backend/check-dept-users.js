const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

async function checkDeptUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const deptRoles = ['HOD', 'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Admin', 'Warden', 'Dean', 'Records', 'IT', 'ORIC'];
    const users = await User.find({ role: { $in: deptRoles } }, { full_name: 1, role: 1, department: 1 }).lean();
    
    console.log('\n📋 ===== DEPARTMENT STAFF AND THEIR ROLES =====\n');
    users.forEach(u => {
      console.log(`${u.full_name}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Department: ${u.department || 'N/A'}`);
      console.log();
    });
    
    console.log('\n📊 Summary by Role:');
    const roleCount = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    Object.entries(roleCount).sort().forEach(([role, count]) => {
      console.log(`  ${role}: ${count} staff`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDeptUsers();
