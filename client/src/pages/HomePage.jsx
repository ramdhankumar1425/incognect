import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div className="w-full min-h-screen flex flex-col bg-gray-950 text-gray-300">
            {/* Header Section */}
            <header className="w-full py-4 bg-gray-900 shadow-md border-b border-gray-800">
                <div className="mx-auto px-4 sm:px-10 md:px-20 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-white">
                        Incognect
                    </Link>
                    <nav className="flex items-center space-x-6">
                        <Link
                            to="https://github.com/ramdhankumar1425/incognect"
                            className="hidden sm:block hover:underline hover:underline-offset-4"
                        >
                            Github
                        </Link>
                        <Link to="/chat">
                            <button className="px-4 py-1.5 border border-gray-700 text-gray-300 hover:text-gray-100 bg-transparent rounded-lg shadow-sm hover:bg-gray-800 hover:shadow-md transition-all duration-200 ease-in-out outline-none">
                                Start Chat
                            </button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-4 my-16 sm:my-20 md:my-28">
                <h1 className="text-4xl font-bold leading-tight text-white mb-6">
                    Connect with Strangers, Instantly
                </h1>
                <p className="text-lg max-w-2xl text-gray-400 mb-8">
                    Meet people from around the world in one click. Chat, share,
                    and explore anonymously with random strangers.
                </p>
                <Link to="/chat">
                    <button className="px-6 py-2.5 border border-gray-800 text-gray-300 hover:text-gray-100 bg-transparent rounded-lg shadow-sm hover:bg-gray-900 hover:shadow-md transition-all duration-200 ease-in-out outline-none">
                        Start Chatting Now
                    </button>
                </Link>
            </section>

            {/* Features Section */}
            <section className="w-full px-4 sm:px-10 md:px-20 py-16 bg-gray-900 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-semibold text-center text-white mb-10">
                        Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-white mb-3">
                                Anonymous Chat
                            </h3>
                            <p className="text-gray-400">
                                Stay anonymous while connecting with random
                                strangers for meaningful or fun conversations.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-white mb-3">
                                Real-Time Communication
                            </h3>
                            <p className="text-gray-400">
                                Enjoy seamless real-time text or video chat
                                powered by cutting-edge technology.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg text-center">
                            <h3 className="text-xl font-bold text-white mb-3">
                                Global Reach
                            </h3>
                            <p className="text-gray-400">
                                Meet people from different countries and
                                cultures without any barriers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-5 bg-gray-900 text-center border-t border-gray-800">
                <p className="text-gray-500">
                    &copy; {new Date().getFullYear()} Incognect. All Rights
                    Reserved.
                </p>
                <p className="mt-2">
                    <Link
                        to="https://github.com/ramdhankumar1425/incognect"
                        target="_blank"
                        className="text-blue-500 hover:text-blue-400 transition duration-150"
                    >
                        View on GitHub
                    </Link>
                </p>
            </footer>
        </div>
    );
}

export default HomePage;
