
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </QueryClientProvider>
      </UserProvider>
    </AuthProvider>
  );
}

// Protected route component
function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireTermsAccepted = false 
}: { 
  children: React.ReactNode,
  requireAuth?: boolean,
  requireTermsAccepted?: boolean
}) {
  const { authState } = useAuth();
  const { userProfile } = useUser();
  const location = useLocation();
  const isLoggedIn = authState.isAuthenticated;
  const hasAcceptedDisclaimer = userProfile?.health_disclaimer_accepted;

  // Skip navigation checks when already at certain pages
  const isAtConfirmationScreen = location.pathname === "/confirmation";
  const isAtAuthScreen = location.pathname === "/auth";

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAuth && requireTermsAccepted && !hasAcceptedDisclaimer) {
    if (!isAtConfirmationScreen) {
      return <Navigate to="/confirmation" replace />;
    }
  }

  if (!requireAuth && isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Main app content with more efficient authentication check
function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    console.log("App component rendered");
    setIsInitialized(true);
  }, []);
  
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      {/* Use only one toast provider */}
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route path="/auth" element={
          <ProtectedRoute requireAuth={false}>
            <Auth />
          </ProtectedRoute>
        } />
        
        <Route path="/confirm-email" element={<ConfirmationEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />
        
        <Route path="/confirmation" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={false}>
            <ConfirmationScreen />
          </ProtectedRoute>
        } />
        
        <Route path="/profile-setup" element={
          <ProtectedRoute requireAuth={true}>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/quiz" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <Quiz />
          </ProtectedRoute>
        } />
        
        <Route path="/quiz-results" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <QuizResults />
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <Chat />
          </ProtectedRoute>
        } />
        
        <Route path="/nearby-gyms" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <NearbyGyms />
          </ProtectedRoute>
        } />
        
        <Route path="/find-professionals" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <FindProfessionals />
          </ProtectedRoute>
        } />
        
        <Route path="/plan-generator" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <PlanGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/step-tracker" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <StepTracker />
          </ProtectedRoute>
        } />
        
        <Route path="/meals" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <MealPlans />
          </ProtectedRoute>
        } />
        
        <Route path="/training" element={
          <ProtectedRoute requireAuth={true} requireTermsAccepted={true}>
            <Training />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// Export the wrapped app
export default AppWrapper;
