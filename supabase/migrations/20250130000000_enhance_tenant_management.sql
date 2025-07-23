-- Migration: Enhanced Tenant Management System
-- Adds organization management for existing users

-- Add account_type to user_profiles to track individual vs organization accounts
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization'));

-- Add organization_id to user_profiles to link organization owners to their organization
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);

-- Function to create organization for existing user
CREATE OR REPLACE FUNCTION create_organization_for_user(
    org_name text,
    org_type text DEFAULT 'fertility_clinic',
    org_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    org_slug text;
    org_subdomain text;
    new_org_id uuid;
    current_user_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Ensure user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create an organization';
    END IF;
    
    -- Ensure organization name is provided
    IF org_name IS NULL OR trim(org_name) = '' THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;
    
    -- Generate slug and subdomain from organization name
    org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
    org_slug := trim(both '-' from org_slug);
    
    -- Ensure slug uniqueness by appending random suffix if needed
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    END LOOP;
    
    org_subdomain := org_slug;
    
    -- Ensure subdomain uniqueness
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE subdomain = org_subdomain) LOOP
        org_subdomain := org_subdomain || '-' || substr(gen_random_uuid()::text, 1, 8);
    END LOOP;
    
    -- Create the organization
    INSERT INTO public.organizations (
        name,
        slug,
        subdomain,
        type,
        description,
        visibility,
        owner_id
    ) VALUES (
        org_name,
        org_slug,
        org_subdomain,
        org_type,
        COALESCE(org_description, 'Organization created during signup'),
        'private',
        current_user_id
    ) RETURNING id INTO new_org_id;
    
    -- Update user profile to link to organization and change account type
    UPDATE public.user_profiles 
    SET organization_id = new_org_id,
        account_type = 'organization'
    WHERE id = current_user_id;
    
    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup (simplified - no organization logic)
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile for new auth user
    INSERT INTO public.user_profiles (
        id,
        full_name,
        account_type
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'individual' -- Default to individual account
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_organization_for_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Allow organization owners to view and update their organization
DROP POLICY IF EXISTS "Organization owners can view their organization" ON public.organizations;
CREATE POLICY "Organization owners can view their organization" ON public.organizations
    FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Organization owners can update their organization" ON public.organizations;
CREATE POLICY "Organization owners can update their organization" ON public.organizations
    FOR UPDATE USING (owner_id = auth.uid());

-- Update existing users to have account_type if not set
UPDATE public.user_profiles 
SET account_type = 'individual' 
WHERE account_type IS NULL;