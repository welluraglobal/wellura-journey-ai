
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Dumbbell, ActivitySquare, Apple, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/contexts/UserContext";

type QuizAnswer = {
  // Personal metrics
  age: string;
  gender: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  waistCircumference: string;
  
  // Fitness
  fitnessLevel: string;
  fitnessGoals: string[];
  preferredWorkoutTime: string;
  workoutDuration: string;
  workoutFrequency: string;
  equipmentAccess: string;
  previousInjuries: string;
  
  // Nutrition
  dietaryPreference: string;
  mealFrequency: string;
  foodAllergies: string[];
  waterIntake: string;
  appetiteLevel: string;
  digestiveIssues: string;
  
  // Lifestyle
  sleepQuality: string;
  stressLevel: string;
  energyLevel: string;
  focusLevel: string;
  immunityStrength: string;
  recoveryRate: string;
};

const defaultAnswers: QuizAnswer = {
  age: "",
  gender: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  waistCircumference: "",
  
  fitnessLevel: "",
  fitnessGoals: [],
  preferredWorkoutTime: "",
  workoutDuration: "",
  workoutFrequency: "",
  equipmentAccess: "",
  previousInjuries: "none",
  
  dietaryPreference: "",
  mealFrequency: "",
  foodAllergies: [],
  waterIntake: "",
  appetiteLevel: "",
  digestiveIssues: "",
  
  sleepQuality: "",
  stressLevel: "",
  energyLevel: "",
  focusLevel: "",
  immunityStrength: "",
  recoveryRate: "",
};

interface FitnessQuizProps {
  onComplete: (results: QuizAnswer) => void;
  onCancel: () => void;
  initialData?: Partial<QuizAnswer>;
}

