const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User'); 

exports.createComment = async (req, res) => {
  const { comment } = req.body;
  const userId = await User.findOne({"firebase_uid":req.uid});
  try {
    const newComment = new Comment({
      user: userId,
      comment,
      post: req.params.id,
    });
    const savedComment = await newComment.save();
    const post = await Post.findById(req.params.id);
    post.comments.push(savedComment._id);
    await post.save();
    res.json(savedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getCommentsByPostId = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('user');
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

