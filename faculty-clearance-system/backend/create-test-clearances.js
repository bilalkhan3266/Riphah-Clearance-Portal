const mongoose = require('mongoose');
const Clearance = require('./models/Clearance');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

const sampleClearances = [
  {
    facultyId: 'E001001',
    facultyName: 'Dr. Ahmed Hassan',
    facultyEmail: 'ahmed.hassan@riphah.edu.pk',
    department: 'Engineering',
    overallStatus: 'Completed',
    completionDate: new Date('2026-04-05'),
    phases: [
      { name: 'Lab', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Library', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Finance', status: 'Approved', remarks: 'No pending issues' },
      { name: 'HR', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Record', status: 'Approved', remarks: 'No pending issues' },
      { name: 'IT', status: 'Approved', remarks: 'No pending issues' },
    ]
  },
  {
    facultyId: 'E001002',
    facultyName: 'Dr. Fatima Khan',
    facultyEmail: 'fatima.khan@riphah.edu.pk',
    department: 'Medicine',
    overallStatus: 'Completed',
    completionDate: new Date('2026-04-03'),
    phases: [
      { name: 'Pharmacy', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Finance', status: 'Approved', remarks: 'No pending issues' },
      { name: 'HR', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Record', status: 'Approved', remarks: 'No pending issues' },
    ]
  },
  {
    facultyId: 'E001003',
    facultyName: 'Prof. Muhammad Ali',
    facultyEmail: 'ali.muhammad@riphah.edu.pk',
    department: 'Sciences',
    overallStatus: 'Completed',
    completionDate: new Date('2026-04-01'),
    phases: [
      { name: 'Lab', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Library', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Finance', status: 'Approved', remarks: 'No pending issues' },
      { name: 'HR', status: 'Approved', remarks: 'No pending issues' },
      { name: 'Record', status: 'Approved', remarks: 'No pending issues' },
    ]
  }
];

mongoose.connect(mongoUrl, { connectTimeoutMS: 5000 }).then(async () => {
  try {
    console.log('\n📝 Creating sample completed clearances...\n');
    
    // Clear existing records first
    await Clearance.deleteMany({});
    console.log('✓ Cleared existing clearances');
    
    // Insert sample records
    const result = await Clearance.insertMany(sampleClearances);
    console.log(`✓ Created ${result.length} sample clearance records\n`);
    
    result.forEach(record => {
      console.log(`   ✅ ${record.facultyId} - ${record.facultyName}`);
    });
    
    console.log('\n✨ Test data created successfully!');
    console.log('   Refresh your browser to see the Approved tab populated.\n');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
}).catch(err => console.error('Connection Error:', err.message));
