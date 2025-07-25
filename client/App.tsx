import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LiveDataProvider } from "./contexts/LiveDataContext";
import { ChatProvider } from "./contexts/ChatContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import MiniGames from "./pages/MiniGames";
import AdminPanel from "./pages/AdminPanel";
import StaffPanel from "./pages/StaffPanel";
import GoldStore from "./pages/GoldStore";
import Slots from "./pages/Slots";
import TableGames from "./pages/TableGames";
import Sports from "./pages/Sports";
import Bingo from "./pages/Bingo";
import OAuthTest from "./pages/OAuthTest";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ErrorBoundary>
            <LiveDataProvider>
              <NotificationProvider>
                <ChatProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/login" element={<Auth />} />
                        <Route path="/register" element={<Auth />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/mini-games"
                          element={
                            <ProtectedRoute>
                              <MiniGames />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute
                              requireAuth={true}
                              requireAdmin={true}
                            >
                              <AdminPanel />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/staff"
                          element={
                            <ProtectedRoute
                              requireAuth={true}
                              requireStaff={true}
                            >
                              <StaffPanel />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/store"
                          element={
                            <ProtectedRoute>
                              <GoldStore />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/gold-store"
                          element={
                            <ProtectedRoute>
                              <GoldStore />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/slots"
                          element={
                            <ProtectedRoute>
                              <Slots />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/table-games"
                          element={
                            <ProtectedRoute>
                              <TableGames />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/sports"
                          element={
                            <ProtectedRoute>
                              <Sports />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/bingo"
                          element={
                            <ProtectedRoute>
                              <Bingo />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/oauth-test" element={<OAuthTest />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </ChatProvider>
              </NotificationProvider>
            </LiveDataProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Prevent multiple root creation during HMR
const container = document.getElementById("root")!;
const containerWithRoot = container as HTMLElement & { _reactRootContainer?: any };

if (!containerWithRoot._reactRootContainer) {
  const root = createRoot(container);
  containerWithRoot._reactRootContainer = root;
  root.render(<App />);
} else {
  containerWithRoot._reactRootContainer.render(<App />);
}
