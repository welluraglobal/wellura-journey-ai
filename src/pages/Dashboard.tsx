
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { 
  BookText, 
  Utensils, 
  Dumbbell, 
  MapPin, 
  MessageCircle, 
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { firstName } = useContext(UserContext);

  // Feature cards data with the requested functionality
  const featureCards = [
    {
      title: "Start Wellness Quiz",
      description: "Answer questions about your lifestyle and receive personalized recommendations.",
      icon: BookText,
      link: "/quiz"
    },
    {
      title: "Access Meal Plans",
      description: "Access personalized meal plans based on your preferences and goals.",
      icon: Utensils,
      link: "/meals"
    },
    {
      title: "Start Training Plan",
      description: "Get a customized exercise plan based on your objectives and preferences.",
      icon: Dumbbell,
      link: "/training"
    },
    {
      title: "Nearby Gyms",
      description: "Find the highest-rated gyms in your area with detailed information.",
      icon: MapPin,
      link: "/nearby-gyms"
    },
    {
      title: "Talk to AI Consultant",
      description: "Chat with our intelligent assistant to answer health questions.",
      icon: MessageCircle,
      link: "/chat"
    },
    {
      title: "Find Health Professionals",
      description: "Discover qualified health professionals in your area based on your needs.",
      icon: Users,
      link: "/find-professionals"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Wellura App
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground">
              Your personalized journey to a healthier life starts here.
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-6">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((card, index) => (
                <Card key={index} className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-center w-12 h-12 mb-4 bg-primary/10 text-primary rounded-full">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{card.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={card.link}>Access</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button asChild size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
                <Link to="/quiz">
                  <BookText className="h-6 w-6 mb-1" />
                  <span>Wellness Quiz</span>
                </Link>
              </Button>
              
              <Button asChild size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
                <Link to="/chat">
                  <MessageCircle className="h-6 w-6 mb-1" />
                  <span>AI Consultant</span>
                </Link>
              </Button>
              
              <Button asChild size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
                <Link to="/nearby-gyms">
                  <MapPin className="h-6 w-6 mb-1" />
                  <span>Nearby Gyms</span>
                </Link>
              </Button>
              
              <Button asChild size="lg" className="h-24 flex flex-col items-center justify-center gap-2">
                <Link to="/find-professionals">
                  <Users className="h-6 w-6 mb-1" />
                  <span>Health Professionals</span>
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
