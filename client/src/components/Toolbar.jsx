import React from "react";
import { useNavigate } from "react-router-dom";
import { usePeerConnection } from "../context/PeerConnectionProvider";

function Toolbar() {
    const { connect, leave } = usePeerConnection();
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-900 rounded-t-lg shadow-lg border border-b-0 border-gray-800">
            {/* Leave Button */}
            <button
                onClick={() => {
                    leave();
                    navigate("/");
                }}
                className="flex items-center px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-all duration-200 ease-in-out"
            >
                <span className="font-semibold">Leave</span>
            </button>

            {/* Next Button */}
            <button
                onClick={() => connect()}
                className="flex items-center px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-all duration-200 ease-in-out"
            >
                <span className="font-semibold">Next</span>
            </button>
        </div>
    );
}

export default Toolbar;
