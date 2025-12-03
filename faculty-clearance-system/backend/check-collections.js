const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance');
    console.log('✅ Connected to MongoDB\n');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections in faculty_clearance database:\n');

    if (collections.length === 0) {
      console.log('❌ No collections found');
    } else {
      collections.forEach((collection, idx) => {
        console.log(`${idx + 1}. ${collection.name}`);
      });
    }

    // Count documents in each collection
    console.log('\n📈 Document counts:\n');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

listCollections();
