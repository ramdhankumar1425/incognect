const Peer = require("./Peer");

let peers = new Map();

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // store the peer
        peers.set(socket.id, new Peer(socket.id));

        io.emit("onlinePeerCount", { count: peers.size });

        socket.on("offer", async function ({ offer }, cb) {
            try {
                peers.get(socket.id).setOffer(offer);

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
                io.to(targetId).emit("answer", { answer, peerId: socket.id });

                cb({ success: true });
            } catch (error) {
                console.error("Error in answer event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("iceCandidate", async function ({ candidate }, cb) {
            try {
                peers.get(socket.id).addIceCandidate(candidate);

                cb({ success: true });
            } catch (error) {
                console.error("Error in adding iceCandidate event:", error);

                cb({
                    success: false,
                    error,
                });
            }
        });

        socket.on("createConnection", function (_, cb) {
            try {
                peers.forEach((peer) => {
                    if (peer.id !== socket.id && peer.isReady()) {
                        console.log("Connecting....");
                        const offer = peer.getOffer();

                        socket.emit("offer", { offer, peerId: peer.id });

                        return;
                    }
                });

                cb({
                    success: true,
                });
            } catch (error) {
                console.error("Error in createConnection event:", error);

                cb({
                    success: false,
                    error,
                });
            }
            // send offer
        });

        socket.on("getIceCandidates", async function ({ peerId }, cb) {
            try {
                const iceCandidates = peers.get(peerId).getIceCandidates();

                iceCandidates.forEach((candidate) => {
                    socket.emit("iceCandidate", { candidate });
                });
            } catch (error) {
                console.error("Error in getting iceCandidates event:", error);

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
