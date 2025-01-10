import React from "react";
import { OrbitProgress } from "react-loading-indicators";

function FallbackLoading() {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900">
            <OrbitProgress color="#d1d5db" size="medium" text="" textColor="" />
        </div>
    );
}

export default FallbackLoading;
