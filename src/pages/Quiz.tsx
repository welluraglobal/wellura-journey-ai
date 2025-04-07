
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Check, Printer, Mail, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { getQuizQuestions, getRecommendations, healthGoals } from "@/utils/quizUtils";

const Quiz = () => {
  const { userId, userProfile, setUserProfile } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [quizStep, setQuizStep] = useState<number>(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check if user has already completed the quiz
  useEffect(() => {
    if (userProfile?.quiz_data) {
      setHasCompletedQuiz(true);
      setSelectedGoals(userProfile.quiz_data.goals || []);
      setQuizAnswers(userProfile.quiz_data.answers || {});
    }
  }, [userProfile]);

  // Load questions when goals are selected
  useEffect(() => {
    if (selectedGoals.length > 0 && quizStep === 1) {
      const allQuestions = getQuizQuestions(selectedGoals);
      setQuestions(allQuestions);
    }
  }, [selectedGoals, quizStep]);

  // Generate recommendations when quiz is completed
  useEffect(() => {
    if (quizStep === 2 && Object.keys(quizAnswers).length > 0) {
      const recs = getRecommendations(selectedGoals, quizAnswers);
      setRecommendations(recs);
    }
  }, [quizStep, quizAnswers, selectedGoals]);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal);
      } else {
        // Limit to 3 selections
        if (prev.length >= 3) {
          toast.warning("You can select up to 3 goals only");
          return prev;
        }
        return [...prev, goal];
      }
    });
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextStep = () => {
    if (quizStep === 0) {
      if (selectedGoals.length === 0) {
        toast.error("Please select at least one health goal");
        return;
      }
      setQuizStep(1);
    } else if (quizStep === 1) {
      // Check if all questions for the current goal are answered
      const currentGoalQuestions = questions.filter(q => q.goal === selectedGoals[currentGoalIndex]);
      const allAnswered = currentGoalQuestions.every(q => quizAnswers[q.id] !== undefined);
      
      if (!allAnswered) {
        toast.error("Please answer all questions before proceeding");
        return;
      }

      // If there are more goals to answer questions for
      if (currentGoalIndex < selectedGoals.length - 1) {
        setCurrentGoalIndex(prev => prev + 1);
      } else {
        setQuizStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    if (quizStep === 1 && currentGoalIndex > 0) {
      setCurrentGoalIndex(prev => prev - 1);
    } else if (quizStep === 1 && currentGoalIndex === 0) {
      setQuizStep(0);
    } else if (quizStep === 2) {
      setQuizStep(1);
      setCurrentGoalIndex(selectedGoals.length - 1);
    }
  };

  const saveQuizData = async () => {
    setIsSubmitting(true);
    
    try {
      if (!userId) {
        toast.error("You must be logged in to save your quiz results");
        setIsSubmitting(false);
        return;
      }
      
      const quizData = {
        goals: selectedGoals,
        answers: quizAnswers,
        completedAt: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          quiz_data: quizData 
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local user profile
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          quiz_data: quizData
        };
        setUserProfile(updatedProfile);
      }
      
      toast.success("Your wellness quiz results have been saved!");
      setHasCompletedQuiz(true);
    } catch (error) {
      console.error("Error saving quiz data:", error);
      toast.error("Failed to save your quiz results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setSelectedGoals([]);
    setQuizAnswers({});
    setCurrentGoalIndex(0);
    setHasCompletedQuiz(false);
  };

  const printReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print the report.");
      return;
    }
    
    let reportContent = `
      <html>
      <head>
        <title>Wellness Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #3f51b5; }
          h2 { color: #536dfe; margin-top: 20px; }
          .goal { margin-bottom: 30px; }
          .recommendation { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Your Personalized Wellness Report</h1>
        <p>Based on your responses, we've created this custom wellness plan for you.</p>
    `;
    
    selectedGoals.forEach(goal => {
      reportContent += `
        <div class="goal">
          <h2>Your ${goal} Plan</h2>
          <h3>Recommendations:</h3>
          <ul>
      `;
      
      if (recommendations[goal]) {
        recommendations[goal].forEach(rec => {
          reportContent += `<li class="recommendation">${rec}</li>`;
        });
      }
      
      reportContent += `</ul></div>`;
    });
    
    reportContent += `</body></html>`;
    
    reportWindow.document.open();
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    
    setTimeout(() => {
      reportWindow.print();
    }, 500);
  };

  const sendEmailReport = () => {
    // In a real implementation, this would send an email with the report
    toast.success("Email feature will be implemented in the next version");
  };

  const renderCurrentStep = () => {
    // Already completed quiz view
    if (hasCompletedQuiz && quizStep === 0) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Wellness Profile</CardTitle>
            <CardDescription>
              You've already completed the wellness quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Health Goals:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedGoals.map(goal => (
                  <div key={goal} className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-md">
                    <Check className="h-5 w-5 text-wellura-500" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Your Wellness Report:</h3>
                {selectedGoals.map(goal => (
                  <div key={goal} className="mb-4">
                    <h4 className="font-medium text-wellura-500">{goal}</h4>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {recommendations[goal]?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-3">
            <div className="flex flex-wrap gap-3 w-full">
              <Button variant="outline" onClick={printReport} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" onClick={sendEmailReport} className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email Report
              </Button>
            </div>
            <Button onClick={resetQuiz} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Step 0: Goal selection
    if (quizStep === 0) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Wellness Quiz</CardTitle>
            <CardDescription>
              What are your main health goals? Select up to 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-center space-x-2 border rounded-md p-3 hover:bg-secondary/50 cursor-pointer ${
                    selectedGoals.includes(goal.id) ? "bg-secondary border-primary" : ""
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={selectedGoals.includes(goal.id)}
                    onCheckedChange={() => handleGoalToggle(goal.id)}
                  />
                  <Label htmlFor={`goal-${goal.id}`} className="cursor-pointer">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div></div>
            <Button onClick={handleNextStep} disabled={selectedGoals.length === 0}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Step 1: Questions based on selected goals
    if (quizStep === 1) {
      const currentGoal = selectedGoals[currentGoalIndex];
      const currentGoalQuestions = questions.filter(q => q.goal === currentGoal);
      
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Questions about {currentGoal}</CardTitle>
            <CardDescription>
              Goal {currentGoalIndex + 1} of {selectedGoals.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentGoalQuestions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="text-lg font-medium">{question.text}</h3>
                  
                  {question.type === 'radio' && (
                    <RadioGroup
                      value={quizAnswers[question.id] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option: string) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === 'text' && (
                    <Input
                      value={quizAnswers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Your answer"
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <Textarea
                      value={quizAnswers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Your answer"
                      className="min-h-[80px]"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNextStep}>
              {currentGoalIndex < selectedGoals.length - 1 ? (
                <>Next Goal<ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                <>Complete Quiz<Check className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Step 2: Results and recommendations
    if (quizStep === 2) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Wellness Report</CardTitle>
            <CardDescription>
              Based on your responses, we've created a personalized wellness plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedGoals.map(goal => (
                <div key={goal} className="space-y-3">
                  <h3 className="text-lg font-medium text-wellura-500">{goal} Recommendations</h3>
                  <div className="bg-secondary/30 p-4 rounded-md">
                    <ul className="list-disc pl-5 space-y-2">
                      {recommendations[goal]?.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-3">
            <div className="flex flex-wrap gap-3 w-full">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="outline" onClick={printReport} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" onClick={sendEmailReport} className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email Report
              </Button>
            </div>
            <Button onClick={saveQuizData} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Results"}
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Wellness Assessment</h1>
            <p className="text-muted-foreground">
              Complete this quiz to receive personalized wellness recommendations
            </p>
          </div>
          
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
