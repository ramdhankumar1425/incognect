import Chat from "../components/Chat";
import Stream from "../components/Stream";
import React from "react";

function ChatPage() {
    return (
        <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row justify-between gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-950">
            <Stream />
            <Chat />
        </div>
    );
}

export default ChatPage;
