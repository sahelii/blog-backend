const Post = require('../models/Post');
const User = require('../models/User');
const { errorResponse } = require('./responseFormatter');

exports.authorize = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    const user = await User.findOne({ firebase_uid: req.uid });
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Check if user owns the post
    if (post.author.toString() !== user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to perform this action');
    }

    next();
  } catch (error) {
    next(error);
  }
};
