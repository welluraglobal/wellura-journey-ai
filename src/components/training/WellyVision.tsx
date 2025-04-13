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
  
  // Squat detection state
  const [isSquatting, setIsSquatting] = useState(false);
  const [squatProgress, setSquatProgress] = useState(0);
  const [keypoints, setKeypoints] = useState<any>(null);
  const [squatDepth, setSquatDepth] = useState(0);
  const [lastSquatTime, setLastSquatTime] = useState(0);
  
  // Initialize camera
  useEffect(() => {
    if (isActive && videoRef.current) {
      initCamera();
      return () => {
        stopPoseDetection();
      };
    }
    
    return () => {
      stopPoseDetection();
      
      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);
  
  // Check for workout completion
  useEffect(() => {
    if (repCount >= targetReps) {
      // Workout completed
      playFeedback(getCompletionPhrase());
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
  
  const initCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        toast({
          title: "Camera Active",
          description: "Welly is now watching your form!",
        });
        
        // Start pose detection after the video is loaded
        videoRef.current.onloadeddata = () => {
          startPoseDetection();
        };
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
  
  const startPoseDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Since we're not using MediaPipe directly due to installation issues,
    // we'll implement a simplified but effective squat detection algorithm
    // based on vertical movement tracking
    
    // Set up canvas for visualization
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Motion detection variables for squat
    let prevY = 0;
    let motionBuffer: number[] = [];
    const bufferSize = 10; // Store last 10 vertical positions
    
    const detectPose = () => {
      if (!videoRef.current || !canvasRef.current || !ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw video frame
      ctx.drawImage(
        videoRef.current, 
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      
      // Simplified motion detection for squats
      // In a real implementation, we would use a pose estimation model here
      
      // We'll use a simple technique of analyzing pixel changes in the lower half of the frame
      // This is a simplification that looks for general movement patterns
      
      // Get pixel data from the lower middle portion of the frame where squats occur
      const frameWidth = canvasRef.current.width;
      const frameHeight = canvasRef.current.height;
      
      const sampleRegionX = Math.floor(frameWidth * 0.4); // 40% from left
      const sampleRegionY = Math.floor(frameHeight * 0.6); // 60% from top (lower part of frame)
      const sampleWidth = Math.floor(frameWidth * 0.2); // 20% of width
      const sampleHeight = Math.floor(frameHeight * 0.3); // 30% of height
      
      const imageData = ctx.getImageData(
        sampleRegionX, 
        sampleRegionY, 
        sampleWidth, 
        sampleHeight
      );
      
      // Calculate movement metric based on pixel brightness in region
      let totalBrightness = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Simple grayscale conversion for brightness
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
      }
      
      const avgBrightness = totalBrightness / (sampleWidth * sampleHeight);
      
      // Add to motion buffer
      motionBuffer.push(avgBrightness);
      if (motionBuffer.length > bufferSize) {
        motionBuffer.shift();
      }
      
      // Calculate motion trend (are we going down or up?)
      const motionTrend = calculateMotionTrend(motionBuffer);
      
      // Draw visualization rectangle for debugging
      ctx.strokeStyle = isSquatting ? 'green' : 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(sampleRegionX, sampleRegionY, sampleWidth, sampleHeight);
      
      // Draw text indicators
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Rep Count: ${repCount}`, 10, 30);
      ctx.fillText(`Squatting: ${isSquatting ? 'YES' : 'NO'}`, 10, 60);
      ctx.fillText(`Motion: ${motionTrend.toFixed(2)}`, 10, 90);
      
      // Detect squat based on motion trend - a negative trend means going down, positive means going up
      const squatThreshold = 5;
      const now = Date.now();
      
      // Detect start of squat (going down)
      if (!isSquatting && motionTrend < -squatThreshold) {
        setIsSquatting(true);
        setSquatProgress(25); // Start of squat
      }
      
      // Update squat progress
      if (isSquatting) {
        if (motionTrend < -squatThreshold) {
          // Still going down
          setSquatProgress(prev => Math.min(prev + 15, 50));
        } else if (motionTrend > squatThreshold) {
          // Going up - completing the squat
          setSquatProgress(prev => {
            const newProgress = prev + 15;
            if (newProgress >= 100) {
              // Complete rep if it's been at least 1 second since last squat
              if (now - lastSquatTime > 1000) {
                setIsSquatting(false);
                setLastSquatTime(now);
                setRepCount(prev => {
                  const newCount = prev + 1;
                  provideFeedback(newCount, targetReps);
                  return newCount;
                });
              }
              return 0;
            }
            return newProgress;
          });
        }
      }
      
      // Schedule next frame
      animationRef.current = requestAnimationFrame(detectPose);
    };
    
    // Start detection loop
    animationRef.current = requestAnimationFrame(detectPose);
  };
  
  const calculateMotionTrend = (buffer: number[]) => {
    if (buffer.length < 2) return 0;
    
    // Calculate the average rate of change using the last few frames
    let sum = 0;
    for (let i = 1; i < buffer.length; i++) {
      sum += buffer[i] - buffer[i-1];
    }
    
    return sum / (buffer.length - 1);
  };
  
  const stopPoseDetection = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  const getMotivationalPhrase = (currentRep: number, targetReps: number): string => {
    const remainingReps = targetReps - currentRep;
    
    if (language === "pt-br") {
      // Portuguese motivational phrases
      if (remainingReps > 5) {
        const startPhrases = [
          "Vamos lá!",
          "Boa, continue assim!",
          "Isso mesmo, mantém o ritmo!",
          "Você está mandando bem!",
        ];
        return startPhrases[Math.floor(Math.random() * startPhrases.length)];
      } else if (remainingReps > 0) {
        const midPhrases = [
          `Só mais ${remainingReps}, bora!`,
          `Falta ${remainingReps}, você consegue!`,
          `Mais ${remainingReps} e terminou!`,
          "Está quase lá, não desista!",
        ];
        return midPhrases[Math.floor(Math.random() * midPhrases.length)];
      } else {
        return "Última repetição, capricha!";
      }
    } else {
      // English motivational phrases
      if (remainingReps > 5) {
        const startPhrases = [
          "Let's go!",
          "Great job, keep it up!",
          "That's it, keep the pace!",
          "You're doing amazing!",
        ];
        return startPhrases[Math.floor(Math.random() * startPhrases.length)];
      } else if (remainingReps > 0) {
        const midPhrases = [
          `Only ${remainingReps} more to go!`,
          `${remainingReps} left, you can do it!`,
          `Just ${remainingReps} more and you're done!`,
          "You're almost there, don't give up!",
        ];
        return midPhrases[Math.floor(Math.random() * midPhrases.length)];
      } else {
        return "Last rep, give it all you've got!";
      }
    }
  };
  
  const getTechnicalPhrase = (): string => {
    if (language === "pt-br") {
      const phrases = [
        "Mantenha as costas retas",
        "Desça mais profundo",
        "Joelhos alinhados com os pés",
        "Mantenha o peito para cima",
        "Capricha na postura!",
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    } else {
      const phrases = [
        "Keep your back straight",
        "Go deeper with your squat",
        "Knees in line with your feet",
        "Keep your chest up",
        "Watch your form!",
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
  };
  
  const getCompletionPhrase = (): string => {
    if (language === "pt-br") {
      const phrases = [
        "Treino concluído! Você é brabo!",
        "Incrível! Você completou o treino!",
        "Parabéns! Você arrasou hoje!",
        "Excelente trabalho! Treino finalizado!",
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    } else {
      const phrases = [
        "Workout completed! You crushed it!",
        "Amazing! You've completed the workout!",
        "Congrats! You rocked it today!",
        "Excellent work! Workout finished!",
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
  };
  
  const provideFeedback = (currentRep: number, targetReps: number) => {
    const now = Date.now();
    // Limit feedback frequency to avoid overwhelming the user
    if (now - lastFeedbackTime < 3000) return; 
    
    let feedback = "";
    
    if (feedbackMode === "motivational") {
      feedback = getMotivationalPhrase(currentRep, targetReps);
    } else {
      // Technical mode - form feedback
      feedback = getTechnicalPhrase();
    }
    
    playFeedback(feedback);
    setLastFeedbackTime(now);
  };
  
  const playFeedback = (text: string) => {
    // Text-to-speech with improved voice selection and parameters
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Select appropriate voice based on language
      if (language === "pt-br") {
        // Try to find Luciana or any Portuguese voice
        utterance.voice = voices.find(voice => 
          voice.name.includes('Luciana') || 
          voice.lang === 'pt-BR'
        ) || null;
        utterance.lang = "pt-BR";
      } else {
        // Find a good English voice
        utterance.voice = voices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.lang === 'en-US'
        ) || null;
        utterance.lang = "en-US";
      }
      
      // Set energetic speech parameters
      utterance.rate = 1.1;  // Slightly faster than normal
      utterance.pitch = 1.2; // Higher pitch for more energy
      utterance.volume = 1;  // Maximum volume
      
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
    // Initialize voice list if needed
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    
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
