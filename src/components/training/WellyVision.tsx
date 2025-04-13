
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Volume2, Volume1, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeviceSize, useOrientation } from "@/hooks/use-mobile";
import WelluraPlaylistButton from "./WelluraPlaylistButton";

interface WellyVisionProps {
  exerciseName: string;
  targetReps: number;
  onComplete: () => void;
  onClose: () => void;
}

const WellyVision: React.FC<WellyVisionProps> = ({
  exerciseName,
  targetReps = 10,
  onComplete,
  onClose
}) => {
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [feedbackMode, setFeedbackMode] = useState<"motivational" | "technical">("motivational");
  const [language, setLanguage] = useState<"en" | "pt-br">("en");
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();
  const deviceSize = useDeviceSize();
  const orientation = useOrientation();
  
  // Simulated squat detection
  const [isSquatting, setIsSquatting] = useState(false);
  const [squatProgress, setSquatProgress] = useState(0);
  
  // Mock detection timer for demo purposes
  useEffect(() => {
    if (!isActive) return;
    
    let mockDetectionInterval = setInterval(() => {
      // Simulate squat detection - in real implementation this would use
      // camera data and MediaPipe pose detection
      if (!isSquatting && Math.random() > 0.7) {
        setIsSquatting(true);
        setSquatProgress(0);
        console.log("Squat started");
      }
      
      if (isSquatting) {
        setSquatProgress(prev => {
          const newProgress = prev + (Math.random() * 20);
          if (newProgress >= 100) {
            // Complete rep
            setIsSquatting(false);
            setRepCount(prev => {
              const newCount = prev + 1;
              provideFeedback(newCount, targetReps);
              return newCount;
            });
            console.log("Squat completed");
            return 0;
          }
          return newProgress;
        });
      }
    }, 500);
    
    return () => clearInterval(mockDetectionInterval);
  }, [isActive, isSquatting, targetReps]);
  
  // Check for workout completion
  useEffect(() => {
    if (repCount >= targetReps) {
      // Workout completed
      playFeedback("Workout completed! You crushed it!");
      setIsActive(false);
      
      // Delay to allow final feedback to be heard
      setTimeout(() => {
        onComplete();
        toast({
          title: "Workout Completed!",
          description: `You completed ${targetReps} ${exerciseName} reps. Great job!`,
        });
      }, 2500);
    }
  }, [repCount, targetReps, exerciseName, onComplete]);
  
  // Initialize camera
  useEffect(() => {
    if (isActive && videoRef.current) {
      initCamera();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);
  
  const initCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: "user" }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        toast({
          title: "Camera Active",
          description: "Welly is now watching your form!",
        });
        
        // In a real implementation, we would initialize MediaPipe here
        console.log("MediaPipe would be initialized here for pose detection");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive"
      });
      setIsActive(false);
    }
  };
  
  const provideFeedback = (currentRep: number, targetReps: number) => {
    const now = Date.now();
    // Limit feedback frequency to avoid overwhelming the user
    if (now - lastFeedbackTime < 3000) return; 
    
    let feedback = "";
    const remainingReps = targetReps - currentRep;
    
    if (feedbackMode === "motivational") {
      if (remainingReps > 0) {
        const phrases = [
          `Let's go! Only ${remainingReps} more!`,
          `You're doing great! ${remainingReps} to go!`,
          `Keep pushing! ${remainingReps} left!`,
          `You've got this! Just ${remainingReps} more!`
        ];
        feedback = phrases[Math.floor(Math.random() * phrases.length)];
      } else {
        feedback = "Final rep! You crushed it!";
      }
    } else {
      // Technical mode - this would include form feedback
      feedback = "Keep your back straight and knees aligned";
    }
    
    playFeedback(feedback);
    setLastFeedbackTime(now);
  };
  
  const playFeedback = (text: string) => {
    // In a real implementation, this would use the device's text-to-speech
    // with appropriate language settings
    console.log(`Voice feedback: ${text}`);
    
    // Mock text-to-speech for demo
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "en" ? "en-US" : "pt-BR";
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const toggleFeedbackMode = () => {
    setFeedbackMode(prev => prev === "motivational" ? "technical" : "motivational");
    toast({
      title: "Feedback Mode Changed",
      description: `Switched to ${feedbackMode === "motivational" ? "technical" : "motivational"} feedback mode`,
    });
  };
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "pt-br" : "en");
    toast({
      title: "Language Changed",
      description: `Switched to ${language === "en" ? "Portuguese" : "English"}`,
    });
  };
  
  const startWorkout = () => {
    setIsActive(true);
    setRepCount(0);
  };
  
  const stopWorkout = () => {
    setIsActive(false);
    if (repCount > 0) {
      onComplete();
    }
    onClose();
  };
  
  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="relative flex-1 overflow-hidden">
        {isActive ? (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover mirror-mode"
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full" 
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/50 text-white rounded-full" 
                onClick={stopWorkout}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="bg-black/50 px-4 py-2 rounded-full text-lg font-bold">
                {repCount} / {targetReps}
              </div>
            </div>
            
            {/* Squat progress indicator */}
            {isSquatting && (
              <div className="absolute bottom-20 left-4 right-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${squatProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-black/50 text-white" 
                onClick={toggleFeedbackMode}
              >
                {feedbackMode === "motivational" ? (
                  <Volume2 className="h-4 w-4 mr-2" />
                ) : (
                  <Volume1 className="h-4 w-4 mr-2" />
                )}
                {feedbackMode === "motivational" ? "Motivational" : "Technical"}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-black/50 text-white" 
                onClick={toggleLanguage}
              >
                {language === "en" ? "EN" : "PT-BR"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Camera className="h-16 w-16 mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Welly Vision</h2>
            <p className="mb-6 text-gray-300">
              Your AI personal trainer will count your {exerciseName} reps and provide real-time feedback
            </p>
            
            <Button onClick={startWorkout} className="mb-4 w-full">
              START WORKOUT WITH WELLY
            </Button>
            
            <WelluraPlaylistButton variant="ghost" className="w-full" />
          </div>
        )}
      </div>
      
      {!isActive && (
        <div className="p-4 border-t border-gray-800">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Return to Workout
          </Button>
        </div>
      )}
    </div>
  );
};

export default WellyVision;
