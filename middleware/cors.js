const cors = require('cors');
const config = require('../config/config');
const logger = require('../utils/logger');

const allowedOrigins = config.cors.allowedOrigins;

if (allowedOrigins.length === 0 && config.nodeEnv === 'production') {
  logger.warn(
    'CORS: No allowed origins configured. Set CORS_ALLOWED_ORIGINS or FRONTEND_URL in production.'
  );
}

/**
 * CORS middleware: allowlist only, credentials supported.
 * - Requests with no origin (e.g. Postman, server-to-server) are allowed.
 * - Browser requests must have an origin in the allowlist.
 */
const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
};

module.exports = cors(corsOptions);
