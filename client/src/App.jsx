import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
const HomePage = lazy(() => import("./pages/HomePage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
import FallbackLoading from "./components/FallbackLoading";
import { Toaster } from "sonner";

function App() {
    return (
        <>
            <AppRoutes />
            <Toaster richColors />
        </>
    );
}

export default App;

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route
                    path="chat"
                    element={
                        <Suspense fallback={<FallbackLoading />}>
                            <ChatPage />
                        </Suspense>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Suspense fallback={<FallbackLoading />}>
                            <NotFoundPage />
                        </Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
