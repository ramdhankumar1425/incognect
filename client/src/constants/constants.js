const SOCKET_EVENTS = {
    GET_PARTNER: "getPartner",
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    PARTNER_FOUND: "partnerFound",
    GET_OFFER: "getOffer",
    OFFER: "offer",
    ANSWER: "answer",
    ICE_CANDIDATE: "iceCandidate",
    CHAT: "chat",
    ONLINE_PEER_COUNT: "onlinePeerCount",
    PARTNER_DISCONNECTED: "partnerDisconnected",
};

const WEBRTC_CONNECTION_CONFIG = {
    iceServers: [
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};

const CONTENT_MODERATION_INTERVAL = 10 * 1000; // 10 seconds

const MAX_CHAT_MESSAGES = 50;

export {
    SOCKET_EVENTS,
    WEBRTC_CONNECTION_CONFIG,
    CONTENT_MODERATION_INTERVAL,
    MAX_CHAT_MESSAGES,
};
