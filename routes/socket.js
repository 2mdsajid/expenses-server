let express = require('express')
const { Server } = require("socket.io");
const http = require('http');
let app = express()
const server = http.createServer(app);

const Expense = require('../schema/expenseSchema')
const User = require('../schema/userSchema')

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   }
// });



// module.exports = io;


exports = module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('a user connected broooo');

        socket.on('join-room', (roomid) => {
            socket.join(roomid);
            console.log(`Socket ${socket.id} joined expense dialog ${roomid}`);

            socket.on('addcomment', async (newcomment, roomId) => {

                const { userId, comment, expenseId } = newcomment
                const expense = await Expense.findById(expenseId);

                const newComment = {
                    user: userId,
                    comment: comment
                };
                expense.comments.push(newComment);

                const newexp = await expense.save();

                console.log(newexp)
                io.to(roomId).emit('updatecomment', { newexp });
            });
        });

        socket.on('join-expense', (homeid) => {
            socket.join(homeid);
            console.log(`Socket ${socket.id} joined expense ${homeid}`);

            socket.on('addexpense', async (expense, homeid) => {

                const { item, price, userid, sharing, description, category } = expense;

                // Create new expense
                const newexpense = new Expense({
                    home: homeid,
                    item,
                    price,
                    addedby: userid
                });

                // Add description and sharing if they are present in the request
                if (description) {
                    newexpense.description = description;
                }
                if (sharing) {
                    newexpense.sharing = sharing
                }

                if (category) {
                    newexpense.category = category
                }

                await newexpense.save();

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


                console.log('item', expenses)
                io.to(homeid).emit('addedexpense', {homeid,home:expenses,user:userexpenses});

            })
        });

    });
}
