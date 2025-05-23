
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
import { Footprints, Flame, Trophy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepCounter from "@/components/steps/StepCounter";
import StepMetrics from "@/components/steps/StepMetrics";
import { healthService, HealthData, HistoricalHealthData } from "@/services/healthService";

const StepTracker = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [healthData, setHealthData] = useState<HealthData>({ steps: 0, calories: 0, distance: 0, activeMinutes: 0 });
  const [historicalData, setHistoricalData] = useState<HistoricalHealthData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [averageSteps, setAverageSteps] = useState(0);
  
  const loadHealthData = async () => {
    try {
      const data = await healthService.getHealthData();
      setHealthData(data);
      
      const history = await healthService.getHistoricalData();
      setHistoricalData(history);
      
      if (history.length > 0) {
        const total = history.reduce((sum, day) => sum + day.steps, 0);
        setAverageSteps(Math.floor(total / history.length));
      }
    } catch (error) {
      console.error("Error loading health data:", error);
      toast({
        title: "Error",
        description: "Failed to load your health data.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    loadHealthData();
    
    const alreadyTracking = healthService.isTracking();
    setIsTracking(alreadyTracking);
    
    const interval = setInterval(() => {
      loadHealthData();
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [toast]);
  
  const handleStartTracking = async () => {
    try {
      const success = await healthService.startTracking();
      
      if (success) {
        setIsTracking(true);
        toast({
          title: "Tracking Started",
          description: "We've started monitoring your steps.",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not start tracking.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error starting tracking:", error);
      toast({
        title: "Error",
        description: "An error occurred while starting tracking.",
        variant: "destructive"
      });
    }
  };
  
  const handleStopTracking = () => {
    healthService.stopTracking();
    setIsTracking(false);
    
    toast({
      title: "Tracking Stopped",
      description: "We've stopped monitoring your steps.",
    });
    
    loadHealthData();
  };
  
  const chartData = historicalData.map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      day: dayName,
      steps: day.steps,
      calories: day.calories
    };
  });
  
  const shareWithAIConsultant = () => {
    const formattedHealthData = healthService.formatHealthDataForChat();
    
    navigate('/chat', { 
      state: { 
        prefilledMessage: formattedHealthData 
      } 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Step Counter</h1>
          
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
              <CardTitle>Your steps this week</CardTitle>
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
                      name="Steps" 
                      stroke="#8b5cf6" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="calories" 
                      name="Calories" 
                      stroke="#f97316" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Day</th>
                      <th className="text-left py-3 px-4">Steps</th>
                      <th className="text-left py-3 px-4">Calories</th>
                      <th className="text-left py-3 px-4">Goal Reached</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((day, index) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{formattedDay}</td>
                          <td className="py-3 px-4">{day.steps.toLocaleString('en-US')}</td>
                          <td className="py-3 px-4">{day.calories}</td>
                          <td className="py-3 px-4">
                            {day.steps >= 8000 ? (
                              <span className="inline-flex items-center text-green-600">
                                <Trophy className="h-4 w-4 mr-1" /> Yes
                              </span>
                            ) : (
                              <span className="text-red-500">No</span>
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
          
          <div className="mt-4">
            <Button 
              onClick={shareWithAIConsultant}
              className="w-full"
              variant="default"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Share Data with AI Consultant
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StepTracker;
