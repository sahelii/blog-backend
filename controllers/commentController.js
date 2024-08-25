const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
  const { comment } = req.body;

  try {
    const newComment = new Comment({
      user: req.user.email,
      comment,
      post: req.params.id,
    });

    const post = await Post.findById(req.params.id);
    post.comments.push(newComment);
    await post.save();

    const savedComment = await newComment.save();
    res.json(savedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
