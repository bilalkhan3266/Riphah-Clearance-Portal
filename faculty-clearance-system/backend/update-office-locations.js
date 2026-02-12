/**
 * UPDATE OFFICE LOCATIONS
 * Script to add office locations for all faculty members
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance';

async function updateOfficeLocations() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // First, get all users to see what we have
    const users = await User.find({});
    console.log('📋 Current Users in Database:');
    users.forEach(u => {
      console.log(`
  Name: ${u.full_name}
  Email: ${u.email}
  Faculty ID: ${u.faculty_id || 'N/A'}
  Department: ${u.department || 'N/A'}
  Office Location: ${u.office_location || 'Not set'}
      `);
    });

    // Define office locations based on department and designations
    const officeLocationMap = {
      'Computer Science': 'Building 3, Floor 2, Room 208',
      'Engineering': 'Building 4, Floor 1, Room 105',
      'Laboratory Services': 'Building 2, Lab Wing, Room 204',
      'Library Services': 'Central Library, Ground Floor',
      'Finance': 'Main Office, Finance Wing, Room 301',
      'Human Resources': 'Administration Building, Room 302',
      'Academic Records': 'Academic Block, Room 102',
      'Information Technology': 'IT Building, Ground Floor, Room 110',
      'ORIC': 'Research Building, Room 201',
      'Administration': 'Main Office, Room 305',
      'Student Affairs': 'Hostel Complex, Office Block',
      'Faculty of Engineering': 'Rector Office, Building 1, Floor 4'
    };

    console.log('\n🔄 Updating Office Locations...\n');
    let updated = 0;

    for (const user of users) {
      const dept = user.department || '';
      const officeLocation = officeLocationMap[dept] || `Building 5, Room ${Math.floor(Math.random() * 500) + 100}`;

      const result = await User.findByIdAndUpdate(
        user._id,
        { office_location: officeLocation },
        { new: true }
      );

      if (result) {
        console.log(`✅ ${result.full_name} (${result.department})`);
        console.log(`   Office: ${result.office_location}\n`);
        updated++;
      }
    }

    console.log(`\n📊 Summary: Updated ${updated} users`);

    // Display final results
    console.log('\n📋 Final Faculty Details:');
    const finalUsers = await User.find({});
    finalUsers.forEach(u => {
      console.log(`
  Name: ${u.full_name}
  Email: ${u.email}
  Faculty ID: ${u.faculty_id || 'N/A'}
  Designation: ${u.designation || 'Not specified'}
  Department: ${u.department || 'Not specified'}
  Office Location: ${u.office_location || 'Not specified'}
      `);
    });

    console.log('\n✅ Update complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

updateOfficeLocations();
