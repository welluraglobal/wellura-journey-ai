
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

// Define the UserContext type
export interface UserContextType {
  isLoggedIn: boolean;
  hasProfile: boolean;
  firstName: string;
  userId: string | null;
  userProfile: any;
  setFirstName: (name: string) => void;
  setHasProfile: (has: boolean) => void;
  setUserProfile: (profile: any) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

// Create context with default values
export const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  hasProfile: false,
  firstName: '',
  userId: null,
  userProfile: null,
  setFirstName: () => {},
  setHasProfile: () => {},
  setUserProfile: () => {},
  setIsLoggedIn: () => {},
});

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { authState } = useAuth();

  // Effect to sync with auth state
  useEffect(() => {
    const isAuthenticated = authState.isAuthenticated;
    setIsLoggedIn(isAuthenticated);
    
    if (isAuthenticated && authState.user) {
      setUserId(authState.user.id);
      
      // Load profile data from local storage if available
      const storedHasProfile = localStorage.getItem("wellura-has-profile") === "true";
      const storedFirstName = localStorage.getItem("wellura-first-name") || '';
      
      setHasProfile(storedHasProfile);
      setFirstName(storedFirstName);
      
      // Fetch user profile from Supabase
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authState.user.id)
            .single();
            
          if (error) {
            if (error.code !== 'PGRST116') { // Not found error
              console.error("Error fetching user profile:", error);
            }
            return;
          }
          
          if (data) {
            setUserProfile(data);
            setHasProfile(true);
            
            // Store first name if available
            if (data.first_name) {
              setFirstName(data.first_name);
              localStorage.setItem("wellura-first-name", data.first_name);
              localStorage.setItem("wellura-has-profile", "true");
            }
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
        }
      };
      
      // Use setTimeout to prevent potential auth state deadlocks
      setTimeout(() => {
        fetchUserProfile();
      }, 0);
    } else {
      // Clear user data on logout
      setUserId(null);
      setUserProfile(null);
      setHasProfile(false);
      setFirstName('');
      
      // Clear local storage
      localStorage.removeItem("wellura-has-profile");
      localStorage.removeItem("wellura-first-name");
    }
  }, [authState.isAuthenticated, authState.user]);

  return (
    <UserContext.Provider 
      value={{
        isLoggedIn,
        hasProfile,
        firstName,
        userId,
        userProfile,
        setFirstName,
        setHasProfile,
        setUserProfile,
        setIsLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);
