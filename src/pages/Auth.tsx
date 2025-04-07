
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultMode = queryParams.get("mode") === "login" ? "login" : "signup";
  
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { setIsLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Update the tab when the URL query parameter changes
  useEffect(() => {
    const newMode = queryParams.get("mode") === "login" ? "login" : "signup";
    setMode(newMode);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!email || !password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (mode === "signup" && password !== confirmedPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      // Placeholder for Supabase authentication
      // This will be replaced with actual Supabase auth once integrated
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (mode === "signup") {
        // Mock signup success
        toast.success("Account created successfully!");
      }
      
      // Set auth state in context and local storage for demo purposes
      setIsLoggedIn(true);
      localStorage.setItem("wellura-authenticated", "true");
      
      // Redirect to profile setup for new users
      navigate("/profile-setup");
      
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wellura-500 mb-2">Wellura Brasil</h1>
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmedPassword}
                      onChange={(e) => setConfirmedPassword(e.target.value)}
                      required
                    />
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
    </div>
  );
};

export default Auth;
