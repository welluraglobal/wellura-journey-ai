
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

  // Utility function to extract token from various possible sources
  const extractTokenFromUrl = () => {
    console.log("Extracting token from URL...");
    console.log("Current URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("URL hash:", window.location.hash);
    
    // Check for token in URL query parameters
    const token = searchParams.get("token") || 
                  searchParams.get("access_token") || 
                  searchParams.get("t");
    
    if (token) {
      console.log("Token found in URL parameters:", token);
      return token;
    }
    
    // Check for token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashToken = hashParams.get("token") || 
                      hashParams.get("access_token") || 
                      hashParams.get("t");
    
    if (hashToken) {
      console.log("Token found in URL hash:", hashToken);
      return hashToken;
    }
    
    // Check for Supabase recovery flow
    const type = searchParams.get("type");
    if (type === "recovery") {
      const recoveryToken = searchParams.get("token");
      if (recoveryToken) {
        console.log("Recovery token found:", recoveryToken);
        return recoveryToken;
      }
    }
    
    console.log("No token found in URL");
    return null;
  };

  useEffect(() => {
    const token = extractTokenFromUrl();
    
    if (token) {
      setAccessToken(token);
      console.log("Token extracted and stored successfully");
    } else {
      setStatus("error");
      setMessage("No reset token found. Please request a new password reset link.");
      console.error("Failed to extract token from URL");
    }
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("processing");

    try {
      // Validate passwords
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

      // First approach: try to update user directly with the token
      try {
        const { error } = await supabase.auth.updateUser({
          password: password
        }, {
          emailRedirectTo: window.location.origin + "/auth?mode=login"
        });
        
        if (error) {
          console.log("Direct update failed, trying with session:", error.message);
          throw error; // Proceed to next approach
        } else {
          // Success with direct update
          setStatus("success");
          setMessage("Your password has been reset successfully!");
          toast({
            title: "Password Updated",
            description: "Your password has been reset successfully.",
          });
          
          setTimeout(() => {
            navigate("/auth?mode=login");
          }, 3000);
          return;
        }
      } catch (directUpdateError) {
        console.log("Moving to session approach after direct update failed");
      }

      // Second approach: try to use the token to set the session
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (error) {
          console.error("Error setting session:", error);
          throw error; // Proceed to next approach
        }
        
        console.log("Session set successfully:", data);
        
        // Update the password after session is set
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });

        if (updateError) {
          throw updateError;
        } else {
          // Success with session method
          setStatus("success");
          setMessage("Your password has been reset successfully!");
          
          toast({
            title: "Password Updated",
            description: "Your password has been reset successfully.",
          });
          
          setTimeout(() => {
            navigate("/auth?mode=login");
          }, 3000);
          return;
        }
      } catch (sessionError) {
        console.error("Session approach failed:", sessionError);
        
        // Third approach: try with recovery flow
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(
            searchParams.get("email") || "",
            {
              redirectTo: window.location.origin + "/reset-password"
            }
          );
          
          if (error) {
            throw error;
          } else {
            setStatus("success");
            setMessage("A new password reset link has been sent to your email.");
            setTimeout(() => {
              navigate("/auth?mode=login");
            }, 3000);
            return;
          }
        } catch (recoveryError) {
          console.error("All password reset approaches failed:", recoveryError);
          throw new Error("Password reset failed after trying multiple approaches");
        }
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setStatus("error");
      setMessage(error.message || "An error occurred during password reset. Please try again or request a new reset link.");
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

          {(status === "ready" || status === "processing") && !accessToken && (
            <div className="text-center py-4">
              <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Missing Reset Token</h3>
              <p className="text-muted-foreground mb-4">
                The password reset link appears to be invalid or has expired.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth?mode=forgotPassword")}
                className="mt-2"
              >
                Request New Reset Link
              </Button>
            </div>
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
