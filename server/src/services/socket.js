const Peer = require("./Peer");
const peerStore = require("./peerStore");
const {
    handleGetPartner,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleConnected,
    handleDisconnected,
    handleChat,
    handleEmoji,
} = require("../controllers/socket.controllers");

// master socket handler for all socket events
const socketHandler = (io) => {
    io.on("connection", (socket) => {
        // store the peer
        peerStore.set(socket.id, new Peer(socket.id));

        io.emit("onlinePeerCount", { count: peerStore.size });
        console.log("Online Peers:", peerStore.size);

        socket.on("getPartner", (data, cb) =>
            handleGetPartner(io, socket, data, cb)
        );

        socket.on("offer", (data, cb) => handleOffer(io, socket, data, cb));

        socket.on("answer", (data, cb) => handleAnswer(io, socket, data, cb));

        socket.on("iceCandidate", (data, cb) =>
            handleIceCandidate(io, socket, data, cb)
        );

        socket.on("connected", (data, cb) =>
            handleConnected(io, socket, data, cb)
        );

        socket.on("disconnected", (data, cb) =>
            handleDisconnected(io, socket, data, cb)
        );

        socket.on("chat", (data, cb) => handleChat(io, socket, data, cb));

        socket.on("emoji", (data, cb) => handleEmoji(io, socket, data, cb));

        socket.on("disconnect", () => {
            if (peerStore.has(socket.id)) peerStore.delete(socket.id);

            io.emit("onlinePeerCount", { count: peerStore.size });
            console.log("Online Peers:", peerStore.size);
        });
    });
};

module.exports = socketHandler;
