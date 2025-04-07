
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { User, MessageCircle, LineChart, Calendar, Utensils, Dumbbell } from "lucide-react";

const Dashboard = () => {
  const { firstName } = useContext(UserContext);

  // This data would come from Supabase once integrated
  const mockData = {
    hasActiveMealPlan: false,
    hasActiveTrainingPlan: false,
    lastChatTime: null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <section className="bg-gradient-wellura text-white rounded-xl p-8 border border-wellura-300/30">
            <h1 className="text-3xl font-bold mb-4">
              Welcome back, <span className="text-white">{firstName || "Friend"}!</span>
            </h1>
            <p className="text-white/90 mb-6 max-w-2xl">
              Your wellness journey is our priority. Track your progress, chat with your AI consultant, 
              and manage your personalized plans all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                <Link to="/chat">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Talk to Your AI Consultant
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-white/30 bg-white/10 hover:bg-white/20 text-white">
                <Link to="/plan-generator">
                  <LineChart className="mr-2 h-4 w-4" />
                  Generate Your Plans
                </Link>
              </Button>
            </div>
          </section>
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Utensils className="mr-2 h-5 w-5 text-wellura-400" />
                    Meal Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockData.hasActiveMealPlan ? (
                    <p>View your current meal plan and recipes</p>
                  ) : (
                    <p className="text-muted-foreground">No active meal plan yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/plan-generator">
                      {mockData.hasActiveMealPlan ? "View Plan" : "Create Plan"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Dumbbell className="mr-2 h-5 w-5 text-wellura-400" />
                    Training Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockData.hasActiveTrainingPlan ? (
                    <p>Access your workout schedule and exercises</p>
                  ) : (
                    <p className="text-muted-foreground">No active training plan yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/plan-generator">
                      {mockData.hasActiveTrainingPlan ? "View Plan" : "Create Plan"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-wellura-400" />
                    AI Consultant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get personalized advice and support</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/chat">Start Conversation</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
          
          {/* Progress Section - This would be populated with real data once Supabase is integrated */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Your Wellness Journey</h2>
            <div className="bg-card rounded-xl border p-6">
              <p className="text-center text-muted-foreground mb-4">
                Start generating your personalized plans to track your progress here
              </p>
              <div className="flex justify-center">
                <Button asChild>
                  <Link to="/plan-generator">Create Your First Plan</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
