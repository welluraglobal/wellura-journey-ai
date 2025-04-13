
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  RefreshCw, 
  ArrowRight, 
  Dumbbell,
  Loader2
} from "lucide-react";
import FitnessQuiz from "@/components/training/FitnessQuiz";
import { 
  calculateBodyComposition, 
  generateMealPlan, 
  generateTrainingPlan, 
  generateSupplementRecommendations,
  savePlansToProfile
} from "@/utils/planGenerators";

const Quiz = () => {
  const { userId, userProfile, setUserProfile } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(false);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState<boolean>(false);

  // Check if user has already completed the quiz
  useEffect(() => {
    if (userProfile?.quiz_data) {
      setHasCompletedQuiz(true);
      if (userProfile.quiz_data.completedAt) {
        setLastCompletedDate(new Date(userProfile.quiz_data.completedAt).toLocaleDateString());
      }
    }
  }, [userProfile]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleCancelQuiz = () => {
    setShowQuiz(false);
  };

  const handleQuizComplete = async (quizResults: any) => {
    setShowQuiz(false);
    setIsSubmitting(true);
    
    try {
      if (!userId) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to save your quiz results",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const quizData = {
        answers: quizResults,
        goals: quizResults.fitnessGoals,
        completedAt: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          quiz_data: quizData 
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local user profile
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          quiz_data: quizData
        };
        setUserProfile(updatedProfile);
      }
      
      toast({
        title: "Success",
        description: "Your wellness quiz results have been saved!",
      });
      setHasCompletedQuiz(true);
      setLastCompletedDate(new Date().toLocaleDateString());
      
      // Generate plans after saving quiz data
      generatePlans(quizData);
      
    } catch (error) {
      console.error("Error saving quiz data:", error);
      toast({
        title: "Error",
        description: "Failed to save your quiz results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePlans = async (quizData: any) => {
    setIsGeneratingPlans(true);
    
    try {
      // Generate body composition
      const bodyComposition = calculateBodyComposition(quizData);
      
      // Generate meal plan
      const mealPlan = generateMealPlan(quizData, userProfile, bodyComposition);
      
      // Generate training plan
      const trainingPlan = generateTrainingPlan(quizData, userProfile);
      
      // Generate supplement recommendations
      const supplementRecommendations = generateSupplementRecommendations(quizData);
      
      // Save generated plans to database
      if (userId) {
        const saved = await savePlansToProfile(userId, quizData, {
          mealPlan,
          trainingPlan,
          bodyComposition,
          supplementRecommendations
        });
        
        if (saved) {
          toast({
            title: "Plans Generated",
            description: "Your personalized plans have been created based on your quiz responses",
          });
          
          // Navigate to results page
          navigate("/quiz-results");
        }
      }
    } catch (error) {
      console.error("Error generating plans:", error);
      toast({
        title: "Error",
        description: "Failed to generate personalized plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  const handleViewResults = () => {
    navigate("/quiz-results");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Wellness Assessment</h1>
            <p className="text-muted-foreground">
              Complete this comprehensive quiz to receive personalized wellness recommendations
            </p>
          </div>
          
          {showQuiz ? (
            <FitnessQuiz 
              onComplete={handleQuizComplete} 
              onCancel={handleCancelQuiz}
              initialData={userProfile?.quiz_data?.answers}
            />
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Your Wellness Profile</CardTitle>
                <CardDescription>
                  {hasCompletedQuiz 
                    ? `You last completed the wellness quiz on ${lastCompletedDate}`
                    : "Take our comprehensive health assessment to get personalized recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hasCompletedQuiz ? (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                        Your wellness profile is ready
                      </h3>
                      <p className="mt-2 text-muted-foreground">
                        Based on your quiz responses, we've created personalized meal plans, training routines, and supplement recommendations tailored just for you.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold">Get Personalized Recommendations</h3>
                      <p className="mt-2 text-muted-foreground">
                        This comprehensive assessment takes about 5 minutes and covers:
                      </p>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start">
                          <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                          <span>Fitness level, goals, and preferences</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                          <span>Nutrition habits and dietary preferences</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                          <span>Energy levels, sleep quality, and supplement needs</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                {hasCompletedQuiz ? (
                  <>
                    <Button className="w-full sm:w-auto" onClick={handleViewResults}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Your Report
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleStartQuiz}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake Quiz
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={handleStartQuiz}>
                    Start Wellness Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
              
              {(isSubmitting || isGeneratingPlans) && (
                <div className="flex items-center justify-center p-4 border-t">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>{isSubmitting ? "Saving your responses..." : "Generating your personalized plans..."}</span>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
