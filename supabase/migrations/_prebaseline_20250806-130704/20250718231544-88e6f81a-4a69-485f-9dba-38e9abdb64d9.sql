-- Remove the primary tree concept from data model

-- 1. Remove family_tree_id from persons table (legacy direct reference)
ALTER TABLE persons DROP COLUMN IF EXISTS family_tree_id;

-- 2. Remove is_primary from family_tree_members table  
ALTER TABLE family_tree_members DROP COLUMN IF EXISTS is_primary;

-- 3. Update any indexes that might reference these columns
-- (PostgreSQL will automatically drop dependent indexes)

-- Note: This simplifies the model to pure many-to-many relationships
-- Each person can be in multiple trees with equal status