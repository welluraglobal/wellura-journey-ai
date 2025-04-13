
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2, Plus } from "lucide-react";
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

interface CreateCustomPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newPlan: MealPlan) => void;
}

const CreateCustomPlanDialog: React.FC<CreateCustomPlanDialogProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [newPlan, setNewPlan] = useState<MealPlan>({
    id: `plan-${Date.now()}`,
    name: "",
    description: "",
    meals: [],
    calories: 2000,
    protein: 100,
    carbs: 200,
    fat: 70
  });

  const [newMealName, setNewMealName] = useState("");
  const [newMealTime, setNewMealTime] = useState("");
  const [newMealDescription, setNewMealDescription] = useState("");

  const handleBasicInfoChange = (
    field: "name" | "description",
    value: string
  ) => {
    setNewPlan((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMacroChange = (
    type: "calories" | "protein" | "carbs" | "fat",
    value: number
  ) => {
    setNewPlan((prev) => ({
      ...prev,
      [type]: value
    }));
  };

  const handleRemoveMeal = (mealId: string) => {
    setNewPlan((prev) => ({
      ...prev,
      meals: prev.meals.filter((meal) => meal.id !== mealId)
    }));
  };

  const handleAddMeal = () => {
    if (!newMealName || !newMealTime || !newMealDescription) return;

    const newMeal = {
      id: `m${Date.now()}`,
      name: newMealName,
      time: newMealTime,
      description: newMealDescription
    };

    setNewPlan((prev) => ({
      ...prev,
      meals: [...prev.meals, newMeal]
    }));

    // Reset fields
    setNewMealName("");
    setNewMealTime("");
    setNewMealDescription("");
  };

  const handleSave = () => {
    if (newPlan.name && newPlan.description) {
      onSave(newPlan);
      
      // Reset form for next time
      setNewPlan({
        id: `plan-${Date.now()}`,
        name: "",
        description: "",
        meals: [],
        calories: 2000,
        protein: 100,
        carbs: 200,
        fat: 70
      });
      
      onOpenChange(false);
    }
  };

  const isValid = newPlan.name && newPlan.description && newPlan.meals.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Meal Plan</DialogTitle>
          <DialogDescription>
            Build your personalized meal plan from scratch. Add meals, set nutrition goals, and customize to your needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Plan Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Plan Information</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input 
                  id="plan-name"
                  value={newPlan.name} 
                  onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                  placeholder="My Custom Plan"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea 
                  id="plan-description"
                  value={newPlan.description} 
                  onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                  placeholder="Describe your meal plan and its goals"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Calories and Macros Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Nutrition Goals</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="calories">Calories: {newPlan.calories}</Label>
                  <span className="text-sm text-muted-foreground">{newPlan.calories} kcal</span>
                </div>
                <Slider 
                  id="calories"
                  min={1000} 
                  max={4000} 
                  step={50} 
                  value={[newPlan.calories]} 
                  onValueChange={(value) => handleMacroChange("calories", value[0])}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input 
                    id="protein"
                    type="number" 
                    value={newPlan.protein} 
                    onChange={(e) => handleMacroChange("protein", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input 
                    id="carbs"
                    type="number" 
                    value={newPlan.carbs} 
                    onChange={(e) => handleMacroChange("carbs", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input 
                    id="fat"
                    type="number" 
                    value={newPlan.fat} 
                    onChange={(e) => handleMacroChange("fat", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meals Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Meals</h3>
            
            {newPlan.meals.length > 0 ? (
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
                  {newPlan.meals.map((meal) => (
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
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No meals added yet. Add your first meal below.
              </div>
            )}

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
          <Button onClick={handleSave} disabled={!isValid}>Create Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomPlanDialog;
