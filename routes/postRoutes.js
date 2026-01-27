const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware = require('../middleware/verifyTokenMiddleware');
const { authorize } = require('../middleware/authorize');
const { validatePost, validatePostUpdate } = require('../validators/postValidator');
const upload = require('../utils/uploadImage');
const paginate = require('../middleware/pagination');
const Post = require('../models/Post');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostsByUserId,
} = require('../controllers/postController');

// Get user's own posts (protected)
router.get('/my-blogs', tokenVerifyMiddleware, getPostsByUserId);

// Get all posts with pagination (public)
router.get('/', paginate(Post, [
  { path: 'author', select: 'name email avatar' },
  { path: 'comments', populate: { path: 'user', select: 'name email avatar' } }
]), getPosts);

// Get single post (public)
router.get('/:id', getPost);

// Create post (protected, requires validation)
router.post(
  '/',
  tokenVerifyMiddleware,
  upload.single('image'),
  validatePost,
  createPost
);

// Update post (protected, requires authorization and validation)
router.put(
  '/:id',
  tokenVerifyMiddleware,
  authorize,
  upload.single('image'),
  validatePostUpdate,
  updatePost
);

// Delete post (protected, requires authorization)
router.delete('/:id', tokenVerifyMiddleware, authorize, deletePost);

module.exports = router;
