require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socket");

const server = createServer();
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URI,
    },
});

socketHandler(io);

server.listen(process.env.PORT || 5000, () => {
    console.log(
        `Server started successfully on port ${process.env.PORT || 5000}`
    );
});
