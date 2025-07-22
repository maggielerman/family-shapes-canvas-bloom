-- Fix RLS policies for organization_invitations to allow admins and managers to cancel invitations
-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Organization owners can update their invitations" ON public.organization_invitations;
DROP POLICY IF EXISTS "Organization owners can delete their invitations" ON public.organization_invitations;

-- Create new policy for organization admins and managers to update invitations
CREATE POLICY "Organization admins and managers can update invitations" 
ON public.organization_invitations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
);

-- Create new policy for organization admins and managers to delete invitations
CREATE POLICY "Organization admins and managers can delete invitations" 
ON public.organization_invitations 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
);

-- Also update the view policy to allow admins and managers to view invitations
DROP POLICY IF EXISTS "Organization owners can view their invitations" ON public.organization_invitations;

CREATE POLICY "Organization admins and managers can view invitations" 
ON public.organization_invitations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
);

-- Update the insert policy to allow admins and managers to create invitations
DROP POLICY IF EXISTS "Organization owners can create invitations" ON public.organization_invitations;

CREATE POLICY "Organization admins and managers can create invitations" 
ON public.organization_invitations 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.organization_id = organization_invitations.organization_id 
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'editor')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_invitations.organization_id 
    AND o.owner_id = auth.uid()
  )
); 