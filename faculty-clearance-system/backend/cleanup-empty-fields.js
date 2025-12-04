const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function cleanup() {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty-clearance').then(async () => {
    const result = await User.updateMany(
      { employee_id: { $in: [null] } },
      { $unset: { employee_id: '' } }
    );
    console.log('✅ Cleaned employee_id values:', result.modifiedCount);
    mongoose.connection.close();
  }).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

cleanup();
