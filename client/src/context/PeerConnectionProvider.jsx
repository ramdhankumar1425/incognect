import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import * as nsfwjs from "nsfwjs";
import { toast } from "sonner";
import {
    SOCKET_EVENTS,
    WEBRTC_CONNECTION_CONFIG,
    CONTENT_MODERATION_INTERVAL,
    MAX_CHAT_MESSAGES,
} from "../constants/constants";
import { useSocket } from "./SocketProvider";

const PeerConnectionContext = createContext();

export const PeerConnectionProvider = ({ children }) => {
    const { socket, emitSocketEvent } = useSocket();

    const peerConnectionRef = useRef(null); // reference to the webrtc connection
    const partnerIdRef = useRef(null); // reference to the partner's id
    const [isLoading, setIsLoading] = useState(false); // to track the loading state

    const [localMedia, setLocalMedia] = useState(null); // local media (audio and video)
    const [remoteMedia, setRemoteMedia] = useState(null); // remote media (audio and video)
    const [chats, setChats] = useState([]); // chat messages

    const [onlinePeerCount, setOnlinePeerCount] = useState(0); // total online peers currently

    const nsfwjsModelRef = useRef(null); // nsfwjs model reference

    // to get local media (audio and video)
    const getLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            setLocalMedia(stream);
        } catch (error) {
            console.error("Error in getting local media:", error);

            if (error.name === "NotAllowedError") {
                toast.error("Permission denied to access media devices.");
            } else {
                toast.error("Error in accessing media devices.");
            }
        }
    }, []);

    // master function to connect
    const getPartner = useCallback(async () => {
        try {
            if (!socket || socket.disconnected) return;
            if (!localMedia) await getLocalMedia();

            setIsLoading(true);

            await emitSocketEvent(SOCKET_EVENTS.DISCONNECTED);

            if (peerConnectionRef.current) peerConnectionRef.current.close();

            peerConnectionRef.current = null;
            partnerIdRef.current = null;
            setRemoteMedia(null);
            setChats([]);

            await emitSocketEvent(SOCKET_EVENTS.GET_PARTNER);
        } catch (error) {
            console.error("Error in getting partner:", error);
            toast.error("Error in connecting. Please try again.");
        }
    }, [socket, localMedia, getLocalMedia, emitSocketEvent]);

    // to leave the current connection
    const leavePartner = useCallback(async () => {
        try {
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (localMedia)
                localMedia.getTracks().forEach((track) => track.stop());
            if (remoteMedia)
                remoteMedia.getTracks().forEach((track) => track.stop());

            peerConnectionRef.current = null;
            setLocalMedia(null);
            setRemoteMedia(null);
            setChats([]);
            setIsLoading(false);
            partnerIdRef.current = null;
        } catch (error) {
            console.error("Error in leaving:", error);
        }
    }, [localMedia, remoteMedia]);

    // to send chat messages
    const sendChat = useCallback(
        async (text) => {
            try {
                if (!partnerIdRef.current) return;

                setChats((prev) => {
                    const newChats = [...prev, { isLocal: true, text }];
                    return newChats.slice(
                        Math.max(newChats.length - MAX_CHAT_MESSAGES, 0)
                    );
                });

                await emitSocketEvent(SOCKET_EVENTS.CHAT, {
                    text,
                    targetId: partnerIdRef.current,
                });
            } catch (error) {
                console.error("Error in sending chat:", error);
                toast.error("Error in sending chat. Please try again.");
            }
        },
        [emitSocketEvent]
    );

    // to load the NSFWJS model
    const loadNSFWJSModel = useCallback(async () => {
        try {
            const model = await nsfwjs.load(
                `${window.location.origin}/nsfwjs/models/mobilenet_v2_mid/model.json`,
                {
                    type: "graph",
                }
            );

            nsfwjsModelRef.current = model;
        } catch (error) {
            console.error("Error in loading NSFWJS model:", error);
        }
    }, []);

    // to moderate the local media for inappropriate content using NSFWJS
    const moderateLocalMedia = useCallback(async () => {
        try {
            if (!localMedia) return;

            const localVideo = document.getElementById("localVideo");

            if (!nsfwjsModelRef.current) await loadNSFWJSModel();

            const interval = setInterval(async () => {
                // Classify the image
                const predictions = await nsfwjsModelRef.current.classify(
                    localVideo
                );

                const isInappropriate = predictions.some(
                    (prediction) =>
                        prediction.className === "Porn" &&
                        prediction.probability > 0.9
                );

                if (isInappropriate) {
                    // inappropriate content detected
                    leavePartner();
                    alert("Inappropriate content detected.");
                    clearInterval(interval);
                }
            }, CONTENT_MODERATION_INTERVAL);

            return interval;
        } catch (error) {
            console.error("Error in moderating local media:", error);
        }
    }, [localMedia, leavePartner]);

    // socket event handlers
    const handlePartnerFound = useCallback(
        ({ partnerId }) => {
            if (!isLoading) return;

            partnerIdRef.current = partnerId;

            // create RTCPeerConnection
            const pc = new RTCPeerConnection(WEBRTC_CONNECTION_CONFIG);
            peerConnectionRef.current = pc;

            pc.onicecandidate = pcEventIceCandidate;
            pc.ontrack = pcEventTrack;
            pc.onconnectionstatechange = pcEventConnectionStateChange;

            // attach local media to peer connection
            if (localMedia)
                localMedia
                    .getTracks()
                    .forEach((track) => pc.addTrack(track, localMedia));
        },
        [localMedia]
    );

    const handleGetOffer = useCallback(async () => {
        try {
            if (!partnerIdRef.current || !peerConnectionRef.current) return;

            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            await emitSocketEvent(SOCKET_EVENTS.OFFER, {
                offer,
                targetId: partnerIdRef.current,
            });
        } catch (error) {
            console.error("Error in getting offer:", error);
            toast.error("Error in connecting. Please try again.");
        }
    }, [emitSocketEvent]);

    const handleOffer = useCallback(
        async ({ offer }) => {
            try {
                if (!peerConnectionRef.current) return;

                await peerConnectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );

                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);

                await emitSocketEvent(SOCKET_EVENTS.ANSWER, {
                    answer,
                    targetId: partnerIdRef.current,
                });
            } catch (error) {
                console.error("Error in handling offer:", error);
                toast.error("Error in connecting. Please try again.");
            }
        },
        [emitSocketEvent]
    );

    const handleAnswer = useCallback(async ({ answer }) => {
        try {
            if (!peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        } catch (error) {
            console.error("Error in handling answer:", error);
            toast.error("Error in connecting. Please try again.");
        }
    }, []);

    const handleIceCandidate = useCallback(async ({ candidate }) => {
        try {
            if (!peerConnectionRef.current) return;

            if (candidate) {
                await peerConnectionRef.current.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error("Error in handling ICE candidate:", error);
            toast.error("Error in connecting. Please try again.");
        }
    }, []);

    const handleChat = useCallback(({ text }) => {
        if (!text) return;

        setChats((prev) => {
            const newChats = [...prev, { isLocal: false, text }];
            return newChats.slice(
                Math.max(newChats.length - MAX_CHAT_MESSAGES, 0)
            );
        });
    }, []);

    const handleOnlinePeerCount = useCallback(({ count }) => {
        if (count) setOnlinePeerCount(count);
    }, []);

    const handlePartnerDisconnected = useCallback(() => {
        getPartner();
    }, [getPartner]);

    // peer connection event handlers
    // when the local peer has an ICE candidate
    const pcEventIceCandidate = useCallback(
        async (event) => {
            try {
                if (partnerIdRef.current && event.candidate) {
                    await emitSocketEvent(SOCKET_EVENTS.ICE_CANDIDATE, {
                        candidate: event.candidate,
                        targetId: partnerIdRef.current,
                    });
                }
            } catch (error) {
                console.error("Error in sending ICE candidate:", error);
                toast.error("Error in connecting. Please try again.");
            }
        },
        [emitSocketEvent]
    );

    // when the local peer receives a remote stream
    const pcEventTrack = useCallback(async (event) => {
        const [remoteStream] = event.streams;
        setRemoteMedia(remoteStream);
    }, []);

    // when the local peer connection state changes
    const pcEventConnectionStateChange = useCallback(async () => {
        const connectionState = peerConnectionRef.current?.connectionState;

        switch (connectionState) {
            case "connected": {
                setIsLoading(false);
                emitSocketEvent(SOCKET_EVENTS.CONNECTED, {
                    partnerId: partnerIdRef.current,
                });

                break;
            }
            case "disconnected":
            case "failed":
            case "closed": {
                console.warn("Connection lost. Attempting to reconnect...");
                getPartner();

                break;
            }
            default:
                break;
        }
    }, [emitSocketEvent, getPartner]);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on(SOCKET_EVENTS.PARTNER_FOUND, handlePartnerFound);
        socket.on(SOCKET_EVENTS.GET_OFFER, handleGetOffer);
        socket.on(SOCKET_EVENTS.OFFER, handleOffer);
        socket.on(SOCKET_EVENTS.ANSWER, handleAnswer);
        socket.on(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
        socket.on(SOCKET_EVENTS.CHAT, handleChat);
        socket.on(SOCKET_EVENTS.ONLINE_PEER_COUNT, handleOnlinePeerCount);
        socket.on(
            SOCKET_EVENTS.PARTNER_DISCONNECTED,
            handlePartnerDisconnected
        );

        return () => {
            if (!socket) return;

            socket.off(SOCKET_EVENTS.PARTNER_FOUND, handlePartnerFound);
            socket.off(SOCKET_EVENTS.GET_OFFER, handleGetOffer);
            socket.off(SOCKET_EVENTS.OFFER, handleOffer);
            socket.off(SOCKET_EVENTS.ANSWER, handleAnswer);
            socket.off(SOCKET_EVENTS.ICE_CANDIDATE, handleIceCandidate);
            socket.off(SOCKET_EVENTS.CHAT, handleChat);
            socket.off(SOCKET_EVENTS.ONLINE_PEER_COUNT, handleOnlinePeerCount);
            socket.off(
                SOCKET_EVENTS.PARTNER_DISCONNECTED,
                handlePartnerDisconnected
            );
        };
    }, [
        socket,
        handlePartnerFound,
        handleGetOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        handleChat,
        handleOnlinePeerCount,
        handlePartnerDisconnected,
    ]);

    // to moderate the video that is being shared
    useEffect(() => {
        if (!localMedia) return;

        const interval = moderateLocalMedia();

        return () => clearInterval(interval);
    }, [localMedia, moderateLocalMedia]);

    // cleanup
    useEffect(() => {
        return () => {
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (localMedia)
                localMedia.getTracks().forEach((track) => track.stop());
            if (remoteMedia)
                remoteMedia.getTracks().forEach((track) => track.stop());

            peerConnectionRef.current = null;
            setLocalMedia(null);
            setRemoteMedia(null);
            setChats([]);
            setIsLoading(false);
            partnerIdRef.current = null;
            setOnlinePeerCount(0);
            nsfwjsModelRef.current = null;
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            getPartner,
            leavePartner,
            localMedia,
            remoteMedia,
            isLoading,
            chats,
            sendChat,
            partnerIdRef,
            onlinePeerCount,
        }),
        [
            getPartner,
            leavePartner,
            localMedia,
            remoteMedia,
            isLoading,
            chats,
            sendChat,
            partnerIdRef,
            onlinePeerCount,
        ]
    );

    return (
        <PeerConnectionContext.Provider value={contextValue}>
            {children}
        </PeerConnectionContext.Provider>
    );
};

export const usePeerConnection = () => {
    const context = useContext(PeerConnectionContext);

    if (!context) {
        throw new Error(
            "usePeerConnection must be used within PeerConnectionProvider"
        );
    }

    return context;
};
