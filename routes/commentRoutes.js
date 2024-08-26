const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware=require('../middleware/verifyTokenMiddleware')
const { createComment, getCommentsByPostId } = require('../controllers/commentController');




router.post('/:id/comment', tokenVerifyMiddleware, createComment);
router.get('/:id/comment', getCommentsByPostId);


module.exports = router;
