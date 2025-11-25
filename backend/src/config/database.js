// ==========================================
// config/database.js
// MongoDB connection configuration
// ==========================================
const mongoose = require('mongoose');
const { getEnv } = require('./env');

/**
 * Connect to MongoDB database
 */
async function connectDatabase() {
  try {
    const mongoUri = getEnv('MONGODB_URI');
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Database disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    throw error;
  }
}

/**
 * Disconnect from database
 */
async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};