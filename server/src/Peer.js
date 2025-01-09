module.exports = class Peer {
    constructor(peerId) {
        this.id = peerId;
        this.offer = null;
        this.iceCandidates = [];
        this.isConnected = false;
        this.partnerId = null;
    }

    setOffer(offer) {
        this.offer = offer;
    }

    getOffer() {
        return this.offer;
    }

    addIceCandidate(candidate) {
        this.iceCandidates.push(candidate);
    }

    getIceCandidates() {
        return this.iceCandidates;
    }

    connect(partnerId) {
        this.partnerId = partnerId;
        this.isConnected = true;
    }

    disconnect() {
        this.offer = null;
        this.iceCandidates = [];
        this.partnerId = null;
        this.isConnected = false;
    }

    isReady() {
        return !this.isConnected && this.offer && this.iceCandidates.length > 0;
    }

    log() {
        console.log("id:", this.id);
        console.log("isConnected:", this.isConnected);
        console.log("partnerId:", this.partnerId);
        console.log("\n");
    }
};
