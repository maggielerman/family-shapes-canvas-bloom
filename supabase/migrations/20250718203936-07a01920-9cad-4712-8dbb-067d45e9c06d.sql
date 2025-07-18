-- Create organization_media table to link media files to organizations
CREATE TABLE public.organization_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  media_file_id uuid NOT NULL,
  added_by uuid NOT NULL,
  folder_id uuid,
  sort_order integer DEFAULT 0,
  tags text[],
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organization_id, media_file_id)
);

-- Enable RLS
ALTER TABLE public.organization_media ENABLE ROW LEVEL SECURITY;

-- Create policies for organization_media
CREATE POLICY "Users can add media to organizations they belong to" 
ON public.organization_media 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = organization_media.organization_id 
    AND (
      o.owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM organization_memberships om
        WHERE om.organization_id = o.id 
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'editor')
      )
    )
  ) AND added_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM media_files mf
    WHERE mf.id = organization_media.media_file_id 
    AND mf.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view media in organizations they have access to" 
ON public.organization_media 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = organization_media.organization_id 
    AND (
      o.owner_id = auth.uid() OR 
      o.visibility = 'public' OR
      EXISTS (
        SELECT 1 FROM organization_memberships om
        WHERE om.organization_id = o.id 
        AND om.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can update media in organizations they have edit access to" 
ON public.organization_media 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = organization_media.organization_id 
    AND (
      o.owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM organization_memberships om
        WHERE om.organization_id = o.id 
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'editor')
      )
    )
  )
);

CREATE POLICY "Users can remove media from organizations they have edit access to" 
ON public.organization_media 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = organization_media.organization_id 
    AND (
      o.owner_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM organization_memberships om
        WHERE om.organization_id = o.id 
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'editor')
      )
    )
  )
);

-- Create media_folders table for general media organization
CREATE TABLE public.media_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  parent_folder_id uuid,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for media_folders
CREATE POLICY "Users can create their own folders" 
ON public.media_folders 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own folders" 
ON public.media_folders 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own folders" 
ON public.media_folders 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own folders" 
ON public.media_folders 
FOR DELETE 
USING (user_id = auth.uid());

-- Add folder_id to media_files table
ALTER TABLE public.media_files 
ADD COLUMN folder_id uuid;

-- Create trigger for updated_at on media_folders
CREATE TRIGGER update_media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();