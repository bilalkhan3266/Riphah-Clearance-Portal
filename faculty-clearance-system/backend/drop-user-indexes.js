const { MongoClient } = require('mongodb');
require('dotenv').config();

async function dropIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('faculty-clearance');
    const collection = db.collection('users');
    
    console.log('Dropping indices...');
    
    try {
      await collection.dropIndex('faculty_id_1');
      console.log('✅ Dropped faculty_id_1');
    } catch(e) {
      console.log('ℹ️ faculty_id_1 not found');
    }
    
    try {
      await collection.dropIndex('employee_id_1');
      console.log('✅ Dropped employee_id_1');
    } catch(e) {
      console.log('ℹ️ employee_id_1 not found');
    }
    
    console.log('\n✅ Indexes dropped successfully');
  } finally {
    await client.close();
  }
}

dropIndexes().catch(console.error);
