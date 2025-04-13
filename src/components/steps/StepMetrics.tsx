
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, Flame, Timer, ArrowUpRight } from "lucide-react";

interface StepMetricsProps {
  totalSteps: number;
  averageSteps: number;
  totalCalories: number;
}

const StepMetrics = ({ totalSteps, averageSteps, totalCalories }: StepMetricsProps) => {
  // Calculate approximate values for distance and active time
  const approximateDistance = (totalSteps * 0.0008).toFixed(2); // in km, rough estimate
  const approximateActiveMinutes = Math.floor(totalSteps / 100); // rough approximation
  
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
              {totalSteps.toLocaleString('pt-BR')}
            </div>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <Flame className="h-4 w-4 mr-1" />
              Calorias Queimadas
            </div>
            <div className="text-2xl font-semibold">
              {totalCalories.toLocaleString('pt-BR')}
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
              <Timer className="h-4 w-4 mr-1" />
              Tempo Ativo
            </div>
            <div className="text-2xl font-semibold">
              {approximateActiveMinutes} min
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepMetrics;
