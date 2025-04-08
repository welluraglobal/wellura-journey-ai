
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isLoggedIn } = useContext(UserContext);
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Only redirect to dashboard if already logged in - using useEffect to avoid render-time navigation
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center border-b bg-gradient-wellura text-white">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Wellura App</h1>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild className="border-white/30 bg-white/10 hover:bg-white/20 text-white">
                <Link to="/auth?mode=login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1">
        <section className="py-20 px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Your personalized <span className="gradient-text">wellness journey</span> starts here
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Wellura App offers AI-powered personal coaching, customized meal and training plans, 
                all designed to help you achieve your unique health goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-md font-medium" asChild>
                  <Link to="/auth?mode=signup">Start Your Journey</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-md font-medium" asChild>
                  <Link to="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
              <div className="absolute inset-0 bg-gradient-wellura opacity-90"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Personalized AI Coaching</h3>
                <p className="mb-6">Get tailored advice and support from your AI wellness consultant</p>
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                  <p className="italic">"How can I help you achieve your wellness goals today?"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-16 px-8 bg-secondary">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How Wellura App Works for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="wellura-card">
                <div className="h-12 w-12 bg-gradient-wellura rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Complete Your Profile</h3>
                <p className="text-muted-foreground">Share your health goals, preferences, and current measurements to personalize your experience.</p>
              </div>
              
              <div className="wellura-card">
                <div className="h-12 w-12 bg-gradient-wellura rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Custom Plans</h3>
                <p className="text-muted-foreground">Receive AI-generated meal and training plans tailored to your specific goals and preferences.</p>
              </div>
              
              <div className="wellura-card">
                <div className="h-12 w-12 bg-gradient-wellura rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Chat with Your AI Coach</h3>
                <p className="text-muted-foreground">Get real-time guidance, motivation, and answers to all your wellness questions.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 border-t bg-gradient-wellura text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Wellura App. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-white/80 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
