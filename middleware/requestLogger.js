const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 *
 * Logs all incoming requests with:
 * - Unique request ID for tracing
 * - Request method, URL, IP
 * - Response status code
 * - Response time
 * - User ID (if authenticated)
 *
 * This helps with:
 * - Debugging production issues
 * - Performance monitoring
 * - Security auditing
 * - Request tracing across services
 */

const requestLogger = (req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  // Start time for response time calculation
  const startTime = Date.now();

  // Log request start
  logger.info('Incoming Request', {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.uid || null, // From token middleware if authenticated
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Log response
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.uid || null,
    };

    // Log errors separately
    if (res.statusCode >= 400) {
      logger.warn('Request Error', {
        ...logData,
        error: body.error || body.message,
      });
    } else {
      logger.info('Request Completed', logData);
    }

    // Add request ID to response headers for client tracing
    res.setHeader('X-Request-ID', requestId);

    return originalJson(body);
  };

  // Handle response finish (for cases where res.json isn't called)
  res.on('finish', () => {
    if (!res.headersSent) {
      const responseTime = Date.now() - startTime;
      logger.info('Request Completed', {
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.uid || null,
      });
    }
  });

  next();
};

module.exports = requestLogger;
