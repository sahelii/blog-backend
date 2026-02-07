/**
 * REDIS CACHING MIDDLEWARE
 * 
 * What This Does:
 * This middleware intercepts requests and checks Redis cache first.
 * If data exists in cache, return it immediately (super fast!).
 * If not, let the request continue to controller, then cache the result.
 * 
 * How It Works:
 * 
 * Request Flow WITHOUT Cache:
 * Client → Server → Controller → MongoDB → Controller → Response
 * Time: ~200ms (database query is slow)
 * 
 * Request Flow WITH Cache (Cache Hit):
 * Client → Server → Cache Middleware → Redis → Response
 * Time: ~5ms (RAM is super fast!)
 * 
 * Request Flow WITH Cache (Cache Miss):
 * Client → Server → Cache Middleware → Controller → MongoDB → Cache Result → Response
 * Time: ~200ms first time, then cached for next requests
 * 
 * Cache Key Strategy:
 * We create unique keys based on:
 * - URL path: /api/posts
 * - Query params: ?page=2&limit=10
 * - User ID (for user-specific data)
 * 
 * Example Cache Keys:
 * - "posts:list:page:1:limit:10" → List of posts
 * - "post:detail:123" → Single post with ID 123
 * - "user:posts:456" → Posts by user ID 456
 */

const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { incrementCacheHit, incrementCacheMiss } = require('../utils/metrics');

/**
 * Cache Middleware Factory
 * 
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @param {function} keyGenerator - Optional function to generate custom cache key
 * 
 * How to Use:
 * router.get('/', cache(300), getPosts);
 * 
 * This will:
 * 1. Check Redis for cached data
 * 2. If found, return cached data (skip controller)
 * 3. If not found, run controller, cache result, return response
 */
const cache = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for POST, PUT, DELETE (these modify data)
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator) {
      // Custom key generator (for user-specific caching)
      cacheKey = await keyGenerator(req);
    } else {
      // Default: Use URL + query params
      cacheKey = `cache:${req.originalUrl || req.url}`;
    }

    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        // Redis not connected, skip caching
        return next();
      }

      // Try to get data from Redis cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        incrementCacheHit();
        logger.info(`Cache HIT: ${cacheKey}`);
        
        // Parse JSON (Redis stores strings)
        const data = JSON.parse(cachedData);
        
        // Send cached response immediately
        return res.json(data);
      }

      incrementCacheMiss();
      logger.info(`Cache MISS: ${cacheKey}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (body) {
        // Cache the response in Redis
        if (redisClient.isOpen) {
          redisClient.setEx(cacheKey, duration, JSON.stringify(body))
            .then(() => {
              logger.info(`Cached: ${cacheKey} for ${duration}s`);
            })
            .catch((err) => {
              logger.error('Redis cache error:', err);
            });
        }

        // Send original response
        return originalJson(body);
      };

      // Continue to next middleware/controller
      next();
    } catch (err) {
      // If Redis fails, just continue without caching
      logger.error('Cache middleware error:', err);
      next();
    }
  };
};

/**
 * Cache Invalidation Helper
 * 
 * When data is updated/deleted, we need to remove it from cache.
 * This function helps invalidate (delete) cache entries.
 * 
 * Usage:
 * await invalidateCache('posts:list:*'); // Delete all post list caches
 * await invalidateCache('post:detail:123'); // Delete specific post cache
 */
const invalidateCache = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    // If pattern contains *, use SCAN to find matching keys
    if (pattern.includes('*')) {
      const keys = [];
      for await (const key of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100
      })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
      }
    } else {
      // Exact key match
      await redisClient.del(pattern);
      logger.info(`Invalidated cache key: ${pattern}`);
    }
  } catch (err) {
    logger.error('Cache invalidation error:', err);
  }
};

/**
 * Clear All Cache
 * 
 * Useful for development or when you want to reset everything
 */
const clearAllCache = async () => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.flushAll();
    logger.info('All cache cleared');
  } catch (err) {
    logger.error('Clear cache error:', err);
  }
};

module.exports = {
  cache,
  invalidateCache,
  clearAllCache
};
