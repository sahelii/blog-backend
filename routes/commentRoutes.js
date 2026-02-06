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

/**
 * @swagger
 * /api/comments/{id}/comment:
 *   post:
 *     summary: Create a comment on a post
 *     description: Adds a new comment to a blog post. Requires authentication.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: Great article! Very helpful.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post(
  '/:id/comment',
  tokenVerifyMiddleware,
  validateComment,
  createComment
);

/**
 * @swagger
 * /api/comments/{id}/comment:
 *   get:
 *     summary: Get all comments for a post
 *     description: Retrieves all comments for a specific blog post, sorted by date (newest first)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 */
router.get('/:id/comment', cache(120), getCommentsByPostId);

/**
 * @swagger
 * /api/comments/{id}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a comment. Only the comment author can delete their own comment.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the comment author)
 *       404:
 *         description: Comment not found
 */
router.delete('/:id/comment/:commentId', tokenVerifyMiddleware, deleteComment);

module.exports = router;
