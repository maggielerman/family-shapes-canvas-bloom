import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Search, Upload, Image as ImageIcon, File, Trash2, Download, Link2, Users, FolderTree, Share, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  created_at: string;
  user_id: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  created_at: string;
  owner_id: string;
}

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
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Dialog states
  const [linkToTreeOpen, setLinkToTreeOpen] = useState(false);
  const [linkToOrgOpen, setLinkToOrgOpen] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState<MediaFile | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  const { uploadMultipleFiles, getFileUrl, deleteFile, isUploading } = useFileUpload();

  useEffect(() => {
    fetchMediaFiles();
    fetchFamilyTrees();
    fetchOrganizations();
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

  const fetchFamilyTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('family_trees')
        .select('*')
        .order('name');

      if (error) throw error;
      setFamilyTrees(data || []);
    } catch (error) {
      console.error('Error fetching family trees:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const linkToFamilyTree = async () => {
    if (!selectedMediaFile || !selectedTreeId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('family_tree_media')
        .insert({
          family_tree_id: selectedTreeId,
          media_file_id: selectedMediaFile.id,
          folder_id: null,
          added_by: user.id,
        });

      if (error) throw error;

      toast.success('Media file linked to family tree successfully');
      setLinkToTreeOpen(false);
      setSelectedMediaFile(null);
      setSelectedTreeId('');
    } catch (error) {
      console.error('Error linking to family tree:', error);
      toast.error('Failed to link media file to family tree');
    }
  };

  const linkToOrganization = async () => {
    if (!selectedMediaFile || !selectedOrgId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('organization_media')
        .insert({
          organization_id: selectedOrgId,
          media_file_id: selectedMediaFile.id,
          added_by: user.id,
        });

      if (error) throw error;

      toast.success('Media file linked to organization successfully');
      setLinkToOrgOpen(false);
      setSelectedMediaFile(null);
      setSelectedOrgId('');
    } catch (error) {
      console.error('Error linking to organization:', error);
      toast.error('Failed to link media file to organization');
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
                       <div className="flex gap-1 relative">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button
                               variant="ghost"
                               size="sm"
                               className="w-full"
                             >
                               <MoreVertical className="h-3 w-3" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent>
                             <DropdownMenuItem onClick={() => downloadFile(file)}>
                               <Download className="h-4 w-4 mr-2" />
                               Download
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                               onClick={() => {
                                 setSelectedMediaFile(file);
                                 setLinkToTreeOpen(true);
                               }}
                             >
                               <FolderTree className="h-4 w-4 mr-2" />
                               Link to Family Tree
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => {
                                 setSelectedMediaFile(file);
                                 setLinkToOrgOpen(true);
                               }}
                             >
                               <Users className="h-4 w-4 mr-2" />
                               Link to Organization
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                               onClick={() => handleDeleteFile(file.id)}
                               className="text-destructive"
                             >
                               <Trash2 className="h-4 w-4 mr-2" />
                               Delete File
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Link to Family Tree Dialog */}
      <Dialog open={linkToTreeOpen} onOpenChange={setLinkToTreeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Family Tree</DialogTitle>
            <DialogDescription>
              Choose a family tree to link this media file to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedTreeId} onValueChange={setSelectedTreeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a family tree" />
              </SelectTrigger>
              <SelectContent>
                {familyTrees.map((tree) => (
                  <SelectItem key={tree.id} value={tree.id}>
                    {tree.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkToTreeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={linkToFamilyTree} disabled={!selectedTreeId}>
              Link to Tree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to Organization Dialog */}
      <Dialog open={linkToOrgOpen} onOpenChange={setLinkToOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Organization</DialogTitle>
            <DialogDescription>
              Choose an organization to link this media file to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkToOrgOpen(false)}>
              Cancel
            </Button>
            <Button onClick={linkToOrganization} disabled={!selectedOrgId}>
              Link to Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}