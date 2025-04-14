import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Calendar, ArrowRight, Clock, Trophy, Film, ClipboardCheck, CheckCircle2, Info, Camera, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import FitnessQuiz from "@/components/training/FitnessQuiz";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ExerciseInstructionDialog from "@/components/training/ExerciseInstructionDialog";
import WellyVisionDialog from "@/components/training/WellyVisionDialog";
import WelluraPlaylistButton from "@/components/training/WelluraPlaylistButton";

const exerciseImages = {
  "Push-ups": "https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=500&auto=format&fit=crop",
  "Dumbbell Rows": "https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=500&auto=format&fit=crop",
  "Shoulder Press": "https://images.unsplash.com/photo-1590771998996-8589ec9b5ac6?w=500&auto=format&fit=crop",
  "Bicep Curls": "https://images.unsplash.com/photo-1581009137042-c552e4856a0e?w=500&auto=format&fit=crop",
  "Tricep Extensions": "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=500&auto=format&fit=crop",
  "Squats": "https://images.unsplash.com/photo-1566241142559-40a9552895b3?w=500&auto=format&fit=crop",
  "Lunges": "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=500&auto=format&fit=crop",
  "Glute Bridges": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop",
  "Calf Raises": "https://images.unsplash.com/photo-1596357395217-80de13130e92?w=500&auto=format&fit=crop",
  "Plank": "https://images.unsplash.com/photo-1566241439806-35a019c81bc9?w=500&auto=format&fit=crop",
  "Deadlifts": "https://images.unsplash.com/photo-1598971639058-a09602454baf?w=500&auto=format&fit=crop",
  "Bench Press": "https://images.unsplash.com/photo-1534367990512-edbdca781b00?w=500&auto=format&fit=crop",
  "Pull-ups": "https://images.unsplash.com/photo-1598971636294-7f8c8ad975c9?w=500&auto=format&fit=crop",
  "Leg Press": "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=500&auto=format&fit=crop",
  "Core Workout": "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=500&auto=format&fit=crop",
  "Incline Dumbbell Press": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop",
  "Chest Flyes": "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=500&auto=format&fit=crop",
  "Tricep Dips": "https://images.unsplash.com/photo-1567013127542-490d757e6aa7?w=500&auto=format&fit=crop",
  "Tricep Pushdowns": "https://images.unsplash.com/photo-1598266663441-0c3b9df3d8e6?w=500&auto=format&fit=crop",
  "Bent-over Rows": "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=500&auto=format&fit=crop",
  "Lat Pulldowns": "https://images.unsplash.com/photo-1604247584233-99c3f6ddfc52?w=500&auto=format&fit=crop",
  "Hammer Curls": "https://images.unsplash.com/photo-1590771998969-a3a2a141a883?w=500&auto=format&fit=crop",
  "Leg Curls": "https://images.unsplash.com/photo-1597347316205-38ba281a2796?w=500&auto=format&fit=crop",
  "Plank Circuit": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop",
  "Lateral Raises": "https://images.unsplash.com/photo-1598971636307-43f02544d1e3?w=500&auto=format&fit=crop",
  "Front Raises": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop",
  "Skull Crushers": "https://images.unsplash.com/photo-1598266663473-c7d0a086e932?w=500&auto=format&fit=crop",
  "Concentration Curls": "https://images.unsplash.com/photo-1584863231364-2edc166de576?w=500&auto=format&fit=crop",
  "Jump Squats": "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&auto=format&fit=crop",
  "Burpees": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop",
  "Mountain Climbers": "https://images.unsplash.com/photo-1590239926044-42a30c03e4aa?w=500&auto=format&fit=crop",
  "Jumping Lunges": "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&auto=format&fit=crop",
  "High Knees": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&auto=format&fit=crop",
  "Push-up Jacks": "https://images.unsplash.com/photo-1598971639058-a09602454baf?w=500&auto=format&fit=crop",
  "Plank Shoulder Taps": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop",
  "Jumping Jacks": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop",
  "Plank Jacks": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop"
};

