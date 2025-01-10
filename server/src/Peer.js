module.exports = class Peer {
    constructor(socketId) {
        this.id = socketId;
        this.isConnected = false;
        this.partnerId = null;
    }

    connect(partnerId) {
        this.partnerId = partnerId;
        this.isConnected = true;
    }

    disconnect() {
        this.partnerId = null;
        this.isConnected = false;
    }

    isReady() {
        return !this.isConnected;
    }
};
