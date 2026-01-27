const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware = require('../middleware/verifyTokenMiddleware');
const { validateComment } = require('../validators/postValidator');
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
router.get('/:id/comment', getCommentsByPostId);

// Delete comment (protected)
router.delete('/:id/comment/:commentId', tokenVerifyMiddleware, deleteComment);

module.exports = router;
