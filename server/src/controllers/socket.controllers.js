const peerStore = require("../services/peerStore");

const handleGetPartner = async (io, socket, data, cb) => {
    try {
        peerStore.forEach((peer) => {
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

        peerStore.get(socket.id).ready = true;
    } catch (error) {
        console.error("Error in getting partner event:", error);

        cb({
            success: false,
            error,
        });
    }
};

const handleOffer = async (io, socket, data, cb) => {
    try {
        const { offer, targetId } = data;

        if (!offer || !targetId) {
            cb({
                success: false,
                error: new Error("Invalid offer or targetId"),
            });
            return;
        }

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
};

const handleAnswer = async (io, socket, data, cb) => {
    try {
        const { answer, targetId } = data;

        if (!answer || !targetId) {
            cb({
                success: false,
                error: new Error("Invalid answer or targetId"),
            });
            return;
        }

        io.to(targetId).emit("answer", { answer });

        cb({ success: true });
    } catch (error) {
        console.error("Error in answer event:", error);

        cb({
            success: false,
            error,
        });
    }
};

const handleIceCandidate = async (io, socket, data, cb) => {
    try {
        const { candidate, targetId } = data;

        if (!candidate || !targetId) {
            cb({
                success: false,
                error: new Error("Invalid iceCandidate or targetId"),
            });
            return;
        }

        io.to(targetId).emit("iceCandidate", { candidate });

        cb({ success: true });
    } catch (error) {
        console.error("Error in adding iceCandidate event:", error);

        cb({
            success: false,
            error,
        });
    }
};

const handleConnected = async (io, socket, data, cb) => {
    try {
        const { partnerId } = data;

        if (!partnerId) {
            cb({
                success: false,
                error: new Error("Invalid partnerId"),
            });
            return;
        }

        peerStore.get(socket.id).connect(partnerId);

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
};

const handleDisconnected = async (io, socket, data, cb) => {
    try {
        peerStore.get(socket.id).disconnect();

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
};

const handleChat = async (io, socket, data, cb) => {
    try {
        const { text, targetId } = data;

        if (!text || !targetId) {
            cb({
                success: false,
                error: new Error("Invalid text or targetId"),
            });
            return;
        }

        io.to(targetId).emit("chat", { text });

        cb({
            success: true,
        });
    } catch (error) {
        console.error("Error in sending chat:", error);

        cb({ success: false, error });
    }
};

const handleEmoji = async (io, socket, data, cb) => {
    try {
        const { emoji, targetId } = data;

        if (!emoji || !targetId) {
            cb({
                success: false,
                error: new Error("Invalid emoji or targetId"),
            });
            return;
        }

        io.to(targetId).emit("emoji", { emoji });

        cb({
            success: true,
        });
    } catch (error) {
        console.error("Error in sending emoji:", error);

        cb({ success: false, error });
    }
};

module.exports = {
    handleGetPartner,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    handleConnected,
    handleDisconnected,
    handleChat,
    handleEmoji,
};
