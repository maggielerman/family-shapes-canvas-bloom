
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, accountType?: 'individual' | 'organization') => Promise<{ error: any }>;
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

  const signUp = async (email: string, password: string, fullName?: string, accountType: 'individual' | 'organization' = 'individual') => {
    console.log('Attempting signup for:', email, 'with name:', fullName, 'account type:', accountType);
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      // Prepare user metadata based on account type
      const userMetadata: { full_name?: string; account_type: string; organization_name?: string } = {
        account_type: accountType
      };

      if (accountType === 'organization') {
        userMetadata.organization_name = fullName;
      } else {
        userMetadata.full_name = fullName;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userMetadata
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
      const { error } = await supabase.auth.signOut();
      console.log('Signout response:', { error });
      return { error };
    } catch (err) {
      console.error('Signout error:', err);
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
