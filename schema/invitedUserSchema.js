const mongoose = require('mongoose');

const invitedUserSchema = new mongoose.Schema({
  homeid: {
    type: String,
    required: true,
    unique: true,
  },
  invitedusers: [{
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    invitetoken: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['accepted', 'pending', 'rejected'],
      default: 'pending',
    }
  }]
});

const InvitedUsers = mongoose.model('InvitedUser', invitedUserSchema);

module.exports = InvitedUsers;
