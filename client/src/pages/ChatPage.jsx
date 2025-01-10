import React, { lazy } from "react";
import Chat from "../components/Chat";
import Stream from "../components/Stream";
import { PeerConnectionProvider } from "../context/PeerConnectionProvider";

function ChatPage() {
    return (
        <PeerConnectionProvider>
            <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row justify-between gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-950">
                <Stream />
                <Chat />
            </div>
        </PeerConnectionProvider>
    );
}

export default ChatPage;
