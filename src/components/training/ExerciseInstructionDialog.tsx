
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Info, Dumbbell } from "lucide-react";
import WelluraPlaylistButton from "./WelluraPlaylistButton";

interface ExerciseInstructionDialogProps {
  exercise: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  description: string;
}

// Add equipment images mapping
const equipmentImages = {
  "none": null,
  "dumbbells": "https://images.unsplash.com/photo-1584863231364-2edc166de576?w=500&auto=format&fit=crop",
  "barbell": "https://images.unsplash.com/photo-1526507303136-2850e0d332d4?w=500&auto=format&fit=crop",
  "bench": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop",
  "pull-up-bar": "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=500&auto=format&fit=crop",
  "leg-press-machine": "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=500&auto=format&fit=crop",
  "lat-pulldown-machine": "https://images.unsplash.com/photo-1604247584233-99c3f6ddfc52?w=500&auto=format&fit=crop",
  "leg-curl-machine": "https://images.unsplash.com/photo-1597347316205-38ba281a2796?w=500&auto=format&fit=crop",
  "cable-machine": "https://images.unsplash.com/photo-1598266663473-c7d0a086e932?w=500&auto=format&fit=crop",
  "parallel-bars": "https://images.unsplash.com/photo-1598266663473-c7d0a086e932?w=500&auto=format&fit=crop"
};

// Add equipment names mapping
const equipmentNames = {
  "none": "No equipment needed",
  "dumbbells": "Dumbbells",
  "barbell": "Barbell",
  "bench": "Workout Bench",
  "pull-up-bar": "Pull-up Bar",
  "leg-press-machine": "Leg Press Machine",
  "lat-pulldown-machine": "Lat Pulldown Machine",
  "leg-curl-machine": "Leg Curl Machine",
  "cable-machine": "Cable Machine",
  "parallel-bars": "Parallel Bars"
};

// Exercise equipment mapping (imported from Training.tsx)
const exerciseEquipment = {
  "Push-ups": "none",
  "Dumbbell Rows": "dumbbells",
  "Shoulder Press": "dumbbells",
  "Bicep Curls": "dumbbells",
  "Tricep Extensions": "dumbbells",
  "Squats": "none",
  "Lunges": "none",
  "Glute Bridges": "none",
  "Calf Raises": "none",
  "Plank": "none",
  "Deadlifts": "barbell",
  "Bench Press": "bench,barbell",
  "Pull-ups": "pull-up-bar",
  "Leg Press": "leg-press-machine",
  "Core Workout": "none",
  "Incline Dumbbell Press": "bench,dumbbells",
  "Chest Flyes": "dumbbells",
  "Tricep Dips": "parallel-bars",
  "Tricep Pushdowns": "cable-machine",
  "Bent-over Rows": "dumbbells",
  "Lat Pulldowns": "lat-pulldown-machine",
  "Hammer Curls": "dumbbells",
  "Leg Curls": "leg-curl-machine",
  "Plank Circuit": "none",
  "Lateral Raises": "dumbbells",
  "Front Raises": "dumbbells",
  "Skull Crushers": "bench,dumbbells",
  "Concentration Curls": "dumbbells",
  "Jump Squats": "none",
  "Burpees": "none",
  "Mountain Climbers": "none",
  "Jumping Lunges": "none",
  "High Knees": "none",
  "Push-up Jacks": "none",
  "Plank Shoulder Taps": "none",
  "Jumping Jacks": "none",
  "Plank Jacks": "none"
};

const ExerciseInstructionDialog: React.FC<ExerciseInstructionDialogProps> = ({
  exercise,
  open,
  onOpenChange,
  imageUrl,
  description
}) => {
  // Get equipment for this exercise
  const equipment = exerciseEquipment[exercise] || "none";
  const equipmentList = equipment.split(",");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            {exercise}
          </DialogTitle>
          <DialogDescription>
            Exercise Instructions and Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="rounded-md overflow-hidden bg-muted aspect-video">
              <img 
                src={imageUrl} 
                alt={exercise} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-4">
              <WelluraPlaylistButton className="w-full mt-2" />
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-primary" />
                Instructions
              </h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="font-medium mb-3">Equipment Needed</h3>
              
              {equipmentList.map((item) => (
                <div key={item} className="flex items-center mb-3">
                  {equipmentImages[item] ? (
                    <div className="w-16 h-16 rounded overflow-hidden mr-3 bg-muted flex-shrink-0">
                      <img 
                        src={equipmentImages[item]} 
                        alt={equipmentNames[item]} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center mr-3 flex-shrink-0">
                      <Dumbbell className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{equipmentNames[item]}</span>
                    {item === "none" && (
                      <p className="text-xs text-muted-foreground">This exercise uses bodyweight only</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseInstructionDialog;
