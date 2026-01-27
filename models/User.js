const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't return password by default
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ firebase_uid: 1 });

module.exports = mongoose.model('User', UserSchema);
