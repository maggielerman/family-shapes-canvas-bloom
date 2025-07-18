-- Create a policy to allow public access to connections when their family tree is public
CREATE POLICY "Public access to connections in public family trees" 
ON public.connections 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.family_trees ft 
    WHERE ft.id = connections.family_tree_id 
    AND ft.visibility = 'public'
  )
);