const exerciseDescriptions = {
  "Push-ups": "Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up.",
  "Dumbbell Rows": "With a dumbbell in one hand, bend at the waist with other hand on bench. Pull dumbbell up to side of torso, keeping elbow close to body.",
  "Shoulder Press": "Sit or stand with dumbbells at shoulder height. Press weights upward until arms are fully extended overhead.",
  "Bicep Curls": "Hold dumbbells at sides with palms facing forward. Curl weights up toward shoulders while keeping elbows close to torso.",
  "Tricep Extensions": "Hold a dumbbell overhead with both hands. Lower the weight behind your head by bending at the elbows, then extend arms back up.",
  "Squats": "Stand with feet shoulder-width apart. Lower your body by bending knees and pushing hips back as if sitting in a chair, then return to standing.",
  "Lunges": "Step forward with one leg and lower your body until both knees are bent at 90-degree angles. Push back to starting position and repeat with other leg.",
  "Glute Bridges": "Lie on your back with knees bent and feet flat on floor. Lift hips off ground until body forms a straight line from shoulders to knees.",
  "Calf Raises": "Stand with feet hip-width apart. Raise heels off the ground by pushing through the balls of your feet, then lower back down.",
  "Plank": "Hold a position similar to the top of a push-up, with body forming a straight line from head to heels. Engage core and hold.",
  "Deadlifts": "Stand with feet shoulder-width apart. Lower your body by bending knees and pushing hips back as if sitting in a chair, then return to standing.",
  "Bench Press": "Sit on a bench with dumbbells at shoulder height. Press weights upward until arms are fully extended overhead.",
  "Pull-ups": "Hang from a pull-up bar with arms fully extended. Pull yourself up until your chin is above the bar.",
  "Leg Press": "Sit on a leg press machine with feet shoulder-width apart. Push the weight up until your legs are fully extended.",
  "Core Workout": "Lie on your back with knees bent and feet flat on floor. Engage your core and hold.",
  "Incline Dumbbell Press": "Sit on a bench with dumbbells at shoulder height. Press weights upward until arms are fully extended overhead.",
  "Chest Flyes": "Lie on a bench with dumbbells at shoulder height. Extend arms out to the sides and lower the dumbbells down to the chest.",
  "Tricep Dips": "Sit on a bench with dumbbells at shoulder height. Lower the dumbbells down to the chest and push them back up.",
  "Tricep Pushdowns": "Hold a dumbbell overhead with both hands. Lower the weight behind your head by bending at the elbows, then extend arms back up.",
  "Bent-over Rows": "Stand with a dumbbell in one hand. Bend at the waist with other hand on bench. Pull dumbbell up to side of torso, keeping elbow close to body.",
  "Lat Pulldowns": "Sit on a lat pulldown machine with a barbell. Pull the bar down until your chin is above the bar.",
  "Hammer Curls": "Hold dumbbells at sides with palms facing forward. Curl weights up toward shoulders while keeping elbows close to torso.",
  "Leg Curls": "Sit on a leg curl machine with feet shoulder-width apart. Curl the weights up toward your thighs.",
  "Plank Circuit": "Lie on your back with knees bent and feet flat on floor. Engage your core and hold.",
  "Lateral Raises": "Stand with dumbbells at shoulder height. Raise the dumbbells to the sides.",
  "Front Raises": "Stand with dumbbells at shoulder height. Raise the dumbbells up to the chest.",
  "Skull Crushers": "Lie on a bench with dumbbells at shoulder height. Lower the dumbbells down to the chest and push them back up.",
  "Concentration Curls": "Hold dumbbells at sides with palms facing forward. Curl weights up toward shoulders while keeping elbows close to torso.",
  "Jump Squats": "Stand with feet shoulder-width apart. Lower your body by bending knees and pushing hips back as if sitting in a chair, then return to standing.",
  "Burpees": "Start in a plank position. Jump your feet back into a squat position, then jump back up into a plank position.",
  "Mountain Climbers": "Start in a plank position. Alternate between jumping your feet up and down.",
  "Jumping Lunges": "Stand with feet shoulder-width apart. Step forward with one leg and lower your body until both knees are bent at 90-degree angles. Push back to starting position and repeat with other leg.",
  "High Knees": "Stand with feet hip-width apart. Jump your knees up and down.",
  "Push-up Jacks": "Start in a plank position. Jump your feet back into a squat position, then jump back up into a plank position.",
  "Plank Shoulder Taps": "Start in a plank position. Tap your shoulders to the ground.",
  "Jumping Jacks": "Start in a plank position. Jump your feet back into a squat position, then jump back up into a plank position.",
  "Plank Jacks": "Start in a plank position. Jump your feet back into a squat position, then jump back up into a plank position."
};

