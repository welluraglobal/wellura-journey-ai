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
  
  const [isPerformingExercise, setIsPerformingExercise] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [keypoints, setKeypoints] = useState<any>(null);
  const [lastExerciseTime, setLastExerciseTime] = useState(0);
  
  useEffect(() => {
    if (isActive && videoRef.current) {
      initCamera();
      
      return () => {
        stopPoseDetection();
      };
    }
    
    return () => {
      stopPoseDetection();
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);
  
  useEffect(() => {
    if (repCount >= targetReps) {
      playFeedback(getCompletionPhrase());
      setIsActive(false);
      
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
      welcomeText = `Bem-vindo, ${userName}. Este exercício é chamado ${exerciseName}. Eu vou te ajudar a executar com perfeição para que você tenha resultados reais. Vamos nessa!`;
    } else {
      welcomeText = `Welcome, ${userName}. This exercise is called ${exerciseName}. I'll guide you to perform it correctly for real results. Let's do this!`;
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
        
        if (!hasPlayedIntro) {
          setTimeout(() => {
            playWelcomeMessage();
            setHasPlayedIntro(true);
          }, 500);
        }
        
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
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    let motionBuffer: number[] = [];
    const bufferSize = 10;
    
    const detectPose = () => {
      if (!videoRef.current || !canvasRef.current || !ctx) return;
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      ctx.drawImage(
        videoRef.current, 
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
      
      const frameWidth = canvasRef.current.width;
      const frameHeight = canvasRef.current.height;
      
      let trackingRegions: {name: string, x: number, y: number, width: number, height: number, color: string}[] = [];
      
      switch(exerciseName) {
        case "Squat":
          trackingRegions = [
            {
              name: "Upper Body",
              x: Math.floor(frameWidth * 0.3),
              y: Math.floor(frameHeight * 0.15),
              width: Math.floor(frameWidth * 0.4),
              height: Math.floor(frameHeight * 0.3),
              color: "rgba(0, 255, 0, 0.5)"
            },
            {
              name: "Lower Body",
              x: Math.floor(frameWidth * 0.25),
              y: Math.floor(frameHeight * 0.5),
              width: Math.floor(frameWidth * 0.5),
              height: Math.floor(frameHeight * 0.4),
              color: "rgba(255, 0, 0, 0.5)"
            }
          ];
          break;
          
        case "Bicep Curl":
          trackingRegions = [
            {
              name: "Arms",
              x: Math.floor(frameWidth * 0.2),
              y: Math.floor(frameHeight * 0.2),
              width: Math.floor(frameWidth * 0.6),
              height: Math.floor(frameHeight * 0.4),
              color: "rgba(0, 0, 255, 0.5)"
            }
          ];
          break;
          
        case "Push-up":
          trackingRegions = [
            {
              name: "Full Upper Body",
              x: Math.floor(frameWidth * 0.2),
              y: Math.floor(frameHeight * 0.1),
              width: Math.floor(frameWidth * 0.6),
              height: Math.floor(frameHeight * 0.6),
              color: "rgba(255, 165, 0, 0.5)"
            }
          ];
          break;
          
        case "Plank":
          trackingRegions = [
            {
              name: "Full Body",
              x: Math.floor(frameWidth * 0.1),
              y: Math.floor(frameHeight * 0.1),
              width: Math.floor(frameWidth * 0.8),
              height: Math.floor(frameHeight * 0.8),
              color: "rgba(128, 0, 128, 0.5)"
            }
          ];
          break;
          
        case "Shoulder Press":
          trackingRegions = [
            {
              name: "Upper Body",
              x: Math.floor(frameWidth * 0.2),
              y: Math.floor(frameHeight * 0.1),
              width: Math.floor(frameWidth * 0.6),
              height: Math.floor(frameHeight * 0.4),
              color: "rgba(255, 192, 203, 0.5)"
            },
            {
              name: "Arms",
              x: Math.floor(frameWidth * 0.15),
              y: Math.floor(frameHeight * 0.1),
              width: Math.floor(frameWidth * 0.7),
              height: Math.floor(frameHeight * 0.3),
              color: "rgba(0, 128, 128, 0.5)"
            }
          ];
          break;
          
        default:
          trackingRegions = [
            {
              name: "Full Body",
              x: Math.floor(frameWidth * 0.2),
              y: Math.floor(frameHeight * 0.2),
              width: Math.floor(frameWidth * 0.6),
              height: Math.floor(frameHeight * 0.6),
              color: "rgba(100, 100, 100, 0.5)"
            }
          ];
      }
      
      let totalMotionValue = 0;
      
      trackingRegions.forEach(region => {
        const imageData = ctx.getImageData(
          region.x, 
          region.y, 
          region.width, 
          region.height
        );
        
        const regionMotionValue = detectMotionInRegion(imageData, region.width, region.height, exerciseName);
        totalMotionValue += regionMotionValue;
        
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(region.x, region.y, region.width, region.height);
        
        ctx.fillStyle = "white";
        ctx.font = '14px Arial';
        ctx.fillText(`Tracking: ${region.name}`, region.x + 5, region.y - 5);
      });
      
      const normalizedMotionValue = totalMotionValue / trackingRegions.length;
      
      motionBuffer.push(normalizedMotionValue);
      if (motionBuffer.length > bufferSize) {
        motionBuffer.shift();
      }
      
      const motionTrend = calculateMotionTrend(motionBuffer);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Rep Count: ${repCount}`, 10, 30);
      ctx.fillText(`Now tracking: ${exerciseName}`, 10, 60);
      ctx.fillText(`Motion: ${motionTrend.toFixed(2)}`, 10, 90);
      
      const exerciseThreshold = getExerciseThreshold(exerciseName);
      const now = Date.now();
      
      detectExerciseRep(exerciseName, motionTrend, exerciseThreshold, now);
      
      animationRef.current = requestAnimationFrame(detectPose);
    };
    
    animationRef.current = requestAnimationFrame(detectPose);
  };
  
  const detectMotionInRegion = (imageData: ImageData, width: number, height: number, exercise: string): number => {
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    const avgBrightness = totalBrightness / (width * height);
    
    switch(exercise) {
      case "Squat":
        return avgBrightness * 1.2;
      case "Bicep Curl":
        return avgBrightness * 1.3;
      case "Push-up":
        return avgBrightness * 1.1;
      case "Plank":
        return avgBrightness * 0.8;
      case "Shoulder Press":
        return avgBrightness * 1.2;
      default:
        return avgBrightness;
    }
  };
  
  const getExerciseThreshold = (exercise: string): number => {
    switch(exercise) {
      case "Squat":
        return 4.5;
      case "Bicep Curl":
        return 3.5;
      case "Push-up":
        return 5.5;
      case "Plank":
        return 1.8;
      case "Shoulder Press":
        return 4.5;
      default:
        return 4.5;
    }
  };
  
  const detectExerciseRep = (exercise: string, motionTrend: number, threshold: number, now: number) => {
    switch(exercise) {
      case "Squat":
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
        break;
        
      case "Bicep Curl":
        if (!isPerformingExercise && motionTrend > threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25);
        }
        
        if (isPerformingExercise) {
          if (motionTrend > threshold) {
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend < -threshold) {
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
        break;
        
      case "Push-up":
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
        break;
        
      case "Plank":
        if (Math.abs(motionTrend) < threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(prev => Math.min(prev + 1, 100));
          
          if (now - lastExerciseTime > 5000) {
            provideFeedback(repCount, targetReps);
            setLastExerciseTime(now);
          }
        } else {
          setIsPerformingExercise(false);
          setExerciseProgress(0);
        }
        break;
        
      case "Shoulder Press":
        if (!isPerformingExercise && motionTrend > threshold) {
          setIsPerformingExercise(true);
          setExerciseProgress(25);
        }
        
        if (isPerformingExercise) {
          if (motionTrend > threshold) {
            setExerciseProgress(prev => Math.min(prev + 15, 50));
          } else if (motionTrend < -threshold) {
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
        break;
        
      default:
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
    if (now - lastFeedbackTime < 3000) return; 
    
    let feedback = "";
    
    if (feedbackMode === "motivational") {
      feedback = getMotivationalPhrase(currentRep, targetReps);
    } else {
      feedback = getTechnicalPhrase();
    }
    
    playFeedback(feedback);
    setLastFeedbackTime(now);
  };
  
  const playFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      
      if (language === "pt-br") {
        utterance.voice = voices.find(voice => 
          voice.name.includes('Luciana') || 
          voice.lang === 'pt-BR'
        ) || null;
        utterance.lang = "pt-BR";
      } else {
        utterance.voice = voices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.lang === 'en-US'
        ) || null;
        utterance.lang = "en-US";
      }
      
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
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
            
            <div className="absolute top-20 left-4 right-4 flex justify-center">
              <div className="bg-primary/80 px-6 py-2 rounded-full text-base font-semibold">
                Now tracking: {exerciseName}
              </div>
            </div>
            
            <div className="absolute bottom-20 left-4 right-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${exerciseProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="absolute bottom-28 left-4 right-4 flex justify-center">
              <div className="bg-black/40 px-4 py-1 rounded-full text-sm">
                Welly is tracking your form
              </div>
            </div>
            
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
