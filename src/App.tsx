import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import ConfirmEmail from "@/pages/ConfirmEmail";
import ResetPassword from "@/pages/ResetPassword";
import Quiz from "@/pages/Quiz";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/NotFound";
import Chat from "@/pages/Chat";
import NearbyGyms from "@/pages/NearbyGyms";
import FindProfessionals from "@/pages/FindProfessionals";
import PlanGenerator from "@/pages/PlanGenerator";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Create a client
const queryClient = new QueryClient();

function App() {
  const { authState } = useAuth();
  const isLoggedIn = authState.isAuthenticated;

  useEffect(() => {
    console.log("App component rendered");
  }, []);
  
  return (
    <div>
      <QueryClientProvider
        client={queryClient}
        contextSharing={true}
      >
        <BrowserRouter>
          {/* Use only one toast provider */}
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={!isLoggedIn ? <Auth /> : <Navigate to="/dashboard" />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile-setup" element={isLoggedIn ? <ProfileSetup /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/quiz" element={isLoggedIn ? <Quiz /> : <Navigate to="/auth" />} />
            <Route path="/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/auth" />} />
            <Route path="/nearby-gyms" element={isLoggedIn ? <NearbyGyms /> : <Navigate to="/auth" />} />
            <Route path="/find-professionals" element={isLoggedIn ? <FindProfessionals /> : <Navigate to="/auth" />} />
            <Route path="/plan-generator" element={isLoggedIn ? <PlanGenerator /> : <Navigate to="/auth" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
