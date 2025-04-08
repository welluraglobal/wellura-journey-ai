
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
