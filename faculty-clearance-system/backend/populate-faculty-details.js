/**
 * POPULATE FACULTY DETAILS SCRIPT
 * Updates User records with designation, department, and office_location
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance';

async function populateFacultyDetails() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Define sample faculty data based on common designations at universities
    const facultyData = [
      {
        email: 'faculty1@test.edu',
        designation: 'Associate Professor',
        department: 'Computer Science',
        office_location: 'Building 3, Floor 2, Room 208'
      },
      {
        email: 'faculty2@test.edu',
        designation: 'Senior Lecturer',
        department: 'Engineering',
        office_location: 'Building 4, Floor 1, Room 105'
      },
      {
        email: 'lab@test.edu',
        designation: 'Lab Technician',
        department: 'Laboratory Services',
        office_location: 'Building 2, Lab Wing, Room 204'
      },
      {
        email: 'library@test.edu',
        designation: 'Head Librarian',
        department: 'Library Services',
        office_location: 'Central Library, Ground Floor'
      }
    ];

    let updated = 0;
    let notFound = 0;

    for (const data of facultyData) {
      const user = await User.findOneAndUpdate(
        { email: data.email },
        {
          designation: data.designation,
          department: data.department,
          office_location: data.office_location
        },
        { new: true }
      );

      if (user) {
        console.log(`✅ Updated: ${data.email} - ${data.designation} at ${data.office_location}`);
        updated++;
      } else {
        console.log(`⚠️  Not found: ${data.email}`);
        notFound++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Not found: ${notFound} users`);

    // Also display all faculty with their new details
    console.log('\n📋 All Faculty Members:');
    const allUsers = await User.find({ role: { $in: ['faculty', 'Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'] } });
    
    allUsers.forEach(user => {
      console.log(`
  Name: ${user.full_name}
  Email: ${user.email}
  Faculty ID: ${user.faculty_id || 'N/A'}
  Designation: ${user.designation || 'Not specified'}
  Department: ${user.department || 'Not specified'}
  Office Location: ${user.office_location || 'Not specified'}
  `);
    });

    console.log('\n✅ Population complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

populateFacultyDetails();
