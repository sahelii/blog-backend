const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// Suppress Mongoose deprecation warning for strictQuery
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    
    if (!mongoUri) {
      logger.error('MongoDB URI is not defined. Please set MONGO_URI or MONGODB_URI in your .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (err) {
    logger.error('Database connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
