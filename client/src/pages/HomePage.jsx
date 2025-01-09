import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-gray-900 text-gray-200">
            {/* Header Section */}
            <header className="w-full py-5 bg-gray-800 shadow-md">
                <div className="container mx-auto px-1.5 sm:px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Incognect</h1>
                    <nav>
                        <Link
                            to="/chat"
                            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 duration-100"
                        >
                            Start Chatting
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4 my-16">
                <h1 className="text-4xl font-bold leading-tight">
                    Connect with Strangers, Instantly
                </h1>
                <p className="text-lg max-w-2xl">
                    Meet people from around the world in one click. Chat, share,
                    and explore anonymously with random strangers.
                </p>
                <Link to="/chat">
                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Start Chatting Now
                    </button>
                </Link>
            </section>

            {/* Features Section */}
            <section className="w-full px-4 sm:px-10 md:px-20 py-16 bg-gray-800">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-semibold text-center mb-8">
                        Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-5 bg-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold mb-3">
                                Anonymous Chat
                            </h3>
                            <p>
                                Stay anonymous while connecting with random
                                strangers for meaningful or fun conversations.
                            </p>
                        </div>
                        <div className="p-5 bg-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold mb-3">
                                Real-Time Communication
                            </h3>
                            <p>
                                Enjoy seamless real-time text or video chat
                                powered by cutting-edge technology.
                            </p>
                        </div>
                        <div className="p-5 bg-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold mb-3">
                                Global Reach
                            </h3>
                            <p>
                                Meet people from different countries and
                                cultures without any barriers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-5 bg-gray-800 text-center border-t border-gray-700">
                <p>
                    &copy; {new Date().getFullYear()} Incognect. All Rights
                    Reserved.
                </p>
            </footer>
        </div>
    );
}

export default HomePage;
