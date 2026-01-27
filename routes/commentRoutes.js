const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware = require('../middleware/verifyTokenMiddleware');
const { validateComment } = require('../validators/postValidator');
const { cache } = require('../middleware/cache');
const { 
  createComment, 
  getCommentsByPostId,
  deleteComment 
} = require('../controllers/commentController');

// Create comment (protected, requires validation)
router.post(
  '/:id/comment',
  tokenVerifyMiddleware,
  validateComment,
  createComment
);

// Get comments by post ID (public)
// Cache for 2 minutes (120 seconds) - comments change more frequently than posts
router.get('/:id/comment', cache(120), getCommentsByPostId);

// Delete comment (protected)
router.delete('/:id/comment/:commentId', tokenVerifyMiddleware, deleteComment);

module.exports = router;
