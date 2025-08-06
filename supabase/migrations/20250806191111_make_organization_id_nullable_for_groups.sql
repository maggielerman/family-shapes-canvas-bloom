-- Make organization_id nullable to support personal groups
ALTER TABLE public.groups 
ALTER COLUMN organization_id DROP NOT NULL;

-- Update RLS policies to handle both personal and organization groups
DROP POLICY IF EXISTS "Users can view public groups" ON groups;
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can insert groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;

-- Policy for viewing groups
CREATE POLICY "Users can view groups they have access to" ON public.groups
FOR SELECT USING (
  visibility = 'public' OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_memberships gm 
    WHERE gm.group_id = groups.id 
    AND gm.user_id = auth.uid()
  ) OR
  (
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = groups.organization_id
      AND om.user_id = auth.uid()
    )
  )
);

-- Policy for inserting groups (users can create personal or organization groups)
CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (
  owner_id = auth.uid() AND
  (
    -- Personal group (no organization)
    organization_id IS NULL OR
    -- Organization group (user must be member of the organization)
    EXISTS (
      SELECT 1 FROM organization_memberships om
      WHERE om.organization_id = groups.organization_id
      AND om.user_id = auth.uid()
    )
  )
);

-- Policy for updating groups
CREATE POLICY "Users can update groups they own or admin" ON public.groups
FOR UPDATE USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM group_memberships gm 
    WHERE gm.group_id = groups.id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('owner', 'admin')
  )
);

-- Policy for deleting groups
CREATE POLICY "Users can delete groups they own" ON public.groups
FOR DELETE USING (owner_id = auth.uid());