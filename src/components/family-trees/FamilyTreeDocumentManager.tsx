import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  Search, 
  Image as ImageIcon, 
  File, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Download,
  Trash2,
  Edit,
  Eye,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/use-file-upload';
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

interface FamilyTreeFolder {
  id: string;
  family_tree_id: string;
  parent_folder_id: string | null;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface FamilyTreeMedia {
  id: string;
  family_tree_id: string;
  media_file_id: string;
  folder_id: string | null;
  added_by: string;
  tags: string[] | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  media_file: MediaFile;
}

interface FamilyTreeDocumentManagerProps {
  familyTreeId: string;
}

export function FamilyTreeDocumentManager({ familyTreeId }: FamilyTreeDocumentManagerProps) {
  const [folders, setFolders] = useState<FamilyTreeFolder[]>([]);
  const [media, setMedia] = useState<FamilyTreeMedia[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadFilesOpen, setUploadFilesOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Form states
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  
  const { uploadMultipleFiles, getFileUrl, deleteFile, isUploading } = useFileUpload();

  useEffect(() => {
    fetchFolders();
    fetchMedia();
  }, [familyTreeId, currentFolderId]);

  const fetchFolders = async () => {
    try {
      let query = supabase
        .from('family_tree_folders')
        .select('*')
        .eq('family_tree_id', familyTreeId);
      
      if (currentFolderId === null) {
        query = query.is('parent_folder_id', null);
      } else {
        query = query.eq('parent_folder_id', currentFolderId);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    }
  };

  const fetchMedia = async () => {
    try {
      let query = supabase
        .from('family_tree_media')
        .select(`
          *,
          media_file:media_files(*)
        `)
        .eq('family_tree_id', familyTreeId);
      
      if (currentFolderId === null) {
        query = query.is('folder_id', null);
      } else {
        query = query.eq('folder_id', currentFolderId);
      }
      
      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('family_tree_folders')
        .insert({
          family_tree_id: familyTreeId,
          parent_folder_id: currentFolderId,
          name: folderName.trim(),
          description: folderDescription.trim() || null,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Folder created successfully');
      setCreateFolderOpen(false);
      setFolderName('');
      setFolderDescription('');
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload files to media system
      const uploadedFiles = await uploadMultipleFiles(selectedFiles, 'family-photos');
      
      // Link uploaded files to this family tree
      const linkPromises = uploadedFiles.map(file => 
        supabase
          .from('family_tree_media')
          .insert({
            family_tree_id: familyTreeId,
            media_file_id: file.id,
            folder_id: currentFolderId,
            added_by: user.id,
          })
      );

      await Promise.all(linkPromises);

      toast.success(`Uploaded ${uploadedFiles.length} file(s) successfully`);
      setUploadFilesOpen(false);
      setSelectedFiles([]);
      fetchMedia();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const removeFromTree = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from('family_tree_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      toast.success('File removed from tree');
      fetchMedia();
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  const filteredMedia = media.filter(item => 
    item.media_file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading media...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentFolderId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolderId(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Root
            </Button>
          )}
          <h3 className="text-xl font-semibold">
            {currentFolderId ? 'Folder Contents' : 'Family Media'}
          </h3>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your family media files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    placeholder="Enter folder name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Enter folder description"
                    value={folderDescription}
                    onChange={(e) => setFolderDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder} disabled={!folderName.trim()}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadFilesOpen} onOpenChange={setUploadFilesOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Upload photos, videos, and documents to this family tree.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FileUpload
                  onFilesSelected={setSelectedFiles}
                  multiple={true}
                  maxFiles={10}
                />
                {selectedFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadFilesOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={selectedFiles.length === 0 || isUploading}
                >
                  {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files and folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {filteredFolders.length === 0 && filteredMedia.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media files yet</h3>
            <p className="text-muted-foreground mb-4">
              Start organizing your family media by creating folders and uploading files.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <Card 
              key={folder.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Folder className="w-8 h-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{folder.name}</h4>
                    {folder.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Media Files */}
          {filteredMedia.map((item) => {
            const FileIcon = getFileIcon(item.media_file.mime_type);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {item.media_file.mime_type.startsWith('image/') ? (
                    <img
                      src={getFileUrl(item.media_file.bucket_name, item.media_file.file_path)}
                      alt={item.media_file.file_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => downloadFile(item.media_file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => removeFromTree(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Tree
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate" title={item.media_file.file_name}>
                      {item.media_file.file_name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(item.media_file.file_size)}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}