
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import ProfileFormCard, { ProfileFormData } from "@/components/profile/ProfileFormCard";

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { setHasProfile, setFirstName, userProfile, setUserProfile } = useContext(UserContext);
  const navigate = useNavigate();

  // Get the current user ID and check for existing profile
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
          setUserId(data.user.id);
          
          // Check if user already has a profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profile && !error) {
            setIsEditMode(true);
            
            // Get profile values with fallbacks for TypeScript
            const firstName = profile.first_name || '';
            const lastName = profile.last_name || '';
            
            // Extract numeric values from quiz_data if available, or use empty strings
            let age = '';
            let gender = '';
            let height = '';
            let weight = '';
            
            // Check if quiz_data exists and has the required properties
            if (profile.quiz_data) {
              const quizData = profile.quiz_data as Record<string, any>;
              age = quizData.age?.toString() || '';
              gender = quizData.gender || '';
              height = quizData.height?.toString() || '';
              weight = quizData.weight?.toString() || '';
            }
            
            // Fill the form with existing profile data
            setProfileData({
              fullName: `${firstName} ${lastName}`.trim(),
              age,
              gender,
              height,
              weight,
              goal: profile.main_goal || '',
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const updateField = (field: keyof ProfileFormData, value: string) => {
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
      
      // Prepare quiz_data object for storing the profile information
      const quizData = {
        age: parseInt(profileData.age),
        gender: profileData.gender,
        height: parseFloat(profileData.height),
        weight: parseFloat(profileData.weight)
      };
      
      // Save to Supabase profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          main_goal: profileData.goal,
          quiz_data: quizData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Fetch updated profile data
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      // Update context with new profile data
      setUserProfile(updatedProfile);
      setHasProfile(true);
      setFirstName(firstName);
      
      // Store in localStorage for persistence between sessions
      localStorage.setItem("wellura-has-profile", "true");
      localStorage.setItem("wellura-first-name", firstName);
      
      toast.success(isEditMode ? "Profile updated successfully!" : "Profile setup complete!");
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
        <ProfileFormCard 
          profileData={profileData}
          updateField={updateField}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
