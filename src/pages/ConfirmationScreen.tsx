
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ConfirmationScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const { userId, setUserProfile, userProfile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already accepted the terms
    if (userProfile && userProfile.health_disclaimer_accepted) {
      navigate("/dashboard");
    }
  }, [userProfile, navigate]);

  const handleAccept = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          health_disclaimer_accepted: true
        })
        .eq('id', userId);
      
      if (error) throw error;

      // Update context with accepted status
      setUserProfile({
        ...userProfile,
        health_disclaimer_accepted: true
      });
      
      toast({
        title: "Success",
        description: "Thank you for accepting our terms.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating acceptance status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your acceptance. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewTerms = () => {
    window.open("/terms-and-privacy", "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome to Wellura App!</CardTitle>
          <CardDescription>
            Before you start, please review the following:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
            <li>The information in this app is not medical advice and is for educational purposes only.</li>
            <li>Always consult with a healthcare provider before starting any supplement, training, or diet plan.</li>
            <li>Supplement statements have not been evaluated by the FDA.</li>
            <li>Results may vary by individual.</li>
            <li>This app uses your device camera to track exercise form. No video or image is stored.</li>
            <li>No personal health data is shared without your consent.</li>
          </ul>
          <p className="text-sm font-medium mt-4">By continuing, you agree to these terms.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            variant="outline" 
            className="w-full"
            onClick={viewTerms}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Terms & Privacy Policy
          </Button>
          <Button 
            className="w-full" 
            onClick={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "I Agree and Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmationScreen;
