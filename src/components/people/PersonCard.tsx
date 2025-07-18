import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Image as ImageIcon,
  FileText,
  Heart,
  Users,
  Baby,
  Dna,
  Download,
  UserCircle,
  File,
  Loader2,
  TreePine
} from 'lucide-react';
import { usePersonMedia } from '@/hooks/use-person-media';
import { useFileUpload } from '@/hooks/use-file-upload';
import { FileUpload } from '@/components/ui/file-upload';
import { PersonTreesManager } from './PersonTreesManager';
import { MarkAsSelfDialog } from './MarkAsSelfDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PersonCardProps {
  person: {
    id: string;
    name: string;
    gender?: string | null;
    date_of_birth?: string | null;
    birth_place?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_photo_url?: string | null;
    status: string;
    notes?: string | null;
    donor?: boolean;
    used_ivf?: boolean;
    used_iui?: boolean;
    fertility_treatments?: any;
    is_self?: boolean;
  };
  onEdit?: () => void;
  onClose?: () => void;
}

export function PersonCard({ person, onEdit, onClose }: PersonCardProps) {
  const { mediaFiles, loading: mediaLoading, getFileUrl, linkMediaToPerson, refetch } = usePersonMedia(person.id);
  const { uploadMultipleFiles, isUploading } = useFileUpload();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [markAsSelfDialogOpen, setMarkAsSelfDialogOpen] = useState(false);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getFertilityInfo = () => {
    const treatments = [];
    if (person.used_ivf) treatments.push('IVF');
    if (person.used_iui) treatments.push('IUI');
    if (person.fertility_treatments && typeof person.fertility_treatments === 'object') {
      // Add any additional treatments from the JSON field
      Object.keys(person.fertility_treatments).forEach(key => {
        if (person.fertility_treatments[key] === true) {
          treatments.push(key.toUpperCase());
        }
      });
    }
    return treatments;
  };

  const handleFilesSelected = (files: File[]) => {
    setUploadingFiles(files);
  };

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;

    try {
      const uploadedFiles = await uploadMultipleFiles(uploadingFiles);
      
      // Link each uploaded file to the person
      for (const file of uploadedFiles) {
        await linkMediaToPerson(file.id);
      }
      
      setUploadingFiles([]);
      toast.success(`Uploaded and linked ${uploadedFiles.length} file(s) to ${person.name}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (mediaFile: any) => {
    try {
      const { data, error } = await supabase.storage
        .from(mediaFile.bucket_name)
        .download(mediaFile.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = mediaFile.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={person.profile_photo_url || undefined} alt={person.name} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{person.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {person.gender && (
                  <Badge variant="secondary">
                    {person.gender}
                  </Badge>
                )}
                <Badge variant={person.status === 'living' ? 'default' : 'secondary'}>
                  {person.status}
                </Badge>
                {person.donor && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Dna className="h-3 w-3 mr-1" />
                    Donor
                  </Badge>
                )}
                {person.is_self && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <User className="h-3 w-3 mr-1" />
                    Self
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setMarkAsSelfDialogOpen(true)}
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="trees">Trees</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Born:</span>
                  <span className="ml-2">{formatDate(person.date_of_birth)}</span>
                  {person.date_of_birth && getAge(person.date_of_birth) && (
                    <span className="ml-2 text-muted-foreground">
                      (Age {getAge(person.date_of_birth)})
                    </span>
                  )}
                </div>
                
                {person.birth_place && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Birth Place:</span>
                    <span className="ml-2">{person.birth_place}</span>
                  </div>
                )}
              </div>
            </div>
            
            {person.notes && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {person.notes}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="space-y-3">
              {person.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a 
                    href={`mailto:${person.email}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {person.email}
                  </a>
                </div>
              )}
              
              {person.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <a 
                    href={`tel:${person.phone}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {person.phone}
                  </a>
                </div>
              )}
              
              {person.address && (
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Address:</span>
                  <span className="ml-2">{person.address}</span>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="medical" className="space-y-4 mt-4">
            <div className="space-y-3">
              {getFertilityInfo().length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Fertility Treatments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getFertilityInfo().map((treatment) => (
                      <Badge key={treatment} variant="outline">
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {!person.used_ivf && !person.used_iui && !person.fertility_treatments && (
                <div className="text-sm text-muted-foreground">
                  No fertility treatment information recorded
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trees" className="space-y-4 mt-4">
            <PersonTreesManager personId={person.id} />
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4 mt-4">
            {/* Upload Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upload Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  multiple={true}
                  maxFiles={5}
                />
                {uploadingFiles.length > 0 && (
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    size="sm"
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${uploadingFiles.length} file(s)`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Media Files */}
            {mediaLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No media files linked to this person</p>
                <p className="text-xs">Media files can be linked from the Media Gallery</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mediaFiles.map((personMedia) => (
                  <Card key={personMedia.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      {personMedia.media_file.mime_type.startsWith('image/') ? (
                        <img
                          src={getFileUrl(personMedia.media_file.bucket_name, personMedia.media_file.file_path)}
                          alt={personMedia.media_file.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <File className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {personMedia.is_profile_photo && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          <UserCircle className="h-3 w-3 mr-1" />
                          Profile
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm truncate" title={personMedia.media_file.file_name}>
                          {personMedia.media_file.file_name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(personMedia.media_file.file_size)}</span>
                          <span>{new Date(personMedia.media_file.created_at).toLocaleDateString()}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(personMedia.media_file)}
                          className="w-full"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <MarkAsSelfDialog
        open={markAsSelfDialogOpen}
        onOpenChange={setMarkAsSelfDialogOpen}
        person={person}
        onPersonUpdated={() => {
          // Force a page refresh to update the person data
          window.location.reload();
        }}
      />
    </Card>
  );
}

interface PersonCardDialogProps {
  person: {
    id: string;
    name: string;
    gender?: string | null;
    date_of_birth?: string | null;
    birth_place?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_photo_url?: string | null;
    status: string;
    notes?: string | null;
    donor?: boolean;
    used_ivf?: boolean;
    used_iui?: boolean;
    fertility_treatments?: any;
    is_self?: boolean;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function PersonCardDialog({ person, open, onOpenChange, onEdit }: PersonCardDialogProps) {
  if (!person) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Person Details</DialogTitle>
          <DialogDescription>
            View detailed information about {person.name}
          </DialogDescription>
        </DialogHeader>
        <PersonCard person={person} onEdit={onEdit} />
      </DialogContent>
    </Dialog>
  );
}