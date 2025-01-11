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

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null); // to store the socket connection

    // to initialize the socket connection
    const initSocket = useCallback(() => {
        if (socket) return;

        const socketInstance = io(import.meta.env.VITE_SERVER_URI);

        setSocket(socketInstance);

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            toast.error("Error in connecting to server. Please try again.");
        });

        socketInstance.on("disconnect", (reason) => {
            console.warn("Socket disconnected:", reason);
            if (reason === "io server disconnect") {
                // Disconnected by server, attempt to reconnect
                toast.info("Connection to server lost. Reconnecting...");
                socketInstance.connect();
            }
        });
    }, []);

    // to emit socket events
    const emitSocketEvent = useCallback(
        async (event, data = {}) => {
            return new Promise((resolve, reject) => {
                socket.emit(event, data, (response) => {
                    if (response.success) resolve(response);
                    else reject(new Error(response.error || "Unknown error"));
                });
            });
        },
        [socket]
    );

    // to initialize the socket connection on component mount
    useEffect(() => {
        if (!socket) initSocket();
    }, [initSocket]);

    // cleanup
    useEffect(() => {
        return () => {
            console.log("SocketProvider cleanup");
            setSocket(null);
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            socket,
            initSocket,
            emitSocketEvent,
        }),
        [socket, initSocket, emitSocketEvent]
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
