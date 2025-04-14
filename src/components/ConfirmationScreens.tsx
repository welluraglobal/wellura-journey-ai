
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserContext } from "@/contexts/UserContext";
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
import { Check, ExternalLink } from "lucide-react";

type ConfirmationStep = "privacy" | "health" | "completed";

const ConfirmationScreens = () => {
  const [currentStep, setCurrentStep] = useState<ConfirmationStep>("privacy");
  const [isLoading, setIsLoading] = useState(false);
  const { userId, setUserProfile, userProfile } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already accepted the terms
    if (userProfile && userProfile.privacy_accepted && userProfile.health_disclaimer_accepted) {
      navigate("/dashboard");
    }
  }, [userProfile, navigate]);

  const handlePrivacyAccept = () => {
    setCurrentStep("health");
  };

  const handleHealthDisclaimerAccept = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          privacy_accepted: true, 
          health_disclaimer_accepted: true 
        })
        .eq('id', userId);
      
      if (error) throw error;

      // Update context with accepted status
      setUserProfile({
        ...userProfile,
        privacy_accepted: true,
        health_disclaimer_accepted: true
      });
      
      toast({
        title: "Success",
        description: "Thank you for confirming our terms.",
      });
      
      setCurrentStep("completed");
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

  const openPrivacyPolicy = () => {
    window.open("/privacy-policy", "_blank");
  };

  if (currentStep === "privacy") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Privacy Notice</CardTitle>
            <CardDescription>
              Please review our privacy information before continuing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome to the Wellura App. Your personal information, including health data, 
              is securely stored and handled according to our privacy policy. We do not share 
              your data with third parties without your consent.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              variant="outline" 
              className="w-full"
              onClick={openPrivacyPolicy}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Privacy Policy
            </Button>
            <Button 
              className="w-full" 
              onClick={handlePrivacyAccept}
            >
              I Understand and Agree
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (currentStep === "health") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Health Disclaimer</CardTitle>
            <CardDescription>
              Important health information about using Wellura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Wellura App is designed for general wellness purposes only and is not 
              intended to diagnose, treat, cure, or prevent any disease. Always consult 
              your physician or a qualified health professional before making any changes 
              to your diet, supplements, or exercise routines.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleHealthDisclaimerAccept}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "I Understand and Accept"}
              {!isLoading && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
};

export default ConfirmationScreens;
