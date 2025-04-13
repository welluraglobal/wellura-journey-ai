
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import QuizResultsSection from "@/components/quiz/QuizResultsSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Utensils, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Update the getBMI function to handle different value types
const getBMI = (bmi: any) => {
  // First, convert to a number if it's a string
  const numericBMI = typeof bmi === 'string' 
    ? parseFloat(bmi) 
    : bmi;
  
  // Then check if it's a valid number
  return typeof numericBMI === 'number' && !isNaN(numericBMI)
    ? numericBMI.toFixed(1)
    : 'N/A';
};

const QuizResults = () => {
  const { userProfile } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [bodyComposition, setBodyComposition] = useState<any>(null);
  const [supplementRecommendations, setSupplementRecommendations] = useState<any[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    
    if (userProfile) {
      // Log the entire userProfile to debug
      console.log("UserProfile data:", userProfile);
      
      // Extract data from the userProfile
      if (userProfile.bodyComposition) {
        console.log("Body composition found:", userProfile.bodyComposition);
        setBodyComposition(userProfile.bodyComposition);
      } else {
        console.log("No body composition found in user profile");
      }
      
      if (userProfile.supplementRecommendations) {
        console.log("Supplement recommendations found:", userProfile.supplementRecommendations);
        setSupplementRecommendations(userProfile.supplementRecommendations);
      } else {
        console.log("No supplement recommendations found in user profile");
      }
      
      if (userProfile?.quiz_data?.goals) {
        console.log("Goals found:", userProfile.quiz_data.goals);
        setSelectedGoals(Array.isArray(userProfile.quiz_data.goals) 
          ? userProfile.quiz_data.goals 
          : [userProfile.quiz_data.goals]);
      } else if (userProfile?.quiz_data?.answers?.fitnessGoals) {
        // Fallback to answers.fitnessGoals if goals not directly available
        console.log("Using fitnessGoals from answers:", userProfile.quiz_data.answers.fitnessGoals);
        setSelectedGoals(Array.isArray(userProfile.quiz_data.answers.fitnessGoals) 
          ? userProfile.quiz_data.answers.fitnessGoals 
          : [userProfile.quiz_data.answers.fitnessGoals]);
      } else {
        console.log("No goals found in user profile");
      }

      // Get meal plan from user profile
      if (userProfile.mealPlan) {
        console.log("Meal plan found:", userProfile.mealPlan);
        setMealPlan(userProfile.mealPlan);
      } else {
        console.log("No meal plan found in user profile");
      }

      // Get training plan from user profile
      if (userProfile.trainingPlan) {
        console.log("Training plan found:", userProfile.trainingPlan);
        setTrainingPlan(userProfile.trainingPlan);
      } else {
        console.log("No training plan found in user profile");
      }
    } else {
      console.log("No user profile data available");
    }
    
    setLoading(false);
  }, [userProfile]);

  const handleRetakeQuiz = () => {
    navigate("/quiz");
  };

  const handleViewMealPlan = () => {
    if (mealPlan) {
      navigate("/meals", { state: { quizGeneratedPlan: mealPlan }});
      toast({
        title: "Quiz-based Meal Plan",
        description: "Viewing your personalized meal plan based on quiz results",
      });
    } else {
      toast({
        title: "No Meal Plan Found",
        description: "Complete the wellness quiz to generate a personalized meal plan",
        variant: "destructive",
      });
    }
  };

  const handleViewTrainingPlan = () => {
    if (trainingPlan) {
      navigate("/training", { state: { quizGeneratedPlan: trainingPlan }});
      toast({
        title: "Quiz-based Training Plan",
        description: "Viewing your personalized training plan based on quiz results",
      });
    } else {
      toast({
        title: "No Training Plan Found",
        description: "Complete the wellness quiz to generate a personalized training plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                <div>Loading your personalized results...</div>
              </CardContent>
            </Card>
          ) : !bodyComposition ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">No Quiz Results Found</h2>
                <p className="text-muted-foreground mb-6">
                  Take our comprehensive wellness quiz to receive personalized recommendations
                  and insights based on your goals and needs.
                </p>
                <Button onClick={handleRetakeQuiz}>
                  <FileText className="mr-2 h-4 w-4" />
                  Take Wellness Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <QuizResultsSection 
                bodyComposition={bodyComposition}
                supplementRecommendations={supplementRecommendations}
                selectedGoals={selectedGoals}
              />
              
              {/* New section for personalized plans */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Utensils className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold">Personalized Meal Plan</h3>
                        <p className="text-sm text-muted-foreground">Based on your quiz responses</p>
                      </div>
                    </div>
                    
                    <p className="mb-4">
                      {mealPlan 
                        ? `Your meal plan has been generated with ${mealPlan.mealCount || 3} meals per day, focused on your ${mealPlan.mainGoal || "overall fitness"} goal.`
                        : "Take the wellness quiz to generate your personalized meal plan."}
                    </p>
                    
                    <Button 
                      onClick={handleViewMealPlan} 
                      className="w-full"
                      disabled={!mealPlan}
                    >
                      View Your Meal Plan
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="flex flex-col">
                  <CardContent className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Dumbbell className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold">Personalized Training Plan</h3>
                        <p className="text-sm text-muted-foreground">Based on your quiz responses</p>
                      </div>
                    </div>
                    
                    <p className="mb-4">
                      {trainingPlan 
                        ? `Your training plan includes ${trainingPlan.workouts?.length || 0} workouts per week, designed for your ${trainingPlan.level || "beginner"} level.`
                        : "Take the wellness quiz to generate your personalized training plan."}
                    </p>
                    
                    <Button 
                      onClick={handleViewTrainingPlan} 
                      className="w-full"
                      disabled={!trainingPlan}
                    >
                      View Your Training Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
