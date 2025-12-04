const mongoose = require('mongoose');
const Clearance = require('./models/Clearance');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

mongoose.connect(mongoUrl).then(async () => {
  try {
    console.log('\n🔍 TROUBLESHOOTING DATABASE CONNECTION\n');
    
    // Get connection info
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Check collection info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(c => console.log('  -', c.name));
    
    // Query Clearance directly
    console.log('\n📊 Clearance Model Query:');
    const query1 = await Clearance.find({});
    console.log('Total records (no filter):', query1.length);
    
    const query2 = await Clearance.find({ overallStatus: 'Completed' });
    console.log('Completed records:', query2.length);
    
    if (query2.length > 0) {
      console.log('\n✅ Records found:');
      query2.forEach(r => {
        console.log(`  - ${r.facultyId}: ${r.facultyName} (${r.overallStatus})`);
      });
    } else {
      console.log('\n❌ No completed records found');
      
      // Check raw collection
      console.log('\n🔍 Checking raw collection...');
      const rawRecords = await db.collection('clearances').find({}).toArray();
      console.log('Raw records count:', rawRecords.length);
      if (rawRecords.length > 0) {
        console.log('First record:', JSON.stringify(rawRecords[0], null, 2));
      }
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    mongoose.connection.close();
  }
}).catch(err => console.error('Connection Error:', err.message));
