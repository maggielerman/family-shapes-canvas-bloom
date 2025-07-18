-- Remove primary tree concept - Step 1: Drop dependent objects

-- 1. Drop the RLS policy that depends on family_tree_id
DROP POLICY IF EXISTS "Public access to persons in public family trees" ON persons;

-- 2. Drop the view that depends on family_tree_id  
DROP VIEW IF EXISTS persons_with_trees;

-- 3. Now we can safely drop the columns
ALTER TABLE persons DROP COLUMN IF EXISTS family_tree_id;
ALTER TABLE family_tree_members DROP COLUMN IF EXISTS is_primary;

-- 4. Recreate the view without family_tree_id dependency
CREATE VIEW persons_with_trees AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'family_tree_id', ftm.family_tree_id,
        'role', ftm.role,
        'added_by', ftm.added_by,
        'created_at', ftm.created_at
      )
    ) FILTER (WHERE ftm.family_tree_id IS NOT NULL),
    '[]'::json
  ) AS family_trees
FROM persons p
LEFT JOIN family_tree_members ftm ON p.id = ftm.person_id
GROUP BY p.id;

-- 5. Update the RLS policy to use family_tree_members relationship
CREATE POLICY "Public access to persons in public family trees" 
ON persons FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM family_tree_members ftm
    JOIN family_trees ft ON ftm.family_tree_id = ft.id
    WHERE ftm.person_id = persons.id 
    AND ft.visibility = 'public'
  )
);