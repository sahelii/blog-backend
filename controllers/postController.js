const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../middleware/responseFormatter');
const { invalidateCache } = require('../middleware/cache');
const logger = require('../utils/logger');

exports.getPosts = async (req, res, next) => {
  try {
    // If pagination middleware was applied, use its results
    if (res.paginatedResults) {
      return res.json(res.paginatedResults);
    }

    // Otherwise, return all posts (fallback)
    const posts = await Post.find()
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .sort({ date: -1 })
      .limit(50); // Limit to prevent huge responses

    successResponse(res, 200, posts, 'Posts retrieved successfully');
  } catch (err) {
    logger.error('Error in getPosts:', err);
    next(err);
  }
};

exports.getPostsByUserId = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .sort({ date: -1 });

    successResponse(res, 200, posts, 'User posts retrieved successfully');
  } catch (err) {
    logger.error('Error in getPostsByUserId:', err);
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email avatar bio')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name email avatar' },
        options: { sort: { date: -1 } }
      });

    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    successResponse(res, 200, post, 'Post retrieved successfully');
  } catch (err) {
    logger.error('Error in getPost:', err);
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    // Handle image - if using Cloudinary, req.file.path will be the URL
    // If using memory storage, req.file.buffer will be the buffer
    let imageUrl = null;
    let imageType = null;

    if (req.file) {
      if (req.file.path) {
        // Cloudinary storage - file.path is the URL
        imageUrl = req.file.path;
        imageType = req.file.mimetype;
      } else if (req.file.buffer) {
        // Memory storage - convert to base64 for now (not ideal, but works)
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        imageType = req.file.mimetype;
      }
    }

    const postData = {
      title,
      content,
      author: req.user._id,
      image: imageUrl,
      imageType: imageType
    };

    if (tags && Array.isArray(tags)) {
      postData.tags = tags.filter(tag => tag.trim().length > 0);
    }

    const newPost = new Post(postData);
    const post = await newPost.save();

    // Populate author before returning
    await post.populate('author', 'name email avatar');

    // Invalidate cache when new post is created
    // This ensures users see the new post immediately
    await invalidateCache('cache:/api/posts*'); // Invalidate all post list caches
    await invalidateCache(`cache:/api/posts/${post._id}`); // Invalidate this post's cache

    successResponse(res, 201, post, 'Post created successfully');
  } catch (err) {
    logger.error('Error in createPost:', err);
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const updateData = { updatedAt: Date.now() };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags.filter(tag => tag.trim().length > 0);
    }

    // Handle image update if provided
    if (req.file) {
      if (req.file.path) {
        updateData.image = req.file.path;
        updateData.imageType = req.file.mimetype;
      } else if (req.file.buffer) {
        updateData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        updateData.imageType = req.file.mimetype;
      }
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('author', 'name email avatar');

    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    // Invalidate cache when post is updated
    await invalidateCache('cache:/api/posts*'); // Invalidate all post list caches
    await invalidateCache(`cache:/api/posts/${post._id}`); // Invalidate this post's cache

    successResponse(res, 200, post, 'Post updated successfully');
  } catch (err) {
    logger.error('Error in updatePost:', err);
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    // Use deleteOne instead of deprecated remove()
    await Post.deleteOne({ _id: post._id });

    // Invalidate cache when post is deleted
    await invalidateCache('cache:/api/posts*'); // Invalidate all post list caches
    await invalidateCache(`cache:/api/posts/${post._id}`); // Invalidate this post's cache

    successResponse(res, 200, null, 'Post deleted successfully');
  } catch (err) {
    logger.error('Error in deletePost:', err);
    next(err);
  }
};
