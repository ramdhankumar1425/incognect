const SOCKET_CONNECTION_TIMEOUT = 10000;
const SOCKET_RECONNECTION_ATTEMPTS = 5;
const SOCKET_RECONNECTION_DELAY = 1000;
const SOCKET_RECONNECTION_DELAY_MAX = 5000;

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
    EMOJI: "emoji",
    ONLINE_PEER_COUNT: "onlinePeerCount",
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
    SOCKET_CONNECTION_TIMEOUT,
    SOCKET_RECONNECTION_ATTEMPTS,
    SOCKET_RECONNECTION_DELAY,
    SOCKET_RECONNECTION_DELAY_MAX,
    SOCKET_EVENTS,
    WEBRTC_CONNECTION_CONFIG,
    CONTENT_MODERATION_INTERVAL,
    MAX_CHAT_MESSAGES,
};
