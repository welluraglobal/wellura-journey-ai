
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import ConfirmationEmail from "@/pages/ConfirmEmail";
import ResetPassword from "@/pages/ResetPassword";
import ConfirmationScreen from "@/pages/ConfirmationScreen";
import TermsAndPrivacy from "@/pages/TermsAndPrivacy";
import Quiz from "@/pages/Quiz";
import QuizResults from "@/pages/QuizResults";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/NotFound";
import Chat from "@/pages/Chat";
import NearbyGyms from "@/pages/NearbyGyms";
import FindProfessionals from "@/pages/FindProfessionals";
import PlanGenerator from "@/pages/PlanGenerator";
import StepTracker from "@/pages/StepTracker";
import MealPlans from "@/pages/MealPlans";
import Training from "@/pages/Training";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { useEffect } from "react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// App wrapper to provide all contexts
function AppWrapper() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}

// Main app content with authentication check
function AppContent() {
  const { authState } = useAuth();
  const { userProfile } = useUser();
  const isLoggedIn = authState.isAuthenticated;
  const hasAcceptedDisclaimer = userProfile?.health_disclaimer_accepted;

  useEffect(() => {
    console.log("App component rendered");
  }, []);
  
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* Use only one toast provider */}
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={!isLoggedIn ? <Auth /> : <Navigate to="/dashboard" replace />} />
            <Route path="/confirm-email" element={<ConfirmationEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />
            <Route path="/confirmation" element={
              isLoggedIn && !hasAcceptedDisclaimer 
                ? <ConfirmationScreen /> 
                : <Navigate to={isLoggedIn ? "/dashboard" : "/auth"} replace />
            } />
            <Route path="/profile-setup" element={isLoggedIn ? <ProfileSetup /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <Dashboard /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/quiz" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <Quiz /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/quiz-results" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <QuizResults /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/chat" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <Chat /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/nearby-gyms" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <NearbyGyms /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/find-professionals" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <FindProfessionals /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/plan-generator" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <PlanGenerator /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/step-tracker" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <StepTracker /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/meals" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <MealPlans /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="/training" element={
              isLoggedIn 
                ? (hasAcceptedDisclaimer ? <Training /> : <Navigate to="/confirmation" replace />)
                : <Navigate to="/auth" replace />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

// Export the wrapped app
export default AppWrapper;
