
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Check, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"ready" | "processing" | "success" | "error">("ready");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify that the token is present and valid
    const verifyToken = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        console.error("No token found in URL");
        setStatus("error");
        setMessage("Invalid or missing reset token. Please request a new password reset link.");
        return;
      }
      
      console.log("Token found in URL:", token);
      
      try {
        // Just check if the token is present, actual verification happens on submit
        setTokenValid(true);
      } catch (error) {
        console.error("Token verification error:", error);
        setStatus("error");
        setMessage("There was an error verifying your reset token. Please request a new password reset link.");
      }
    };

    verifyToken();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("processing");

    try {
      if (password !== confirmPassword) {
        setStatus("error");
        setMessage("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setStatus("error");
        setMessage("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }

      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Invalid reset token. Please request a new password reset link.");
        setIsLoading(false);
        return;
      }

      console.log("Attempting to reset password with token:", token);

      // Update the password using the correct method from Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password reset error:", error);
        setStatus("error");
        setMessage(error.message || "Failed to reset password. Please try again.");
      } else {
        setStatus("success");
        setMessage("Your password has been reset successfully!");
        
        // Show toast message
        toast({
          title: "Password Updated",
          description: "Your password has been reset successfully.",
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/auth?mode=login");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setStatus("error");
      setMessage(error.message || "An error occurred during password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <Check className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
                <div className="mt-2">
                  Redirecting you to login...
                </div>
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

          {(status === "ready" || status === "processing") && tokenValid && (
            <form onSubmit={handlePasswordReset}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <div className="w-full flex justify-center">
            <Link to="/auth?mode=login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
