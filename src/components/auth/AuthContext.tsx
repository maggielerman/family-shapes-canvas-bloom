
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Event details:', { event, hasSession: !!session, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting signup for:', email, 'with name:', fullName);
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined
        }
      });
      
      console.log('Signup response:', { data, error });
      return { error };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting signin for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Signin response:', { data, error });
      return { error };
    } catch (err) {
      console.error('Signin error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Attempting signout');
    try {
      console.log('Current user before signout:', user?.email);
      console.log('Current session before signout:', session?.access_token ? 'exists' : 'none');
      
      // Try multiple approaches to sign out
      let error = null;
      
      // Approach 1: Try the official sign out
      try {
        const result = await supabase.auth.signOut();
        error = result.error;
        console.log('Official signout result:', result);
        
        // If we get a session_not_found error, treat it as success
        if (error && error.message && error.message.includes('session_not_found')) {
          console.log('Session not found - treating as successful logout');
          error = null; // Clear the error since this is actually success
        }
      } catch (signOutErr) {
        console.log('Official signout failed:', signOutErr);
        // Check if it's a session_not_found error in the catch block too
        if (signOutErr.message && signOutErr.message.includes('session_not_found')) {
          console.log('Session not found in catch - treating as successful logout');
          error = null;
        } else {
          error = signOutErr;
        }
      }
      
      // Approach 2: Clear local storage manually
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('sb-nhkufibfwskdpzdjwirr-auth-token');
          localStorage.removeItem('supabase.auth.token');
          console.log('Local storage cleared');
        } catch (storageErr) {
          console.log('Failed to clear local storage:', storageErr);
        }
      }
      
      // Approach 3: Clear local state regardless
      console.log('Clearing local state');
      setUser(null);
      setSession(null);
      
      return { error };
    } catch (err) {
      console.error('Signout error:', err);
      // Clear local state even if there's an error
      setUser(null);
      setSession(null);
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
