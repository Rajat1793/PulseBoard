const mongoose = require('mongoose');

const seedDemoUser = async () => {
  // Inline require to avoid circular dependency issues at startup
  const User = require('../models/User');
  const exists = await User.findOne({ email: 'demo@pulseboard.dev' });
  if (!exists) {
    await User.create({
      name: 'Demo User',
      email: 'demo@pulseboard.dev',
      password: 'demo123',
    });
    console.log('Demo user created: demo@pulseboard.dev / demo123');
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseboard'
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedDemoUser();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
