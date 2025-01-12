import React, { useState } from "react";
import { usePeerConnection } from "../context/PeerConnectionProvider";

function Toolbar() {
    const { leavePartner, getPartner, partnerIdRef } = usePeerConnection();
    const [emojiActive, setEmojiActive] = useState(false);

    return (
        <div className="relative flex items-center bg-gray-900 rounded-t-lg shadow-md border border-gray-700 p-1.5 md:p-2">
            {/* Leave Button */}
            <button
                onClick={() => leavePartner()}
                className="flex items-center gap-2 px-2.5 py-1 md:px-4 md:py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700 outline-none transition-all"
                title="Leave (Left Arrow)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 19V5" />
                    <path d="m13 6-6 6 6 6" />
                    <path d="M7 12h14" />
                </svg>
                <span className="hidden md:flex">Leave</span>
            </button>

            {/* Next Button */}
            <button
                onClick={() => getPartner()}
                className="flex items-center gap-2 px-2.5 py-1 md:px-4 md:py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700 outline-none transition-all ml-2"
                title="Next (Right Arrow)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
                <span className="hidden md:flex">Next</span>
            </button>

            {/* Emoji Button */}
            {partnerIdRef.current && (
                <button
                    onClick={() => setEmojiActive(!emojiActive)}
                    className="flex items-center gap-2 px-2.5 py-1 md:px-4 md:py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all ml-2"
                    title="Emoji Reaction"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <span className="hidden md:flex">Emoji</span>
                </button>
            )}

            {/* Emoji Picker */}
            {emojiActive && <EmojiPicker />}
        </div>
    );
}

export default Toolbar;

function EmojiPicker() {
    const { sendEmoji } = usePeerConnection();
    const emojis = ["😂", "❤️", "👍", "😡", "😢"];

    return (
        <div className="absolute bottom-[120%] left-1/2 -translate-x-1/2 right-0 w-fit flex items-center gap-1 sm:gap-2 bg-gray-800 px-2.5 py-1 sm:px-4 sm:py-2 rounded-3xl">
            {emojis.map((emoji, index) => (
                <button
                    key={index}
                    onClick={() => sendEmoji(emoji)}
                    className="text-xl sm:text-3xl hover:scale-125 duration-200 transform outline-none"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}
