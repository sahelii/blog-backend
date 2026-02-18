const admin = require('firebase-admin');
const config = require('../config/config');
const logger = require('../utils/logger');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use environment variables first
    if (config.firebase.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          type: config.firebase.type,
          project_id: config.firebase.projectId,
          private_key_id: config.firebase.privateKeyId,
          private_key: config.firebase.privateKey,
          client_email: config.firebase.clientEmail,
          client_id: config.firebase.clientId,
          auth_uri: config.firebase.authUri,
          token_uri: config.firebase.tokenUri,
          auth_provider_x509_cert_url: config.firebase.authProviderX509CertUrl,
          client_x509_cert_url: config.firebase.clientX509CertUrl
        })
      });
    } else {
      // Fallback: attempt to load a service account JSON from a secure path
      // provided via the FIREBASE_SERVICE_ACCOUNT_PATH env var.
      try {
        const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (saPath) {
          const serviceAccount = require(saPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } else {
          logger.warn('No FIREBASE_SERVICE_ACCOUNT_PATH set. Using environment variables.');
        }
      } catch (fileError) {
        logger.warn('Firebase service account file could not be loaded. Using environment variables.');
      }
    }
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
  }
}

const verifyToken = async (req, res, next) => {
  try {
    // If Firebase Admin was never initialized (e.g. missing env vars on Render), return 503
    if (!admin.apps.length) {
      logger.error('Firebase Admin not initialized. Set FIREBASE_* env vars on Render.');
      return res.status(503).json({
        success: false,
        error: 'Server configuration error: authentication not configured. Set Firebase Admin env vars on your host (see backend DEPLOYMENT.md).'
      });
    }

    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid token, authorization denied'
    });
  }
};

module.exports = verifyToken;
