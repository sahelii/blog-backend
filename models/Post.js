const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL if using cloud storage, or Buffer if storing in DB
    required: false
  },
  imageType: {
    type: String,
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  tags: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
PostSchema.index({ author: 1, date: -1 });
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ date: -1 });
PostSchema.index({ tags: 1 });

// Update updatedAt before saving
PostSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);
