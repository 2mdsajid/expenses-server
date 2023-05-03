const express = require('express');
const router = express.Router();

let app = express()
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");

const { v4: uuidv4 } = require('uuid');

const Home = require('../schema/homeSchema')
const User = require('../schema/userSchema')
const Member = require('../schema/memberSchema')
const Expense = require('../schema/expenseSchema')

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   }
// });

// pusher setup
// const Pusher = require("pusher");

// const pusher = new Pusher({
//   appId: "1594316",
//   key: "f594af9f3392d531de1f",
//   secret: "be2783858206674c1136",
//   cluster: "ap2",
//   useTLS: true
// });


router.post('/addexpense', async (req, res) => {
  try {
    const { homeid, item, price, userid, sharing, description, category } = req.body;

    // Create new expense
    const newExpense = new Expense({
      home: homeid,
      item,
      price,
      addedby: userid
    });

    // Add description and sharing if they are present in the request
    if (description) {
      newExpense.description = description;
    }
    if (sharing) {
      newExpense.sharing = sharing
    }

    if (category) {
      newExpense.category = category
    }

    await newExpense.save();

    const expenses = await Expense.find({ home: homeid })
      .populate({
        path: 'addedby',
        select: 'name'
      })

    const userexpenses = await Expense.find({ addedby: userid })
      .populate({
        path: 'comments.user',
        select: 'name'
      })
      .populate('addedby', 'name avatar').exec();



    return res.status(201).json({
      message: 'New expense added successfully',
      homeid,
      home: expenses,
      user: userexpenses,
      status: 201,
      meaning: 'created'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal Server Error',
      status: 500,
      meaning: 'internal server error'
    });
  }
});

// get expenses by for user
router.post('/getuserexpenses', async (req, res) => {
  const { userId } = req.body;
  // console.log(userId)

  try {
    const expenses = await Expense.find({ addedby: userId })
      .populate({
        path: 'comments.user',
        select: 'name'
      })
      .populate('addedby', 'name avatar').exec();

    // console.log(expenses)
    // .populate('addedby', '-password -loginTokens -verification.token');

    res.status(200).json({
      message: 'User expenses retrieved successfully',
      expenses,
      status: 200,
      meaning: 'ok'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
      meaning: 'internal server error'
    });
  }
})

// get expenses by homes
router.post('/gethomeexpenses', async (req, res) => {
  const { homeId } = req.body;

  try {
    const expenses = await Expense.find({ home: homeId })
      .populate({
        path: 'addedby',
        select: 'name'
      })
      .populate({
        path: 'comments.user',
        select: 'name'
      })

    res.status(200).json({
      message: 'Expenses retrieved successfully',
      expenses,
      status: 200,
      meaning: 'ok'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve expenses',
      error,
      status: 500,
      meaning: 'internal server error'
    });
  }
});



// add comments
router.post('/expenses/addcomments', async (req, res) => {
  try {
    const { userId, comment, expenseId } = req.body;

    const expense = await Expense.findById(expenseId)

    if (!expense) {
      return res.status(404).json({
        message: 'Expense not found',
        status: 404,
        meaning: 'not found'
      });
    }

    const newComment = {
      user: userId,
      comment: comment
    };

    expense.comments.push(newComment);
    await expense.save();

    
    const newexp = await Expense.findById(expenseId).populate('comments.user', 'name')
    
    // pusher.trigger("comment", "get-comment", {
    //   newexp
    // });

    return res.status(201).json({
      message: 'New comment added successfully',
      newexp,
      status: 201,
      meaning: 'created'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      meaning: 'internal server error'
    });
  }
});


module.exports = router;
