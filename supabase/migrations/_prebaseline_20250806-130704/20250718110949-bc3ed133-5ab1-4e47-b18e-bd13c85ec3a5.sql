-- Fix sharing_links to reference family_trees instead of groups
ALTER TABLE public.sharing_links DROP CONSTRAINT sharing_links_group_id_fkey;
ALTER TABLE public.sharing_links RENAME COLUMN group_id TO family_tree_id;
ALTER TABLE public.sharing_links ADD CONSTRAINT sharing_links_family_tree_id_fkey 
  FOREIGN KEY (family_tree_id) REFERENCES family_trees(id) ON DELETE CASCADE;

-- Update sharing_links indexes
DROP INDEX IF EXISTS idx_sharing_links_group_id;
CREATE INDEX idx_sharing_links_family_tree_id ON public.sharing_links USING btree (family_tree_id);

-- Add organization_id to family_trees (optional, for org-level trees)
ALTER TABLE public.family_trees ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_family_trees_organization_id ON public.family_trees USING btree (organization_id);

-- Add group_id to family_trees (optional, for group-level trees)  
ALTER TABLE public.family_trees ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE CASCADE;
CREATE INDEX idx_family_trees_group_id ON public.family_trees USING btree (group_id);

-- Ensure groups MUST belong to organizations (make organization_id NOT NULL)
UPDATE groups SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;
ALTER TABLE public.groups ALTER COLUMN organization_id SET NOT NULL;

-- Update RLS policies for sharing_links to reference family_trees
DROP POLICY IF EXISTS "Users can manage sharing links for families they own or admin" ON sharing_links;
DROP POLICY IF EXISTS "Users can view sharing links for families they have access to" ON sharing_links;

CREATE POLICY "Users can manage sharing links for family trees they own or have access to" 
ON public.sharing_links 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM family_trees ft 
  WHERE ft.id = sharing_links.family_tree_id 
  AND (
    ft.user_id = auth.uid() OR
    (ft.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_memberships om 
      WHERE om.organization_id = ft.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('admin', 'editor')
    )) OR
    (ft.group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM groups g 
      JOIN organization_memberships om ON om.organization_id = g.organization_id
      WHERE g.id = ft.group_id 
      AND om.user_id = auth.uid() 
      AND om.role IN ('admin', 'editor')
    ))
  )
));

CREATE POLICY "Users can view sharing links for family trees they have access to" 
ON public.sharing_links 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM family_trees ft 
  WHERE ft.id = sharing_links.family_tree_id 
  AND (
    ft.user_id = auth.uid() OR
    ft.visibility = 'public' OR
    (ft.organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_memberships om 
      WHERE om.organization_id = ft.organization_id 
      AND om.user_id = auth.uid()
    )) OR
    (ft.group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM groups g 
      JOIN organization_memberships om ON om.organization_id = g.organization_id
      WHERE g.id = ft.group_id 
      AND om.user_id = auth.uid()
    ))
  )
));