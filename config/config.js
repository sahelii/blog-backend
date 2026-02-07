require('dotenv').config();

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/**
 * Build allowed CORS origins from env (industry practice: config-driven, no hardcoded prod URLs).
 * - CORS_ALLOWED_ORIGINS: comma-separated list (e.g. https://app.example.com,https://staging.example.com)
 * - FRONTEND_URL: single origin (legacy); added if set
 * - In development, localhost origins are added automatically if not already present.
 */
function getAllowedOrigins() {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const fromFrontendUrl = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : [];
  const combined = [...new Set([...fromEnv, ...fromFrontendUrl])];
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  const isProduction = process.env.NODE_ENV === 'production';
  if (isDev) {
    DEV_ORIGINS.forEach((o) => {
      if (!combined.includes(o)) combined.push(o);
    });
  }
  // Fallback so production works if env was not set on host (e.g. Render)
  if (isProduction && combined.length === 0) {
    combined.push('https://blog-frontend-sigma-ecru.vercel.app');
  }
  return combined;
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    allowedOrigins: getAllowedOrigins(),
  },
  firebase: {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
};
