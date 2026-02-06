const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const testFacultyAccounts = [
  {
    full_name: 'Dr. Ahmed Hassan',
    email: 'ahmed@faculty.edu',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Associate Professor',
    department: 'Computer Science'
  },
  {
    full_name: 'Prof. Fatima Khan',
    email: 'fatima@faculty.edu',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Professor',
    department: 'Physics'
  },
  {
    full_name: 'Dr. Muhammad Ali',
    email: 'muhammad@faculty.edu',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Assistant Professor',
    department: 'Mathematics'
  },
  {
    full_name: 'Dr. Aisha Malik',
    email: 'aisha@faculty.edu',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Lecturer',
    department: 'Chemistry'
  },
  {
    full_name: 'Prof. Hassan Khan',
    email: 'hassan@faculty.edu',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Professor',
    department: 'Engineering'
  }
];

async function seedFaculty() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance');
    console.log('🔄 Connected to MongoDB...');

    // Clear existing faculty accounts
    await User.deleteMany({ role: 'faculty' });
    console.log('🗑️  Cleared existing faculty accounts');

    // Hash passwords and insert users
    const createdUsers = [];
    for (const account of testFacultyAccounts) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(account.password, salt);
      
      const user = new User({
        full_name: account.full_name,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        designation: account.designation,
        department: account.department
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created faculty: ${account.full_name} (${account.email})`);
    }

    console.log(`\n✅ ${createdUsers.length} faculty accounts created successfully!\n`);

    console.log('📋 LOGIN CREDENTIALS:\n');
    testFacultyAccounts.forEach((account, index) => {
      console.log(`${index + 1}. Name: ${account.full_name}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Department: ${account.department}`);
      console.log(`   Designation: ${account.designation}\n`);
    });

    await mongoose.connection.close();
    console.log('✅ Database seeding completed and connection closed');
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    process.exit(1);
  }
}

seedFaculty();
