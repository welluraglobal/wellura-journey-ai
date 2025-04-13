
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QuizAnswer = {
  fitnessLevel: string;
  fitnessGoals: string[];
  preferredWorkoutTime: string;
  workoutDuration: string;
  previousInjuries: string;
};

const defaultAnswers: QuizAnswer = {
  fitnessLevel: "",
  fitnessGoals: [],
  preferredWorkoutTime: "",
  workoutDuration: "",
  previousInjuries: "none",
};

interface FitnessQuizProps {
  onComplete: (results: QuizAnswer) => void;
  onCancel: () => void;
}

const FitnessQuiz: React.FC<FitnessQuizProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>(defaultAnswers);
  const { toast } = useToast();

  const steps = [
    {
      title: "Fitness Level",
      description: "How would you describe your current fitness level?",
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
      description: "When do you prefer to work out and for how long?",
      content: (
        <div className="space-y-6">
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
        </div>
      ),
      isValid: () => !!answers.preferredWorkoutTime && !!answers.workoutDuration,
    },
    {
      title: "Health Considerations",
      description: "Do you have any previous injuries or health considerations?",
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
    } else {
      onComplete(answers);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 flex items-center text-muted-foreground text-sm">
          Step {currentStep + 1} of {steps.length}
        </div>
        <CardTitle className="flex items-center text-xl">
          <Dumbbell className="mr-2 h-5 w-5 text-primary" />
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
