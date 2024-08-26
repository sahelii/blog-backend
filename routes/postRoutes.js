const express = require('express');
const router = express.Router();
const multer = require('multer');
const tokenVerifyMiddleware=require('../middleware/verifyTokenMiddleware')
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostsByUserId,  
  
} = require('../controllers/postController');



const upload = multer();


router.get('/my-blogs', tokenVerifyMiddleware, getPostsByUserId);

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', [tokenVerifyMiddleware,upload.single('image')], createPost);
router.put('/:id', tokenVerifyMiddleware, updatePost);
router.delete('/:id', tokenVerifyMiddleware, deletePost);

module.exports = router;

