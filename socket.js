// Importing express library and initializing app variable
let express = require('express')
const http = require('http');
let app = express()
const server = http.createServer(app);

const { Server } = require("socket.io");


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

module.exports = {io}