const mongoose = require('mongoose');
const Clearance = require('./models/Clearance');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

mongoose.connect(mongoUrl, { connectTimeoutMS: 5000 }).then(async () => {
  try {
    console.log('\n📊 Clearance Database Status:');
    const total = await Clearance.countDocuments();
    const completed = await Clearance.countDocuments({ overallStatus: 'Completed' });
    const inProgress = await Clearance.countDocuments({ overallStatus: 'In Progress' });
    const rejected = await Clearance.countDocuments({ overallStatus: 'Rejected' });
    
    console.log('✓ Total Clearances:', total);
    console.log('✓ Completed:', completed);
    console.log('✓ In Progress:', inProgress);
    console.log('✓ Rejected:', rejected);
    
    if (completed > 0) {
      const records = await Clearance.find({ overallStatus: 'Completed' }).limit(3);
      console.log('\n✅ Sample Completed Records:');
      records.forEach(r => console.log('   - ' + r.facultyId + ' (' + r.facultyName + ')'));
    } else {
      console.log('\n⚠️  No completed clearances found in database');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    mongoose.connection.close();
  }
}).catch(err => console.error('Connection Error:', err.message));