const exerciseEquipment = {
  "Push-ups": "none",
  "Dumbbell Rows": "dumbbells",
  "Shoulder Press": "dumbbells",
  "Bicep Curls": "dumbbells",
  "Tricep Extensions": "dumbbells",
  "Squats": "none",
  "Lunges": "none",
  "Glute Bridges": "none",
  "Calf Raises": "none",
  "Plank": "none",
  "Deadlifts": "barbell",
  "Bench Press": "bench,barbell",
  "Pull-ups": "pull-up-bar",
  "Leg Press": "leg-press-machine",
  "Core Workout": "none",
  "Incline Dumbbell Press": "bench,dumbbells",
  "Chest Flyes": "dumbbells",
  "Tricep Dips": "parallel-bars",
  "Tricep Pushdowns": "cable-machine",
  "Bent-over Rows": "dumbbells",
  "Lat Pulldowns": "lat-pulldown-machine",
  "Hammer Curls": "dumbbells",
  "Leg Curls": "leg-curl-machine",
  "Plank Circuit": "none",
  "Lateral Raises": "dumbbells",
  "Front Raises": "dumbbells",
  "Skull Crushers": "bench,dumbbells",
  "Concentration Curls": "dumbbells",
  "Jump Squats": "none",
  "Burpees": "none",
  "Mountain Climbers": "none",
  "Jumping Lunges": "none",
  "High Knees": "none",
  "Push-up Jacks": "none",
  "Plank Shoulder Taps": "none",
  "Jumping Jacks": "none",
  "Plank Jacks": "none"
};

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
      { id: "w4", name: "Shoulders & Arms", exercises: ["Shoulder Press", "Lateral Raises", "Front Raises", "Skull Crushers", "Concentration Curls"] }
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
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, string[]>>({});
  const [selectedExercise, setSelectedExercise] = useState<{name: string, image: string, description: string} | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [wellyVisionOpen, setWellyVisionOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<{name: string, workoutId: string, index: number}>({name: "", workoutId: "", index: 0});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const togglePlanDetails = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleStartPlan = (planId: string, planName: string) => {
    console.log(`Starting plan: ${planId} - ${planName}`);
    setActivePlan(planId);
    
    if (!completedExercises[planId]) {
      setCompletedExercises(prev => ({
        ...prev,
        [planId]: []
      }));
    }
    
    toast({
      title: "Training Plan Started",
      description: `You've started the ${planName} training plan.`,
    });
    
    setActiveTab("progress");
  };

  const handleSchedulePlan = (planId: string, planName: string) => {
    console.log(`Scheduling plan: ${planId} - ${planName}`);
    toast({
      title: "Plan Scheduled",
      description: `${planName} has been added to your calendar.`,
    });
  };

  const handleViewDetails = (planId: string) => {
    togglePlanDetails(planId);
  };

  const handleQuizComplete = (results: any) => {
    console.log("Quiz results:", results);
    
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

  const toggleExerciseCompletion = (workoutId: string, exerciseIndex: number) => {
    if (!activePlan) return;
    
    const exerciseKey = `${workoutId}-${exerciseIndex}`;
    
    setCompletedExercises(prev => {
      const planExercises = [...(prev[activePlan] || [])];
      
      if (planExercises.includes(exerciseKey)) {
        return {
          ...prev,
          [activePlan]: planExercises.filter(key => key !== exerciseKey)
        };
      } else {
        return {
          ...prev,
          [activePlan]: [...planExercises, exerciseKey]
        };
      }
    });
    
    toast({
      title: "Progress Updated",
      description: completedExercises[activePlan]?.includes(exerciseKey) 
        ? "Exercise marked as incomplete" 
        : "Exercise marked as completed",
    });
  };

  const calculateProgress = () => {
    if (!activePlan) return 0;
    
    const plan = mockTrainingPlans.find(p => p.id === activePlan);
    if (!plan) return 0;
    
    const totalExercises = plan.workouts.reduce((total, workout) => total + workout.exercises.length, 0);
    const completedCount = completedExercises[activePlan]?.length || 0;
    
    return Math.round((completedCount / totalExercises) * 100);
  };

  const handleViewInstructions = (exercise: string) => {
    setSelectedExercise({
      name: exercise,
      image: exerciseImages[exercise] || "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop",
      description: exerciseDescriptions[exercise] || "Perform this exercise with proper form, focusing on controlled movements and proper breathing technique."
    });
    setInstructionsOpen(true);
  };

  const handleStartWellyVision = (exerciseName: string, workoutId: string, exerciseIndex: number) => {
    setCurrentExercise({
      name: exerciseName,
      workoutId: workoutId,
      index: exerciseIndex
    });
    setWellyVisionOpen(true);
  };

  const handleWellyVisionComplete = () => {
    if (currentExercise.workoutId && activePlan) {
      const exerciseKey = `${currentExercise.workoutId}-${currentExercise.index}`;
      
      setCompletedExercises(prev => {
        const planExercises = [...(prev[activePlan] || [])];
        
        if (!planExercises.includes(exerciseKey)) {
          return {
            ...prev,
            [activePlan]: [...planExercises, exerciseKey]
          };
        }
        return prev;
      });
      
      toast({
        title: "Exercise Completed with Welly Vision",
        description: `Great job! ${currentExercise.name} marked as completed.`,
      });
    }
  };

  const activePlanObj = activePlan 
    ? mockTrainingPlans.find(plan => plan.id === activePlan) 
    : null;

  const recommendedPlanObj = recommendedPlan 
    ? mockTrainingPlans.find(plan => plan.id === recommendedPlan) 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10 safe-area-inset">
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
                  <Card className="bg-primary/5 border-primary mb-8 relative">
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
                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 bg-muted/10 pt-4">
                      <div className="flex w-full justify-between items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={handleStartOver}
                        >
                          Retake Quiz
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSchedulePlan(recommendedPlanObj.id, recommendedPlanObj.name)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
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
              
              <TabsContent value="progress" className="h-full">
                {activePlan && activePlanObj ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                          {activePlanObj.name} - My Progress
                        </CardTitle>
                        <CardDescription>
                          Track your progress and mark completed exercises
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Overall Progress</h3>
                            <span className="text-primary font-semibold">{calculateProgress()}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${calculateProgress()}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-8">
                          {activePlanObj.workouts.map((workout) => (
                            <div key={workout.id} className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-4">{workout.name}</h3>
                              <div className="space-y-4">
                                {workout.exercises.map((exercise, index) => {
                                  const exerciseKey = `${workout.id}-${index}`;
                                  const isCompleted = completedExercises[activePlan]?.includes(exerciseKey);
                                  
                                  return (
                                    <div 
                                      key={`${workout.id}-${index}`} 
                                      className={`p-4 rounded-md border ${
                                        isCompleted ? 'bg-primary/10 border-primary/30' : ''
                                      }`}
                                    >
                                      <div className="flex flex-col md:flex-row gap-4">
                                        <div className="md:w-1/3 mb-3 md:mb-0">
                                          <div className="rounded-md overflow-hidden bg-muted aspect-video relative">
                                            <img 
                                              src={exerciseImages[exercise] || "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop"} 
                                              alt={exercise}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </div>
                                        <div className="md:w-2/3">
                                          <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-lg flex items-center">
                                              <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                                              {exercise}
                                            </h4>
                                            <Button
                                              variant={isCompleted ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => toggleExerciseCompletion(workout.id, index)}
                                            >
                                              {isCompleted ? (
                                                <>
                                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                                  Completed
                                                </>
                                              ) : (
                                                "Mark Complete"
                                              )}
                                            </Button>
                                          </div>
                                          
                                          <p className="text-muted-foreground text-sm mb-3">
                                            {exerciseDescriptions[exercise] || 
                                              "Perform this exercise with proper form, focusing on controlled movements."}
                                          </p>
                                          
                                          <div className="flex flex-wrap gap-2 mt-4">
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              className="text-xs"
                                              onClick={() => handleViewInstructions(exercise)}
                                            >
                                              <Info className="h-3 w-3 mr-1" />
                                              View Instructions
                                            </Button>
                                            
                                            <Button 
                                              variant="default" 
                                              size="sm"
                                              className="text-xs"
                                              onClick={() => handleStartWellyVision(exercise, workout.id, index)}
                                            >
                                              <Camera className="h-3 w-3 mr-1" />
                                              START WITH WELLY VISION
                                            </Button>
                                            
                                            <WelluraPlaylistButton size="sm" className="text-xs" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Training Plan</h3>
                    <p className="text-muted-foreground mb-4">Start a training plan to track your progress and achievements</p>
                    <Button onClick={() => setActiveTab("plans")}>
                      Browse Training Plans
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="exercises" className="h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Film className="h-5 w-5 mr-2 text-primary" />
                      Exercise Library
                    </CardTitle>
                    <CardDescription>
                      Browse our collection of exercise demonstrations and instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(exerciseImages).slice(0, 8).map(([exercise, imageUrl]) => (
                        <Card key={exercise} className="overflow-hidden">
                          <div className="aspect-video relative">
                            <img 
                              src={imageUrl} 
                              alt={exercise} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{exercise}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {exerciseDescriptions[exercise] || 
                                "Perform this exercise with proper form, focusing on controlled movements."}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewInstructions(exercise)}
                            >
                              View Details
                            </Button>
                            <WelluraPlaylistButton size="sm" />
                          </CardFooter>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-8">
                      <h3 className="font-medium mb-4">Featured Workout Demonstrations</h3>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {Object.entries(exerciseImages).slice(8, 16).map(([exercise, imageUrl]) => (
                            <CarouselItem key={exercise} className="md:basis-1/2 lg:basis-1/3">
                              <div className="p-1">
                                <Card>
                                  <div className="aspect-square relative">
                                    <img 
                                      src={imageUrl} 
                                      alt={exercise} 
                                      className="w-full h-full object-cover rounded-t-lg"
                                    />
                                  </div>
                                  <CardContent className="p-4">
                                    <h3 className="font-medium">{exercise}</h3>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-xs"
                                        onClick={() => handleViewInstructions(exercise)}
                                      >
                                        <Info className="h-3 w-3 mr-1" />
                                        View Instructions
                                      </Button>
                                      <WelluraPlaylistButton size="sm" className="text-xs" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          {selectedExercise && (
            <ExerciseInstructionDialog
              exercise={selectedExercise.name}
              open={instructionsOpen}
              onOpenChange={setInstructionsOpen}
              imageUrl={selectedExercise.image}
              description={selectedExercise.description}
            />
          )}
          
          <WellyVisionDialog
            exerciseName={currentExercise.name}
            targetReps={10}
            open={wellyVisionOpen}
            onOpenChange={setWellyVisionOpen}
            onComplete={handleWellyVisionComplete}
          />
        </div>
      </main>
    </div>
  );
};

export default Training;
