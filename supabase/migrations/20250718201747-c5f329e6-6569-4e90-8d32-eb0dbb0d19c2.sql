-- Create family tree media folders for organizing files within trees
CREATE TABLE public.family_tree_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_tree_id UUID NOT NULL,
  parent_folder_id UUID REFERENCES public.family_tree_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(family_tree_id, parent_folder_id, name),
  UNIQUE(family_tree_id, name) WHERE parent_folder_id IS NULL -- Root folders must have unique names
);

-- Create association table linking existing media files to family trees and folders
CREATE TABLE public.family_tree_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_tree_id UUID NOT NULL,
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.family_tree_folders(id) ON DELETE SET NULL,
  added_by UUID NOT NULL,
  tags TEXT[], -- Array of tags for better organization
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(family_tree_id, media_file_id) -- Each media file can only be in a family tree once
);

-- Enable RLS
ALTER TABLE public.family_tree_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tree_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_tree_folders
CREATE POLICY "Users can view folders in family trees they have access to"
ON public.family_tree_folders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_folders.family_tree_id
    AND (ft.user_id = auth.uid() OR ft.visibility = 'public')
  )
);

CREATE POLICY "Users can create folders in their family trees"
ON public.family_tree_folders FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_folders.family_tree_id
    AND ft.user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update folders in their family trees"
ON public.family_tree_folders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_folders.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete folders in their family trees"
ON public.family_tree_folders FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_folders.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

-- RLS Policies for family_tree_media
CREATE POLICY "Users can view media in family trees they have access to"
ON public.family_tree_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_media.family_tree_id
    AND (ft.user_id = auth.uid() OR ft.visibility = 'public')
  )
);

CREATE POLICY "Users can add media to their family trees"
ON public.family_tree_media FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_media.family_tree_id
    AND ft.user_id = auth.uid()
  )
  AND added_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.id = family_tree_media.media_file_id
    AND mf.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update media in their family trees"
ON public.family_tree_media FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_media.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove media from their family trees"
ON public.family_tree_media FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.family_trees ft
    WHERE ft.id = family_tree_media.family_tree_id
    AND ft.user_id = auth.uid()
  )
);

-- Create updated_at triggers
CREATE TRIGGER update_family_tree_folders_updated_at
  BEFORE UPDATE ON public.family_tree_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_family_tree_folders_tree_id ON public.family_tree_folders(family_tree_id);
CREATE INDEX idx_family_tree_folders_parent_id ON public.family_tree_folders(parent_folder_id);
CREATE INDEX idx_family_tree_media_tree_id ON public.family_tree_media(family_tree_id);
CREATE INDEX idx_family_tree_media_folder_id ON public.family_tree_media(folder_id);
CREATE INDEX idx_family_tree_media_file_id ON public.family_tree_media(media_file_id);
CREATE INDEX idx_family_tree_media_tags ON public.family_tree_media USING GIN(tags);