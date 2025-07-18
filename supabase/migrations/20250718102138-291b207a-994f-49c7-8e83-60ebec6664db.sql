-- Create a policy to allow public access to persons when their family tree is public
CREATE POLICY "Public access to persons in public family trees" 
ON public.persons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_trees ft 
    WHERE ft.id = persons.family_tree_id 
    AND ft.visibility = 'public'
  )
);