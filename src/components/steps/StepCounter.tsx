
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Footprints } from "lucide-react";
import { useEffect, useState } from "react";
import { healthService } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";

interface StepCounterProps {
  steps: number;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

const StepCounter = ({ steps, isTracking, onStartTracking, onStopTracking }: StepCounterProps) => {
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Target steps per day (recommended by health experts)
  const targetSteps = 10000;
  const progressPercentage = Math.min(100, (steps / targetSteps) * 100);
  
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permission = await healthService.requestPermissions();
        setHasPermission(permission);
        
        if (!permission) {
          toast({
            title: "Permissão Negada",
            description: "Precisamos de permissão para contar seus passos.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setHasPermission(false);
      }
    };
    
    checkPermissions();
  }, [toast]);
  
  const handleToggleTracking = async () => {
    if (isTracking) {
      onStopTracking();
    } else {
      // Verificar permissões novamente se necessário
      if (hasPermission === false) {
        const permission = await healthService.requestPermissions();
        setHasPermission(permission);
        
        if (!permission) {
          toast({
            title: "Permissão Negada",
            description: "Precisamos de permissão para contar seus passos.",
            variant: "destructive"
          });
          return;
        }
      }
      
      onStartTracking();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="text-primary h-6 w-6" />
          Passos de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="text-6xl font-bold mb-4 text-center">
          {steps.toLocaleString('pt-BR')}
        </div>
        <Progress value={progressPercentage} className="w-full h-3 mb-2" />
        <p className="text-muted-foreground text-sm mb-4">
          {steps.toLocaleString('pt-BR')} de {targetSteps.toLocaleString('pt-BR')} passos 
          ({Math.round(progressPercentage)}%)
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={handleToggleTracking} 
          disabled={hasPermission === false}
          className="w-full"
          variant={isTracking ? "destructive" : "default"}
        >
          {isTracking ? "Parar Rastreamento" : "Iniciar Rastreamento"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StepCounter;
