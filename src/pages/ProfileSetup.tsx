
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";

type ProfileData = {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
};

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { setHasProfile, setFirstName } = useContext(UserContext);
  const navigate = useNavigate();

  // Get the current user ID when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Basic validation
      for (const [key, value] of Object.entries(profileData)) {
        if (!value) {
          toast.error(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          setIsLoading(false);
          return;
        }
      }
      
      // Additional numeric validation
      if (isNaN(Number(profileData.age)) || Number(profileData.age) <= 0) {
        toast.error("Please enter a valid age");
        setIsLoading(false);
        return;
      }
      
      if (isNaN(Number(profileData.height)) || Number(profileData.height) <= 0) {
        toast.error("Please enter a valid height");
        setIsLoading(false);
        return;
      }
      
      if (isNaN(Number(profileData.weight)) || Number(profileData.weight) <= 0) {
        toast.error("Please enter a valid weight");
        setIsLoading(false);
        return;
      }

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      // Extract first name from full name for greeting
      const firstName = profileData.fullName.split(" ")[0];
      const lastName = profileData.fullName.split(" ").slice(1).join(" ");
      
      // Save to Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          main_goal: profileData.goal,
          // Add other profile fields
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Set profile completion state and store first name for personalization
      setHasProfile(true);
      setFirstName(firstName);
      
      // Store in localStorage for persistence between sessions
      localStorage.setItem("wellura-has-profile", "true");
      localStorage.setItem("wellura-first-name", firstName);
      
      toast.success("Profile setup complete!");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast.error("Failed to save profile: " + (error.message || "Unknown error"));
      console.error("Profile save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us about yourself so we can personalize your wellness journey
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="30"
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={profileData.gender}
                    onValueChange={(value) => updateField("gender", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (in meters)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profileData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    placeholder="1.75"
                    step="0.01"
                    min="0.5"
                    max="2.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (in kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profileData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    placeholder="70"
                    step="0.1"
                    min="30"
                    max="250"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Main Health Goal</Label>
                <Select
                  value={profileData.goal}
                  onValueChange={(value) => updateField("goal", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                    <SelectItem value="improve_fitness">Improve Fitness</SelectItem>
                    <SelectItem value="increase_energy">Increase Energy</SelectItem>
                    <SelectItem value="improve_sleep">Improve Sleep</SelectItem>
                    <SelectItem value="reduce_stress">Reduce Stress</SelectItem>
                    <SelectItem value="improve_overall">Improve Overall Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
