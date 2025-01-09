import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PeerConnectionProvider } from "./context/PeerConnectionProvider";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route index element={<HomePage />} />
                        <Route
                            path="chat"
                            element={
                                <PeerConnectionProvider>
                                    <ChatPage />
                                </PeerConnectionProvider>
                            }
                        />

                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
