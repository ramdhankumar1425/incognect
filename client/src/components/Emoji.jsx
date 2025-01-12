import React from "react";
import { usePeerConnection } from "../context/PeerConnectionProvider";

function Emoji() {
    const { emoji } = usePeerConnection();

    return (
        emoji && (
            <div className="p-2.5 lg:p-5 text-3xl lg:text-5xl">{emoji}</div>
        )
    );
}

export default Emoji;
