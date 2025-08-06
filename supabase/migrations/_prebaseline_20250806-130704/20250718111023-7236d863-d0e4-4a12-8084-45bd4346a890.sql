-- Update sharing_links table to support multi-level sharing
-- First, make group_id nullable since we'll have other reference options
ALTER TABLE public.sharing_links 
ALTER COLUMN group_id DROP NOT NULL;

-- Add new reference columns for different sharing levels
DO $$ 
BEGIN
    -- Add family_tree_id for individual tree sharing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sharing_links' 
        AND column_name = 'family_tree_id'
    ) THEN
        ALTER TABLE public.sharing_links 
        ADD COLUMN family_tree_id uuid;
    END IF;
    
    -- Add organization_id for org-level sharing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sharing_links' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.sharing_links 
        ADD COLUMN organization_id uuid;
    END IF;
END $$;

-- Add constraint to ensure exactly one sharing target is specified
ALTER TABLE public.sharing_links 
ADD CONSTRAINT sharing_links_single_target_check 
CHECK (
    (family_tree_id IS NOT NULL AND group_id IS NULL AND organization_id IS NULL) OR
    (family_tree_id IS NULL AND group_id IS NOT NULL AND organization_id IS NULL) OR
    (family_tree_id IS NULL AND group_id IS NULL AND organization_id IS NOT NULL)
);

-- Update RLS policies for sharing_links to handle all three levels
DROP POLICY IF EXISTS "Users can manage sharing links for families they own or admin" ON public.sharing_links;
DROP POLICY IF EXISTS "Users can view sharing links for families they have access to" ON public.sharing_links;

-- New comprehensive policy for managing sharing links
CREATE POLICY "Users can manage sharing links they created or have admin access to" 
ON public.sharing_links 
FOR ALL 
USING (
    created_by = auth.uid() OR
    -- Family tree level access
    (family_tree_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM family_trees ft 
        WHERE ft.id = sharing_links.family_tree_id 
        AND ft.user_id = auth.uid()
    )) OR
    -- Group level access
    (group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM groups g 
        WHERE g.id = sharing_links.group_id 
        AND (g.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM group_memberships gm 
            WHERE gm.group_id = g.id 
            AND gm.user_id = auth.uid() 
            AND gm.role IN ('admin', 'editor')
        ))
    )) OR
    -- Organization level access
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM organizations o 
        WHERE o.id = sharing_links.organization_id 
        AND (o.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM organization_memberships om 
            WHERE om.organization_id = o.id 
            AND om.user_id = auth.uid() 
            AND om.role IN ('admin', 'editor')
        ))
    ))
);

-- Policy for viewing sharing links
CREATE POLICY "Users can view sharing links they have access to" 
ON public.sharing_links 
FOR SELECT 
USING (
    -- Family tree level access (owner or public)
    (family_tree_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM family_trees ft 
        WHERE ft.id = sharing_links.family_tree_id 
        AND (ft.user_id = auth.uid() OR ft.visibility = 'public')
    )) OR
    -- Group level access
    (group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM groups g 
        WHERE g.id = sharing_links.group_id 
        AND (g.owner_id = auth.uid() OR g.visibility = 'public' OR EXISTS (
            SELECT 1 FROM group_memberships gm 
            WHERE gm.group_id = g.id 
            AND gm.user_id = auth.uid()
        ))
    )) OR
    -- Organization level access
    (organization_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM organizations o 
        WHERE o.id = sharing_links.organization_id 
        AND (o.owner_id = auth.uid() OR o.visibility = 'public' OR EXISTS (
            SELECT 1 FROM organization_memberships om 
            WHERE om.organization_id = o.id 
            AND om.user_id = auth.uid()
        ))
    ))
);