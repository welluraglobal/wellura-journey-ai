
import React, { useEffect } from "react";
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
  // Pre-load speech synthesis voices when dialog opens
  useEffect(() => {
    if (open && window.speechSynthesis) {
      // Pre-fetch voices to ensure they're available when needed
      window.speechSynthesis.getVoices();
      
      // Some browsers need a small delay to properly load voices
      const timer = setTimeout(() => {
        window.speechSynthesis.getVoices();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [open]);
  
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
