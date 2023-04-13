const mongoose = require('mongoose');

const User = require('./userSchema')
const Home = require('./homeSchema')

// expenses collection schema
const expenseSchema = new mongoose.Schema({
    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
        required: true
    },
    item: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    addedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharing: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        share: {
            type: Number,
            default:0
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        comment:{
            type:String,
            required:true
        }
    }]
    // any other relevant data
});

module.exports = mongoose.model('Expense', expenseSchema);
