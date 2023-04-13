const express = require('express');
const router = express.Router();
// const nanoid = require('nanoid');
const nodemailer = require('nodemailer');

const { v4: uuidv4 } = require('uuid');

const Home = require('../schema/homeSchema');
const User = require('../schema/userSchema');
const Member = require('../schema/memberSchema')
const InvitedUsers = require('../schema/invitedUserSchema')

// nodemailer cofnigurration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'livingasrb007@gmail.com',
    pass: 'iddtzfwzeecehxrl'
  }
});


// CREATE A NEW HOME
router.post('/createhome', async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    const homeId = uuidv4(); // generate a unique ID for the home
    console.log('id', homeId)

    // check if the owner exists


    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }


    // create the new home
    const newHome = new Home({
      name,
      owner: ownerId,
      homeId,
      members: [{ user: ownerId }]
    });

    // save the new home
    const savedHome = await newHome.save();

    // add the new home to the owner's list of homes
    owner.homes.push(savedHome._id);
    await owner.save();

    const member = new Member({
      home: newHome._id,
      user: ownerId,
      role: 'owner'
    })
    await member.save()

    res.status(201).json({
      message: 'New home created successfully',
      home: savedHome,
      member: member,
      status: 201,
      meaning: 'created',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// JOIN HOME FROM HOME-ID not LINK
router.post('/joinhomeviaid', async (req, res) => {
  try {
    const { homeid, userId } = req.body;

    // Check if the home exists
    const home = await Home.findById(homeid);
    if (!home) {
      return res.status(404).json({
        message: 'Home not found',
        status: 404,
        meaning: 'not found'
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
        meaning: 'not found'
      });
    }

    // Add the member to the Member collection
    const member = new Member({
      home: homeid,
      user: user._id,
      role: 'member',
      invitationStatus: 'none'
    });
    await member.save();
    console.log('member', member)

    // Add the member to the Home collection
    home.members.push({ user: user._id });
    await home.save();
    console.log('home', home)

    user.homes.push(home._id)
    await user.save()
    console.log('user', user)

    return res.status(200).json({
      message: 'New member added successfully',
      status: 200,
      meaning: 'ok'
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

// ADD INVITED USERS IN PENDING
router.post('/addinvitedusers', async (req, res) => {
  try {
    const { homeid, invitedUsers } = req.body;

    for (let i = 0; i < invitedUsers.length; i++) {
      const invitetoken = uuidv4().replace(/-/g, '');
      invitedUsers[i].invitetoken = invitetoken;
    }
    
    console.log(invitedUsers)

    const existingInvitedUsers = await InvitedUsers.findOne({ homeid });

    const newInvitedUsers = existingInvitedUsers || new InvitedUsers({
      homeid,
      invitedusers: []
    });

    newInvitedUsers.invitedusers.push(...invitedUsers);

    await newInvitedUsers.save();
    const meaning = existingInvitedUsers ? 'updated' : 'created';

    // send email with joining link
    invitedUsers.forEach(async (user) => {

      const mailOptions = {
        from: 'livingasrb007@gmail.com',
        to: user.email,
        subject: 'Verify your email address',
        html: `Click <a href="${process.env.BASE_URL}/verifyinvitedusers/${user.invitetoken}-${homeid}">here</a> to verify your email address.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
      } catch (error) {
        if (error.message.includes("Invalid recipient")) {
          console.log(`Wrong email address: ${user.email}`);
        } else {
          console.log(error);
        }
      }
    });

    return res.status(201).json({
      message: 'New invited users added successfully',
      invitedUsers: newInvitedUsers,
      status: 201,
      meaning
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

// VERIFY INVITED USERS
router.get('/verifyinvitedusers/:token', async (req, res) => {
  try {
    const token = req.params.token;

    console.log(token);
    const [inviteToken, homeId] = token.split('-');
    console.log('homeId', homeId);

    const invitedUsersDoc = await InvitedUsers.findOne({ homeid: homeId });
    if (!invitedUsersDoc) {
      return res.status(404).json({ message: 'Home not found' });
    }

    const matchedUser = invitedUsersDoc.invitedusers.find(user => user.invitetoken === inviteToken);
    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid invitation token' });
    }

    matchedUser.status = 'accepted';
    await invitedUsersDoc.save();

    return res.json({ name: matchedUser.name, email: matchedUser.email, homeid:homeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET HOME INFORMATION
router.post('/gethomeinfo', async (req, res) => {
  try {
    const homeId = req.body.homeId;

    const home = await Home.findById(homeId).populate({
      path: 'members.user',
      select: 'name avatar email _id'
    }).populate({
      path: 'owner',
      select: 'name avatar'
    });


    res.status(200).json({
      message: 'Home information retrieved successfully',
      home: home,
      status: 200,
      meaning: 'success'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error occurred while retrieving home information',
      status: 500,
      meaning: 'error'
    });
  }
});


// GET INVITED USERS
router.post('/getinvitedusers', async (req, res) => {
  const { homeId } = req.body;

  try {
    const invitedusers = await InvitedUsers.find({ homeid: homeId })

    if (!invitedusers) {
      return res.status(404).json({
        message: 'invitedusers not found',
        status: 404,
        meaning: 'not found'
      });
    }

    return res.status(200).json({
      message: 'Invited users retrieved successfully',
      users: invitedusers,
      status: 200,
      meaning: 'ok'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
      status: 500,
      meaning: 'internal server error'
    });
  }
});



module.exports = router