const FitnessQuiz: React.FC<FitnessQuizProps> = ({ onComplete, onCancel, initialData }) => {
  const { userProfile } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({...defaultAnswers, ...initialData});
  const { toast } = useToast();
  const [stepCategory, setStepCategory] = useState<'personal' | 'fitness' | 'nutrition' | 'lifestyle'>('personal');

  // Check if user has quiz data and prefill answers if available
  useEffect(() => {
    if (!initialData && userProfile?.quiz_data?.answers) {
      setAnswers(prev => ({
        ...prev,
        ...userProfile.quiz_data.answers
      }));
      
      toast({
        title: "Quiz Pre-filled",
        description: "We've loaded your previous quiz answers"
      });
    }
  }, [userProfile, initialData, toast]);

  const steps = [
    // Personal metrics section
    {
      title: "Personal Information",
      description: "Let's start with some basic information about you",
      category: 'personal',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Your age"
                value={answers.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                value={answers.gender}
                onValueChange={(value) => handleChange("gender", value)}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="male" id="gender-male" />
                  <Label htmlFor="gender-male" className="cursor-pointer flex-1">Male</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value="female" id="gender-female" />
                  <Label htmlFor="gender-female" className="cursor-pointer flex-1">Female</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Your height in cm"
                value={answers.height}
                onChange={(e) => handleChange("height", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waistCircumference">Waist Circumference (cm) <span className="text-muted-foreground">(Optional)</span></Label>
              <Input
                id="waistCircumference"
                type="number"
                placeholder="Your waist measurement in cm (optional)"
                value={answers.waistCircumference}
                onChange={(e) => handleChange("waistCircumference", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                placeholder="Your current weight"
                value={answers.currentWeight}
                onChange={(e) => handleChange("currentWeight", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                placeholder="Your goal weight"
                value={answers.targetWeight}
                onChange={(e) => handleChange("targetWeight", e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
      isValid: () => {
        // Remove waistCircumference from required fields
        const requiredFields = ['age', 'gender', 'height', 'currentWeight', 'targetWeight'];
        return requiredFields.every(field => !!answers[field as keyof QuizAnswer]);
      },
    },
    
    // Fitness section
    {
      title: "Fitness Level",
      description: "How would you describe your current fitness level?",
      category: 'fitness',
      content: (
        <RadioGroup
          value={answers.fitnessLevel}
          onValueChange={(value) => handleChange("fitnessLevel", value)}
          className="grid gap-3"
        >
          {[
            { value: "beginner", label: "Beginner - New to regular exercise" },
            { value: "intermediate", label: "Intermediate - Exercise 1-3 times weekly" },
            { value: "advanced", label: "Advanced - Exercise 4+ times weekly" },
            { value: "athletic", label: "Athletic - Competitive sports or training" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
      isValid: () => !!answers.fitnessLevel,
    },
    {
      title: "Fitness Goals",
      description: "What are your primary fitness goals? (Select up to 3)",
      category: 'fitness',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: "lose-weight", label: "Lose Weight" },
            { id: "build-muscle", label: "Build Muscle" },
            { id: "increase-endurance", label: "Increase Endurance" },
            { id: "improve-flexibility", label: "Improve Flexibility" },
            { id: "strength-training", label: "Strength Training" },
            { id: "overall-fitness", label: "Overall Fitness" },
          ].map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer ${
                answers.fitnessGoals.includes(goal.id) ? "bg-secondary border-primary" : ""
              }`}
            >
              <Checkbox
                id={goal.id}
                checked={answers.fitnessGoals.includes(goal.id)}
                onCheckedChange={(checked) => {
                  handleGoalToggle(goal.id, checked === true);
                }}
              />
              <Label htmlFor={goal.id} className="cursor-pointer flex-1">{goal.label}</Label>
            </div>
          ))}
        </div>
      ),
      isValid: () => answers.fitnessGoals.length > 0 && answers.fitnessGoals.length <= 3,
    },
    {
      title: "Workout Preferences",
      description: "Tell us about your preferred workout schedule",
      category: 'fitness',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">How often do you want to workout per week?</h3>
            <RadioGroup
              value={answers.workoutFrequency}
              onValueChange={(value) => handleChange("workoutFrequency", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "1-2", label: "1-2 days" },
                { value: "3-4", label: "3-4 days" },
                { value: "5+", label: "5+ days" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`freq-${option.value}`} />
                  <Label htmlFor={`freq-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">Preferred time of day</h3>
            <RadioGroup
              value={answers.preferredWorkoutTime}
              onValueChange={(value) => handleChange("preferredWorkoutTime", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "morning", label: "Morning" },
                { value: "afternoon", label: "Afternoon" },
                { value: "evening", label: "Evening" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`time-${option.value}`} />
                  <Label htmlFor={`time-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">Typical workout duration</h3>
            <RadioGroup
              value={answers.workoutDuration}
              onValueChange={(value) => handleChange("workoutDuration", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "15-30min", label: "15-30 minutes" },
                { value: "30-60min", label: "30-60 minutes" },
                { value: "60+min", label: "60+ minutes" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`duration-${option.value}`} />
                  <Label htmlFor={`duration-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">What equipment do you have access to?</h3>
            <RadioGroup
              value={answers.equipmentAccess}
              onValueChange={(value) => handleChange("equipmentAccess", value)}
              className="grid gap-3"
            >
              {[
                { value: "none", label: "None (bodyweight only)" },
                { value: "minimal", label: "Minimal (resistance bands, few dumbbells)" },
                { value: "home-gym", label: "Home gym setup" },
                { value: "full-gym", label: "Full gym membership" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`equip-${option.value}`} />
                  <Label htmlFor={`equip-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),
      isValid: () => !!answers.workoutFrequency && !!answers.preferredWorkoutTime && !!answers.workoutDuration && !!answers.equipmentAccess,
    },
    {
      title: "Health Considerations",
      description: "Do you have any previous injuries or health considerations?",
      category: 'fitness',
      content: (
        <RadioGroup
          value={answers.previousInjuries}
          onValueChange={(value) => handleChange("previousInjuries", value)}
          className="grid gap-3"
        >
          {[
            { value: "none", label: "No injuries or health concerns" },
            { value: "back", label: "Back issues" },
            { value: "knee", label: "Knee problems" },
            { value: "shoulder", label: "Shoulder injuries" },
            { value: "joint", label: "Joint pain" },
            { value: "other", label: "Other health considerations" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`injury-${option.value}`} />
              <Label htmlFor={`injury-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
      isValid: () => !!answers.previousInjuries,
    },
    
    // Nutrition section
    {
      title: "Dietary Preferences",
      description: "What type of diet do you follow?",
      category: 'nutrition',
      content: (
        <RadioGroup
          value={answers.dietaryPreference}
          onValueChange={(value) => handleChange("dietaryPreference", value)}
          className="grid gap-3"
        >
          {[
            { value: "omnivore", label: "Omnivore (everything)" },
            { value: "vegetarian", label: "Vegetarian" },
            { value: "vegan", label: "Vegan" },
            { value: "pescatarian", label: "Pescatarian" },
            { value: "keto", label: "Keto / Low-carb" },
            { value: "paleo", label: "Paleo" },
            { value: "mediterranean", label: "Mediterranean" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
              <RadioGroupItem value={option.value} id={`diet-${option.value}`} />
              <Label htmlFor={`diet-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      ),
      isValid: () => !!answers.dietaryPreference,
    },
    {
      title: "Food Allergies & Intolerances",
      description: "Do you have any of these allergies or intolerances?",
      category: 'nutrition',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: "gluten", label: "Gluten" },
            { id: "dairy", label: "Dairy" },
            { id: "nuts", label: "Nuts" },
            { id: "soy", label: "Soy" },
            { id: "eggs", label: "Eggs" },
            { id: "shellfish", label: "Shellfish" },
            { id: "none", label: "No allergies" },
          ].map((allergen) => (
            <div
              key={allergen.id}
              className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer ${
                answers.foodAllergies.includes(allergen.id) ? "bg-secondary border-primary" : ""
              }`}
            >
              <Checkbox
                id={`allergy-${allergen.id}`}
                checked={answers.foodAllergies.includes(allergen.id)}
                onCheckedChange={(checked) => {
                  handleAllergyToggle(allergen.id, checked === true);
                }}
              />
              <Label htmlFor={`allergy-${allergen.id}`} className="cursor-pointer flex-1">{allergen.label}</Label>
            </div>
          ))}
        </div>
      ),
      isValid: () => answers.foodAllergies.length > 0,
    },
    {
      title: "Nutrition Habits",
      description: "Tell us about your eating and drinking habits",
      category: 'nutrition',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">How many meals do you typically eat per day?</h3>
            <RadioGroup
              value={answers.mealFrequency}
              onValueChange={(value) => handleChange("mealFrequency", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "1-2", label: "1-2 meals" },
                { value: "3", label: "3 meals" },
                { value: "4-5", label: "4-5 meals" },
                { value: "6+", label: "6+ meals/snacks" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`meals-${option.value}`} />
                  <Label htmlFor={`meals-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">How would you describe your water intake?</h3>
            <RadioGroup
              value={answers.waterIntake}
              onValueChange={(value) => handleChange("waterIntake", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {[
                { value: "low", label: "Low (less than 1L daily)" },
                { value: "moderate", label: "Moderate (1-2L daily)" },
                { value: "high", label: "High (2L+ daily)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`water-${option.value}`} />
                  <Label htmlFor={`water-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">How would you describe your appetite level?</h3>
            <RadioGroup
              value={answers.appetiteLevel}
              onValueChange={(value) => handleChange("appetiteLevel", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "low", label: "Low (often not hungry)" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High (often hungry)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`appetite-${option.value}`} />
                  <Label htmlFor={`appetite-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">Do you experience digestive issues?</h3>
            <RadioGroup
              value={answers.digestiveIssues}
              onValueChange={(value) => handleChange("digestiveIssues", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {[
                { value: "none", label: "No issues" },
                { value: "occasional", label: "Occasional discomfort" },
                { value: "frequent", label: "Frequent problems" },
                { value: "severe", label: "Severe issues" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`digestive-${option.value}`} />
                  <Label htmlFor={`digestive-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),
      isValid: () => !!answers.mealFrequency && !!answers.waterIntake && !!answers.appetiteLevel && !!answers.digestiveIssues,
    },
    
    // Lifestyle and supplement section
    {
      title: "Energy & Recovery",
      description: "Tell us about your energy levels and recovery",
      category: 'lifestyle',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">How would you rate your daily energy levels?</h3>
            <RadioGroup
              value={answers.energyLevel}
              onValueChange={(value) => handleChange("energyLevel", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "low", label: "Low (often tired)" },
                { value: "moderate", label: "Moderate (varies)" },
                { value: "high", label: "High (energetic)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`energy-${option.value}`} />
                  <Label htmlFor={`energy-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">How well do you recover after exercise?</h3>
            <RadioGroup
              value={answers.recoveryRate}
              onValueChange={(value) => handleChange("recoveryRate", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "slow", label: "Slow (takes days)" },
                { value: "average", label: "Average" },
                { value: "fast", label: "Fast (ready next day)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`recovery-${option.value}`} />
                  <Label htmlFor={`recovery-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),
      isValid: () => !!answers.energyLevel && !!answers.recoveryRate,
    },
    {
      title: "Sleep & Stress",
      description: "Tell us about your sleep quality and stress levels",
      category: 'lifestyle',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">How would you rate your sleep quality?</h3>
            <RadioGroup
              value={answers.sleepQuality}
              onValueChange={(value) => handleChange("sleepQuality", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "poor", label: "Poor (trouble sleeping)" },
                { value: "fair", label: "Fair (could be better)" },
                { value: "good", label: "Good (sleep well)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`sleep-${option.value}`} />
                  <Label htmlFor={`sleep-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">How would you describe your stress levels?</h3>
            <RadioGroup
              value={answers.stressLevel}
              onValueChange={(value) => handleChange("stressLevel", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "low", label: "Low (rarely stressed)" },
                { value: "moderate", label: "Moderate (sometimes stressed)" },
                { value: "high", label: "High (often stressed)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`stress-${option.value}`} />
                  <Label htmlFor={`stress-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),
      isValid: () => !!answers.sleepQuality && !!answers.stressLevel,
    },
    {
      title: "Focus & Immunity",
      description: "Tell us about your concentration and immune system",
      category: 'lifestyle',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">How would you rate your ability to focus?</h3>
            <RadioGroup
              value={answers.focusLevel}
              onValueChange={(value) => handleChange("focusLevel", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "poor", label: "Poor (easily distracted)" },
                { value: "moderate", label: "Moderate (varies)" },
                { value: "good", label: "Good (can concentrate well)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`focus-${option.value}`} />
                  <Label htmlFor={`focus-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="mb-3 font-medium">How would you describe your immune system?</h3>
            <RadioGroup
              value={answers.immunityStrength}
              onValueChange={(value) => handleChange("immunityStrength", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {[
                { value: "weak", label: "Weak (get sick often)" },
                { value: "average", label: "Average" },
                { value: "strong", label: "Strong (rarely sick)" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={option.value} id={`immunity-${option.value}`} />
                  <Label htmlFor={`immunity-${option.value}`} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      ),
      isValid: () => !!answers.focusLevel && !!answers.immunityStrength,
    },
  ];

  const handleChange = (field: keyof QuizAnswer, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoalToggle = (goalId: string, isChecked: boolean) => {
    setAnswers((prev) => {
      if (isChecked) {
        // Don't add if already at 3 goals
        if (prev.fitnessGoals.length >= 3) {
          toast({
            title: "Maximum Goals Reached",
            description: "You can select up to 3 fitness goals",
          });
          return prev;
        }
        return {
          ...prev,
          fitnessGoals: [...prev.fitnessGoals, goalId],
        };
      } else {
        return {
          ...prev,
          fitnessGoals: prev.fitnessGoals.filter((id) => id !== goalId),
        };
      }
    });
  };

  const handleAllergyToggle = (allergyId: string, isChecked: boolean) => {
    setAnswers((prev) => {
      // Handle "No allergies" selection specially
      if (allergyId === "none" && isChecked) {
        return {
          ...prev,
          foodAllergies: ["none"]
        };
      }
      
      // If selecting something other than "none", remove "none" from the list
      let newAllergies = isChecked 
        ? [...prev.foodAllergies.filter(a => a !== "none"), allergyId]
        : prev.foodAllergies.filter(a => a !== allergyId);
        
      return {
        ...prev,
        foodAllergies: newAllergies
      };
    });
  };

  const goToNextStep = () => {
    const currentStepData = steps[currentStep];
    
    if (!currentStepData.isValid()) {
      toast({
        title: "Please Complete This Step",
        description: "Please answer all questions before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Update the category when changing steps
      const nextCategory = steps[currentStep + 1].category as 'personal' | 'fitness' | 'nutrition' | 'lifestyle';
      setStepCategory(nextCategory);
    } else {
      onComplete(answers);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      // Update the category when changing steps
      const prevCategory = steps[currentStep - 1].category as 'personal' | 'fitness' | 'nutrition' | 'lifestyle';
      setStepCategory(prevCategory);
    } else {
      onCancel();
    }
  };

  // Set initial step category
  useEffect(() => {
    setStepCategory(steps[currentStep].category as 'personal' | 'fitness' | 'nutrition' | 'lifestyle');
  }, [currentStep]);

  const currentStepData = steps[currentStep];
  
  // Calculate progress percentage - completing the truncated line
  const progressPercentage = Math.round(((currentStep + 1) / steps.length) * 100);

  // Get category icon
  const getCategoryIcon = () => {
    switch (stepCategory) {
      case 'personal':
        return <ActivitySquare className="mr-2 h-5 w-5 text-primary" />;
      case 'fitness':
        return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
      case 'nutrition':
        return <Apple className="mr-2 h-5 w-5 text-primary" />;
      case 'lifestyle':
        return <Pill className="mr-2 h-5 w-5 text-primary" />;
      default:
        return <Dumbbell className="mr-2 h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 flex items-center text-muted-foreground text-sm">
          Step {currentStep + 1} of {steps.length} ({progressPercentage}%)
        </div>
        <CardTitle className="flex items-center text-xl">
          {getCategoryIcon()}
          {currentStepData.title}
        </CardTitle>
        <CardDescription>{currentStepData.description}</CardDescription>
      </CardHeader>
      <CardContent>{currentStepData.content}</CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>
        <Button onClick={goToNextStep}>
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FitnessQuiz;
