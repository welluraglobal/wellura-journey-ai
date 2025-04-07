
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import PlanGenerator from "./pages/PlanGenerator";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { useState, useEffect, createContext } from "react";

// Create a context to store and share user authentication state
export const UserContext = createContext({
  isLoggedIn: false,
  hasProfile: false,
  firstName: "",
  setIsLoggedIn: (value: boolean) => {},
  setHasProfile: (value: boolean) => {},
  setFirstName: (value: string) => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  
  // Check authentication status on app load (could be expanded with Supabase auth)
  useEffect(() => {
    // When Supabase is integrated, we'll check auth status here
    const checkAuthStatus = async () => {
      // Placeholder for actual Supabase auth check
      const isAuthenticated = localStorage.getItem("wellura-authenticated") === "true";
      setIsLoggedIn(isAuthenticated);
      
      // Check if user has completed profile setup
      const hasCompletedProfile = localStorage.getItem("wellura-has-profile") === "true";
      setHasProfile(hasCompletedProfile);
      
      // Get user's first name if available
      const storedFirstName = localStorage.getItem("wellura-first-name") || "";
      setFirstName(storedFirstName);
    };
    
    checkAuthStatus();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider 
        value={{ 
          isLoggedIn, 
          hasProfile, 
          firstName,
          setIsLoggedIn, 
          setHasProfile,
          setFirstName
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/profile-setup"
                element={
                  isLoggedIn ? (
                    <ProfileSetup />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    hasProfile ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/profile-setup" replace />
                    )
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/plan-generator"
                element={
                  isLoggedIn && hasProfile ? (
                    <PlanGenerator />
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/chat"
                element={
                  isLoggedIn && hasProfile ? (
                    <Chat />
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
