
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, Flame, Timer, ArrowUpRight, Navigation } from "lucide-react";
import { HealthData } from "@/services/healthService";

interface StepMetricsProps {
  healthData: HealthData;
  averageSteps: number;
}

const StepMetrics = ({ healthData, averageSteps }: StepMetricsProps) => {
  const { steps, calories, distance, activeMinutes } = healthData;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Métricas da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <Footprints className="h-4 w-4 mr-1" />
              Total de Passos
            </div>
            <div className="text-2xl font-semibold">
              {steps.toLocaleString('pt-BR')}
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <Flame className="h-4 w-4 mr-1" />
              Calorias Queimadas
            </div>
            <div className="text-2xl font-semibold">
              {calories.toLocaleString('pt-BR')}
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Média Diária
            </div>
            <div className="text-2xl font-semibold">
              {averageSteps.toLocaleString('pt-BR')}
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <Navigation className="h-4 w-4 mr-1" />
              Distância
            </div>
            <div className="text-2xl font-semibold">
              {distance.toFixed(2)} km
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5 col-span-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Timer className="h-4 w-4 mr-1" />
              Tempo Ativo
            </div>
            <div className="text-2xl font-semibold">
              {activeMinutes} min
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepMetrics;
