import React from "react";
import { useNavigate } from "react-router-dom";
import { usePeerConnection } from "../context/PeerConnectionProvider";

function Toolbar() {
    const { leavePartner, getPartner } = usePeerConnection();
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between bg-gray-900 rounded-t-lg overflow-hidden shadow-lg border border-b-0 border-gray-800">
            {/* Leave Button */}
            <button
                onClick={() => leavePartner()}
                className="flex items-center px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 text-sm md:text-base text-gray-200 hover:bg-red-700 outline-none transition-all duration-200 ease-in-out"
            >
                <span className="font-semibold">Leave</span>
            </button>

            {/* Next Button */}
            <button
                onClick={() => getPartner()}
                className="flex items-center px-2.5 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 text-sm md:text-base text-gray-200 hover:bg-blue-700 outline-none transition-all duration-200 ease-in-out"
            >
                <span className="font-semibold">Next</span>
            </button>
        </div>
    );
}

export default Toolbar;
