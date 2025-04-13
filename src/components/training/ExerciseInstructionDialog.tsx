
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dumbbell, Timer, RotateCcw, User, Heart, Activity, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ExerciseInstructionDialogProps {
  exercise: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  description: string;
}

// Extended exercise details - these would ideally come from a database
const exerciseDetails = {
  "Push-ups": {
    primaryMuscles: "Chest, Shoulders, Triceps",
    secondaryMuscles: "Core, Lower back",
    equipment: "None (bodyweight)",
    difficulty: "Beginner to Advanced",
    sets: "3-4",
    reps: "8-15",
    restTime: "30-90 seconds",
    tips: [
      "Keep your body in a straight line from head to toe",
      "Position hands slightly wider than shoulder-width apart",
      "Lower your body until your chest nearly touches the floor",
      "Keep elbows at a 45-degree angle to your body",
      "Fully extend arms at the top without locking elbows"
    ],
    variations: [
      "Knee push-ups (easier)",
      "Incline push-ups (easier)",
      "Decline push-ups (harder)",
      "Diamond push-ups (focuses on triceps)",
      "Wide push-ups (focuses on chest)"
    ],
    commonMistakes: [
      "Sagging or arching the lower back",
      "Not going through full range of motion",
      "Flaring elbows out too much",
      "Holding breath during exercise",
      "Letting the head drop forward"
    ],
    benefits: [
      "Builds upper body strength",
      "Improves core stability",
      "Enhances shoulder stability",
      "Requires no equipment",
      "Highly versatile with many variations"
    ]
  },
  // Default values for other exercises
  default: {
    primaryMuscles: "Various major muscle groups",
    secondaryMuscles: "Supporting muscles",
    equipment: "Varies",
    difficulty: "Beginner to Advanced",
    sets: "3-4",
    reps: "8-12",
    restTime: "60-90 seconds",
    tips: [
      "Maintain proper form throughout the exercise",
      "Focus on controlled movements",
      "Breathe steadily - exhale during exertion",
      "Start with lighter weights to master form",
      "Progress gradually to avoid injury"
    ],
    variations: [
      "Lighter weight with higher reps (endurance)",
      "Heavier weight with lower reps (strength)",
      "Different grip or stance variations",
      "Tempo variations (slow negatives, pauses)",
      "Unilateral (single-side) versions when applicable"
    ],
    commonMistakes: [
      "Using momentum instead of muscle control",
      "Poor posture or body alignment",
      "Rushing through repetitions",
      "Inadequate range of motion",
      "Overtraining without proper rest"
    ],
    benefits: [
      "Increases muscle strength and/or endurance",
      "Improves joint stability and function",
      "Enhances coordination and balance",
      "Contributes to better posture",
      "Aids in preventing injuries when done properly"
    ]
  }
};

const ExerciseInstructionDialog: React.FC<ExerciseInstructionDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  imageUrl,
  description
}) => {
  const details = exerciseDetails[exercise] || exerciseDetails.default;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {exercise}
          </DialogTitle>
          <DialogDescription>
            Detailed instructions and information for proper form and execution
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="instructions" className="w-full mt-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="form">Proper Form</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instructions" className="mt-4 space-y-4">
            <div className="rounded-md overflow-hidden bg-muted mb-4">
              <img 
                src={imageUrl} 
                alt={exercise} 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Instructions</h3>
              <p className="text-muted-foreground">{description}</p>
              
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-sm">Sets: {details.sets}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span className="text-sm">Reps: {details.reps}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">Difficulty: {details.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm">Rest: {details.restTime}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mt-4">Key Tips</h3>
              <ul className="space-y-2">
                {details.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="muscles">
                <AccordionTrigger>Target Muscles</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-sm">Primary:</span>
                      <span className="text-sm ml-2">{details.primaryMuscles}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-sm">Secondary:</span>
                      <span className="text-sm ml-2">{details.secondaryMuscles}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="equipment">
                <AccordionTrigger>Equipment Needed</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm">{details.equipment}</p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="variations">
                <AccordionTrigger>Exercise Variations</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {details.variations.map((variation, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Activity className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                        {variation}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="benefits">
                <AccordionTrigger>Benefits</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {details.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <ThumbsUp className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          <TabsContent value="form" className="mt-4">
            <h3 className="font-semibold text-lg mb-3">Common Mistakes to Avoid</h3>
            <ul className="space-y-2 mb-6">
              {details.commonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ThumbsDown className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                  <span className="text-sm">{mistake}</span>
                </li>
              ))}
            </ul>
            
            <div className="rounded-md overflow-hidden bg-muted">
              <img 
                src={imageUrl} 
                alt={`${exercise} form`}
                className="w-full h-64 object-cover"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseInstructionDialog;
