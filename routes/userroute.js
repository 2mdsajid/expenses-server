const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const User = require('../schema/userSchema');
const Home = require('../schema/homeSchema')
const Expense = require('../schema/expenseSchema')
const InvitedUsers = require('../schema/invitedUserSchema')
const Member = require('../schema/memberSchema')

// necessary imports for image
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

// nodemailer cofnigurration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'livingasrb007@gmail.com',
    pass: 'iddtzfwzeecehxrl'
  }
});



// Configure cloudinary
cloudinary.config({
  cloud_name: 'dww0rxb4q',
  api_key: '459624268647755',
  api_secret: 'nnvB3I1oDJI5dDutlXIQ7ECE6H4'
});

// Set up multer storage settings
const DIR = './public/';
const uploadDir = `${DIR}uploads/`;
fse.ensureDir(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


router.get('/', (req, res) => {
  res.json({ data: 'this is home page' })
})


// POST request for user signup
router.post('/signup', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, homeid } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if the provided home ID exists
    if (homeid) {
      let home = await Home.findById(homeid);
      console.log('home exist')
      if (!home) {
        return res.status(400).json({ message: 'Invalid home ID' });
      }
    }

    // Upload the avatar to cloudinary if it exists
    let avatarUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      avatarUrl = result.secure_url;
      console.log(avatarUrl)
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    // const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationToken = uuidv4().replace(/-/g, '');
    // Create a new user document
    user = new User({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      homes: homeid ? [homeid] : [],
      verification: {
        token: verificationToken,
        isVerified: false,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      },
    });

    // Save the user document
    await user.save();


    // adding as a member
    if (homeid) {

      const member = new Member({
        home: homeid,
        user: user._id,
        role: 'member',
        invitationStatus: 'accepted'
      })
B  
      console.log('member', member)
      await member.save()


      // Find the invited user by email
      // const invitedUsers = await InvitedUsers.findOne({ homeid });
      // const invitedUser = invitedUsers.invitedusers.find(user => user.email === email);
      // if (invitedUser) {
      //   invitedUser.status = 'accepted';
      //   console.log('invited', invitedUser)
      //   await invitedUsers.save();
      // }

      // adding to home also
      let home = await Home.findById(homeid);
      home.members.push({ user: user._id })
      console.log('home', home)
      await home.save()

    }


    // Send a verification email
    const mailOptions = {
      from: 'livingasrb007@gmail.com',
      to: '222mdsasdsfdsdcsdcdsjid@gmail.com',
      subject: 'Verify your email address',
      html: `Click <a href="${process.env.BASE_URL}/verifyemail/${verificationToken}-${user._id}">here</a> to verify your email address.`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        if (error.message.includes("Invalid recipient")) {
          console.log("Wrong email address");
        } else {
          console.log(error);
        }
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    



    res.status(201).json({
      message: 'User created successfully',
      user,
      status: 201,
      meaning: 'created',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// LOGIN REQUEST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        status: 401,
        meaning: 'unauthorized'
      });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        status: 401,
        meaning: 'unauthorized'
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Add JWT token to user's loginTokens array
    user.loginTokens.push({ token });

    // Save user's updated loginTokens array
    await user.save();

    // Return success response with JWT token
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status
      },
      token,
      isverified:user.verification.isVerified,
      homes: user.homes,
      status: 200,
      meaning: 'ok'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Internal server error',
      status: 500,
      meaning: 'internal server error'
    });
  }
});

// getting user profile
router.post('/getuserprofile', async (req, res) => {
  try {
    const userId = req.body.userId;

    // Retrieve the user profile data based on the provided userId
    const user = await User.findById(userId)
      .select('-loginTokens -password -verification.token')
      .populate('homes', 'name members')
      .exec();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
        meaning: 'not found'
      });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: user,
      status: 200,
      meaning: 'ok'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error',
      status: 500,
      meaning: 'internal server error'
    });
  }
});

// verify email
router.get('/verifyemail/:token', async (req, res) => {
  try {
    const token = req.params.token;

    console.log(token)
    const [verificationToken, userId] = token.split('-');
    console.log('userid',userId)

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verification.token === verificationToken) {
      user.verification.isVerified = true;
      await user.save();
      return res.json({ message: 'Email verified successfully' });
    } else {
      return res.status(401).json({ message: 'Invalid verification token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;