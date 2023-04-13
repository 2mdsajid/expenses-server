// Import necessary libraries
const mongoose = require('mongoose');

const User = require('./userSchema')
const Home = require('./homeSchema')

// Members collection schema
const memberSchema = new mongoose.Schema({
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Home',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'member'],
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default:null,
  },
  invitationStatus: {
    type: String,
    required: true,
    enum: ['accepted', 'pending', 'rejected','none'],
    default: 'pending',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  // any other relevant data
});

module.exports = mongoose.model('Member', memberSchema);
