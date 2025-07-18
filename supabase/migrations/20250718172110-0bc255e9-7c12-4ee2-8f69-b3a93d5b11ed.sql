
-- Create media_files table to track all uploaded files
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'family-photos',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create person_media junction table to link media to specific people
CREATE TABLE public.person_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  is_profile_photo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id, media_file_id)
);

-- Create media_albums table for organizing photos into collections
CREATE TABLE public.media_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create album_media junction table
CREATE TABLE public.album_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.media_albums(id) ON DELETE CASCADE,
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(album_id, media_file_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_media ENABLE ROW LEVEL SECURITY;

-- RLS policies for media_files
CREATE POLICY "Users can view their own media files"
  ON public.media_files FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own media files"
  ON public.media_files FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own media files"
  ON public.media_files FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own media files"
  ON public.media_files FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for person_media
CREATE POLICY "Users can view person_media for their persons"
  ON public.person_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.persons p 
    WHERE p.id = person_media.person_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create person_media for their persons"
  ON public.person_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.persons p 
    WHERE p.id = person_media.person_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update person_media for their persons"
  ON public.person_media FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.persons p 
    WHERE p.id = person_media.person_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete person_media for their persons"
  ON public.person_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.persons p 
    WHERE p.id = person_media.person_id AND p.user_id = auth.uid()
  ));

-- RLS policies for media_albums
CREATE POLICY "Users can view their own albums"
  ON public.media_albums FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public albums"
  ON public.media_albums FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can create their own albums"
  ON public.media_albums FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own albums"
  ON public.media_albums FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own albums"
  ON public.media_albums FOR DELETE
  USING (user_id = auth.uid());

-- RLS policies for album_media
CREATE POLICY "Users can view album_media for their albums"
  ON public.album_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.media_albums a 
    WHERE a.id = album_media.album_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can create album_media for their albums"
  ON public.album_media FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.media_albums a 
    WHERE a.id = album_media.album_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can update album_media for their albums"
  ON public.album_media FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.media_albums a 
    WHERE a.id = album_media.album_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete album_media for their albums"
  ON public.album_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.media_albums a 
    WHERE a.id = album_media.album_id AND a.user_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_albums_updated_at
  BEFORE UPDATE ON public.media_albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
CREATE INDEX idx_person_media_person_id ON public.person_media(person_id);
CREATE INDEX idx_person_media_media_file_id ON public.person_media(media_file_id);
CREATE INDEX idx_media_albums_user_id ON public.media_albums(user_id);
CREATE INDEX idx_album_media_album_id ON public.album_media(album_id);
CREATE INDEX idx_album_media_media_file_id ON public.album_media(media_file_id);
