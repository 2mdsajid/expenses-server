const express = require('express');
const router = express.Router();

const { v4: uuidv4 } = require('uuid');

const Home = require('../schema/homeSchema')
const User = require('../schema/userSchema')
const Member = require('../schema/memberSchema')
const Expense = require('../schema/expenseSchema')


router.post('/addexpense', async (req, res) => {
  try {
    const { homeid, item, price, userId, sharing, description } = req.body;

    // Create new expense
    const newExpense = new Expense({
      home: homeid,
      item,
      price,
      addedby: userId
    });

    // Add description and sharing if they are present in the request
    if (description) {
      newExpense.description = description;
    }
    if (sharing) {
      newExpense.sharing = sharing
    }

    await newExpense.save();

    return res.status(201).json({
      message: 'New expense added successfully',
      expense: newExpense,
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

  try {
    const expenses = await Expense.find({ addedby: userId })
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
    // .populate('addedBy', 'name avatar email _id').exec();

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



module.exports = router;