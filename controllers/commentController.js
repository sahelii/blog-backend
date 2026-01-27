const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../middleware/responseFormatter');
const { invalidateCache } = require('../middleware/cache');
const logger = require('../utils/logger');

exports.createComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const user = await User.findOne({ firebase_uid: req.uid });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    const newComment = new Comment({
      user: user._id,
      comment,
      post: req.params.id,
    });

    const savedComment = await newComment.save();
    
    // Add comment to post if not already added
    if (!post.comments.includes(savedComment._id)) {
      post.comments.push(savedComment._id);
      await post.save();
    }

    // Populate user before returning
    await savedComment.populate('user', 'name email avatar');

    // Invalidate cache when comment is added
    // Post detail page cache needs to be invalidated to show new comment
    await invalidateCache(`cache:/api/posts/${req.params.id}`);
    await invalidateCache(`cache:/api/comments/${req.params.id}/comment`);

    successResponse(res, 201, savedComment, 'Comment created successfully');
  } catch (err) {
    logger.error('Error in createComment:', err);
    next(err);
  }
};

exports.getCommentsByPostId = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name email avatar')
      .sort({ date: -1 });

    successResponse(res, 200, comments, 'Comments retrieved successfully');
  } catch (err) {
    logger.error('Error in getCommentsByPostId:', err);
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return errorResponse(res, 404, 'Comment not found');
    }

    const user = await User.findOne({ firebase_uid: req.uid });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if user owns the comment
    if (comment.user.toString() !== user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this comment');
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(
      comment.post,
      { $pull: { comments: comment._id } }
    );

    await Comment.deleteOne({ _id: comment._id });

    // Invalidate cache when comment is deleted
    await invalidateCache(`cache:/api/posts/${comment.post}`);
    await invalidateCache(`cache:/api/comments/${comment.post}/comment`);

    successResponse(res, 200, null, 'Comment deleted successfully');
  } catch (err) {
    logger.error('Error in deleteComment:', err);
    next(err);
  }
};
