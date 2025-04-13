
import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Calendar, ArrowRight, Clock, Trophy, Film, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import FitnessQuiz from "@/components/training/FitnessQuiz";

// Mock training plans data
const mockTrainingPlans = [
  {
    id: "1",
    name: "Beginner Full Body",
    description: "Perfect for those new to fitness, focusing on building basic strength and form",
    difficulty: "Beginner",
    duration: "4 weeks",
    workoutsPerWeek: 3,
    timePerWorkout: "30-45 minutes",
    workouts: [
      { id: "w1", name: "Day 1: Upper Body", exercises: ["Push-ups", "Dumbbell Rows", "Shoulder Press", "Bicep Curls", "Tricep Extensions"] },
      { id: "w2", name: "Day 2: Lower Body", exercises: ["Squats", "Lunges", "Glute Bridges", "Calf Raises", "Plank"] },
      { id: "w3", name: "Day 3: Full Body", exercises: ["Deadlifts", "Bench Press", "Pull-ups", "Leg Press", "Core Workout"] }
    ]
  },
  {
    id: "2",
    name: "Intermediate Strength",
    description: "Progress your strength training with more challenging movements and progressive overload",
    difficulty: "Intermediate",
    duration: "8 weeks",
    workoutsPerWeek: 4,
    timePerWorkout: "45-60 minutes",
    workouts: [
      { id: "w1", name: "Day 1: Chest & Triceps", exercises: ["Bench Press", "Incline Dumbbell Press", "Chest Flyes", "Tricep Dips", "Tricep Pushdowns"] },
      { id: "w2", name: "Day 2: Back & Biceps", exercises: ["Pull-ups", "Bent-over Rows", "Lat Pulldowns", "Bicep Curls", "Hammer Curls"] },
      { id: "w3", name: "Day 3: Legs & Core", exercises: ["Squats", "Deadlifts", "Leg Press", "Leg Curls", "Plank Circuit"] },
      { id: "w4", name: "Day 4: Shoulders & Arms", exercises: ["Shoulder Press", "Lateral Raises", "Front Raises", "Skull Crushers", "Concentration Curls"] }
    ]
  },
  {
    id: "3",
    name: "HIIT Cardio Burner",
    description: "High-intensity interval training to maximize calorie burn and cardiovascular fitness",
    difficulty: "All Levels",
    duration: "6 weeks",
    workoutsPerWeek: 3,
    timePerWorkout: "20-30 minutes",
    workouts: [
      { id: "w1", name: "Day 1: Lower Body HIIT", exercises: ["Jump Squats", "Burpees", "Mountain Climbers", "Jumping Lunges", "High Knees"] },
      { id: "w2", name: "Day 2: Upper Body HIIT", exercises: ["Push-up Jacks", "Plank Shoulder Taps", "Tricep Dips", "Mountain Climbers", "Jumping Jacks"] },
      { id: "w3", name: "Day 3: Total Body HIIT", exercises: ["Burpees", "Jumping Jacks", "Mountain Climbers", "Plank Jacks", "High Knees"] }
    ]
  }
];

