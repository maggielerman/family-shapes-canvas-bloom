-- Remove family_tree_id from connections table since it's redundant
-- Tree membership is already established through family_tree_members junction table

-- First, drop any foreign key constraints
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_family_tree_id_fkey;

-- Drop any indexes on family_tree_id
DROP INDEX IF EXISTS idx_connections_family_tree_id;

-- Remove the column
ALTER TABLE public.connections DROP COLUMN IF EXISTS family_tree_id;

-- Update any RLS policies that reference family_tree_id
-- The existing policies will need to be updated to use the junction table instead

-- Note: This is a breaking change that requires updating the application code
-- to use family_tree_members junction table for tree-specific queries 