import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import {
    SOCKET_CONNECTION_TIMEOUT,
    SOCKET_RECONNECTION_ATTEMPTS,
    SOCKET_RECONNECTION_DELAY,
    SOCKET_RECONNECTION_DELAY_MAX,
} from "../constants/constants";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null); // to store the socket connection

    // to initialize the socket connection
    const initSocket = useCallback(() => {
        if (socket) return;

        const socketInstance = io(import.meta.env.VITE_SERVER_URI, {
            timeout: SOCKET_CONNECTION_TIMEOUT,
            reconnection: true,
            reconnectionAttempts: SOCKET_RECONNECTION_ATTEMPTS,
            reconnectionDelay: SOCKET_RECONNECTION_DELAY,
            reconnectionDelayMax: SOCKET_RECONNECTION_DELAY_MAX,
        });

        setSocket(socketInstance);

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            toast.error("Error in connecting to server. Please try again.");
        });

        socketInstance.on("disconnect", (reason) => {
            // console.warn("Socket disconnected:", reason);
            if (reason === "io server disconnect") {
                // Disconnected by server, attempt to reconnect
                toast.info("Connection to server lost. Reconnecting...");
                setTimeout(() => socketInstance.connect(), 5000); // reconnect after 5 seconds
            }
        });
    }, [socket]);

    // to emit socket events
    const emitSocketEvent = useCallback(
        async (event, data = {}) => {
            if (!socket) {
                console.error("Socket connection not initialized");
                return;
            }
            return new Promise((resolve, reject) => {
                socket.emit(event, data, (response) => {
                    if (response.success) resolve(response);
                    else reject(new Error(response.error || "Unknown error"));
                });
            });
        },
        [socket]
    );

    // socket initialization and cleanup
    useEffect(() => {
        if (!socket) initSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [socket, initSocket]);

    const contextValue = useMemo(
        () => ({
            socket,
            emitSocketEvent,
        }),
        [socket, emitSocketEvent]
    );

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
};
