import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: string | null;
  user: any | null;
  loading: boolean;
}

interface JWTClaims {
  user_role?: string;
  is_admin?: boolean;
  is_super_admin?: boolean;
  [key: string]: any;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isSuperAdmin: false,
    userRole: null,
    user: null,
    loading: true,
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkAdminAuth();
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          userRole: null,
          user: null,
          loading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!session) {
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isSuperAdmin: false,
          userRole: null,
          user: null,
          loading: false,
        });
        return;
      }

      // Decode JWT to get custom claims
      const token = session.access_token;
      const claims = jwtDecode<JWTClaims>(token);
      
      // Check if user has admin role in claims
      const isAdmin = claims.is_admin === true;
      const isSuperAdmin = claims.is_super_admin === true;
      const userRole = claims.user_role || null;

      // Additionally verify with database (belt and suspenders approach)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const dbRole = profile?.role;
      const dbIsAdmin = dbRole === 'admin' || dbRole === 'super_admin';
      const dbIsSuperAdmin = dbRole === 'super_admin';

      // Use the most restrictive permission (both JWT and DB must agree)
      setAuthState({
        isAuthenticated: true,
        isAdmin: isAdmin && dbIsAdmin,
        isSuperAdmin: isSuperAdmin && dbIsSuperAdmin,
        userRole: dbRole || userRole,
        user: session.user,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking admin auth:', error);
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isSuperAdmin: false,
        userRole: null,
        user: null,
        loading: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has admin privileges
      await checkAdminAuth();
      
      // Verify admin access after sign in
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        // Sign out non-admin users
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Track admin login
      await supabase.from('admin_sessions').insert({
        user_id: data.user.id,
        // ip_address is nullable - real IP should be captured server-side
        user_agent: navigator.userAgent,
      });

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to admin panel.",
      });

      navigate('/admin');
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid credentials or insufficient privileges.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // Invalidate current session
      if (authState.user?.id) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('user_id', authState.user.id)
          .eq('is_active', true);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      navigate('/admin/signin');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const requireAdmin = (redirectTo: string = '/admin/signin') => {
    if (!authState.loading && !authState.isAdmin) {
      navigate(redirectTo);
      return false;
    }
    return authState.isAdmin;
  };

  const requireSuperAdmin = (redirectTo: string = '/admin') => {
    if (!authState.loading && !authState.isSuperAdmin) {
      toast({
        title: "Access denied",
        description: "Super admin privileges required for this action.",
        variant: "destructive",
      });
      navigate(redirectTo);
      return false;
    }
    return authState.isSuperAdmin;
  };

  return {
    ...authState,
    signIn,
    signOut,
    requireAdmin,
    requireSuperAdmin,
    checkAdminAuth,
  };
}