const Training = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const togglePlanDetails = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleStartPlan = (planId: string, planName: string) => {
    console.log(`Starting plan: ${planId} - ${planName}`);
    toast({
      title: "Training Plan Started",
      description: `You've started the ${planName} training plan.`,
    });
    // Here you would typically save the selected plan to user's profile
    // and redirect to a more detailed view of the plan
    setActiveTab("progress");
  };

  const handleSchedulePlan = (planId: string, planName: string) => {
    console.log(`Scheduling plan: ${planId} - ${planName}`);
    toast({
      title: "Plan Scheduled",
      description: `${planName} has been added to your calendar.`,
    });
    // Here you would typically integrate with a calendar or scheduling system
  };

  const handleViewDetails = (planId: string) => {
    togglePlanDetails(planId);
  };

  const handleQuizComplete = (results: any) => {
    console.log("Quiz results:", results);
    
    // Simple logic to recommend a plan based on quiz results
    let recommendedPlanId = "1"; // Default to beginner plan
    
    if (results.fitnessLevel === "advanced" || results.fitnessLevel === "athletic") {
      recommendedPlanId = "2"; // Intermediate Strength
    }
    
    if (results.fitnessGoals.includes("increase-endurance") || 
        results.workoutDuration === "15-30min") {
      recommendedPlanId = "3"; // HIIT Cardio Burner
    }
    
    setRecommendedPlan(recommendedPlanId);
    setQuizCompleted(true);
    setShowQuiz(false);
    
    toast({
      title: "Quiz Completed",
      description: "We've found the perfect training plan for you!",
    });
  };

  const handleStartOver = () => {
    setShowQuiz(true);
    setQuizCompleted(false);
    setRecommendedPlan(null);
  };

  // Find the recommended plan object
  const recommendedPlanObj = recommendedPlan 
    ? mockTrainingPlans.find(plan => plan.id === recommendedPlan) 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Dumbbell className="mr-2 h-8 w-8 text-primary" />
              Training
            </h1>
            <p className="text-muted-foreground">
              Access personalized training plans to match your fitness level and goals
            </p>
          </div>
          
          <Separator className="my-6" />
          
          {showQuiz ? (
            <div className="max-w-3xl mx-auto">
              <FitnessQuiz 
                onComplete={handleQuizComplete} 
                onCancel={() => setShowQuiz(false)} 
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-8 grid grid-cols-3">
                <TabsTrigger value="plans" className="flex items-center justify-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Training Plans
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center justify-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  My Progress
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center justify-center">
                  <Film className="mr-2 h-4 w-4" />
                  Exercise Library
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans" className="space-y-6">
                {quizCompleted && recommendedPlanObj && (
                  <Card className="bg-primary/5 border-primary mb-8">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                        Recommended Plan Based on Your Quiz
                      </CardTitle>
                      <CardDescription>
                        Based on your fitness quiz results, we recommend the following plan:
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium text-xl mb-2">{recommendedPlanObj.name}</div>
                      <p className="text-muted-foreground mb-4">{recommendedPlanObj.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                          {recommendedPlanObj.difficulty}
                        </span>
                        <span className="bg-secondary rounded-full px-3 py-1 text-sm">
                          {recommendedPlanObj.duration}
                        </span>
                        <span className="bg-secondary rounded-full px-3 py-1 text-sm">
                          {recommendedPlanObj.workoutsPerWeek} workouts/week
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/10 pt-4">
                      <Button variant="outline" size="sm" onClick={handleStartOver}>
                        Retake Quiz
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSchedulePlan(recommendedPlanObj.id, recommendedPlanObj.name)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStartPlan(recommendedPlanObj.id, recommendedPlanObj.name)}
                        >
                          Start Plan
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">All Training Plans</h2>
                  {quizCompleted && (
                    <Button variant="outline" size="sm" onClick={handleStartOver}>
                      Retake Fitness Quiz
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {mockTrainingPlans.map((plan) => (
                    <Card key={plan.id} className={`overflow-hidden ${recommendedPlan === plan.id ? 'border-primary' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(plan.id)}
                          >
                            {expandedPlan === plan.id ? "Hide Details" : "View Details"}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Difficulty</div>
                            <div className="font-medium mt-1">{plan.difficulty}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="font-medium mt-1">{plan.duration}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Workouts/Week</div>
                            <div className="font-medium mt-1">{plan.workoutsPerWeek}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <div className="text-sm text-muted-foreground">Time/Workout</div>
                            <div className="font-medium mt-1">{plan.timePerWorkout}</div>
                          </div>
                        </div>
                        
                        {expandedPlan === plan.id && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            <h3 className="font-medium">Workout Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {plan.workouts.map((workout) => (
                                <div key={workout.id} className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-2">{workout.name}</h4>
                                  <ul className="space-y-1 text-sm">
                                    {workout.exercises.map((exercise, index) => (
                                      <li key={index} className="flex items-center">
                                        <Dumbbell className="h-3 w-3 mr-2 text-primary" />
                                        {exercise}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-end gap-2 bg-muted/10 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSchedulePlan(plan.id, plan.name)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleStartPlan(plan.id, plan.name)}
                        >
                          Start Plan
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Training Plan</h3>
                <p className="text-muted-foreground mb-4">Start a training plan to track your progress and achievements</p>
                <Button onClick={() => setActiveTab("plans")}>
                  Browse Training Plans
                </Button>
              </TabsContent>
              
              <TabsContent value="exercises" className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Film className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Exercise Library</h3>
                <p className="text-muted-foreground mb-4">Access our extensive library of exercise tutorials and instructions</p>
                <Button>
                  Coming Soon
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Training;
