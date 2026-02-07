const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Ensures a backend User exists for req.uid (Firebase UID) and attaches it to req.user.
 * Must run after verifyTokenMiddleware. Downstream handlers can rely on req.user.
 */
async function ensureBackendUser(req, res, next) {
  try {
    const { user } = await userService.findOrCreateFromFirebase(req.uid, {
      requestId: req.requestId,
    });
    req.user = user;
    next();
  } catch (err) {
    logger.error('ensureBackendUser failed', { err: err.message, requestId: req.requestId, uid: req.uid });
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again.',
    });
  }
}

module.exports = ensureBackendUser;
