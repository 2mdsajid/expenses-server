// Importing express library and initializing app variable
let express = require('express')
const http = require('http');
let app = express()
const server = http.createServer(app);

const { Server } = require("socket.io");

const Expense = require('./schema/expenseSchema')

// Importing dotenv library to retrieve sensitive information from the .env file
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

// Getting the port value from the .env file or defaulting to 5000
const PORT = process.env.PORT || 5000

// database connection
require('./db/dbconn')

// Serving static files from the 'public' folder
app.use('/public', express.static('public'));

let cors = require('cors')
app.use(cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


//before AUTH.JS loading so that it effects
app.use(express.json())

// importing the route
app.use(require('./routes/userroute'))
app.use(require('./routes/homeroute'))
app.use(require('./routes/expenseroute'))




// const io = new Server(server, {
//     cors: {
//         origin: "https://homesplit.netlify.app",
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true
//     }
// });

// const ss = require('./routes/socket')(io)




// const server = http.createServer(app);

server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));















