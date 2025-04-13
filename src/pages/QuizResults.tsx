
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import QuizResultsSection from "@/components/quiz/QuizResultsSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const QuizResults: React.FC = () => {
  const { userProfile } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [bodyComposition, setBodyComposition] = useState<any>(null);
  const [supplementRecommendations, setSupplementRecommendations] = useState<any[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userProfile?.quiz_data) {
      // Extract data from the userProfile
      const quizData = userProfile.quiz_data;
      
      if (userProfile.bodyComposition) {
        setBodyComposition(userProfile.bodyComposition);
      }
      
      if (userProfile.supplementRecommendations) {
        setSupplementRecommendations(userProfile.supplementRecommendations);
      }
      
      if (quizData.goals) {
        setSelectedGoals(Array.isArray(quizData.goals) ? quizData.goals : [quizData.goals]);
      }
    }
    
    setLoading(false);
  }, [userProfile]);

  const handleRetakeQuiz = () => {
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card>
              <CardContent className="p-8 flex justify-center items-center">
                <div className="animate-pulse">Loading your personalized results...</div>
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
            <QuizResultsSection 
              bodyComposition={bodyComposition}
              supplementRecommendations={supplementRecommendations}
              selectedGoals={selectedGoals}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
