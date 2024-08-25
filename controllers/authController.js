const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, firebase_uid } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    const new_user = new User({ email, "password":hashed_password, firebase_uid });
    await new_user.save();
    delete(new_user.password)
    res.status(201).json(new_user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
