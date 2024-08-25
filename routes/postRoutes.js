const express = require('express');
const router = express.Router();
const tokenVerifyMiddleware=require('../middleware/verifyTokenMiddleware')
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  //getMyBlogs,  
  
} = require('../controllers/postController');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', tokenVerifyMiddleware, createPost);
router.put('/:id', tokenVerifyMiddleware, updatePost);
router.delete('/:id', tokenVerifyMiddleware, deletePost);
//router.get('/my-blogs', tokenVerifyMiddleware, getMyBlogs);

module.exports = router;

