const mongoose = require('mongoose');

const Home = require('./homeSchema')

const userSchema = new mongoose.Schema({
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
    avatar: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    verification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        token: {
            type: String
        },
        expiresAt: { type: Date },
    },
    loginTokens: [{
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    homes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home'
    }]
})


module.exports = mongoose.model('User', userSchema);