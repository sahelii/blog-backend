const admin = require('firebase-admin');
const User = require('../models/User');
const logger = require('../utils/logger');

const NAME_MAX_LENGTH = 200;
const EMAIL_MAX_LENGTH = 254;

/**
 * Sanitize and validate name from external source (Firebase).
 */
function sanitizeName(name) {
  if (typeof name !== 'string') return 'User';
  const trimmed = name.trim();
  if (!trimmed) return 'User';
  return trimmed.length > NAME_MAX_LENGTH ? trimmed.slice(0, NAME_MAX_LENGTH) : trimmed;
}

/**
 * Sanitize and validate email from external source (Firebase).
 */
function sanitizeEmail(email, fallbackUid) {
  if (typeof email === 'string' && email.includes('@')) {
    const trimmed = email.toLowerCase().trim();
    return trimmed.length > EMAIL_MAX_LENGTH ? trimmed.slice(0, EMAIL_MAX_LENGTH) : trimmed;
  }
  return `${fallbackUid}@firebase.local`;
}

/**
 * Find or create a backend User for the given Firebase UID.
 * Idempotent: safe to call on every authenticated request.
 *
 * @param {string} firebaseUid - Firebase Auth UID (from verified token)
 * @param {object} [context] - Optional { requestId } for logging
 * @returns {Promise<{ user: object, created: boolean }>}
 * @throws on Firebase or DB errors (caller should map to 503/500)
 */
async function findOrCreateFromFirebase(firebaseUid, context = {}) {
  const logMeta = { firebaseUid, requestId: context.requestId };

  const existing = await User.findOne({ firebase_uid: firebaseUid }).select('-password');
  if (existing) {
    return { user: existing, created: false };
  }

  const fbUser = await admin.auth().getUser(firebaseUid);
  const name = sanitizeName(fbUser.displayName || fbUser.email);
  const email = sanitizeEmail(fbUser.email, firebaseUid);

  let user = await User.findOne({ email });
  if (user) {
    if (user.firebase_uid !== firebaseUid) {
      user.firebase_uid = firebaseUid;
      await user.save();
      logger.info('User linked to Firebase UID', { ...logMeta, userId: user._id.toString(), email: user.email });
    }
    const safe = await User.findById(user._id).select('-password');
    return { user: safe, created: false };
  }

  user = new User({ firebase_uid: firebaseUid, name, email });
  await user.save();
  logger.info('User created from Firebase', { ...logMeta, userId: user._id.toString(), email: user.email });

  const safe = await User.findById(user._id).select('-password');
  return { user: safe, created: true };
}

module.exports = {
  findOrCreateFromFirebase,
  sanitizeName,
  sanitizeEmail,
};
