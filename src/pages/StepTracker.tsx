
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
import { Footprints, Flame, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepCounter from "@/components/steps/StepCounter";
import StepMetrics from "@/components/steps/StepMetrics";

// Mock data for the step tracker - in a real app, this would come from a database
const initialStepData = [
  { day: 'Segunda', steps: 5234, calories: 210 },
  { day: 'Terça', steps: 7891, calories: 315 },
  { day: 'Quarta', steps: 6453, calories: 258 },
  { day: 'Quinta', steps: 9870, calories: 394 },
  { day: 'Sexta', steps: 8765, calories: 350 },
  { day: 'Sábado', steps: 4321, calories: 173 },
  { day: 'Domingo', steps: 3567, calories: 143 },
];

const StepTracker = () => {
  const { toast } = useToast();
  const [stepData, setStepData] = useState(initialStepData);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  useEffect(() => {
    // In a real app, we would load the user's step data from a database here
    console.log("StepTracker component mounted");
    
    // Simulating loading user data
    setTimeout(() => {
      toast({
        title: "Dados carregados",
        description: "Seus dados de passos foram carregados com sucesso.",
      });
    }, 1000);
    
    return () => {
      console.log("StepTracker component unmounted");
    };
  }, [toast]);
  
  const handleStartTracking = () => {
    setIsTracking(true);
    toast({
      title: "Rastreamento iniciado",
      description: "Começamos a monitorar seus passos.",
    });
    
    // Simulating steps being counted - in a real app this would use device sensors
    const interval = setInterval(() => {
      setTodaySteps(prev => {
        const increment = Math.floor(Math.random() * 10) + 1;
        return prev + increment;
      });
    }, 3000);
    
    // Clean up interval after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsTracking(false);
      
      // Update the step data with today's result
      setStepData(prev => {
        const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
        const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
        const newData = [...prev];
        
        // Find today in the data or add it
        const todayIndex = newData.findIndex(item => 
          item.day.toLowerCase() === capitalizedToday.toLowerCase()
        );
        
        if (todayIndex >= 0) {
          newData[todayIndex] = {
            ...newData[todayIndex],
            steps: todaySteps,
            calories: Math.floor(todaySteps * 0.04), // Approximate calories burned
          };
        } else {
          newData.push({
            day: capitalizedToday,
            steps: todaySteps,
            calories: Math.floor(todaySteps * 0.04),
          });
        }
        
        return newData;
      });
      
      toast({
        title: "Rastreamento concluído",
        description: `Você deu ${todaySteps} passos hoje!`,
      });
    }, 30000);
  };
  
  // Calculate total steps and calories
  const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);
  const totalCalories = stepData.reduce((sum, day) => sum + day.calories, 0);
  const averageSteps = Math.floor(totalSteps / stepData.length);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Contador de Passos</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StepCounter 
              steps={todaySteps} 
              isTracking={isTracking} 
              onStartTracking={handleStartTracking} 
            />
            
            <StepMetrics 
              totalSteps={totalSteps} 
              averageSteps={averageSteps} 
              totalCalories={totalCalories} 
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
                    data={stepData}
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
                    {stepData.map((day, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{day.day}</td>
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
                    ))}
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
