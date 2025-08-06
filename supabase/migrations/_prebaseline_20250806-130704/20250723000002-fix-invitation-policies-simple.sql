-- Simple fix for organization_invitations RLS policies
-- This ensures both organization owners and members with admin/editor roles can manage invitations

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Organization owners can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization owners can view their invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization owners can update their invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization owners can delete their invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins and managers can create invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins and managers can view invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins and managers can update invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization admins and managers can delete invitations" ON public.organization_invitations;

-- Create a single comprehensive policy for all operations
CREATE POLICY "Allow organization management" 
ON public.organization_invitations 
FOR ALL 
TO authenticated
USING (
  -- User is the organization owner
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR
  -- User is an admin or editor member
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  -- User is the organization owner
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR
  -- User is an admin or editor member
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
); 