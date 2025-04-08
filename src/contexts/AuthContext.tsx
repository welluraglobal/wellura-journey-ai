
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define types for the auth context
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  session: any | null;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any }>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  authState: {
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
  },
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  requestPasswordReset: async () => ({ error: null }),
});

// Export context provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track authentication
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            loading: false,
          });
          return;
        }
        
        if (data && data.session) {
          setAuthState({
            isAuthenticated: true,
            user: data.session.user,
            session: data.session,
            loading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session && event !== 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: true,
            user: session.user,
            session: session,
            loading: false,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    // Initial session check
    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Sign In Successful",
        description: "Welcome back!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      toast({
        title: "Account Created",
        description: "Please check your email to confirm your account",
      });
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  // Sign out functionality
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  // Password reset functionality
  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
