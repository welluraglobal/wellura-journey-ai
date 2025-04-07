
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Utensils, Dumbbell, Sparkles } from "lucide-react";

type MealPlanOptions = {
  dietType: string;
  allergies: string[];
  mealsPerDay: string;
  preferences: string;
};

type TrainingPlanOptions = {
  trainingType: string;
  preferredTime: string;
  daysPerWeek: string;
  fitnessLevel: string;
};

const PlanGenerator = () => {
  const [planType, setPlanType] = useState<"meal" | "training">("meal");
  const [mealPlanOptions, setMealPlanOptions] = useState<MealPlanOptions>({
    dietType: "",
    allergies: [],
    mealsPerDay: "3",
    preferences: "",
  });
  const [trainingPlanOptions, setTrainingPlanOptions] = useState<TrainingPlanOptions>({
    trainingType: "",
    preferredTime: "",
    daysPerWeek: "3",
    fitnessLevel: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{ type: string; content: string } | null>(null);
  
  const navigate = useNavigate();
  
  const allergies = [
    { id: "dairy", label: "Dairy" },
    { id: "nuts", label: "Nuts" },
    { id: "gluten", label: "Gluten" },
    { id: "seafood", label: "Seafood" },
    { id: "eggs", label: "Eggs" },
  ];
  
  const handleMealPlanChange = (field: keyof MealPlanOptions, value: any) => {
    setMealPlanOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleTrainingPlanChange = (field: keyof TrainingPlanOptions, value: string) => {
    setTrainingPlanOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleAllergyToggle = (allergyId: string) => {
    setMealPlanOptions((prev) => {
      const updatedAllergies = prev.allergies.includes(allergyId)
        ? prev.allergies.filter((id) => id !== allergyId)
        : [...prev.allergies, allergyId];
      
      return {
        ...prev,
        allergies: updatedAllergies,
      };
    });
  };
  
  const generatePlan = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    try {
      // Basic validation
      if (planType === "meal" && !mealPlanOptions.dietType) {
        toast.error("Please select a diet type");
        setIsGenerating(false);
        return;
      }
      
      if (planType === "training" && (!trainingPlanOptions.trainingType || !trainingPlanOptions.preferredTime || !trainingPlanOptions.fitnessLevel)) {
        toast.error("Please fill in all training preferences");
        setIsGenerating(false);
        return;
      }
      
      // Simulate API call to generate plan
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate a mock plan based on options (this would be replaced with real AI generation)
      let planContent = "";
      
      if (planType === "meal") {
        planContent = generateMockMealPlan(mealPlanOptions);
      } else {
        planContent = generateMockTrainingPlan(trainingPlanOptions);
      }
      
      // Set the generated plan
      setGeneratedPlan({
        type: planType,
        content: planContent,
      });
      
      toast.success(`Your ${planType} plan has been generated!`);
      
      // In a real implementation, this plan would be saved to Supabase
      
    } catch (error) {
      console.error("Plan generation error:", error);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateMockMealPlan = (options: MealPlanOptions): string => {
    const { dietType, mealsPerDay, allergies } = options;
    
    let planText = `## 7-Day ${dietType.charAt(0).toUpperCase() + dietType.slice(1)} Meal Plan\n\n`;
    planText += `${mealsPerDay} meals per day`;
    
    if (allergies.length > 0) {
      planText += ` (excluding ${allergies.join(", ")})`;
    }
    
    planText += "\n\n### Day 1\n\n";
    
    if (parseInt(mealsPerDay) >= 1) planText += "**Breakfast:** Scrambled eggs with vegetables\n\n";
    if (parseInt(mealsPerDay) >= 2) planText += "**Lunch:** Grilled chicken salad with olive oil dressing\n\n";
    if (parseInt(mealsPerDay) >= 3) planText += "**Dinner:** Baked salmon with steamed broccoli\n\n";
    if (parseInt(mealsPerDay) >= 4) planText += "**Snack:** Greek yogurt with berries\n\n";
    
    planText += "### Day 2\n\n";
    
    if (parseInt(mealsPerDay) >= 1) planText += "**Breakfast:** Overnight oats with nuts and seeds\n\n";
    if (parseInt(mealsPerDay) >= 2) planText += "**Lunch:** Lentil soup with whole grain bread\n\n";
    if (parseInt(mealsPerDay) >= 3) planText += "**Dinner:** Turkey meatballs with zucchini noodles\n\n";
    if (parseInt(mealsPerDay) >= 4) planText += "**Snack:** Apple slices with almond butter\n\n";
    
    return planText;
  };
  
  const generateMockTrainingPlan = (options: TrainingPlanOptions): string => {
    const { trainingType, preferredTime, daysPerWeek, fitnessLevel } = options;
    
    let planText = `## ${daysPerWeek}-Day ${trainingType.charAt(0).toUpperCase() + trainingType.slice(1)} Training Plan\n\n`;
    planText += `Designed for ${fitnessLevel} fitness level, preferably in the ${preferredTime}\n\n`;
    
    planText += "### Day 1\n\n";
    
    if (trainingType === "gym") {
      planText += "- Warm-up: 5-10 minutes cardio\n";
      planText += "- Squats: 3 sets of 12 reps\n";
      planText += "- Bench Press: 3 sets of 10 reps\n";
      planText += "- Rows: 3 sets of 12 reps\n";
      planText += "- Shoulder Press: 3 sets of 10 reps\n";
      planText += "- Cool down: 5 minutes stretching\n\n";
    } else if (trainingType === "home") {
      planText += "- Warm-up: 5 minutes jogging in place\n";
      planText += "- Push-ups: 3 sets of 10 reps\n";
      planText += "- Bodyweight Squats: 3 sets of 15 reps\n";
      planText += "- Plank: 3 sets of 30 seconds\n";
      planText += "- Mountain Climbers: 3 sets of 20 reps\n";
      planText += "- Cool down: 5 minutes stretching\n\n";
    } else if (trainingType === "cardio") {
      planText += "- Warm-up: 5 minutes light jogging\n";
      planText += "- Interval Running: 30 seconds sprint, 90 seconds walk (repeat 10 times)\n";
      planText += "- Cool down: 5 minutes walking and stretching\n\n";
    }
    
    planText += "### Day 2\n\n";
    
    if (trainingType === "gym") {
      planText += "- Warm-up: 5-10 minutes cardio\n";
      planText += "- Deadlifts: 3 sets of 8 reps\n";
      planText += "- Pull-ups or Lat Pulldowns: 3 sets of 10 reps\n";
      planText += "- Leg Press: 3 sets of 12 reps\n";
      planText += "- Bicep Curls: 3 sets of 12 reps\n";
      planText += "- Cool down: 5 minutes stretching\n\n";
    } else if (trainingType === "home") {
      planText += "- Warm-up: 5 minutes jumping jacks\n";
      planText += "- Lunges: 3 sets of 10 reps each leg\n";
      planText += "- Tricep Dips: 3 sets of 12 reps\n";
      planText += "- Glute Bridges: 3 sets of 15 reps\n";
      planText += "- Russian Twists: 3 sets of 20 reps\n";
      planText += "- Cool down: 5 minutes stretching\n\n";
    } else if (trainingType === "cardio") {
      planText += "- Warm-up: 5 minutes light jogging\n";
      planText += "- Steady State Cardio: 30 minutes at moderate intensity\n";
      planText += "- Cool down: 5 minutes walking and stretching\n\n";
    }
    
    return planText;
  };
  
  const resetPlanGeneration = () => {
    setGeneratedPlan(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Personalized Plan Generator</h1>
          <p className="text-muted-foreground mb-6">
            Create customized meal and training plans based on your preferences and goals
          </p>
          
          {generatedPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {generatedPlan.type === "meal" ? (
                    <Utensils className="mr-2 h-5 w-5 text-wellura-500" />
                  ) : (
                    <Dumbbell className="mr-2 h-5 w-5 text-wellura-500" />
                  )}
                  Your Personalized {generatedPlan.type === "meal" ? "Meal" : "Training"} Plan
                </CardTitle>
                <CardDescription>
                  Generated based on your preferences and goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="bg-secondary/50 rounded-lg p-6 whitespace-pre-line">
                    {generatedPlan.content}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-4 flex-wrap">
                <Button variant="outline" onClick={resetPlanGeneration}>
                  Generate a New Plan
                </Button>
                <Button>
                  Save This Plan
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-wellura-500" />
                  Create Your Plan
                </CardTitle>
                <CardDescription>
                  Select your preferences to generate a personalized plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="meal"
                  value={planType}
                  onValueChange={(value) => setPlanType(value as "meal" | "training")}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="meal" className="flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      Meal Plan
                    </TabsTrigger>
                    <TabsTrigger value="training" className="flex items-center">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Training Plan
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="meal" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Diet Type</h3>
                        <RadioGroup
                          value={mealPlanOptions.dietType}
                          onValueChange={(value) => handleMealPlanChange("dietType", value)}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="balanced" id="balanced" />
                            <Label htmlFor="balanced" className="cursor-pointer">Balanced</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="high-protein" id="high-protein" />
                            <Label htmlFor="high-protein" className="cursor-pointer">High Protein</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="low-carb" id="low-carb" />
                            <Label htmlFor="low-carb" className="cursor-pointer">Low Carb</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="vegetarian" id="vegetarian" />
                            <Label htmlFor="vegetarian" className="cursor-pointer">Vegetarian</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="vegan" id="vegan" />
                            <Label htmlFor="vegan" className="cursor-pointer">Vegan</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="mediterranean" id="mediterranean" />
                            <Label htmlFor="mediterranean" className="cursor-pointer">Mediterranean</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Food Allergies/Restrictions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {allergies.map((allergy) => (
                            <div
                              key={allergy.id}
                              className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer"
                            >
                              <Checkbox
                                id={allergy.id}
                                checked={mealPlanOptions.allergies.includes(allergy.id)}
                                onCheckedChange={() => handleAllergyToggle(allergy.id)}
                              />
                              <Label htmlFor={allergy.id} className="cursor-pointer">{allergy.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Meals Per Day</h3>
                        <RadioGroup
                          value={mealPlanOptions.mealsPerDay}
                          onValueChange={(value) => handleMealPlanChange("mealsPerDay", value)}
                          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                          {[2, 3, 4, 5].map((num) => (
                            <div
                              key={num}
                              className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer"
                            >
                              <RadioGroupItem value={num.toString()} id={`meals-${num}`} />
                              <Label htmlFor={`meals-${num}`} className="cursor-pointer">{num} meals</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Additional Preferences</h3>
                        <Textarea
                          placeholder="Any specific foods you prefer or avoid? E.g., I love sweet potatoes, I dislike bell peppers"
                          value={mealPlanOptions.preferences}
                          onChange={(e) => handleMealPlanChange("preferences", e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="training" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Training Type</h3>
                        <RadioGroup
                          value={trainingPlanOptions.trainingType}
                          onValueChange={(value) => handleTrainingPlanChange("trainingType", value)}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="gym" id="gym" />
                            <Label htmlFor="gym" className="cursor-pointer">Gym</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="home" id="home" />
                            <Label htmlFor="home" className="cursor-pointer">Home Workouts</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="cardio" id="cardio" />
                            <Label htmlFor="cardio" className="cursor-pointer">Cardio</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="yoga" id="yoga" />
                            <Label htmlFor="yoga" className="cursor-pointer">Yoga</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="crossfit" id="crossfit" />
                            <Label htmlFor="crossfit" className="cursor-pointer">CrossFit</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Preferred Time</h3>
                        <RadioGroup
                          value={trainingPlanOptions.preferredTime}
                          onValueChange={(value) => handleTrainingPlanChange("preferredTime", value)}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="morning" id="morning" />
                            <Label htmlFor="morning" className="cursor-pointer">Morning</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="afternoon" id="afternoon" />
                            <Label htmlFor="afternoon" className="cursor-pointer">Afternoon</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="night" id="night" />
                            <Label htmlFor="night" className="cursor-pointer">Night</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Days Per Week</h3>
                        <RadioGroup
                          value={trainingPlanOptions.daysPerWeek}
                          onValueChange={(value) => handleTrainingPlanChange("daysPerWeek", value)}
                          className="grid grid-cols-3 sm:grid-cols-5 gap-3"
                        >
                          {[2, 3, 4, 5, 6].map((num) => (
                            <div
                              key={num}
                              className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer"
                            >
                              <RadioGroupItem value={num.toString()} id={`days-${num}`} />
                              <Label htmlFor={`days-${num}`} className="cursor-pointer">{num} days</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Fitness Level</h3>
                        <RadioGroup
                          value={trainingPlanOptions.fitnessLevel}
                          onValueChange={(value) => handleTrainingPlanChange("fitnessLevel", value)}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <Label htmlFor="beginner" className="cursor-pointer">Beginner</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <Label htmlFor="intermediate" className="cursor-pointer">Intermediate</Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <Label htmlFor="advanced" className="cursor-pointer">Advanced</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={generatePlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Plan"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Allow TypeScript to recognize the textarea component
const Textarea = ({ ...props }) => {
  return <textarea className="wellura-input min-h-[80px]" {...props} />;
};

export default PlanGenerator;
