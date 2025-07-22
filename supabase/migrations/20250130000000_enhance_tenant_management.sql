-- Migration: Enhanced Tenant Management System
-- Adds proper organization signup flow and account type tracking

-- Add account_type to user_profiles to track individual vs organization accounts
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization'));

-- Add organization_id to user_profiles to link organization owners to their organization
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON public.user_profiles(account_type);

-- Function to automatically create organization during signup for organization accounts
CREATE OR REPLACE FUNCTION handle_organization_signup()
RETURNS TRIGGER AS $$
DECLARE
    org_name text;
    org_slug text;
    org_subdomain text;
    new_org_id uuid;
BEGIN
    -- Only process if this is an organization account
    IF NEW.account_type = 'organization' AND NEW.full_name IS NOT NULL THEN
        -- Extract organization name from full_name
        org_name := NEW.full_name;
        
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
            'fertility_clinic', -- Default type, can be changed later
            'Organization created during signup',
            'private',
            NEW.id
        ) RETURNING id INTO new_org_id;
        
        -- Link the user profile to the organization
        NEW.organization_id := new_org_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for organization signup
DROP TRIGGER IF EXISTS trigger_handle_organization_signup ON public.user_profiles;
CREATE TRIGGER trigger_handle_organization_signup
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_organization_signup();

-- Function to handle organization signup from Auth metadata
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    account_type_value text;
    org_name text;
BEGIN
    -- Extract account type and organization name from user metadata
    account_type_value := COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual');
    org_name := NEW.raw_user_meta_data->>'organization_name';
    
    -- Create user profile
    INSERT INTO public.user_profiles (
        id,
        full_name,
        account_type
    ) VALUES (
        NEW.id,
        CASE 
            WHEN account_type_value = 'organization' AND org_name IS NOT NULL THEN org_name
            ELSE NEW.raw_user_meta_data->>'full_name'
        END,
        account_type_value
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
GRANT EXECUTE ON FUNCTION handle_organization_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Update RLS policies for user_profiles to handle organization accounts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Allow organization owners to view their organization
CREATE POLICY "Organization owners can view their organization" ON public.organizations
    FOR SELECT USING (owner_id = auth.uid());

-- Update existing users to have account_type if not set
UPDATE public.user_profiles 
SET account_type = 'individual' 
WHERE account_type IS NULL;