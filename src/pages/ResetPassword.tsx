
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
import BackButton from "@/components/BackButton";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"ready" | "processing" | "success" | "error">("ready");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const extractToken = () => {
      // First, check URL parameters
      const token = searchParams.get("access_token");
      if (token) {
        console.log("Access token found in URL parameters");
        return token;
      }
      
      // Next, check hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashToken = hashParams.get("access_token");
      if (hashToken) {
        console.log("Access token found in URL hash");
        return hashToken;
      }
      
      // Check for type=recovery parameter (Supabase verification links format)
      const type = searchParams.get("type");
      if (type === "recovery") {
        const recoveryToken = searchParams.get("token");
        if (recoveryToken) {
          console.log("Recovery token found in URL parameters");
          return recoveryToken;
        }
      }
      
      // Check for direct token parameter
      const directToken = searchParams.get("token");
      if (directToken) {
        console.log("Token found directly in URL parameters");
        return directToken;
      }
      
      console.error("No access/recovery token found in URL");
      console.error("- URL search params:", Object.fromEntries(searchParams.entries()));
      console.error("- URL hash:", window.location.hash);
      console.error("- Full URL:", window.location.href);
      return null;
    };

    const token = extractToken();
    if (token) {
      setAccessToken(token);
    } else {
      setStatus("error");
      setMessage("Invalid or missing reset token. Please request a new password reset link.");
    }
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

      if (!accessToken) {
        setStatus("error");
        setMessage("Invalid reset token. Please request a new password reset link.");
        setIsLoading(false);
        return;
      }

      console.log("Attempting to reset password with token");

      // Set the access token in the session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      if (sessionError) {
        console.error("Error setting session:", sessionError);
        setStatus("error");
        setMessage("Invalid or expired reset token. Please request a new password reset link.");
        setIsLoading(false);
        return;
      }

      // Update the password
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <BackButton fallbackPath="/auth?mode=login" />
      </div>
      
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

          {(status === "ready" || status === "processing") && accessToken && (
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
