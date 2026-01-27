const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../middleware/responseFormatter');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, firebase_uid } = req.body;

    // Validate required fields
    if (!name || !email || !password || !firebase_uid) {
      return errorResponse(res, 400, 'All fields are required');
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { firebase_uid: firebase_uid }
      ]
    });

    if (user) {
      return errorResponse(res, 400, 'User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    // Create new user
    const new_user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed_password,
      firebase_uid: firebase_uid
    });

    await new_user.save();

    // Remove password from response
    const userResponse = new_user.toObject();
    delete userResponse.password;

    successResponse(res, 201, userResponse, 'User registered successfully');
  } catch (err) {
    logger.error('Error in register:', err);
    next(err);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebase_uid: req.uid })
      .select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, user, 'User profile retrieved successfully');
  } catch (err) {
    logger.error('Error in getUserProfile:', err);
    next(err);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar) updateData.avatar = avatar;

    const user = await User.findOneAndUpdate(
      { firebase_uid: req.uid },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    successResponse(res, 200, user, 'Profile updated successfully');
  } catch (err) {
    logger.error('Error in updateUserProfile:', err);
    next(err);
  }
};
