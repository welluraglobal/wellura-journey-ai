
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateBodyComposition, generateSupplementRecommendations } from "@/utils/planGenerators";
import QuizResultsSection from "@/components/quiz/QuizResultsSection";
import { Loader2, ArrowLeft } from "lucide-react";

const QuizResults = () => {
  const { userId, userProfile } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [bodyComposition, setBodyComposition] = useState<any>(null);
  const [supplementRecommendations, setSupplementRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile?.quiz_data) {
      setQuizData(userProfile.quiz_data);
      
      // Generate body composition analysis
      const bodyComp = calculateBodyComposition(userProfile.quiz_data);
      setBodyComposition(bodyComp);
      
      // Generate supplement recommendations
      const supplements = generateSupplementRecommendations(userProfile.quiz_data);
      setSupplementRecommendations(supplements);
      
      setLoading(false);
    } else {
      // If no quiz data found, redirect to quiz page
      navigate("/quiz");
    }
  }, [userProfile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your personalized results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex items-center">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">Your Wellness Assessment Results</h1>
              <p className="text-muted-foreground">
                Personalized recommendations based on your quiz responses
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="results" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Overview</TabsTrigger>
              <TabsTrigger value="plans">Your Plans</TabsTrigger>
              <TabsTrigger value="supplements">Supplements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="mt-6">
              <QuizResultsSection 
                bodyComposition={bodyComposition}
                supplementRecommendations={supplementRecommendations}
                selectedGoals={quizData.goals || []}
              />
            </TabsContent>
            
            <TabsContent value="plans" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Your Personalized Plans</h2>
                
                {/* Meal Plan Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nutrition Plan</CardTitle>
                    <CardDescription>
                      Your diet plan based on your goals and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium">Your customized meal plan includes:</h3>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                          <li>Daily calorie target: {bodyComposition?.targetStats.calorieNeeds.recommended || "Calculating..."} calories</li>
                          <li>Macro split: {bodyComposition?.macroRecommendations.protein.percentage || 0}% protein, {bodyComposition?.macroRecommendations.carbs.percentage || 0}% carbs, {bodyComposition?.macroRecommendations.fat.percentage || 0}% fat</li>
                          <li>Personalized meal suggestions</li>
                          <li>Grocery shopping lists</li>
                        </ul>
                      </div>
                      
                      <Button className="w-full" onClick={() => navigate("/meals")}>
                        View Full Meal Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Training Plan Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Training Plan</CardTitle>
                    <CardDescription>
                      Customized workouts based on your fitness level and goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-medium">Your training plan includes:</h3>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                          <li>{quizData.answers?.fitnessLevel === "beginner" ? "Beginner-friendly" : quizData.answers?.fitnessLevel === "intermediate" ? "Intermediate" : "Advanced"} workouts</li>
                          <li>{quizData.answers?.workoutDuration || "30-60"} minute sessions</li>
                          <li>Focused on: {quizData.goals?.join(", ") || "overall fitness"}</li>
                          <li>Video guides and progress tracking</li>
                        </ul>
                      </div>
                      
                      <Button className="w-full" onClick={() => navigate("/training")}>
                        View Full Training Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="supplements" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Personalized Supplement Recommendations</h2>
                
                {supplementRecommendations.length > 0 ? (
                  supplementRecommendations.map((supplement) => (
                    <Card key={supplement.id}>
                      <CardHeader>
                        <CardTitle>{supplement.name}</CardTitle>
                        <CardDescription>{supplement.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Key Benefits</h3>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {supplement.benefits.map((benefit: string, index: number) => (
                                <li key={index}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Why It's Recommended for You</h3>
                            <p className="text-muted-foreground">
                              Based on your goals of {quizData.goals?.join(", ") || "improving overall health"}, 
                              this supplement can help support your wellness journey.
                            </p>
                          </div>
                          
                          <Button asChild className="w-full">
                            <a href={supplement.url} target="_blank" rel="noopener noreferrer">
                              Learn More & Shop
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No supplement recommendations available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
