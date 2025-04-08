
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, AlertTriangle, ArrowLeft } from "lucide-react";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Process the confirmation token
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || !type) {
          setStatus("error");
          setMessage("Invalid confirmation link. Please request a new one.");
          return;
        }

        // Handle email confirmation
        if (type === "signup" || type === "email_change") {
          // We're not using the result directly to prevent auto-login
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "email",
          });

          if (error) {
            console.error("Email verification error:", error);
            setStatus("error");
            setMessage(error.message || "Failed to confirm email. Please try again.");
          } else {
            setStatus("success");
            setMessage("Your email has been confirmed successfully!");
          }
        } else {
          setStatus("error");
          setMessage("Invalid confirmation type. Please try again.");
        }
      } catch (error: any) {
        console.error("Confirmation error:", error);
        setStatus("error");
        setMessage(error.message || "An error occurred during confirmation. Please try again.");
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Email Confirmation</CardTitle>
          <CardDescription className="text-center">
            {status === "processing" ? "We're confirming your email address..." : ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "processing" && (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-primary">
                Processing...
              </div>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <Check className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          {status === "success" && (
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth?mode=login")}
            >
              Login to my account
            </Button>
          )}

          {status === "error" && (
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth?mode=login")}
            >
              Return to login
            </Button>
          )}

          <div className="pt-2">
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
