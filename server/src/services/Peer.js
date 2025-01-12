module.exports = class Peer {
    constructor(socketId) {
        this.id = socketId;
        this.ready = false;
        this.isConnected = false;
        this.partnerId = null;
    }

    connect(partnerId) {
        this.partnerId = partnerId;
        this.isConnected = true;
        this.ready = false;
    }

    disconnect() {
        this.partnerId = null;
        this.isConnected = false;
        this.ready = true;
    }

    isReady() {
        return this.ready && !this.isConnected;
    }
};
