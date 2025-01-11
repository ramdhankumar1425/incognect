import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { io } from "socket.io-client";
import * as nsfwjs from "nsfwjs";

const PeerConnectionContext = createContext();

const configuration = {
    iceServers: [
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
    ],
};

export const PeerConnectionProvider = ({ children }) => {
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const partnerIdRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const [localMedia, setLocalMedia] = useState(null);
    const [remoteMedia, setRemoteMedia] = useState(null);
    const [chats, setChats] = useState([]);

    const [onlinePeerCount, setOnlinePeerCount] = useState(0);

    const initSocket = useCallback(() => {
        const socket = io(import.meta.env.VITE_SERVER_URI);

        socketRef.current = socket;
    }, []);

    const emitSocketEvent = useCallback(
        async (event, data = {}) => {
            return new Promise((resolve, reject) => {
                socketRef.current.emit(event, data, (response) => {
                    if (response.success) resolve(response);
                    else reject(new Error(response.error || "Unknown error"));
                });
            });
        },
        [socketRef.current]
    );

    const getLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            setLocalMedia(stream);
        } catch (error) {
            console.error("Error in getting local media:", error);
        }
    }, []);

    const getPartner = useCallback(async () => {
        if (!socketRef.current) initSocket();
        if (!localMedia) await getLocalMedia();

        setIsLoading(true);

        if (peerConnectionRef.current) peerConnectionRef.current.close();

        peerConnectionRef.current = null;
        partnerIdRef.current = null;
        setRemoteMedia(null);
        setChats([]);

        await emitSocketEvent("getPartner");
    }, [
        socketRef.current,
        initSocket,
        localMedia,
        getLocalMedia,
        peerConnectionRef.current,
        emitSocketEvent,
    ]);

    const leave = useCallback(() => {
        // if (socketRef.current) socketRef.current.disconnect();
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (localMedia) localMedia.getTracks().forEach((track) => track.stop());

        // socketRef.current = null;
        peerConnectionRef.current = null;
        setLocalMedia(null);
        setRemoteMedia(null);
        setChats([]);
        setIsLoading(false);
        partnerIdRef.current = null;
        setOnlinePeerCount(0);
    }, [localMedia, peerConnectionRef.current, socketRef.current]);

    const sendChat = useCallback(
        async (text) => {
            if (!partnerIdRef.current) return;

            setChats((prev) => [
                ...prev,
                {
                    isLocal: true,
                    text,
                },
            ]);

            await emitSocketEvent("chat", {
                text,
                targetId: partnerIdRef.current,
            });
        },
        [partnerIdRef.current, emitSocketEvent]
    );

    const moderateLocalMedia = useCallback(async () => {
        if (!localMedia) return;

        const localVideo = document.getElementById("localVideo");

        const model = await nsfwjs.load(
            `${window.location.origin}/nsfwjs/models/inception_v3/model.json`,
            { size: 299 }
        );

        const interval = setInterval(async () => {
            // Classify the image
            const predictions = await model.classify(localVideo);
            console.log(predictions);
            let isInAppropriate = false;

            predictions.forEach((prediction) => {
                if (
                    prediction.className === "Porn" &&
                    prediction.probability > 0.6
                ) {
                    isInAppropriate = true;
                    return;
                }
            });

            if (isInAppropriate) {
                // inappropriate content detected
                leave();

                alert("Inappropriate content detected.");

                clearInterval(interval);
            }
        }, 5000);

        return interval;
    }, [localMedia, emitSocketEvent, leave]);

    // socket event handler
    const handlePartnerFound = useCallback(
        async ({ partnerId }) => {
            partnerIdRef.current = partnerId;

            // create RTCPeerConnection
            const pc = new RTCPeerConnection(configuration);
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
        if (!partnerIdRef.current || !peerConnectionRef.current) return;

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        await emitSocketEvent("offer", {
            offer,
            targetId: partnerIdRef.current,
        });
    }, [partnerIdRef.current, peerConnectionRef.current, emitSocketEvent]);

    const handleOffer = useCallback(
        async ({ offer }) => {
            if (!partnerIdRef.current || !peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            await emitSocketEvent("answer", {
                answer,
                targetId: partnerIdRef.current,
            });
        },
        [partnerIdRef.current, peerConnectionRef.current, emitSocketEvent]
    );

    const handleAnswer = useCallback(
        async ({ answer }) => {
            if (!partnerIdRef.current || !peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        },
        [partnerIdRef.current, peerConnectionRef.current]
    );

    const handleIceCandidate = useCallback(
        async ({ candidate }) => {
            if (!partnerIdRef.current || !peerConnectionRef.current) return;

            if (candidate) {
                await peerConnectionRef.current.addIceCandidate(candidate);
            }
        },
        [partnerIdRef.current, peerConnectionRef.current]
    );

    const handleChat = useCallback(({ text }) => {
        if (text) {
            setChats((prev) => [
                ...prev,
                {
                    isLocal: false,
                    text,
                },
            ]);
        }
    }, []);

    const handleOnlinePeerCount = useCallback(({ count }) => {
        if (count) setOnlinePeerCount(count);
    }, []);

    const handlePartnerDisconnected = useCallback(() => {
        getPartner();
    }, [getPartner]);

    // peer connection event handlers
    const pcEventIceCandidate = useCallback(
        async (event) => {
            if (partnerIdRef.current && event.candidate) {
                await emitSocketEvent("iceCandidate", {
                    candidate: event.candidate,
                    targetId: partnerIdRef.current,
                });
            }
        },
        [partnerIdRef.current, emitSocketEvent]
    );

    const pcEventTrack = useCallback(async (event) => {
        const [remoteStream] = event.streams;
        setRemoteMedia(remoteStream);
    }, []);

    const pcEventConnectionStateChange = useCallback(async () => {
        const connectionState = peerConnectionRef.current.connectionState;

        if (connectionState === "connected") {
            emitSocketEvent("connected", { partnerId: partnerIdRef.current });

            setIsLoading(false);
        } else if (connectionState === "disconnected") {
            emitSocketEvent("disconnected");

            getPartner();
        }
    }, [
        peerConnectionRef.current,
        partnerIdRef.current,
        emitSocketEvent,
        getPartner,
    ]);

    // socket event listeners
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("partnerFound", handlePartnerFound);
        socketRef.current.on("getOffer", handleGetOffer);
        socketRef.current.on("offer", handleOffer);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("iceCandidate", handleIceCandidate);
        socketRef.current.on("chat", handleChat);
        socketRef.current.on("onlinePeerCount", handleOnlinePeerCount);
        socketRef.current.on("partnerDisconnected", handlePartnerDisconnected);

        return () => {
            if (!socketRef.current) return;

            socketRef.current.off("partnerFound", handlePartnerFound);
            socketRef.current.off("getOffer", handleGetOffer);
            socketRef.current.off("offer", handleOffer);
            socketRef.current.off("answer", handleAnswer);
            socketRef.current.off("iceCandidate", handleIceCandidate);
            socketRef.current.off("chat", handleChat);
            socketRef.current.off("onlinePeerCount", handleOnlinePeerCount);
            socketRef.current.off(
                "partnerDisconnected",
                handlePartnerDisconnected
            );
        };
    }, [
        socketRef.current,
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

    const contextValue = useMemo(
        () => ({
            socketRef,
            getPartner,
            leave,
            localMedia,
            remoteMedia,
            isLoading,
            chats,
            sendChat,
            partnerIdRef,
            onlinePeerCount,
        }),
        [
            socketRef,
            getPartner,
            leave,
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

export const usePeerConnection = () => useContext(PeerConnectionContext);
