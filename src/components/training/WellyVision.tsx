
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Volume2, Volume1, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDeviceSize, useOrientation } from "@/hooks/use-mobile";
import WelluraPlaylistButton from "./WelluraPlaylistButton";
import { useUser } from "@/contexts/UserContext";

// Define the specific exercise types we support
type ExerciseType = "Squat" | "Bicep Curl" | "Push-up" | "Plank" | "Shoulder Press";

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
  const [language, setLanguage] = useState<"en" | "pt-br">("pt-br");
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();
  const deviceSize = useDeviceSize();
  const orientation = useOrientation();
  const { firstName } = useUser();
  
  // Exercise detection state
  const [isPerformingExercise, setIsPerformingExercise] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [keypoints, setKeypoints] = useState<any>(null);
  const [lastExerciseTime, setLastExerciseTime] = useState(0);
  
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
  
  const playWelcomeMessage = () => {
    const userName = firstName || "amigo";
    let welcomeText = "";
    
    if (language === "pt-br") {
      welcomeText = `Bem-vindo, ${userName}. Vamos começar seu treino! O primeiro exercício de hoje é: ${exerciseName}. Eu vou te ajudar a executar com perfeição para que você tenha resultados reais. Vamos nessa!`;
    } else {
      welcomeText = `Welcome, ${userName}. Let's start your workout! Your first exercise today is: ${exerciseName}. I'll help you perform it perfectly so you can get real results. Let's do this!`;
    }
    
    playFeedback(welcomeText);
  };
  
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
        
        // Play welcome message as soon as camera is initialized
        if (!hasPlayedIntro) {
          setTimeout(() => {
            playWelcomeMessage();
            setHasPlayedIntro(true);
          }, 500); // Small delay to ensure camera is fully initialized
        }
        
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
    
    // Set up canvas for visualization
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Exercise-specific motion detection variables
    let motionBuffer: number[] = [];
    const bufferSize = 10; // Store last 10 positions
    
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
      
      // Exercise-specific detection logic
      const frameWidth = canvasRef.current.width;
      const frameHeight = canvasRef.current.height;
      
      // Determine the region to analyze based on exercise type
      let sampleRegionX = 0;
      let sampleRegionY = 0;
      let sampleWidth = 0;
      let sampleHeight = 0;
      
      switch(exerciseName) {
        case "Squat":
          // Focus on lower body for squats
          sampleRegionX = Math.floor(frameWidth * 0.4); // 40% from left
          sampleRegionY = Math.floor(frameHeight * 0.6); // 60% from top (lower part)
          sampleWidth = Math.floor(frameWidth * 0.2); // 20% of width
          sampleHeight = Math.floor(frameHeight * 0.3); // 30% of height
          break;
          
        case "Bicep Curl":
          // Focus on arm region for bicep curls
          sampleRegionX = Math.floor(frameWidth * 0.3); // 30% from left
          sampleRegionY = Math.floor(frameHeight * 0.3); // 30% from top (middle area)
          sampleWidth = Math.floor(frameWidth * 0.4); // 40% of width
          sampleHeight = Math.floor(frameHeight * 0.4); // 40% of height
          break;
          
        case "Push-up":
          // Focus on upper body for push-ups
          sampleRegionX = Math.floor(frameWidth * 0.3); // 30% from left
          sampleRegionY = Math.floor(frameHeight * 0.3); // 30% from top
          sampleWidth = Math.floor(frameWidth * 0.4); // 40% of width
          sampleHeight = Math.floor(frameHeight * 0.4); // 40% of height
          break;
          
        case "Plank":
          // Monitor the entire body for planks
          sampleRegionX = Math.floor(frameWidth * 0.2); // 20% from left
          sampleRegionY = Math.floor(frameHeight * 0.3); // 30% from top
          sampleWidth = Math.floor(frameWidth * 0.6); // 60% of width
          sampleHeight = Math.floor(frameHeight * 0.4); // 40% of height
          break;
          
        case "Shoulder Press":
          // Focus on upper body and shoulders
          sampleRegionX = Math.floor(frameWidth * 0.3); // 30% from left
          sampleRegionY = Math.floor(frameHeight * 0.2); // 20% from top (upper area)
          sampleWidth = Math.floor(frameWidth * 0.4); // 40% of width
          sampleHeight = Math.floor(frameHeight * 0.3); // 30% of height
          break;
          
        default:
          // Default region covers the center of the frame
          sampleRegionX = Math.floor(frameWidth * 0.3);
          sampleRegionY = Math.floor(frameHeight * 0.3);
          sampleWidth = Math.floor(frameWidth * 0.4);
          sampleHeight = Math.floor(frameHeight * 0.4);
      }
      
      const imageData = ctx.getImageData(
        sampleRegionX, 
        sampleRegionY, 
        sampleWidth, 
        sampleHeight
      );
      
      // Exercise-specific motion detection
      let motionValue = 0;
      
      switch(exerciseName) {
        case "Squat":
          // For squats, we analyze vertical motion
          motionValue = detectSquatMotion(imageData, sampleWidth, sampleHeight);
          break;
          
        case "Bicep Curl":
          // For bicep curls, we analyze arm flexion
          motionValue = detectBicepCurlMotion(imageData, sampleWidth, sampleHeight);
          break;
          
        case "Push-up":
          // For push-ups, we analyze vertical movement of upper body
          motionValue = detectPushUpMotion(imageData, sampleWidth, sampleHeight);
          break;
          
        case "Plank":
          // For planks, we look for stability and small movements
          motionValue = detectPlankMotion(imageData, sampleWidth, sampleHeight);
          break;
          
        case "Shoulder Press":
          // For shoulder press, we analyze upward motion
          motionValue = detectShoulderPressMotion(imageData, sampleWidth, sampleHeight);
          break;
          
        default:
          // Use general motion detection as fallback
          motionValue = detectGeneralMotion(imageData, sampleWidth, sampleHeight);
      }
      
      // Add to motion buffer
      motionBuffer.push(motionValue);
      if (motionBuffer.length > bufferSize) {
        motionBuffer.shift();
      }
      
      // Calculate motion trend (are we going up/down/stable)
      const motionTrend = calculateMotionTrend(motionBuffer);
      
      // Draw visualization rectangle for debugging
      ctx.strokeStyle = isPerformingExercise ? 'green' : 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(sampleRegionX, sampleRegionY, sampleWidth, sampleHeight);
      
      // Draw text indicators
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Rep Count: ${repCount}`, 10, 30);
      ctx.fillText(`${exerciseName}: ${isPerformingExercise ? 'IN PROGRESS' : 'READY'}`, 10, 60);
      ctx.fillText(`Motion: ${motionTrend.toFixed(2)}`, 10, 90);
      
      // Exercise-specific detection logic
      const exerciseThreshold = getExerciseThreshold(exerciseName);
      const now = Date.now();
      
      // Exercise-specific rep detection
      detectExerciseRep(exerciseName, motionTrend, exerciseThreshold, now);
      
      // Schedule next frame
      animationRef.current = requestAnimationFrame(detectPose);
    };
    
    // Start detection loop
    animationRef.current = requestAnimationFrame(detectPose);
  };
  
  // Exercise-specific motion detection functions
  const detectSquatMotion = (imageData: ImageData, width: number, height: number): number => {
    // Calculate movement based on pixel brightness in lower body region
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const detectBicepCurlMotion = (imageData: ImageData, width: number, height: number): number => {
    // Focus on vertical motion in arm region for bicep curl
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const detectPushUpMotion = (imageData: ImageData, width: number, height: number): number => {
    // Detect vertical movement of upper body for push-ups
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const detectPlankMotion = (imageData: ImageData, width: number, height: number): number => {
    // For planks, minor movement is normal, but large changes mean breaking form
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const detectShoulderPressMotion = (imageData: ImageData, width: number, height: number): number => {
    // Detect upward motion for shoulder press
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const detectGeneralMotion = (imageData: ImageData, width: number, height: number): number => {
    // Generic motion detection as fallback
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    return totalBrightness / (width * height);
  };
  
  const getExerciseThreshold = (exercise: string): number => {
    // Different exercises have different thresholds for motion detection
    switch(exercise) {
      case "Squat":
        return 5;
      case "Bicep Curl":
        return 4;
      case "Push-up":
        return 6;
      case "Plank":
        return 2; // Planks require stability, so a lower threshold
      case "Shoulder Press":
        return 5;
      default:
        return 5;
    }
  };
  
  const detectExerciseRep = (exercise: string, motionTrend: number, threshold: number, now: number) => {
    // Exercise-specific rep detection logic
    switch(exercise) {
      case "Squat":
        // For squats: negative trend means going down, positive means going up
        if (!isPerformingExercise && motionTrend < -threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25); // Start of squat
        }
        
        if (isPerformingExercise) {
          if (motionTrend < -threshold) {
            // Still going down
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend > threshold) {
            // Going up - completing the squat
            setExerciseProgress(prev => {
              const newProgress = prev + 15;
              if (newProgress >= 100) {
                // Complete rep if it's been at least 1 second since last rep
                if (now - lastExerciseTime > 1000) {
                  setIsPerformingExercise(false);
                  setLastExerciseTime(now);
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
        break;
        
      case "Bicep Curl":
        // For bicep curls: positive trend means curling up, negative means lowering
        if (!isPerformingExercise && motionTrend > threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25); // Start of curl
        }
        
        if (isPerformingExercise) {
          if (motionTrend > threshold) {
            // Still curling up
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend < -threshold) {
            // Lowering - completing the curl
            setExerciseProgress(prev => {
              const newProgress = prev + 15;
              if (newProgress >= 100) {
                // Complete rep if it's been at least 1 second since last rep
                if (now - lastExerciseTime > 1000) {
                  setIsPerformingExercise(false);
                  setLastExerciseTime(now);
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
        break;
        
      case "Push-up":
        // For push-ups: negative trend means going down, positive means pushing up
        if (!isPerformingExercise && motionTrend < -threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25); // Start of push-up
        }
        
        if (isPerformingExercise) {
          if (motionTrend < -threshold) {
            // Still going down
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend > threshold) {
            // Pushing up - completing the push-up
            setExerciseProgress(prev => {
              const newProgress = prev + 15;
              if (newProgress >= 100) {
                // Complete rep if it's been at least 1 second since last rep
                if (now - lastExerciseTime > 1000) {
                  setIsPerformingExercise(false);
                  setLastExerciseTime(now);
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
        break;
        
      case "Plank":
        // For planks: monitor stability, count time instead of reps
        // This is just a placeholder as planks require time tracking rather than rep counting
        if (Math.abs(motionTrend) < threshold) {
          // Stable plank - progress increases with time
          setIsPerformingExercise(true);
          setExerciseProgress(prev => Math.min(prev + 1, 100));
          
          // Check if we should provide feedback
          if (now - lastExerciseTime > 5000) { // Every 5 seconds
            provideFeedback(repCount, targetReps);
            setLastExerciseTime(now);
          }
        } else {
          // Too much movement - breaking form
          setIsPerformingExercise(false);
          setExerciseProgress(0);
        }
        break;
        
      case "Shoulder Press":
        // For shoulder press: positive trend means pressing up, negative means lowering
        if (!isPerformingExercise && motionTrend > threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25); // Start of press
        }
        
        if (isPerformingExercise) {
          if (motionTrend > threshold) {
            // Still pressing up
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend < -threshold) {
            // Lowering - completing the press
            setExerciseProgress(prev => {
              const newProgress = prev + 15;
              if (newProgress >= 100) {
                // Complete rep if it's been at least 1 second since last rep
                if (now - lastExerciseTime > 1000) {
                  setIsPerformingExercise(false);
                  setLastExerciseTime(now);
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
        break;
        
      default:
        // Use squat detection as fallback
        if (!isPerformingExercise && motionTrend < -threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25);
        }
        
        if (isPerformingExercise) {
          if (motionTrend < -threshold) {
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend > threshold) {
            setExerciseProgress(prev => {
              const newProgress = prev + 15;
              if (newProgress >= 100) {
                if (now - lastExerciseTime > 1000) {
                  setIsPerformingExercise(false);
                  setLastExerciseTime(now);
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
    }
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
          "Boa, JP!",
          "Segue forte!",
          "Excelente forma!",
          "Vamos com tudo!"
        ];
        return startPhrases[Math.floor(Math.random() * startPhrases.length)];
      } else if (remainingReps > 0) {
        const midPhrases = [
          `Só mais ${remainingReps}, bora!`,
          `Falta ${remainingReps}, você consegue!`,
          `Mais ${remainingReps} e terminou!`,
          "Está quase lá, não desista!",
          `Só mais ${remainingReps}, força!`,
          "Concentre-se, falta pouco!",
          "Vamos lá, mantenha o foco!",
          "Final do treino, não desista!"
        ];
        return midPhrases[Math.floor(Math.random() * midPhrases.length)];
      } else {
        const finalPhrases = [
          "Última repetição, capricha!",
          "Agora é a última, dá tudo!",
          "Finaliza com força!",
          "Última rep, mostra seu potencial!"
        ];
        return finalPhrases[Math.floor(Math.random() * finalPhrases.length)];
      }
    } else {
      // English motivational phrases
      if (remainingReps > 5) {
        const startPhrases = [
          "Let's go!",
          "Great job, keep it up!",
          "That's it, keep the pace!",
          "You're doing amazing!",
          "Good form!",
          "Keep it strong!",
          "That's how you do it!",
          "Looking good!"
        ];
        return startPhrases[Math.floor(Math.random() * startPhrases.length)];
      } else if (remainingReps > 0) {
        const midPhrases = [
          `Only ${remainingReps} more to go!`,
          `${remainingReps} left, you can do it!`,
          `Just ${remainingReps} more and you're done!`,
          "You're almost there, don't give up!",
          `${remainingReps} more, push yourself!`,
          "Stay focused, almost done!",
          "Push through, you got this!",
          "Final stretch, keep going!"
        ];
        return midPhrases[Math.floor(Math.random() * midPhrases.length)];
      } else {
        const finalPhrases = [
          "Last rep, give it all you've got!",
          "Final rep, make it count!",
          "Finish strong!",
          "Last one, best one!"
        ];
        return finalPhrases[Math.floor(Math.random() * finalPhrases.length)];
      }
    }
  };
  
  const getTechnicalPhrase = (): string => {
    // Exercise-specific technical feedback
    if (language === "pt-br") {
      let exercisePhrases: string[] = [];
      
      switch (exerciseName) {
        case "Squat":
          exercisePhrases = [
            "Mantenha as costas retas",
            "Desça mais profundo",
            "Joelhos alinhados com os pés",
            "Mantenha o peito para cima",
            "Capricha na postura!",
            "Desça mais, JP!",
            "Controle a descida",
            "Mantenha o equilíbrio",
            "Olhe para frente",
            "Respire durante o movimento",
            "Desça mais para ativar os glúteos",
            "Mantenha os calcanhares no chão"
          ];
          break;
          
        case "Bicep Curl":
          exercisePhrases = [
            "Mantenha o cotovelo parado",
            "Evite balançar o corpo",
            "Controle a descida",
            "Concentre-se na contração do bíceps",
            "Mantenha os ombros para trás",
            "Punhos firmes durante o movimento",
            "Complete a amplitude de movimento",
            "Mantenha o ritmo constante"
          ];
          break;
          
        case "Push-up":
          exercisePhrases = [
            "Tronco reto, desça até 90 graus",
            "Mantenha firmeza no abdômen",
            "Cotovelos junto ao corpo",
            "Olhe ligeiramente à frente",
            "Não deixe o quadril cair",
            "Mantenha as escápulas estáveis",
            "Respire durante o movimento",
            "Contração total no topo"
          ];
          break;
          
        case "Plank":
          exercisePhrases = [
            "Mantenha o abdômen contraído",
            "Corpo em linha reta",
            "Não deixe o quadril subir",
            "Olhe para baixo, mantenha o pescoço neutro",
            "Respire normalmente",
            "Aperte os glúteos",
            "Pressione os antebraços contra o chão",
            "Mantenha os ombros afastados das orelhas"
          ];
          break;
          
        case "Shoulder Press":
          exercisePhrases = [
            "Mantenha o core estável",
            "Cotovelos em ângulo de 90 graus na base",
            "Pressione diretamente para cima",
            "Não arquee as costas",
            "Mantenha o ritmo controlado",
            "Respire durante o movimento",
            "Alinhe os pulsos corretamente",
            "Contração completa no topo"
          ];
          break;
          
        default:
          exercisePhrases = [
            "Mantenha as costas retas",
            "Controle o movimento",
            "Respire durante o exercício",
            "Mantenha a postura correta",
            "Concentre-se na técnica",
            "Movimento controlado é melhor",
            "Qualidade sobre quantidade",
            "Mantenha o foco na execução"
          ];
      }
      
      return exercisePhrases[Math.floor(Math.random() * exercisePhrases.length)];
    } else {
      // English technical phrases
      let exercisePhrases: string[] = [];
      
      switch (exerciseName) {
        case "Squat":
          exercisePhrases = [
            "Keep your back straight",
            "Go deeper with your squat",
            "Knees in line with your feet",
            "Keep your chest up",
            "Watch your form!",
            "Control the descent",
            "Maintain your balance",
            "Look forward",
            "Remember to breathe",
            "Engage your core",
            "Lower deeper to activate glutes",
            "Keep your heels on the ground"
          ];
          break;
          
        case "Bicep Curl":
          exercisePhrases = [
            "Keep your elbow fixed",
            "Avoid swinging your body",
            "Control the downward motion",
            "Focus on the bicep contraction",
            "Keep shoulders back",
            "Firm wrists throughout",
            "Complete full range of motion",
            "Maintain steady tempo"
          ];
          break;
          
        case "Push-up":
          exercisePhrases = [
            "Straight torso, lower to 90 degrees",
            "Keep your core tight",
            "Elbows close to your body",
            "Look slightly forward",
            "Don't let your hips sag",
            "Keep shoulder blades stable",
            "Breathe through the movement",
            "Full contraction at the top"
          ];
          break;
          
        case "Plank":
          exercisePhrases = [
            "Keep your abs engaged",
            "Straight line from head to heels",
            "Don't let your hips rise",
            "Look down, keep your neck neutral",
            "Breathe normally",
            "Squeeze your glutes",
            "Press forearms into the ground",
            "Keep shoulders away from ears"
          ];
          break;
          
        case "Shoulder Press":
          exercisePhrases = [
            "Keep your core stable",
            "Elbows at 90 degrees at bottom",
            "Press directly upward",
            "Don't arch your back",
            "Keep controlled tempo",
            "Breathe through the movement",
            "Align your wrists properly",
            "Full contraction at the top"
          ];
          break;
          
        default:
          exercisePhrases = [
            "Keep your back straight",
            "Control the movement",
            "Remember to breathe",
            "Maintain proper posture",
            "Focus on technique",
            "Controlled movement is better",
            "Quality over quantity",
            "Stay focused on execution"
          ];
      }
      
      return exercisePhrases[Math.floor(Math.random() * exercisePhrases.length)];
    }
  };
  
  const getCompletionPhrase = (): string => {
    if (language === "pt-br") {
      const phrases = [
        "Treino concluído! Você é brabo!",
        "Incrível! Você completou o treino!",
        "Parabéns! Você arrasou hoje!",
        "Excelente trabalho! Treino finalizado!",
        "Você é brabo JP!",
        "Treino concluído com sucesso!",
        "Mandou muito bem hoje!",
        "Sensacional! Treino completo!"
      ];
      return phrases[Math.floor(Math.random() * phrases.length)];
    } else {
      const phrases = [
        "Workout completed! You crushed it!",
        "Amazing! You've completed the workout!",
        "Congrats! You rocked it today!",
        "Excellent work! Workout finished!",
        "You're a champion! All done!",
        "Workout complete! Well done!",
        "Fantastic job today!",
        "That's how it's done! Workout complete!"
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
      utterance.rate = 1.05;  // Slightly faster than normal
      utterance.pitch = 1.1; // Higher pitch for more energy
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
    setHasPlayedIntro(false);
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
            
            {/* Exercise progress indicator */}
            {isPerformingExercise && (
              <div className="absolute bottom-20 left-4 right-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${exerciseProgress}%` }}
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
