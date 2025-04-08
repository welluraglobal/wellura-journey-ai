
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Mail, Key, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BackButton from "@/components/BackButton";

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultMode = queryParams.get("mode") === "login" ? "login" : "signup";
  
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetEmailSending, setIsResetEmailSending] = useState(false);
  
  const { setIsLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    const newMode = queryParams.get("mode") === "login" ? "login" : "signup";
    setMode(newMode);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields"
        });
        setIsLoading(false);
        return;
      }
      
      if (mode === "signup") {
        if (password !== confirmedPassword) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Passwords do not match"
          });
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              user_type: 'user',
              updated_at: new Date().toISOString()
            }
          }
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to confirm your account."
        });
        
      } else {
        console.log("Logging in with:", email, "password length:", password.length);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          throw error;
        }
        
        console.log("Login successful, data:", data);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session obtained after login:", session);
        setIsLoggedIn(true);
        localStorage.setItem("wellura-authenticated", "true");
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, privacy_accepted, health_disclaimer_accepted')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            navigate("/profile-setup");
            return;
          }
          
          if (profile) {
            const hasPolicyAccepted = !!profile.privacy_accepted && !!profile.health_disclaimer_accepted;
            
            if (!hasPolicyAccepted) {
              if (profile.first_name) {
                navigate("/confirmations");
              } else {
                navigate("/profile-setup");
              }
            } else if (profile.first_name) {
              navigate("/dashboard");
            } else {
              navigate("/profile-setup");
            }
          } else {
            navigate("/profile-setup");
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          navigate("/profile-setup");
        }
      }
      
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Authentication failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address"
      });
      return;
    }

    setIsResetEmailSending(true);
    try {
      // Fixed: Use absolute URL for reset link
      const currentUrl = window.location.origin;
      const resetUrl = `${currentUrl}/reset-password`;
      console.log("Reset URL:", resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: resetUrl,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password"
      });
      setIsForgotPasswordDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again."
      });
    } finally {
      setIsResetEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <BackButton fallbackPath="/" className="w-full max-w-[100px]" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wellura-500 mb-2">Wellura App</h1>
          <p className="text-muted-foreground">Your personalized wellness journey</p>
        </div>
        
        <Tabs defaultValue={mode} value={mode} onValueChange={(value) => setMode(value as "login" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader>
              <CardTitle>{mode === "login" ? "Welcome Back" : "Create Your Account"}</CardTitle>
              <CardDescription>
                {mode === "login" 
                  ? "Enter your credentials to access your account" 
                  : "Sign up to start your wellness journey"}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                    />
                  </div>
                </div>
                
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmedPassword}
                        onChange={(e) => setConfirmedPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
                </Button>
                
                {mode === "login" && (
                  <>
                    <Button
                      type="button"
                      variant="link"
                      className="mb-2 p-0 h-auto"
                      onClick={() => setIsForgotPasswordDialogOpen(true)}
                    >
                      Forgot Password?
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => setMode("signup")}
                      >
                        Sign up
                      </Button>
                    </p>
                  </>
                )}
                
                {mode === "signup" && (
                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => setMode("login")}
                    >
                      Login
                    </Button>
                  </p>
                )}
              </CardFooter>
            </form>
          </Card>
        </Tabs>
      </div>

      <Dialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleResetPassword}
              disabled={isResetEmailSending}
            >
              {isResetEmailSending ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
