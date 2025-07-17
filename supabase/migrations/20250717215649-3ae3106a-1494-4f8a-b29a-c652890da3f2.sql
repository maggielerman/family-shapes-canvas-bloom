-- Enable RLS on organization_invitations table
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Policy for organization owners to create invitations
CREATE POLICY "Organization owners can create invitations" 
ON public.organization_invitations 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_invitations.organization_id 
    AND owner_id = auth.uid()
  )
);

-- Policy for organization owners to view invitations for their organizations
CREATE POLICY "Organization owners can view their invitations" 
ON public.organization_invitations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_invitations.organization_id 
    AND owner_id = auth.uid()
  )
);

-- Policy for organization owners to update invitations
CREATE POLICY "Organization owners can update their invitations" 
ON public.organization_invitations 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_invitations.organization_id 
    AND owner_id = auth.uid()
  )
);

-- Policy for organization owners to delete invitations
CREATE POLICY "Organization owners can delete their invitations" 
ON public.organization_invitations 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_invitations.organization_id 
    AND owner_id = auth.uid()
  )
);