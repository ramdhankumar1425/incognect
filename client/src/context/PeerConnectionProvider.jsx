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

            return stream;
        } catch (error) {
            console.error("Error in getting local media:", error);
        }
    }, []);

    const connect = useCallback(async () => {
        setIsLoading(true);

        if (peerConnectionRef.current) peerConnectionRef.current.close();

        peerConnectionRef.current = null;
        partnerIdRef.current = null;
        setRemoteMedia(null);
        setChats([]);

        if (!socketRef.current) {
            initSocket();
        }

        // create RTCPeerConnection
        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // attach local media to peer connection
        const stream = await getLocalMedia();

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // create offer
        const offer = await pc.createOffer();

        // set local description
        await pc.setLocalDescription(offer);

        await emitSocketEvent("offer", { offer });

        await emitSocketEvent("createConnection");
    }, [
        socketRef.current,
        emitSocketEvent,
        getLocalMedia,
        initSocket,
        peerConnectionRef.current,
    ]);

    const leave = useCallback(() => {
        if (socketRef.current) socketRef.current.disconnect();
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (localMedia) localMedia.getTracks().forEach((track) => track.stop());

        socketRef.current = null;
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

    // socket event handler
    const handleOffer = useCallback(
        async ({ offer, peerId }) => {
            if (!peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            await emitSocketEvent("answer", { answer, targetId: peerId });

            partnerIdRef.current = peerId;

            await emitSocketEvent("getIceCandidates", { peerId });
        },
        [emitSocketEvent, peerConnectionRef.current]
    );

    const handleAnswer = useCallback(
        async ({ answer, peerId }) => {
            if (!peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );

            partnerIdRef.current = peerId;

            await emitSocketEvent("getIceCandidates", { peerId });
        },
        [emitSocketEvent, peerConnectionRef.current]
    );

    const handleIceCandidate = useCallback(
        async ({ candidate }) => {
            if (!peerConnectionRef.current) return;

            if (candidate) {
                await peerConnectionRef.current.addIceCandidate(candidate);
            }
        },
        [peerConnectionRef.current]
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

    // peer connection event handlers
    const pcEventIceCandidate = useCallback(
        async (event) => {
            if (event.candidate) {
                await emitSocketEvent("iceCandidate", {
                    candidate: event.candidate,
                });
            }
        },
        [emitSocketEvent]
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

            connect();
        }
    }, [
        emitSocketEvent,
        connect,
        partnerIdRef.current,
        peerConnectionRef.current,
    ]);

    // peer connection event listener
    useEffect(() => {
        if (!peerConnectionRef.current) return;

        peerConnectionRef.current.addEventListener(
            "icecandidate",
            pcEventIceCandidate
        );
        peerConnectionRef.current.addEventListener("track", pcEventTrack);
        peerConnectionRef.current.addEventListener(
            "connectionstatechange",
            pcEventConnectionStateChange
        );

        return () => {
            if (!peerConnectionRef.current) return;

            peerConnectionRef.current.removeEventListener(
                "icecandidate",
                pcEventIceCandidate
            );
            peerConnectionRef.current.removeEventListener(
                "track",
                pcEventTrack
            );
            peerConnectionRef.current.removeEventListener(
                "connectionstatechange",
                pcEventConnectionStateChange
            );
        };
    }, [
        peerConnectionRef.current,
        pcEventIceCandidate,
        pcEventTrack,
        pcEventConnectionStateChange,
    ]);

    // socket event listeners
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("offer", handleOffer);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("iceCandidate", handleIceCandidate);
        socketRef.current.on("chat", handleChat);
        socketRef.current.on("onlinePeerCount", handleOnlinePeerCount);

        return () => {
            if (!socketRef.current) return;

            socketRef.current.off("offer", handleOffer);
            socketRef.current.off("answer", handleAnswer);
            socketRef.current.off("iceCandidate", handleIceCandidate);
            socketRef.current.off("chat", handleChat);
            socketRef.current.off("onlinePeerCount", handleOnlinePeerCount);
        };
    }, [
        socketRef.current,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        handleChat,
        handleOnlinePeerCount,
    ]);

    const contextValue = useMemo(
        () => ({
            connect,
            leave,
            localMedia,
            remoteMedia,
            isLoading,
            chats,
            sendChat,
            partnerIdRef,
            onlinePeerCount,
            socketRef,
        }),
        [
            connect,
            leave,
            localMedia,
            remoteMedia,
            isLoading,
            chats,
            sendChat,
            partnerIdRef,
            onlinePeerCount,
            socketRef,
        ]
    );

    return (
        <PeerConnectionContext.Provider value={contextValue}>
            {children}
        </PeerConnectionContext.Provider>
    );
};

export const usePeerConnection = () => useContext(PeerConnectionContext);
