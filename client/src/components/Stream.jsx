import React from "react";
import Toolbar from "./Toolbar";
import { usePeerConnection } from "../context/PeerConnectionProvider";
import { OrbitProgress } from "react-loading-indicators";

function Stream() {
    const { localMedia, remoteMedia, isLoading, onlinePeerCount } =
        usePeerConnection();

    return (
        <div className="relative h-full grow rounded-lg overflow-hidden bg-black border border-gray-700">
            {/* Remote Stream */}
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <OrbitProgress
                        color="#d1d5db"
                        size="small"
                        text=""
                        textColor=""
                    />
                </div>
            ) : (
                <div
                    className="w-full h-full inset-0 bg-black"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {remoteMedia && (
                        <video
                            id="remoteVideo"
                            autoPlay
                            playsInline
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                            ref={(video) => {
                                if (video && video.srcObject !== remoteMedia) {
                                    video.srcObject = remoteMedia;
                                }
                            }}
                        />
                    )}
                </div>
            )}

            {/* Local Stream */}
            {localMedia && (
                <div className="absolute top-3 left-3 w-[100px] sm:w-[150px] md:w-[200px] lg:w-[250px] aspect-video bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    <video
                        id="localVideo"
                        muted
                        autoPlay
                        playsInline
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                        ref={(video) => {
                            if (video && video.srcObject !== localMedia) {
                                video.srcObject = localMedia;
                            }
                        }}
                    />
                </div>
            )}

            {/* Toolbar */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Toolbar />
            </div>

            {/* Online peer count */}
            {onlinePeerCount && (
                <div className="absolute bottom-1 left-2 text-xs text-gray-500">
                    Online: <span>{onlinePeerCount}</span>
                </div>
            )}
        </div>
    );
}

export default Stream;
