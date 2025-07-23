-- Remove family_tree_id from connections table since it's redundant
-- Tree membership is already established through family_tree_members junction table

-- First, drop the RLS policy that depends on family_tree_id
DROP POLICY IF EXISTS "Public access to connections in public family trees" ON public.connections;

-- Drop any foreign key constraints
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_family_tree_id_fkey;

-- Drop any indexes on family_tree_id
DROP INDEX IF EXISTS idx_connections_family_tree_id;

-- Remove the column
ALTER TABLE public.connections DROP COLUMN IF EXISTS family_tree_id;

-- Create a new RLS policy that works with the junction table approach
-- This policy allows public access to connections when both people are in a public family tree
CREATE POLICY "Public access to connections in public family trees" 
ON public.connections 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_tree_members ftm1
    JOIN public.family_tree_members ftm2 ON ftm1.family_tree_id = ftm2.family_tree_id
    JOIN public.family_trees ft ON ftm1.family_tree_id = ft.id
    WHERE ftm1.person_id = connections.from_person_id 
    AND ftm2.person_id = connections.to_person_id
    AND ft.visibility = 'public'
  )
);

-- Note: This is a breaking change that requires updating the application code
-- to use family_tree_members junction table for tree-specific queries 