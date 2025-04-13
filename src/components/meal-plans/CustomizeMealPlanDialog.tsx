
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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

interface CustomizeMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MealPlan | null;
  onSave: (updatedPlan: MealPlan) => void;
}

const CustomizeMealPlanDialog: React.FC<CustomizeMealPlanDialogProps> = ({
  open,
  onOpenChange,
  plan,
  onSave
}) => {
  const [customPlan, setCustomPlan] = useState<MealPlan | null>(plan);
  const [newMealName, setNewMealName] = useState("");
  const [newMealTime, setNewMealTime] = useState("");
  const [newMealDescription, setNewMealDescription] = useState("");

  // Reset form when plan changes
  React.useEffect(() => {
    setCustomPlan(plan);
  }, [plan]);

  if (!customPlan) return null;

  const handleMacroChange = (
    type: "calories" | "protein" | "carbs" | "fat",
    value: number
  ) => {
    setCustomPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [type]: value
      };
    });
  };

  const handleRemoveMeal = (mealId: string) => {
    setCustomPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meals: prev.meals.filter((meal) => meal.id !== mealId)
      };
    });
  };

  const handleAddMeal = () => {
    if (!newMealName || !newMealTime || !newMealDescription) return;

    setCustomPlan((prev) => {
      if (!prev) return prev;
      const newMeal = {
        id: `m${Date.now()}`,
        name: newMealName,
        time: newMealTime,
        description: newMealDescription
      };
      return {
        ...prev,
        meals: [...prev.meals, newMeal]
      };
    });

    // Reset fields
    setNewMealName("");
    setNewMealTime("");
    setNewMealDescription("");
  };

  const handleSave = () => {
    if (customPlan) {
      onSave(customPlan);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Meal Plan: {customPlan.name}</DialogTitle>
          <DialogDescription>
            Adjust your calories, macros, and meals to meet your specific needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calories and Macros Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Nutrition Goals</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="calories">Calories: {customPlan.calories}</Label>
                  <span className="text-sm text-muted-foreground">{customPlan.calories} kcal</span>
                </div>
                <Slider 
                  id="calories"
                  min={1000} 
                  max={4000} 
                  step={50} 
                  value={[customPlan.calories]} 
                  onValueChange={(value) => handleMacroChange("calories", value[0])}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input 
                    id="protein"
                    type="number" 
                    value={customPlan.protein} 
                    onChange={(e) => handleMacroChange("protein", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input 
                    id="carbs"
                    type="number" 
                    value={customPlan.carbs} 
                    onChange={(e) => handleMacroChange("carbs", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input 
                    id="fat"
                    type="number" 
                    value={customPlan.fat} 
                    onChange={(e) => handleMacroChange("fat", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meals Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Meals</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customPlan.meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">{meal.name}</TableCell>
                    <TableCell>{meal.time}</TableCell>
                    <TableCell>{meal.description}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMeal(meal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add New Meal */}
            <div className="space-y-3 border p-4 rounded-md">
              <h4 className="font-medium">Add New Meal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="meal-name">Meal Name</Label>
                  <Input 
                    id="meal-name"
                    value={newMealName} 
                    onChange={(e) => setNewMealName(e.target.value)}
                    placeholder="Breakfast"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meal-time">Time</Label>
                  <Input 
                    id="meal-time"
                    value={newMealTime} 
                    onChange={(e) => setNewMealTime(e.target.value)}
                    placeholder="8:00 AM"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meal-description">Description</Label>
                  <Input 
                    id="meal-description"
                    value={newMealDescription} 
                    onChange={(e) => setNewMealDescription(e.target.value)}
                    placeholder="Oatmeal with fruits"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddMeal}
                disabled={!newMealName || !newMealTime || !newMealDescription}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeMealPlanDialog;
