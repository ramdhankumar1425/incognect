const peerStore = new Map();

module.exports = peerStore;

/* Not in use (Can be implemented to use a in memory database like Redis for peerStore)
class PeerStore {
    constructor() {
        this.peers = new Map();
    }

    add(peer) {
        this.peers.set(peer.id, peer);
    }

    get(id) {
        return this.peers.get(id);
    }

    remove(id) {
        this.peers.delete(id);
    }

    connectPeer(id, partnerId) {
        this.peers.get(id).connect(partnerId);
    }

    disconnectPeer(id) {
        this.peers.get(id).disconnect();
    }

    isPeerReady(id) {
        return this.peers.get(id).isReady();
    }
}
*/
