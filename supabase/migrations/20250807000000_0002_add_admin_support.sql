-- Add admin support to existing user_profiles table
-- Simple migration to enable admin authentication functionality

-- Add role column to user_profiles table for admin access control
ALTER TABLE public.user_profiles 
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
ADD COLUMN last_login_at TIMESTAMPTZ;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Create admin_sessions table for session tracking
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Index for active sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_active 
    ON public.admin_sessions(user_id, is_active) 
    WHERE is_active = true;

-- Policy: Users can view and manage their own sessions
CREATE POLICY "Users can view own sessions" ON public.admin_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.admin_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.admin_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Custom Access Token Hook for adding admin claims to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role TEXT;
BEGIN
    -- Fetch the user role
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
        -- Add role to claims
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
        claims := jsonb_set(claims, '{is_admin}', to_jsonb(user_role IN ('admin', 'super_admin')));
        claims := jsonb_set(claims, '{is_super_admin}', to_jsonb(user_role = 'super_admin'));
    END IF;

    -- Update the claims in the event
    event := jsonb_set(event, '{claims}', claims);

    RETURN event;
END;
$$;

-- Grant necessary permissions for the auth hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.role IS 'Admin role for authentication (user, admin, super_admin)';
COMMENT ON TABLE public.admin_sessions IS 'Session tracking for admin users';
COMMENT ON FUNCTION public.custom_access_token_hook IS 'Auth hook to add admin claims to JWT tokens';