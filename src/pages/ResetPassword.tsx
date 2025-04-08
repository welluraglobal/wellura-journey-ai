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

  const extractTokenFromUrl = () => {
    const hash = window.location.hash.substring(1); // remove o "#"
    const params = new URLSearchParams(hash);

    const token = params.get("access_token") || params.get("token");

    if (token) {
      console.log("✅ Token capturado do hash da URL:", token);
      return token;
    }

    return null;
  };

  useEffect(() => {
    setTimeout(() => {
      const token = extractTokenFromUrl();

      if (token) {
        setAccessToken(token);
        setStatus("ready");
      } else {
        setStatus("error");
        setMessage("Reset token not found. Please request a new link.");
      }
      
      // This is important - also check current session
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session ? "Active" : "None");
        if (session) {
          console.log("User is already authenticated, session exists");
        }
      };
      
      checkSession();
    }, 300); // pequeno delay para garantir que o hash esteja acessível
  }, []);

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

      // Try all possible approaches to reset the password
      let resetSuccessful = false;

      // 1. First try with setSession approach (most likely to work with email links)
      try {
        console.log("Trying setSession approach with token:", accessToken);
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (!error) {
          console.log("Session set successfully:", data);
          
          const { error: updateError } = await supabase.auth.updateUser({
            password: password
          });

          if (!updateError) {
            console.log("Password updated successfully with session approach");
            resetSuccessful = true;
          } else {
            console.error("Error updating password after session set:", updateError);
          }
        } else {
          console.error("Error setting session:", error);
        }
      } catch (sessionError) {
        console.error("Session approach failed:", sessionError);
      }

      // 2. Try with the updateUser method (if user is already logged in)
      if (!resetSuccessful) {
        try {
          console.log("Trying direct updateUser approach");
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            const { error } = await supabase.auth.updateUser({
              password: password
            });
            
            if (!error) {
              console.log("Password updated successfully with direct approach");
              resetSuccessful = true;
            } else {
              console.log("Direct update failed:", error.message);
            }
          } else {
            console.log("No active session for direct update");
          }
        } catch (directUpdateError) {
          console.log("Direct update approach failed:", directUpdateError);
        }
      }

      // 3. Try to verify the token as OTP
      if (!resetSuccessful) {
        try {
          console.log("Trying to verify token as OTP");
          const { error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: 'recovery'
          });
          
          if (!error) {
            console.log("Token verified successfully, now updating password");
            const { error: updateError } = await supabase.auth.updateUser({
              password: password
            });
            
            if (!updateError) {
              console.log("Password updated successfully after token verification");
              resetSuccessful = true;
            } else {
              console.error("Error updating password after verification:", updateError);
            }
          } else {
            console.error("Token verification failed:", error);
          }
        } catch (verifyError) {
          console.error("Verification approach failed:", verifyError);
        }
      }

      // Check if any approach was successful
      if (resetSuccessful) {
        setStatus("success");
        setMessage("Your password has been reset successfully!");
        
        toast({
          title: "Password Updated",
          description: "Your password has been reset successfully.",
        });
        
        setTimeout(() => {
          navigate("/auth?mode=login");
        }, 3000);
      } else {
        throw new Error("All password reset approaches failed. Please request a new reset link.");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setStatus("error");
      setMessage(error.message || "An error occurred during password reset. Please try again or request a new reset link.");
      
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password. Please try again or request a new link."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle requesting a new reset link
  const handleRequestNewResetLink = () => {
    navigate("/auth");
    // Open the forgot password dialog programmatically
    // Since we can't directly control the dialog from another component,
    // we'll add a query parameter and handle it in the Auth component
    setTimeout(() => {
      const forgotPasswordButton = document.querySelector('[aria-label="Forgot Password"]');
      if (forgotPasswordButton instanceof HTMLElement) {
        forgotPasswordButton.click();
      }
    }, 500);
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
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRequestNewResetLink}
                    size="sm"
                    className="mt-2"
                  >
                    Request New Reset Link
                  </Button>
                </div>
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
                onClick={handleRequestNewResetLink}
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
