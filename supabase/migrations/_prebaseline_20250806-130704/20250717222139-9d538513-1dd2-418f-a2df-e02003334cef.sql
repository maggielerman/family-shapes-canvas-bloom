-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('family-photos', 'family-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create storage policies for documents (private)
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for family photos (public)
CREATE POLICY "Family photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'family-photos');

CREATE POLICY "Users can upload family photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own family photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own family photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create family_trees table for individual users
CREATE TABLE public.family_trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  tree_data JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on family_trees
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for family_trees
CREATE POLICY "Users can view their own family trees"
  ON public.family_trees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public family trees"
  ON public.family_trees FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can create their own family trees"
  ON public.family_trees FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own family trees"
  ON public.family_trees FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own family trees"
  ON public.family_trees FOR DELETE
  USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_family_trees_updated_at
  BEFORE UPDATE ON public.family_trees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update persons table to link to family trees
ALTER TABLE public.persons 
ADD COLUMN family_tree_id UUID REFERENCES public.family_trees(id) ON DELETE SET NULL;

-- Update connections table to link to family trees  
ALTER TABLE public.connections
ADD COLUMN family_tree_id UUID REFERENCES public.family_trees(id) ON DELETE CASCADE;