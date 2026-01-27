/**
 * REDIS CONNECTION CONFIGURATION
 * 
 * What is Redis?
 * Redis is an in-memory data store. Think of it as a super-fast database
 * that stores data in RAM instead of disk. It's used for caching, sessions,
 * real-time analytics, and more.
 * 
 * Why Use Redis for Caching?
 * 1. Speed: RAM is 1000x faster than disk (MongoDB)
 * 2. Reduce Database Load: Frequently accessed data served from cache
 * 3. Cost: Fewer database queries = lower costs
 * 4. Scalability: Can handle millions of requests per second
 * 
 * How It Works:
 * - First request: Query MongoDB → Store in Redis → Return to user
 * - Next requests: Get from Redis → Return to user (no MongoDB query!)
 * - Cache expires after TTL (Time To Live) or when data is updated
 */

const redis = require('redis');
const logger = require('../utils/logger');
const config = require('./config');

// Create Redis client
// Redis can run locally or on cloud (Redis Cloud, AWS ElastiCache, etc.)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  // Optional: Add password if Redis is password-protected
  // password: process.env.REDIS_PASSWORD
});

// Handle connection events
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client connected and ready');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis client error:', err);
  // Don't exit - app can work without Redis (graceful degradation)
});

redisClient.on('end', () => {
  logger.warn('Redis client connection ended');
});

// Connect to Redis
// This is async, but we don't await it - Redis will connect in background
// If Redis is down, app still works (just without caching)
(async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.warn('Redis connection failed. App will work without caching:', err.message);
    // App continues without Redis - graceful degradation
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  logger.info('Redis connection closed');
});

module.exports = redisClient;
