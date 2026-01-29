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

let hasLoggedError = false; // Track if we've already logged an error

// Create Redis client
// Redis can run locally or on cloud (Redis Cloud, AWS ElastiCache, etc.)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Only retry 3 times, then give up silently
      if (retries > 3) {
        return false; // Stop retrying
      }
      return Math.min(retries * 100, 3000); // Exponential backoff
    },
    connectTimeout: 5000,
  },
  // Optional: Add password if Redis is password-protected
  // password: process.env.REDIS_PASSWORD
});

// Handle connection events
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
  hasLoggedError = false; // Reset on successful connection attempt
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client connected and ready');
  hasLoggedError = false;
});

redisClient.on('error', (err) => {
  // Only log the first error to reduce log noise
  if (!hasLoggedError) {
    logger.warn('⚠️  Redis not available. App will work without caching. To enable Redis, start a Redis server.');
    hasLoggedError = true;
  }
  // Don't exit - app can work without Redis (graceful degradation)
});

redisClient.on('end', () => {
  if (!hasLoggedError) {
    logger.warn('Redis client connection ended');
  }
});

// Connect to Redis
// This is async, but we don't await it - Redis will connect in background
// If Redis is down, app still works (just without caching)
(async () => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
  } catch (err) {
    // Only log once
    if (!hasLoggedError) {
      logger.warn('⚠️  Redis connection failed. App will work without caching.');
      hasLoggedError = true;
    }
    // App continues without Redis - graceful degradation
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  logger.info('Redis connection closed');
});

module.exports = redisClient;
