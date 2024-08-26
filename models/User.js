const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
 firebase_uid:{
    type: String,
    required:true,
    unique:true
 },
 name: {
  type: String,
  required: true,
},
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
