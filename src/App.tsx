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
import Quiz from "./pages/Quiz";
import NearbyGyms from "./pages/NearbyGyms";
import FindProfessionals from "./pages/FindProfessionals";
import NotFound from "./pages/NotFound";
import ConfirmationScreens from "./components/ConfirmationScreens";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import { useState, useEffect, createContext } from "react";
import { supabase } from "./integrations/supabase/client";

export const UserContext = createContext({
  isLoggedIn: false,
  hasProfile: false,
  firstName: "",
  userId: "",
  userProfile: null as any,
  setIsLoggedIn: (value: boolean) => {},
  setHasProfile: (value: boolean) => {},
  setFirstName: (value: string) => {},
  setUserId: (value: string) => {},
  setUserProfile: (value: any) => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session;
        
        if (isAuthenticated && session?.user?.id) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUserProfile(profile);
            
            if (profile.first_name) {
              setFirstName(profile.first_name);
              setHasProfile(true);
              localStorage.setItem("wellura-has-profile", "true");
              localStorage.setItem("wellura-first-name", profile.first_name);
            }
          }
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            const isAuthenticated = !!session;
            setIsLoggedIn(isAuthenticated);
            
            if (isAuthenticated && session?.user?.id) {
              setUserId(session.user.id);
              
              setTimeout(async () => {
                try {
                  const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                    
                  if (profile) {
                    setUserProfile(profile);
                    
                    if (profile.first_name) {
                      setFirstName(profile.first_name);
                      setHasProfile(true);
                      localStorage.setItem("wellura-has-profile", "true");
                      localStorage.setItem("wellura-first-name", profile.first_name);
                    }
                  }
                } catch (profileError) {
                  console.error("Error fetching profile:", profileError);
                }
              }, 0);
            }
            
            if (!isAuthenticated) {
              setHasProfile(false);
              setFirstName("");
              setUserId("");
              setUserProfile(null);
              localStorage.removeItem("wellura-authenticated");
              localStorage.removeItem("wellura-has-profile");
              localStorage.removeItem("wellura-first-name");
            }
          }
        );
        
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
          userId,
          userProfile,
          setIsLoggedIn, 
          setHasProfile,
          setFirstName,
          setUserId,
          setUserProfile
        }}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
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
                path="/confirmations"
                element={
                  isLoggedIn ? (
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <ConfirmationScreens />
                    )
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
                      userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                        <Dashboard />
                      ) : (
                        <Navigate to="/confirmations" replace />
                      )
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
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <PlanGenerator />
                    ) : (
                      <Navigate to="/confirmations" replace />
                    )
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/quiz"
                element={
                  isLoggedIn && hasProfile ? (
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <Quiz />
                    ) : (
                      <Navigate to="/confirmations" replace />
                    )
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/chat"
                element={
                  isLoggedIn && hasProfile ? (
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <Chat />
                    ) : (
                      <Navigate to="/confirmations" replace />
                    )
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/nearby-gyms"
                element={
                  isLoggedIn && hasProfile ? (
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <NearbyGyms />
                    ) : (
                      <Navigate to="/confirmations" replace />
                    )
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/find-professionals"
                element={
                  isLoggedIn && hasProfile ? (
                    userProfile?.privacy_accepted && userProfile?.health_disclaimer_accepted ? (
                      <FindProfessionals />
                    ) : (
                      <Navigate to="/confirmations" replace />
                    )
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/meals"
                element={
                  isLoggedIn && hasProfile ? (
                    <Navigate to="/plan-generator" replace />
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/training"
                element={
                  isLoggedIn && hasProfile ? (
                    <Navigate to="/plan-generator" replace />
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/report"
                element={
                  isLoggedIn && hasProfile ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to={isLoggedIn ? "/profile-setup" : "/auth"} replace />
                  )
                }
              />
              <Route
                path="/support"
                element={
                  isLoggedIn && hasProfile ? (
                    <Navigate to="/chat" replace />
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
