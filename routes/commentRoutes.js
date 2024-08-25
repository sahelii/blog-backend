const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware=require('../middleware/verifyTokenMiddleware')
const { createComment } = require('../controllers/commentController');

router.post('/:id/comments', tokenVerifyMiddleware, createComment);

module.exports = router;
