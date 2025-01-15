require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./services/socket");

// create the http server instance
const server = createServer();

// create the socket server instance
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URI,
    },
});

// handle socket connections
socketHandler(io);

// start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(
        `Server started successfully on port ${process.env.PORT || 5000}`
    );
});
