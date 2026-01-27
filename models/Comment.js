const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
CommentSchema.index({ post: 1, date: -1 });
CommentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
