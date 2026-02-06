const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

// User schema
const userSchema = new mongoose.Schema({
  full_name: String,
  email: String,
  password: String,
  designation: String,
  department: String,
  role: String,
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const departmentStaff = [
  {
    full_name: "Ahmed Library",
    email: "ahmed@library.edu",
    designation: "Head Librarian",
    department: "Library",
    role: "Library"
  },
  {
    full_name: "Fatima Pharmacy",
    email: "fatima@pharmacy.edu",
    designation: "Pharmacy Manager",
    department: "Pharmacy",
    role: "Pharmacy"
  },
  {
    full_name: "Muhammad Finance",
    email: "muhammad@finance.edu",
    designation: "Finance Director",
    department: "Finance",
    role: "Finance"
  },
  {
    full_name: "Aisha HR",
    email: "aisha@hr.edu",
    designation: "HR Manager",
    department: "HR",
    role: "HR"
  },
  {
    full_name: "Hassan Records",
    email: "hassan@records.edu",
    designation: "Records Officer",
    department: "Records",
    role: "Records"
  },
  {
    full_name: "Sara IT",
    email: "sara@it.edu",
    designation: "IT Manager",
    department: "IT",
    role: "IT"
  },
  {
    full_name: "Omar ORIC",
    email: "omar@oric.edu",
    designation: "ORIC Director",
    department: "ORIC",
    role: "ORIC"
  },
  {
    full_name: "Zainab Admin",
    email: "zainab@admin.edu",
    designation: "Admin Officer",
    department: "Admin",
    role: "Admin"
  },
  {
    full_name: "Ibrahim Warden",
    email: "ibrahim@warden.edu",
    designation: "Hostel Warden",
    department: "Warden",
    role: "Warden"
  },
  {
    full_name: "Laila HOD",
    email: "laila@hod.edu",
    designation: "Head of Department",
    department: "HOD",
    role: "HOD"
  },
  {
    full_name: "Khalid Dean",
    email: "khalid@dean.edu",
    designation: "Dean",
    department: "Dean",
    role: "Dean"
  }
];

async function seedDepartments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌱 Seeding department staff accounts...');

    for (const staff of departmentStaff) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: staff.email });
        if (existingUser) {
          console.log(`⏭️  ${staff.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('Department@123', 10);

        // Create new user
        const newUser = new User({
          full_name: staff.full_name,
          email: staff.email,
          password: hashedPassword,
          designation: staff.designation,
          department: staff.department,
          role: staff.role
        });

        await newUser.save();
        console.log(`✅ Created: ${staff.full_name} (${staff.email})`);
      } catch (err) {
        console.error(`❌ Error creating ${staff.email}:`, err.message);
      }
    }

    console.log('\n📊 Total accounts created: 11 department staff');
    console.log('\n🔑 All accounts use password: Department@123');
    console.log('\n📋 Department Staff Accounts Created:');
    console.table(departmentStaff.map(staff => ({
      'Email': staff.email,
      'Name': staff.full_name,
      'Department': staff.department,
      'Designation': staff.designation,
      'Password': 'Department@123'
    })));

    await mongoose.connection.close();
    console.log('\n✅ Done! MongoDB connection closed.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedDepartments();
