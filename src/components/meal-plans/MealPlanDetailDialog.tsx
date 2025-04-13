
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, RefreshCw } from "lucide-react";

type Meal = {
  id: string;
  name: string;
  time: string;
  description: string;
};

type MealPlan = {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

interface MealPlanDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MealPlan | null;
  onReplaceMeal: (mealId: string) => void;
  onAddToShoppingList: (mealId: string) => void;
}

const MealPlanDetailDialog: React.FC<MealPlanDetailDialogProps> = ({
  open,
  onOpenChange,
  plan,
  onReplaceMeal,
  onAddToShoppingList
}) => {
  if (!plan) return null;

  // Sample data for macro distribution per meal (would come from API in real implementation)
  const getMealMacros = (mealId: string) => {
    const totalMeals = plan.meals.length;
    
    // Simple distribution algorithm - divide macros evenly across meals
    return {
      calories: Math.round(plan.calories / totalMeals),
      protein: Math.round(plan.protein / totalMeals),
      carbs: Math.round(plan.carbs / totalMeals),
      fat: Math.round(plan.fat / totalMeals)
    };
  };

  // Sample data for ingredients (would come from API in real implementation)
  const getMealIngredients = (mealId: string) => {
    const mealTypes: Record<string, string[]> = {
      "Breakfast": ["Eggs", "Whole grain bread", "Avocado", "Spinach"],
      "Mid-Morning Snack": ["Greek yogurt", "Mixed berries", "Honey"],
      "Lunch": ["Grilled chicken breast", "Mixed greens", "Olive oil", "Balsamic vinegar"],
      "Afternoon Snack": ["Apple", "Almonds"],
      "Dinner": ["Salmon fillet", "Quinoa", "Broccoli", "Lemon"],
      "Pre-Workout": ["Banana", "Protein bar"],
      "Before Bed": ["Cottage cheese", "Honey"]
    };

    const meal = plan.meals.find(m => m.id === mealId);
    if (!meal) return [];

    // Try to match by meal name, or return generic ingredients
    for (const [key, ingredients] of Object.entries(mealTypes)) {
      if (meal.name.includes(key)) {
        return ingredients;
      }
    }

    return ["Protein source", "Complex carbs", "Healthy fats", "Vegetables"];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan.name} - Detailed Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-muted-foreground">{plan.description}</div>
          
          {/* Macros Summary Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Daily Nutrition Totals</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Calories</span>
                  <span className="font-medium text-lg">{plan.calories}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Protein</span>
                  <span className="font-medium text-lg">{plan.protein}g</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Carbs</span>
                  <span className="font-medium text-lg">{plan.carbs}g</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Fat</span>
                  <span className="font-medium text-lg">{plan.fat}g</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed Meals Table */}
          <div>
            <h3 className="font-medium mb-3">Meal Schedule</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Nutrition</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.meals.map((meal) => {
                    const macros = getMealMacros(meal.id);
                    const ingredients = getMealIngredients(meal.id);
                    
                    return (
                      <TableRow key={meal.id}>
                        <TableCell className="font-medium">{meal.name}</TableCell>
                        <TableCell>{meal.time}</TableCell>
                        <TableCell>
                          <div>
                            <p>{meal.description}</p>
                            <div className="mt-2">
                              <span className="text-xs font-medium">Ingredients:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ingredients.map((ingredient, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {ingredient}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <div>Calories: {macros.calories}</div>
                            <div>Protein: {macros.protein}g</div>
                            <div>Carbs: {macros.carbs}g</div>
                            <div>Fat: {macros.fat}g</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onReplaceMeal(meal.id)}
                            >
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Replace
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onAddToShoppingList(meal.id)}
                            >
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              Add to List
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanDetailDialog;
