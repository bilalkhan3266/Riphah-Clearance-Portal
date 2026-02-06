const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const testUsers = [
  { email: 'faculty1@test.edu', full_name: 'Dr. Ahmed Hassan', role: 'faculty', department: 'Lab' },
  { email: 'faculty2@test.edu', full_name: 'Dr. Sara Khan', role: 'faculty', department: 'Library' },
  { email: 'lab@test.edu', full_name: 'Lab Staff', role: 'Lab', department: 'Lab' },
  { email: 'library@test.edu', full_name: 'Library Staff', role: 'Library', department: 'Library' }
];

async function seedUsers() {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance').then(async () => {
    try {
      // Delete existing test users
      await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
      console.log('Cleaned up existing test users');

      // Create new test users with test password
      const hashedPassword = await bcryptjs.hash('Test@123', 10);
      const created = [];
      
      for (const userData of testUsers) {
        const user = new User({
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          department: userData.department,
          password: hashedPassword,
          phone: '03001234567'
          // Don't include faculty_id or employee_id - let them undefined
        });
        const savedUser = await user.save();
        created.push(savedUser);
        console.log('✅ Created:', userData.email);
      }

      console.log('\n✅ Created ' + created.length + ' test users');
      console.log('\nTest credentials:');
      console.log('  Password: Test@123');
      
      mongoose.connection.close();
    } catch (error) {
      console.error('Error:', error.message);
      mongoose.connection.close();
    }
  }).catch(err => console.error('Connection error:', err.message));
}

seedUsers();
