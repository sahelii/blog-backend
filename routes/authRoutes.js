const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware = require('../middleware/verifyTokenMiddleware');
const { register, getUserProfile, updateUserProfile } = require('../controllers/authController');

// Register new user (public)
router.post('/register', register);

// Get user profile (protected)
router.get('/profile', tokenVerifyMiddleware, getUserProfile);

// Update user profile (protected)
router.put('/profile', tokenVerifyMiddleware, updateUserProfile);

module.exports = router;
