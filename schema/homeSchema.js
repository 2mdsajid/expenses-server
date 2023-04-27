const mongoose = require('mongoose');

const User = require('./userSchema')

const homeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    invitedusers: [{
        name: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,
        },
        invitetoken: {
            type: String,
            required: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: ['accepted', 'pending', 'rejected'],
            default: 'pending',
        }
    }],
    totalExpenses: [{
        month: {
            type: String,
            required: true
        },
        expense: {
            type: Number,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hisExpense: {
            type: Number,
            required: true
        },
        hisReceivable: {
            type: Number,
            required: true
        },
        hisGiveable: {
            type: Number,
            required: true
        },
    }],
    settledExpenses: {
        type: Number,
        default: 0,
    },
    isSettlementNeeded: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Home', homeSchema);
