
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import WellyVision from "./WellyVision";

interface WellyVisionDialogProps {
  exerciseName: string;
  targetReps: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const WellyVisionDialog: React.FC<WellyVisionDialogProps> = ({
  exerciseName,
  targetReps,
  open,
  onOpenChange,
  onComplete
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-md w-[95vw] h-[90vh] p-0 bg-black text-white">
        <WellyVision 
          exerciseName={exerciseName}
          targetReps={targetReps}
          onComplete={onComplete}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WellyVisionDialog;
