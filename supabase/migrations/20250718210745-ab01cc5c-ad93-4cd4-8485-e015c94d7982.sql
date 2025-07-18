-- Create a junction table for family tree memberships (many-to-many relationship)
CREATE TABLE public.family_tree_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_tree_id uuid NOT NULL REFERENCES public.family_trees(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id),
  role text DEFAULT 'member'::text,
  is_primary boolean DEFAULT false, -- Indicates if this is the person's primary family tree
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(family_tree_id, person_id)
);

-- Enable RLS on the new table
ALTER TABLE public.family_tree_members ENABLE ROW LEVEL SECURITY;

-- Create policies for family_tree_members
CREATE POLICY "Users can view family tree members they have access to"
ON public.family_tree_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_members.family_tree_id
    AND (ft.user_id = auth.uid() OR ft.visibility = 'public')
  )
);

CREATE POLICY "Users can add members to their family trees"
ON public.family_tree_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_members.family_tree_id
    AND ft.user_id = auth.uid()
  )
  AND added_by = auth.uid()
);

CREATE POLICY "Users can update members in their family trees"
ON public.family_tree_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_members.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove members from their family trees"
ON public.family_tree_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_members.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

-- Add a trigger for updated_at
CREATE TRIGGER update_family_tree_members_updated_at
  BEFORE UPDATE ON public.family_tree_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_self column to persons table to mark a person as representing the current user
ALTER TABLE public.persons 
ADD COLUMN is_self boolean DEFAULT false;

-- Add a unique constraint to ensure only one person per user can be marked as self
CREATE UNIQUE INDEX idx_persons_user_self 
ON public.persons (user_id) 
WHERE is_self = true;

-- Migrate existing family_tree_id relationships to the new junction table
INSERT INTO public.family_tree_members (family_tree_id, person_id, added_by, is_primary)
SELECT 
  p.family_tree_id,
  p.id,
  p.user_id,
  true -- Mark as primary since it was their original tree
FROM public.persons p
WHERE p.family_tree_id IS NOT NULL
ON CONFLICT (family_tree_id, person_id) DO NOTHING;

-- Create a view for easier querying of persons with their family trees
CREATE OR REPLACE VIEW public.persons_with_trees AS
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