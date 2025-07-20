-- Fix security definer view issue by recreating without SECURITY DEFINER
-- This ensures the view respects RLS policies of the querying user

-- Drop the existing view
DROP VIEW IF EXISTS public.persons_with_trees;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW public.persons_with_trees AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'family_tree_id', ftm.family_tree_id,
        'family_tree_name', ft.name,
        'family_tree_visibility', ft.visibility,
        'is_primary', ftm.is_primary,
        'role', ftm.role,
        'added_at', ftm.created_at
      )
    ) FILTER (WHERE ftm.family_tree_id IS NOT NULL),
    '[]'::json
  ) as family_trees
FROM public.persons p
LEFT JOIN public.family_tree_members ftm ON p.id = ftm.person_id
LEFT JOIN public.family_trees ft ON ftm.family_tree_id = ft.id
GROUP BY p.id;