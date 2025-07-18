import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Search, Upload, Image as ImageIcon, File, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  bucket_name: string;
  created_at: string;
  user_id: string;
}

interface MediaAlbum {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  created_at: string;
  user_id: string;
}

export default function Media() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [albums, setAlbums] = useState<MediaAlbum[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const { uploadMultipleFiles, getFileUrl, deleteFile, isUploading } = useFileUpload();

  useEffect(() => {
    fetchMediaFiles();
    fetchAlbums();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('media_albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const uploadedFiles = await uploadMultipleFiles(selectedFiles);
      if (uploadedFiles.length > 0) {
        await fetchMediaFiles();
        setSelectedFiles([]);
        toast.success(`Uploaded ${uploadedFiles.length} file(s) successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const handleDeleteFile = async (mediaFileId: string) => {
    if (await deleteFile(mediaFileId)) {
      await fetchMediaFiles();
    }
  };

  const downloadFile = async (file: MediaFile) => {
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket_name)
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'images') {
      return matchesSearch && file.mime_type.startsWith('image/');
    } else if (activeTab === 'documents') {
      return matchesSearch && !file.mime_type.startsWith('image/');
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading media files...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Media Gallery</h1>
          <p className="text-muted-foreground">
            Manage your family photos and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            multiple={true}
            maxFiles={10}
          />
          {selectedFiles.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Media Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {searchTerm 
                  ? 'No files match your search criteria' 
                  : activeTab === 'images' 
                    ? 'No images uploaded yet'
                    : activeTab === 'documents'
                      ? 'No documents uploaded yet'
                      : 'No files uploaded yet'
                }
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {file.mime_type.startsWith('image/') ? (
                      <img
                        src={getFileUrl(file.bucket_name, file.file_path)}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <File className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm truncate" title={file.file_name}>
                        {file.file_name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}