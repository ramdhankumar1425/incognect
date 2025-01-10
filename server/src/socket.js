const Peer = require("./Peer");

let peers = new Map(); // in-memory store of all the peers

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // store the peer
        peers.set(socket.id, new Peer(socket.id));

        io.emit("onlinePeerCount", { count: peers.size });

        socket.on("getPartner", async function (_, cb) {
            try {
                peers.forEach((peer) => {
                    if (peer.id === socket.id || !peer.isReady()) return;

                    // connect this socket with peer
                    io.to(socket.id).emit("partnerFound", {
                        partnerId: peer.id,
                    });
                    io.to(peer.id).emit("partnerFound", {
                        partnerId: socket.id,
                    });

                    io.to(socket.id).emit("getOffer");
                });
            } catch (error) {
                console.error("Error in getting partner event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("offer", async function ({ offer, targetId }, cb) {
            try {
                io.to(targetId).emit("offer", { offer });

                cb({
                    success: true,
                });
            } catch (error) {
                console.error("Error in offer event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("answer", async function ({ answer, targetId }, cb) {
            try {
                io.to(targetId).emit("answer", { answer });

                cb({ success: true });
            } catch (error) {
                console.error("Error in answer event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("iceCandidate", async function ({ candidate, targetId }, cb) {
            try {
                io.to(targetId).emit("iceCandidate", { candidate });

                cb({ success: true });
            } catch (error) {
                console.error("Error in adding iceCandidate event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("connected", function ({ partnerId }, cb) {
            try {
                peers.get(socket.id).connect(partnerId);

                cb({
                    success: true,
                });
            } catch (error) {
                console.error("Error in setting connection state:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("disconnected", function (_, cb) {
            try {
                peers.get(socket.id).disconnect();

                cb({
                    success: true,
                });
            } catch (error) {
                console.error("Error in setting connection state:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("chat", function ({ text, targetId }, cb) {
            try {
                io.to(targetId).emit("chat", { text });

                cb({
                    success: true,
                });
            } catch (error) {
                console.error("Error in sending chat:", error);

                cb({ success: false, error });
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);

            if (peers.has(socket.id)) peers.delete(socket.id);

            io.emit("onlinePeerCount", { count: peers.size });
        });
    });
};

module.exports = socketHandler;
