
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
import { supabase } from "./integrations/supabase/client";

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
  
  // Check authentication status on app load with Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            const isAuthenticated = !!session;
            setIsLoggedIn(isAuthenticated);
            
            // If user is authenticated, fetch profile information
            if (isAuthenticated && session?.user?.id) {
              setTimeout(async () => {
                try {
                  const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('first_name')
                    .eq('id', session.user.id)
                    .single();
                    
                  if (profile && profile.first_name) {
                    setFirstName(profile.first_name);
                    setHasProfile(true);
                    localStorage.setItem("wellura-has-profile", "true");
                    localStorage.setItem("wellura-first-name", profile.first_name);
                  }
                } catch (profileError) {
                  console.error("Error fetching profile:", profileError);
                }
              }, 0);
            }
            
            if (!isAuthenticated) {
              setHasProfile(false);
              setFirstName("");
              localStorage.removeItem("wellura-authenticated");
              localStorage.removeItem("wellura-has-profile");
              localStorage.removeItem("wellura-first-name");
            }
          }
        );
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session;
        setIsLoggedIn(isAuthenticated);
        
        // If user is authenticated, fetch profile information
        if (isAuthenticated && session?.user?.id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', session.user.id)
            .single();
            
          if (profile && profile.first_name) {
            setFirstName(profile.first_name);
            setHasProfile(true);
            localStorage.setItem("wellura-has-profile", "true");
            localStorage.setItem("wellura-first-name", profile.first_name);
          }
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth check error:", error);
      }
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
