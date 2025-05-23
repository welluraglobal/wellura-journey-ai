
import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import NavBar from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";
import { Utensils, Apple, Clock, Filter, Plus, Check, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CustomizeMealPlanDialog from "@/components/meal-plans/CustomizeMealPlanDialog";
import CreateCustomPlanDialog from "@/components/meal-plans/CreateCustomPlanDialog";
import MealPlanDetailDialog from "@/components/meal-plans/MealPlanDetailDialog";
import { useUser } from "@/contexts/UserContext";

// Mock meal plan data
const mockMealPlans = [
  {
    id: "1",
    name: "Weight Loss Plan",
    description: "Low calorie balanced meals to support weight loss",
    meals: [
      { id: "m1", name: "Breakfast", time: "8:00 AM", description: "Scrambled eggs with vegetables and whole grain toast" },
      { id: "m2", name: "Mid-Morning Snack", time: "10:30 AM", description: "Greek yogurt with berries" },
      { id: "m3", name: "Lunch", time: "1:00 PM", description: "Grilled chicken salad with olive oil dressing" },
      { id: "m4", name: "Afternoon Snack", time: "4:00 PM", description: "Apple and a handful of almonds" },
      { id: "m5", name: "Dinner", time: "7:00 PM", description: "Baked salmon with steamed vegetables and quinoa" },
    ],
    calories: 1500,
    protein: 120,
    carbs: 105,
    fat: 55
  },
  {
    id: "2",
    name: "Muscle Building Plan",
    description: "High protein meals to support muscle growth and recovery",
    meals: [
      { id: "m1", name: "Breakfast", time: "7:00 AM", description: "Protein oatmeal with banana and peanut butter" },
      { id: "m2", name: "Mid-Morning Snack", time: "10:00 AM", description: "Protein shake with almond milk" },
      { id: "m3", name: "Lunch", time: "1:00 PM", description: "Brown rice with grilled chicken breast and vegetables" },
      { id: "m4", name: "Pre-Workout", time: "4:00 PM", description: "Banana and protein bar" },
      { id: "m5", name: "Dinner", time: "7:30 PM", description: "Lean beef steak with sweet potato and broccoli" },
      { id: "m6", name: "Before Bed", time: "9:30 PM", description: "Cottage cheese with honey" },
    ],
    calories: 2800,
    protein: 180,
    carbs: 320,
    fat: 70
  },
  {
    id: "3",
    name: "Balanced Maintenance",
    description: "Balanced nutrition to maintain current weight and support overall health",
    meals: [
      { id: "m1", name: "Breakfast", time: "8:00 AM", description: "Avocado toast with poached eggs" },
      { id: "m2", name: "Lunch", time: "12:30 PM", description: "Quinoa bowl with mixed vegetables and tofu" },
      { id: "m3", name: "Afternoon Snack", time: "3:30 PM", description: "Mixed nuts and dried fruits" },
      { id: "m4", name: "Dinner", time: "7:00 PM", description: "Grilled fish with roasted vegetables and wild rice" },
    ],
    calories: 2000,
    protein: 110,
    carbs: 220,
    fat: 65
  }
];

const MealPlans = () => {
  const { userProfile } = useContext(UserContext);
  const [mealPlans, setMealPlans] = useState(mockMealPlans);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [selectedPlanForCustomize, setSelectedPlanForCustomize] = useState<string | null>(null);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<string | null>(null);
  const [quizGeneratedPlan, setQuizGeneratedPlan] = useState<any>(null);
  const [showQuizPlan, setShowQuizPlan] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { firstName } = useUser();

  // Check for quiz-generated plan passed from the results page
  useEffect(() => {
    // Check if there's a quiz-generated plan in the location state
    if (location.state?.quizGeneratedPlan) {
      console.log("Received quiz plan:", location.state.quizGeneratedPlan);
      setQuizGeneratedPlan(location.state.quizGeneratedPlan);
      setShowQuizPlan(true);
    } else if (userProfile?.mealPlan) {
      // Check if there's a meal plan in the user profile
      console.log("Found meal plan in user profile:", userProfile.mealPlan);
      setQuizGeneratedPlan(userProfile.mealPlan);
    }
  }, [location, userProfile]);

  const handleViewDetails = (planId: string) => {
    setSelectedPlanForDetail(planId);
    setIsDetailDialogOpen(true);
  };

  const handleViewQuizPlanDetails = () => {
    // Create a temporary plan object with an ID for the detail dialog
    const tempPlan = {
      ...quizGeneratedPlan,
      id: "quiz-generated",
      name: "Personalized Plan",
      description: "Created based on your quiz responses"
    };
    
    // Add to meal plans if not already there
    if (!mealPlans.some(plan => plan.id === "quiz-generated")) {
      setMealPlans([tempPlan, ...mealPlans]);
    }
    
    setSelectedPlanForDetail("quiz-generated");
    setIsDetailDialogOpen(true);
  };

  const handleCreateCustomPlan = () => {
    setIsCreateDialogOpen(true);
  };

  const handleFilter = () => {
    toast({
      title: "Filter Meal Plans",
      description: "Meal plan filtering feature is coming soon!",
    });
  };

  const handleCustomize = (planId: string) => {
    setSelectedPlanForCustomize(planId);
    setIsCustomizeDialogOpen(true);
  };

  const handleActivatePlan = (planId: string, planName: string) => {
    // Deactivate previous plan
    setActivePlan(planId);
    
    toast({
      title: "Plan Activated",
      description: `${planName} has been activated as your current meal plan.`,
    });
  };

  const handleSaveCustomizedPlan = (updatedPlan: typeof mealPlans[0]) => {
    setMealPlans(mealPlans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    ));
    
    toast({
      title: "Plan Customized",
      description: "Your custom plan has been saved.",
    });
  };

  const handleSaveNewPlan = (newPlan: typeof mealPlans[0]) => {
    setMealPlans([...mealPlans, newPlan]);
    
    toast({
      title: "Custom Plan Created",
      description: "Custom plan created successfully!",
    });
  };

  const handleReplaceMeal = (mealId: string) => {
    toast({
      title: "Replace Meal",
      description: "Meal replacement feature is coming soon!",
    });
  };

  const handleAddToShoppingList = (mealId: string) => {
    toast({
      title: "Added to Shopping List",
      description: "Meal ingredients added to your shopping list.",
    });
  };

  const handleRetakeQuiz = () => {
    navigate("/quiz");
  };

  // Get the currently selected plan for customization
  const selectedPlanForCustomizeData = mealPlans.find(plan => plan.id === selectedPlanForCustomize);
  
  // Get the currently selected plan for detail view
  const selectedPlanForDetailData = mealPlans.find(plan => plan.id === selectedPlanForDetail);

  // Format quiz plan for display
  const formatQuizPlan = () => {
    if (!quizGeneratedPlan) return null;
    
    return {
      id: "quiz-generated",
      name: "Your Personalized Plan",
      description: `Based on your ${quizGeneratedPlan.mainGoal || "health"} goals and quiz responses`,
      meals: quizGeneratedPlan.meals || [],
      calories: quizGeneratedPlan.caloriesPerDay || 0,
      protein: quizGeneratedPlan.macros?.protein || 0,
      carbs: quizGeneratedPlan.macros?.carbs || 0,
      fat: quizGeneratedPlan.macros?.fat || 0
    };
  };

  const quizPlanFormatted = formatQuizPlan();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Utensils className="mr-2 h-8 w-8 text-primary" />
              Meal Plans
            </h1>
            <p className="text-muted-foreground">
              Personalized nutrition plans to support your health goals
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              {!quizPlanFormatted && (
                <Button variant="outline" size="sm" onClick={handleRetakeQuiz}>
                  <FileText className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              )}
            </div>
            <Button size="sm" onClick={handleCreateCustomPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Plan
            </Button>
          </div>
          
          {/* Quiz-generated plan card */}
          {quizPlanFormatted && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Your Quiz-Based Meal Plan
              </h2>
              
              <Card className="overflow-hidden border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{quizPlanFormatted.name}</CardTitle>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">Quiz Generated</Badge>
                      </div>
                      <CardDescription className="mt-1">{quizPlanFormatted.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleViewQuizPlanDetails}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Calories</div>
                      <div className="font-medium mt-1">{quizPlanFormatted.calories}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Protein</div>
                      <div className="font-medium mt-1">{quizPlanFormatted.protein}g</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Carbs</div>
                      <div className="font-medium mt-1">{quizPlanFormatted.carbs}g</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Fat</div>
                      <div className="font-medium mt-1">{quizPlanFormatted.fat}g</div>
                    </div>
                  </div>
                  
                  {quizPlanFormatted.meals && quizPlanFormatted.meals.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Meal Schedule</h4>
                      <div className="bg-muted/20 rounded-lg p-4">
                        <ul className="space-y-2">
                          {quizPlanFormatted.meals.slice(0, 3).map((meal: any, index: number) => (
                            <li key={index} className="flex justify-between">
                              <span className="font-medium">{meal.name}</span>
                              <span className="text-muted-foreground">{meal.calories} calories</span>
                            </li>
                          ))}
                          {quizPlanFormatted.meals.length > 3 && (
                            <li className="text-sm text-muted-foreground text-center pt-2">
                              + {quizPlanFormatted.meals.length - 3} more meals
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-end gap-2 bg-muted/10 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCustomize("quiz-generated")}
                  >
                    <Apple className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleActivatePlan("quiz-generated", "Personalized Plan")}
                    variant={activePlan === "quiz-generated" ? "secondary" : "default"}
                  >
                    {activePlan === "quiz-generated" ? "Plan Active" : "Activate Plan"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Separator className="my-8" />
              <h2 className="text-xl font-semibold mb-4">Other Available Plans</h2>
            </div>
          )}
          
          {/* Standard meal plans */}
          <div className="grid grid-cols-1 gap-6">
            {mealPlans.map((plan) => (
              plan.id !== "quiz-generated" && (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          {activePlan === plan.id && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Active
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(plan.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-muted/30 p-3 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Calories</div>
                        <div className="font-medium mt-1">{plan.calories}</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Protein</div>
                        <div className="font-medium mt-1">{plan.protein}g</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Carbs</div>
                        <div className="font-medium mt-1">{plan.carbs}g</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Fat</div>
                        <div className="font-medium mt-1">{plan.fat}g</div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end gap-2 bg-muted/10 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCustomize(plan.id)}
                    >
                      <Apple className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleActivatePlan(plan.id, plan.name)}
                      variant={activePlan === plan.id ? "secondary" : "default"}
                    >
                      {activePlan === plan.id ? "Plan Active" : "Activate Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            ))}
          </div>
        </div>
      </main>

      {/* Customize Meal Plan Dialog */}
      <CustomizeMealPlanDialog
        open={isCustomizeDialogOpen}
        onOpenChange={setIsCustomizeDialogOpen}
        plan={selectedPlanForCustomizeData || null}
        onSave={handleSaveCustomizedPlan}
      />

      {/* Create Custom Plan Dialog */}
      <CreateCustomPlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleSaveNewPlan}
      />

      {/* Meal Plan Detail Dialog */}
      <MealPlanDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        plan={selectedPlanForDetailData || null}
        onReplaceMeal={handleReplaceMeal}
        onAddToShoppingList={handleAddToShoppingList}
      />
    </div>
  );
};

export default MealPlans;
