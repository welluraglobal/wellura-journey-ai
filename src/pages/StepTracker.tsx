
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Footprints, Flame, Trophy } from "lucide-react";
import StepCounter from "@/components/steps/StepCounter";
import StepMetrics from "@/components/steps/StepMetrics";
import { healthService, HealthData, HistoricalHealthData } from "@/services/healthService";

const StepTracker = () => {
  const { toast } = useToast();
  
  // Estados para armazenar os dados de saúde
  const [healthData, setHealthData] = useState<HealthData>({ steps: 0, calories: 0, distance: 0, activeMinutes: 0 });
  const [historicalData, setHistoricalData] = useState<HistoricalHealthData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [averageSteps, setAverageSteps] = useState(0);
  
  // Função para carregar dados de saúde
  const loadHealthData = async () => {
    try {
      const data = await healthService.getHealthData();
      setHealthData(data);
      
      const history = await healthService.getHistoricalData();
      setHistoricalData(history);
      
      // Calcula a média de passos
      if (history.length > 0) {
        const total = history.reduce((sum, day) => sum + day.steps, 0);
        setAverageSteps(Math.floor(total / history.length));
      }
    } catch (error) {
      console.error("Erro ao carregar dados de saúde:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados de saúde.",
        variant: "destructive"
      });
    }
  };
  
  // Carrega dados ao iniciar
  useEffect(() => {
    loadHealthData();
    
    // Verifica se já estava rastreando
    const alreadyTracking = healthService.isTracking();
    setIsTracking(alreadyTracking);
    
    // Intervalo para atualizar dados periódicamente
    const interval = setInterval(() => {
      loadHealthData();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      // Não para o rastreamento ao desmontar para continuar em segundo plano
    };
  }, [toast]);
  
  // Inicia o rastreamento de passos
  const handleStartTracking = async () => {
    try {
      const success = await healthService.startTracking();
      
      if (success) {
        setIsTracking(true);
        toast({
          title: "Rastreamento iniciado",
          description: "Começamos a monitorar seus passos.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o rastreamento.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao iniciar rastreamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar o rastreamento.",
        variant: "destructive"
      });
    }
  };
  
  // Para o rastreamento de passos
  const handleStopTracking = () => {
    healthService.stopTracking();
    setIsTracking(false);
    
    toast({
      title: "Rastreamento parado",
      description: "Paramos de monitorar seus passos.",
    });
    
    // Atualiza os dados uma última vez
    loadHealthData();
  };
  
  // Prepara dados para o gráfico
  const chartData = historicalData.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    
    return {
      day: dayName,
      steps: day.steps,
      calories: day.calories
    };
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contador de Passos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StepCounter 
              steps={healthData.steps} 
              isTracking={isTracking} 
              onStartTracking={handleStartTracking} 
              onStopTracking={handleStopTracking}
            />
            
            <StepMetrics 
              healthData={healthData}
              averageSteps={averageSteps}
            />
          </div>
          
          <Card className="w-full mb-8">
            <CardHeader>
              <CardTitle>Seus passos esta semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="steps" 
                      name="Passos" 
                      stroke="#8b5cf6" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="calories" 
                      name="Calorias" 
                      stroke="#f97316" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Dia</th>
                      <th className="text-left py-3 px-4">Passos</th>
                      <th className="text-left py-3 px-4">Calorias</th>
                      <th className="text-left py-3 px-4">Meta Atingida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((day, index) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
                      const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{formattedDay}</td>
                          <td className="py-3 px-4">{day.steps.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-4">{day.calories}</td>
                          <td className="py-3 px-4">
                            {day.steps >= 8000 ? (
                              <span className="inline-flex items-center text-green-600">
                                <Trophy className="h-4 w-4 mr-1" /> Sim
                              </span>
                            ) : (
                              <span className="text-red-500">Não</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StepTracker;
