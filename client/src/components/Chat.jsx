import React, { useEffect, useRef, useState } from "react";
import { VenetianMask } from "lucide-react";
import { usePeerConnection } from "../context/PeerConnectionProvider";

function Chat() {
    const { chats, sendChat, partnerIdRef } = usePeerConnection();
    const [text, setText] = useState("");
    const lastChatRef = useRef(null);

    const handleSendChat = () => {
        if (!text) return;

        sendChat(text);

        setText("");
    };

    // To scroll to the last chat
    useEffect(() => {
        if (lastChatRef.current) {
            lastChatRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [chats]);

    return (
        <div className="h-full w-full md:w-80 lg:w-96 md:shrink-0 bg-gray-900 text-white flex flex-col rounded-lg overflow-hidden shadow-lg border border-gray-700">
            {/* Chat Scroll Area */}
            <div className="w-full grow p-2 overflow-x-hidden overflow-y-auto">
                <div className="flex flex-col gap-3">
                    {chats?.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-2">
                            No messages yet. Say hi to start the conversation!
                        </div>
                    ) : (
                        chats?.map((chat, index) => (
                            <div
                                key={index}
                                className={`p-3 max-w-[75%] rounded-lg ${
                                    chat.isLocal
                                        ? "bg-blue-600 self-end text-right"
                                        : "bg-gray-700 self-start flex items-start gap-2"
                                }`}
                            >
                                {!chat.isLocal && (
                                    <VenetianMask className="w-6 h-6 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="text-sm break-words">
                                    {chat.text}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={lastChatRef}></div>
                </div>
            </div>

            {/* Input Section */}
            <div className="m-1 sm:m-2.5 mt-0 flex">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={handleSendChat}
                    disabled={!partnerIdRef.current}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
