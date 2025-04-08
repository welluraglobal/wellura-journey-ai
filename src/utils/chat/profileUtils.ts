
import { supabase } from "@/integrations/supabase/client";

// Function to fetch user profile data from Supabase
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, main_goal, quiz_data, email')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data;
};

// Function to extract age, weight, height from quiz_data
export const extractProfileData = (profile: any) => {
  if (!profile) return null;
  
  const quizData = profile.quiz_data || {};
  
  return {
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    email: profile.email || '',
    mainGoal: profile.main_goal || '',
    age: quizData.age || '',
    gender: quizData.gender || '',
    height: quizData.height || '',
    weight: quizData.weight || '',
  };
};
