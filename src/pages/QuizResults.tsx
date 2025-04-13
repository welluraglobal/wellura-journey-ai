import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  calculateBodyComposition, 
  generateSupplementRecommendations 
} from "@/utils/planGenerators";
import { 
  Loader2, 
  ArrowLeft, 
  Scale, 
  Droplets, 
  Utensils, 
  LineChart, 
  PieChart, 
  Dumbbell, 
  Heart,
  ArrowRight
} from "lucide-react";

import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

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
      
      const bodyComp = calculateBodyComposition(userProfile.quiz_data);
      setBodyComposition(bodyComp);
      
      const supplements = generateSupplementRecommendations(userProfile.quiz_data);
      setSupplementRecommendations(supplements);
      
      setLoading(false);
    } else {
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

  const calculateWeeklyTarget = () => {
    if (!bodyComposition) return null;
    
    const currentWeight = parseFloat(quizData.answers.currentWeight);
    const targetWeight = parseFloat(quizData.answers.targetWeight);
    const weightDiff = Math.abs(currentWeight - targetWeight);
    
    const recommendedWeeklyChange = Math.min(weightDiff * 0.1, 1);
    const weeksToTarget = Math.ceil(weightDiff / recommendedWeeklyChange);
    
    return {
      weeklyChange: recommendedWeeklyChange.toFixed(1),
      isGain: targetWeight > currentWeight,
      weeksToTarget
    };
  };

  const weeklyTarget = calculateWeeklyTarget();

  const getBodyFatPercentage = () => {
    const bodyFatPercentage = bodyComposition?.targetStats?.targetBodyFatPercentage;
    
    return typeof bodyFatPercentage === 'number' 
      ? bodyFatPercentage.toFixed(1) 
      : 'N/A';
  };

  const getBMI = () => {
    const bmi = bodyComposition?.currentStats?.bmi;
    
    return typeof bmi === 'number' 
      ? bmi.toFixed(1) 
      : 'N/A';
  };

  const getBodyCompositionChartData = () => {
    if (!bodyComposition?.currentStats) return [];
    
    const { fatMassKg, leanMassKg } = bodyComposition.currentStats;
    
    return [
      { name: 'Fat Mass', value: parseFloat(fatMassKg) },
      { name: 'Lean Mass', value: parseFloat(leanMassKg) }
    ];
  };

  const getMacrosChartData = () => {
    if (!bodyComposition?.macroRecommendations) return [];
    
    const { protein, carbs, fat } = bodyComposition.macroRecommendations;
    
    return [
      { name: 'Protein', grams: protein.grams, calories: protein.calories },
      { name: 'Carbs', grams: carbs.grams, calories: carbs.calories },
      { name: 'Fat', grams: fat.grams, calories: fat.calories }
    ];
  };

  const getWeightComparisonData = () => {
    if (!quizData?.answers) return [];
    
    const currentWeight = parseFloat(quizData.answers.currentWeight);
    const targetWeight = parseFloat(quizData.answers.targetWeight);
    
    return [
      { name: 'Current', weight: currentWeight },
      { name: 'Target', weight: targetWeight }
    ];
  };

  const COLORS = ['#ff8042', '#0088fe'];

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
              <h1 className="text-2xl font-bold">Your Wellness Report</h1>
              <p className="text-muted-foreground">
                Personalized health insights based on your quiz responses
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="body-composition">Body Stats</TabsTrigger>
              <TabsTrigger value="plans">Your Plans</TabsTrigger>
              <TabsTrigger value="supplements">Supplements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Scale className="h-5 w-5 mr-2 text-primary" />
                        Key Health Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Weight</p>
                          <p className="text-2xl font-bold">{quizData.answers.currentWeight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target Weight</p>
                          <p className="text-2xl font-bold">{quizData.answers.targetWeight} kg</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Goal</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">BMI</p>
                          <p className="text-2xl font-bold">{getBMI()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Body Fat %</p>
                          <p className="text-2xl font-bold">{getBodyFatPercentage()}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-primary" />
                        Daily Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Daily Calories</p>
                        <p className="text-2xl font-bold">{bodyComposition?.targetStats.calorieNeeds.recommended} kcal</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Macro Split</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
                            <p className="text-sm font-medium">Protein</p>
                            <p className="text-lg">{bodyComposition?.macroRecommendations.protein.percentage}%</p>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-center">
                            <p className="text-sm font-medium">Carbs</p>
                            <p className="text-lg">{bodyComposition?.macroRecommendations.carbs.percentage}%</p>
                          </div>
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-center">
                            <p className="text-sm font-medium">Fat</p>
                            <p className="text-lg">{bodyComposition?.macroRecommendations.fat.percentage}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Water Intake</p>
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                          <p className="text-lg font-bold">{bodyComposition?.targetStats.waterIntake} liters per day</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary" />
                      Weekly Progress Target
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyTarget && (
                        <>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-medium">Recommended Weekly {weeklyTarget.isGain ? 'Gain' : 'Loss'}</h3>
                            <p className="text-3xl font-bold mt-1">{weeklyTarget.weeklyChange} kg</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              At this rate, you'll reach your target weight in approximately {weeklyTarget.weeksToTarget} weeks
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium">Weight Journey</h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  width={500}
                                  height={300}
                                  data={getWeightComparisonData()}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="weight" fill="#8884d8" name="Weight (kg)" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => navigate("/training")}>
                      View Your Training Plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="body-composition" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-primary" />
                      Body Composition Analysis
                    </CardTitle>
                    <CardDescription>
                      Based on your age, gender, weight, height, and other factors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-3">Your Current Body Composition</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={getBodyCompositionChartData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {getBodyCompositionChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(1)} kg`} />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Detailed Metrics</h3>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Body Fat Percentage:</span>
                                <span className="font-medium">{getBodyFatPercentage()}%</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Lean Mass:</span>
                                <span className="font-medium">{bodyComposition?.currentStats.leanMassKg} kg</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Fat Mass:</span>
                                <span className="font-medium">{bodyComposition?.currentStats.fatMassKg} kg</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">BMI:</span>
                                <span className="font-medium">{getBMI()} ({bodyComposition?.currentStats.bmiCategory})</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Basal Metabolic Rate:</span>
                                <span className="font-medium">{bodyComposition?.targetStats.calorieNeeds.bmr} kcal/day</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Target Body Composition</h3>
                            <p className="mb-2">Based on your target weight of {quizData.answers.targetWeight} kg:</p>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Target Body Fat:</span>
                                <span className="font-medium">{typeof bodyComposition?.targetStats.targetBodyFatPercentage === 'number' 
                                  ? bodyComposition?.targetStats.targetBodyFatPercentage.toFixed(1) 
                                  : bodyComposition?.targetStats.targetBodyFatPercentage}%</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Target Lean Mass:</span>
                                <span className="font-medium">{bodyComposition?.targetStats.targetLeanMassKg} kg</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Target Fat Mass:</span>
                                <span className="font-medium">{bodyComposition?.targetStats.targetFatMassKg} kg</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Your Recommended Macro Breakdown</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={500}
                              height={300}
                              data={getMacrosChartData()}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="grams" fill="#8884d8" name="Grams" />
                              <Bar yAxisId="right" dataKey="calories" fill="#82ca9d" name="Calories" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="plans" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Your Personalized Plans</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-primary" />
                      Nutrition Plan
                    </CardTitle>
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
                          <li>Diet type: {quizData.answers?.dietaryPreference || "Balanced"}</li>
                          <li>Meal frequency: {quizData.answers?.mealFrequency || "3-4"} meals per day</li>
                          <li>Personalized meal suggestions</li>
                        </ul>
                      </div>
                      
                      <Button className="w-full" onClick={() => navigate("/meals")}>
                        View Full Meal Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                      Training Plan
                    </CardTitle>
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
                          <li>{quizData.answers?.workoutFrequency || "3-4"} days per week</li>
                          <li>Focused on: {quizData.fitnessGoals?.join(", ") || "overall fitness"}</li>
                          <li>Customized for {quizData.answers?.equipmentAccess || "minimal"} equipment</li>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Personalized Supplement Recommendations</h2>
                  <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Based on your quiz answers</div>
                </div>
                
                {supplementRecommendations.length > 0 ? (
                  supplementRecommendations.map((supplement) => (
                    <Card key={supplement.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-primary" />
                          {supplement.name}
                        </CardTitle>
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
                              Based on your {supplement.reasonForRecommendation}, 
                              this supplement can help support your wellness journey.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <a href={supplement.url} target="_blank" rel="noopener noreferrer">
                            Learn More & Shop
                          </a>
                        </Button>
                      </CardFooter>
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
