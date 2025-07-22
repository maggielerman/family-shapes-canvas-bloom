-- Verify and debug RLS policies for organization_invitations
-- This migration helps us understand what's happening with the policies

-- Create a function to check current user's permissions
CREATE OR REPLACE FUNCTION public.debug_user_permissions(org_id uuid)
RETURNS TABLE (
  user_id uuid,
  is_owner boolean,
  is_admin boolean,
  is_editor boolean,
  can_manage boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = org_id AND o.owner_id = auth.uid()
    ) as is_owner,
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = org_id 
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    ) as is_admin,
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = org_id 
      AND om.user_id = auth.uid()
      AND om.role = 'editor'
    ) as is_editor,
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = org_id 
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'editor')
    ) OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = org_id AND o.owner_id = auth.uid()
    ) as can_manage;
END;
$$;

-- Grant access to the debug function
GRANT EXECUTE ON FUNCTION public.debug_user_permissions(uuid) TO authenticated;

-- Create a function to list all RLS policies on organization_invitations
CREATE OR REPLACE FUNCTION public.list_invitation_policies()
RETURNS TABLE (
  policy_name text,
  operation text,
  definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname::text,
    p.cmd::text,
    p.qual::text
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  WHERE c.relname = 'organization_invitations';
END;
$$;

-- Grant access to the policy list function
GRANT EXECUTE ON FUNCTION public.list_invitation_policies() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.debug_user_permissions(uuid) IS 'Debug function to check user permissions for an organization';
COMMENT ON FUNCTION public.list_invitation_policies() IS 'List all RLS policies on organization_invitations table'; 