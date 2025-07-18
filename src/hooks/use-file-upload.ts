import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  bucket_name: string;
  created_at: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (
    file: File,
    bucketName: string = 'family-photos',
    folderPath?: string
  ): Promise<UploadedFile | null> => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload files');
        return null;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        toast.error('Failed to upload file');
        return null;
      }

      // Save file metadata to database
      const { data: mediaFile, error: dbError } = await supabase
        .from('media_files')
        .insert({
          user_id: user.id,
          file_path: storageData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          bucket_name: bucketName
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up storage if database insert failed
        await supabase.storage.from(bucketName).remove([storageData.path]);
        toast.error('Failed to save file metadata');
        return null;
      }

      setUploadProgress(100);
      toast.success('File uploaded successfully');
      return mediaFile;

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    bucketName: string = 'family-photos',
    folderPath?: string
  ): Promise<UploadedFile[]> => {
    const uploadedFiles: UploadedFile[] = [];
    
    for (const file of files) {
      const uploadedFile = await uploadFile(file, bucketName, folderPath);
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
    }

    return uploadedFiles;
  };

  const getFileUrl = (bucketName: string, filePath: string): string => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const deleteFile = async (mediaFileId: string): Promise<boolean> => {
    try {
      // Get file info first
      const { data: mediaFile, error: fetchError } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', mediaFileId)
        .single();

      if (fetchError || !mediaFile) {
        toast.error('File not found');
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(mediaFile.bucket_name)
        .remove([mediaFile.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        toast.error('Failed to delete file from storage');
        return false;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', mediaFileId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        toast.error('Failed to delete file metadata');
        return false;
      }

      toast.success('File deleted successfully');
      return true;

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
      return false;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    getFileUrl,
    deleteFile,
    isUploading,
    uploadProgress
  };
};