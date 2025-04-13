
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Footprints } from "lucide-react";

interface StepCounterProps {
  steps: number;
  isTracking: boolean;
  onStartTracking: () => void;
}

const StepCounter = ({ steps, isTracking, onStartTracking }: StepCounterProps) => {
  // Target steps per day (recommended by health experts)
  const targetSteps = 10000;
  const progressPercentage = Math.min(100, (steps / targetSteps) * 100);
  
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
          onClick={onStartTracking} 
          disabled={isTracking}
          className="w-full"
        >
          {isTracking ? "Rastreando..." : "Iniciar Rastreamento"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StepCounter;
