import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PersonMediaFile {
  id: string;
  person_id: string;
  media_file_id: string;
  is_profile_photo: boolean;
  created_at: string;
  media_file: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    bucket_name: string;
    created_at: string;
    user_id: string;
  };
}

export function usePersonMedia(personId: string | null) {
  const [mediaFiles, setMediaFiles] = useState<PersonMediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonMedia = async () => {
    if (!personId) {
      setMediaFiles([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('person_media')
        .select(`
          id,
          person_id,
          media_file_id,
          is_profile_photo,
          created_at,
          media_file:media_files (
            id,
            file_name,
            file_path,
            file_size,
            mime_type,
            bucket_name,
            created_at,
            user_id
          )
        `)
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMediaFiles(data || []);
    } catch (err) {
      console.error('Error fetching person media:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const linkMediaToPerson = async (mediaFileId: string, isProfilePhoto = false) => {
    if (!personId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // If setting as profile photo, remove existing profile photo flag
      if (isProfilePhoto) {
        await supabase
          .from('person_media')
          .update({ is_profile_photo: false })
          .eq('person_id', personId)
          .eq('is_profile_photo', true);
      }

      const { error } = await supabase
        .from('person_media')
        .insert({
          person_id: personId,
          media_file_id: mediaFileId,
          is_profile_photo: isProfilePhoto
        });

      if (error) throw error;

      await fetchPersonMedia();
      return true;
    } catch (err) {
      console.error('Error linking media to person:', err);
      setError(err instanceof Error ? err.message : 'Failed to link media');
      return false;
    }
  };

  const unlinkMediaFromPerson = async (personMediaId: string) => {
    try {
      const { error } = await supabase
        .from('person_media')
        .delete()
        .eq('id', personMediaId);

      if (error) throw error;

      await fetchPersonMedia();
      return true;
    } catch (err) {
      console.error('Error unlinking media from person:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlink media');
      return false;
    }
  };

  const setAsProfilePhoto = async (personMediaId: string) => {
    if (!personId) return false;

    try {
      // Remove existing profile photo flag
      await supabase
        .from('person_media')
        .update({ is_profile_photo: false })
        .eq('person_id', personId)
        .eq('is_profile_photo', true);

      // Set new profile photo
      const { error } = await supabase
        .from('person_media')
        .update({ is_profile_photo: true })
        .eq('id', personMediaId);

      if (error) throw error;

      await fetchPersonMedia();
      return true;
    } catch (err) {
      console.error('Error setting profile photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to set profile photo');
      return false;
    }
  };

  const getFileUrl = (bucketName: string, filePath: string) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  useEffect(() => {
    fetchPersonMedia();
  }, [personId]);

  return {
    mediaFiles,
    loading,
    error,
    linkMediaToPerson,
    unlinkMediaFromPerson,
    setAsProfilePhoto,
    getFileUrl,
    refetch: fetchPersonMedia
  };
}