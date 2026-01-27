const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('../config/config');

// Configure Cloudinary if credentials are provided
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });
}

// Memory storage as fallback (stores in memory, then we can upload to cloudinary or save to DB)
const memoryStorage = multer.memoryStorage();

// Cloudinary storage (preferred)
let storage;
if (config.cloudinary.cloudName) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'blog-images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 630, crop: 'limit' }]
    }
  });
} else {
  // Fallback to memory storage if Cloudinary not configured
  storage = memoryStorage;
}

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'), false);
    }
  }
});

module.exports = upload;
