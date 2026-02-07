const Post = require('../models/Post');
const { errorResponse } = require('./responseFormatter');

/**
 * Authorize: ensures the authenticated user (req.user) owns the resource (post).
 * Must run after tokenVerifyMiddleware and ensureBackendUser.
 */
exports.authorize = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not found');
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to perform this action');
    }

    next();
  } catch (error) {
    next(error);
  }
};
