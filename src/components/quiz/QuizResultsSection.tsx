
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check, Printer, Mail, ChevronDown, ChevronUp } from "lucide-react";

interface MacroData {
  protein: { grams: number; percentage: number };
  carbs: { grams: number; percentage: number };
  fat: { grams: number; percentage: number };
}

interface BodyComposition {
  currentStats: {
    weight: number;
    height: number;
    bmi: number;
    bodyFatPercentage: number;
    leanBodyMass: number;
    fatMass: number;
  };
  targetStats: {
    minIdealWeight: number;
    maxIdealWeight: number;
    calorieNeeds: {
      maintenance: number;
      recommended: number;
      adjustment: number;
    };
  };
  macroRecommendations: MacroData;
}

interface SupplementRecommendation {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  url: string;
}

interface QuizResultsSectionProps {
  bodyComposition: BodyComposition;
  supplementRecommendations: SupplementRecommendation[];
  selectedGoals: string[];
}

const QuizResultsSection: React.FC<QuizResultsSectionProps> = ({
  bodyComposition,
  supplementRecommendations,
  selectedGoals
}) => {
  const navigate = useNavigate();
  const [expandedSupplements, setExpandedSupplements] = React.useState<Record<string, boolean>>({});

  const toggleSupplementDetails = (id: string) => {
    setExpandedSupplements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderProgressBar = (percentage: number, color: string) => {
    return (
      <div className="w-full">
        <Progress value={percentage} className={`h-2 ${color}`} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Personalized Results</h2>
      
      {/* Body Composition Card */}
      <Card>
        <CardHeader>
          <CardTitle>Body Composition Analysis</CardTitle>
          <CardDescription>Based on your height, weight, and other metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Current Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Weight</span>
                  <span className="font-medium">{bodyComposition.currentStats.weight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Height</span>
                  <span className="font-medium">{bodyComposition.currentStats.height} cm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>BMI</span>
                  <span className="font-medium">{bodyComposition.currentStats.bmi}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Body Fat</span>
                  <span className="font-medium">{bodyComposition.currentStats.bodyFatPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lean Mass</span>
                  <span className="font-medium">{bodyComposition.currentStats.leanBodyMass} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fat Mass</span>
                  <span className="font-medium">{bodyComposition.currentStats.fatMass} kg</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Recommended Targets</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Ideal Weight Range</span>
                  <span className="font-medium">{bodyComposition.targetStats.minIdealWeight} - {bodyComposition.targetStats.maxIdealWeight} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Daily Maintenance Calories</span>
                  <span className="font-medium">{bodyComposition.targetStats.calorieNeeds.maintenance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recommended Daily Calories</span>
                  <span className="font-medium">{bodyComposition.targetStats.calorieNeeds.recommended}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Calorie Adjustment</span>
                  <span className={`font-medium ${bodyComposition.targetStats.calorieNeeds.adjustment > 0 ? 'text-green-500' : bodyComposition.targetStats.calorieNeeds.adjustment < 0 ? 'text-red-500' : ''}`}>
                    {bodyComposition.targetStats.calorieNeeds.adjustment > 0 ? '+' : ''}{bodyComposition.targetStats.calorieNeeds.adjustment}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Macronutrient Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrient Recommendations</CardTitle>
          <CardDescription>Personalized macro distribution based on your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Protein</span>
                <span>{bodyComposition.macroRecommendations.protein.grams}g ({bodyComposition.macroRecommendations.protein.percentage}%)</span>
              </div>
              {renderProgressBar(bodyComposition.macroRecommendations.protein.percentage, "bg-blue-500")}
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Carbohydrates</span>
                <span>{bodyComposition.macroRecommendations.carbs.grams}g ({bodyComposition.macroRecommendations.carbs.percentage}%)</span>
              </div>
              {renderProgressBar(bodyComposition.macroRecommendations.carbs.percentage, "bg-green-500")}
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Fat</span>
                <span>{bodyComposition.macroRecommendations.fat.grams}g ({bodyComposition.macroRecommendations.fat.percentage}%)</span>
              </div>
              {renderProgressBar(bodyComposition.macroRecommendations.fat.percentage, "bg-yellow-500")}
            </div>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Why These Macros?</h4>
              <p className="text-sm text-muted-foreground">
                {selectedGoals.includes("Lose Weight") ? 
                  "Higher protein to preserve muscle mass while in a calorie deficit. Moderate carbs for energy and lower fat to reduce overall calories." :
                selectedGoals.includes("Build Muscle") ?
                  "Higher protein to support muscle growth and repair. Higher carbs to fuel intensive workouts. Moderate fat for hormonal health." :
                selectedGoals.includes("Boost Energy") ?
                  "Higher carbs to maximize energy levels throughout the day. Moderate protein for recovery and moderate fat for sustained energy." :
                  "Balanced macronutrient distribution for general health and wellness."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Supplement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Supplement Recommendations</CardTitle>
          <CardDescription>Based on your goals and specific needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplementRecommendations.length > 0 ? (
              supplementRecommendations.map((supplement) => (
                <div key={supplement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{supplement.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleSupplementDetails(supplement.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedSupplements[supplement.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">{supplement.description}</p>
                  
                  {expandedSupplements[supplement.id] && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">Key Benefits:</h4>
                        <ul className="mt-1 list-disc list-inside text-sm">
                          {supplement.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button size="sm" asChild className="w-full">
                        <a href={supplement.url} target="_blank" rel="noopener noreferrer">
                          View Product
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-3">
                Complete the quiz to receive personalized supplement recommendations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={() => navigate("/meals")} className="flex-1">
          View Meal Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={() => navigate("/training")} className="flex-1">
          View Training Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuizResultsSection;
