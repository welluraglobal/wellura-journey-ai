
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dumbbell, Timer, RotateCcw, User, Heart, Activity, CheckCircle, ThumbsUp, ThumbsDown, Package } from "lucide-react";
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
    equipmentImages: [],
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
  "Dumbbell Rows": {
    primaryMuscles: "Upper back, Lats, Rhomboids",
    secondaryMuscles: "Biceps, Rear deltoids, Core",
    equipment: "Dumbbell, Bench (optional)",
    equipmentImages: [
      "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540558105001-5811776FBFA6?w=500&auto=format&fit=crop"
    ],
    difficulty: "Beginner to Intermediate",
    sets: "3-4",
    reps: "8-12",
    restTime: "60-90 seconds",
    tips: [
      "Keep your back flat and core engaged",
      "Pull dumbbell up to your hip/lower ribcage",
      "Keep elbow close to your body during the movement",
      "Lower the weight in a controlled manner",
      "Maintain a slight bend in the supporting knee"
    ],
    variations: [
      "Two-arm bent over rows",
      "Single-arm bench supported rows",
      "Meadows row",
      "Kroc rows (heavier weight)",
      "Incline bench rows"
    ],
    commonMistakes: [
      "Twisting the torso during the movement",
      "Using momentum/swinging the weight",
      "Lifting the weight too far up or not high enough",
      "Rounding the back",
      "Excessive neck strain from looking up"
    ],
    benefits: [
      "Builds upper back strength",
      "Improves posture",
      "Targets multiple muscle groups",
      "Unilateral training helps balance development",
      "Minimal equipment required"
    ]
  },
  "Bicep Curls": {
    primaryMuscles: "Biceps brachii",
    secondaryMuscles: "Brachialis, Brachioradialis, Forearms",
    equipment: "Dumbbells or Barbell",
    equipmentImages: [
      "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&auto=format&fit=crop"
    ],
    difficulty: "Beginner",
    sets: "3-4",
    reps: "8-15",
    restTime: "60 seconds",
    tips: [
      "Keep elbows close to sides throughout the movement",
      "Avoid swinging or using momentum",
      "Fully extend arms at the bottom position",
      "Contract biceps at the top of the movement",
      "Use controlled movements both up and down"
    ],
    variations: [
      "Hammer curls",
      "Incline bench curls",
      "Concentration curls",
      "Preacher curls",
      "Cable curls"
    ],
    commonMistakes: [
      "Using too much weight and improper form",
      "Moving the elbows forward or back",
      "Not fully extending arms at the bottom",
      "Using momentum/swinging the weights",
      "Curling too quickly"
    ],
    benefits: [
      "Strengthens biceps muscles",
      "Improves arm definition",
      "Enhances grip strength",
      "Versatile with many variations",
      "Simple to learn for beginners"
    ]
  },
  "Squats": {
    primaryMuscles: "Quadriceps, Glutes, Hamstrings",
    secondaryMuscles: "Core, Lower back, Calves",
    equipment: "None (bodyweight), Barbell, or Dumbbells optional",
    equipmentImages: [
      "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&auto=format&fit=crop"
    ],
    difficulty: "Beginner to Advanced",
    sets: "3-5",
    reps: "8-15",
    restTime: "60-120 seconds",
    tips: [
      "Keep feet shoulder-width apart or slightly wider",
      "Keep chest up and back straight",
      "Push knees outward (in line with toes)",
      "Lower until thighs are parallel to ground (or lower if mobility allows)",
      "Drive through heels to stand back up"
    ],
    variations: [
      "Front squats",
      "Goblet squats",
      "Bulgarian split squats",
      "Overhead squats",
      "Jump squats"
    ],
    commonMistakes: [
      "Knees caving inward",
      "Heels lifting off the ground",
      "Rounding the back",
      "Not reaching proper depth",
      "Looking down (instead of straight ahead or slightly up)"
    ],
    benefits: [
      "Builds lower body strength",
      "Increases mobility and flexibility",
      "Strengthens core and stabilizer muscles",
      "Improves athletic performance",
      "Burns calories efficiently"
    ]
  },
  // Default values for other exercises
  default: {
    primaryMuscles: "Various major muscle groups",
    secondaryMuscles: "Supporting muscles",
    equipment: "Varies",
    equipmentImages: [],
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

// Adding more equipment data for additional exercises
exerciseDetails["Shoulder Press"] = {
  ...exerciseDetails.default,
  primaryMuscles: "Deltoids (shoulders)",
  secondaryMuscles: "Triceps, Upper chest, Trapezius",
  equipment: "Dumbbells or Barbell",
  equipmentImages: [
    "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500&auto=format&fit=crop"
  ]
};

exerciseDetails["Tricep Extensions"] = {
  ...exerciseDetails.default,
  primaryMuscles: "Triceps",
  secondaryMuscles: "Shoulders (minor involvement)",
  equipment: "Dumbbells, Cables, or Resistance bands",
  equipmentImages: [
    "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&auto=format&fit=crop"
  ]
};

exerciseDetails["Lunges"] = {
  ...exerciseDetails.default,
  primaryMuscles: "Quadriceps, Glutes, Hamstrings",
  secondaryMuscles: "Calves, Core stabilizers",
  equipment: "None (bodyweight) or Dumbbells optional",
  equipmentImages: [
    "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop"
  ]
};

exerciseDetails["Plank"] = {
  ...exerciseDetails.default,
  primaryMuscles: "Core (rectus abdominis, transverse abdominis)",
  secondaryMuscles: "Shoulders, Chest, Lower back, Glutes",
  equipment: "None (bodyweight) or Mat for comfort",
  equipmentImages: [
    "https://images.unsplash.com/photo-1563705883268-eb58ab6f505d?w=500&auto=format&fit=crop"
  ]
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
                  <p className="text-sm mb-3">{details.equipment}</p>
                  
                  {details.equipmentImages && details.equipmentImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {details.equipmentImages.map((img, index) => (
                        <div key={index} className="rounded-md overflow-hidden bg-muted">
                          <img 
                            src={img} 
                            alt={`Equipment ${index + 1}`} 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 border rounded-md">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground ml-2">
                        {details.equipment === "None (bodyweight)" 
                          ? "No equipment needed for this exercise" 
                          : "Equipment images not available"}
                      </p>
                    </div>
                  )}
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
