import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/ui/image-upload';
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
  TreePine,
  GraduationCap,
  Trash2,
  UserMinus,
  Camera,
  X
} from 'lucide-react';
import { usePersonMedia } from '@/hooks/use-person-media';
import { useFileUpload } from '@/hooks/use-file-upload';
import { FileUpload } from '@/components/ui/file-upload';
import { PersonTreesManager } from './PersonTreesManager';
import { MarkAsSelfDialog } from './MarkAsSelfDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDate, calculateAge, formatDateShort, formatPartialDate } from '@/utils/dateUtils';
import { Donor } from '@/types/donor';
import { DonorUtils } from '@/types/donor';
import { Person } from '@/types/person';

interface PersonCardProps {
  person: Person;
  onEdit?: (person?: Person) => void;
  onDelete?: (person: Person) => void;
  onRemoveFromTree?: (person: Person) => void;
  onClick?: () => void;
  showActions?: boolean;
  showRemoveFromTree?: boolean;
  onPersonUpdated?: () => void;
  onClose?: () => void;
  variant?: 'card' | 'detailed';
}

export function PersonCard({ 
  person, 
  onEdit, 
  onDelete,
  onRemoveFromTree,
  onClick,
  showActions = false,
  showRemoveFromTree = false,
  onPersonUpdated,
  onClose,
  variant = 'detailed'
}: PersonCardProps) {
  const { mediaFiles, loading: mediaLoading, getFileUrl, linkMediaToPerson, refetch } = usePersonMedia(person.id);
  const { uploadMultipleFiles, isUploading } = useFileUpload();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [markAsSelfDialogOpen, setMarkAsSelfDialogOpen] = useState(false);
  const [donorInfo, setDonorInfo] = useState<Donor | null>(null);
  const [donorLoading, setDonorLoading] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<any>(null);
  
  // Fetch donor information when person is a donor
  useEffect(() => {
    const fetchDonorInfo = async () => {
      if (person.donor) {
        setDonorLoading(true);
        try {
          const { data, error } = await supabase
            .from('donors')
            .select('*')
            .eq('person_id', person.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error;
          }

          setDonorInfo(data);
        } catch (error) {
          console.error('Error fetching donor info:', error);
        } finally {
          setDonorLoading(false);
        }
      }
    };

    fetchDonorInfo();
  }, [person.id, person.donor]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDateLocal = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return formatDate(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    return calculateAge(birthDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'living':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deceased':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
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

  // Photo management functions
  const handleImageUploaded = (uploadedFile: any) => {
    console.log('Image uploaded successfully:', uploadedFile);
    setUploadedPhoto(uploadedFile);
  };

  const getPhotoUrl = () => {
    if (!uploadedPhoto) return undefined;
    console.log('Getting photo URL for:', uploadedPhoto);
    
    const { data } = supabase.storage
      .from(uploadedPhoto.bucket_name)
      .getPublicUrl(uploadedPhoto.file_path);
    
    const publicUrl = data.publicUrl;
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  };

  const handlePhotoChange = async () => {
    if (!uploadedPhoto) return;

    const photoUrl = getPhotoUrl();
    console.log('Photo URL for person:', photoUrl);

    try {
      const { error } = await supabase
        .from('persons')
        .update({ profile_photo_url: photoUrl })
        .eq('id', person.id);

      if (error) throw error;

      toast.success('Profile photo updated successfully');
      setIsChangingPhoto(false);
      setUploadedPhoto(null);
      onPersonUpdated?.();
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo');
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const { error } = await supabase
        .from('persons')
        .update({ profile_photo_url: null })
        .eq('id', person.id);

      if (error) throw error;

      toast.success('Profile photo removed');
      onPersonUpdated?.();
    } catch (error) {
      console.error('Error removing profile photo:', error);
      toast.error('Failed to remove profile photo');
    }
  };

  // Simple card variant for grid layouts
  if (variant === 'card') {
    return (
      <Card 
        className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={person.profile_photo_url || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Photo management overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChangingPhoto(true);
                      }}
                      className="h-8 w-8 p-0 rounded-full"
                      title="Change photo"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {person.profile_photo_url && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto();
                        }}
                        className="h-8 w-8 p-0 rounded-full"
                        title="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{person.name}</h3>
                {person.date_of_birth && (
                  <p className="text-sm text-muted-foreground">
                    Age {getAge(person.date_of_birth) || 'Unknown'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {person.status === 'deceased' && (
                <Badge className={getStatusColor(person.status)}>
                  {person.status}
                </Badge>
              )}
              {person.is_self && (
                <Badge variant="default" className="bg-[hsl(9,67%,49%)] text-white border-[hsl(9,67%,49%)]">
                  Self
                </Badge>
              )}
              {(showActions || onEdit || onDelete || showRemoveFromTree) && (
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(person);
                      }}
                      title="Edit person"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {showRemoveFromTree && onRemoveFromTree && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromTree(person);
                      }}
                      title="Remove from this tree"
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                  {showActions && onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(person);
                      }}
                      title="Delete person permanently"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {person.date_of_birth && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Born {formatPartialDate(person.date_of_birth)}
            </div>
          )}
          
          {person.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {person.email}
            </div>
          )}
          
          {person.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              {person.phone}
            </div>
          )}
          
          {person.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {person.address}
            </div>
          )}
          
          {person.gender && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle className="w-4 h-4" />
              {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
            </div>
          )}
          
          {person.notes && (
            <div className="text-sm text-muted-foreground border-t pt-3">
              <p className="line-clamp-2">{person.notes}</p>
            </div>
          )}
        </CardContent>

        {/* Photo change dialog */}
        {isChangingPhoto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsChangingPhoto(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Change Profile Photo</h3>
              <div className="space-y-4">
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  disabled={false}
                />
                {uploadedPhoto && (
                  <div className="flex gap-2">
                    <Button onClick={handlePhotoChange} className="flex-1">
                      Update Photo
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsChangingPhoto(false);
                      setUploadedPhoto(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Detailed variant (original functionality)
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
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
                  <Badge variant="default" className="bg-[hsl(9,67%,49%)] text-white border-[hsl(9,67%,49%)]">
                    <User className="h-3 w-3 mr-1 fill-current" />
                    Self
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(person)}>
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
          <TabsList className={`grid w-full ${person.donor ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            {person.donor && <TabsTrigger value="donor">Donor</TabsTrigger>}
            <TabsTrigger value="trees">Trees</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Born:</span>
                  <span className="ml-2">{formatPartialDate(person.date_of_birth)}</span>
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
                <Label className="text-sm font-medium">Notes</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {person.notes}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {person.email && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {person.email}
                  </div>
                </div>
              )}
              
              {person.phone && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {person.phone}
                  </div>
                </div>
              )}
              
              {person.address && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </Label>
                  <div className="p-2 bg-muted rounded-md text-sm">
                    {person.address}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fertility Treatments</Label>
                <div className="space-y-2">
                  {getFertilityInfo().length > 0 ? (
                    getFertilityInfo().map((treatment, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {treatment}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No fertility treatments recorded</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {person.donor && (
            <TabsContent value="donor" className="space-y-4 mt-4">
              {donorLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : donorInfo ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donorInfo.donor_number && (
                        <div>
                          <Label className="text-sm font-medium">Donor Number</Label>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            {donorInfo.donor_number}
                          </div>
                        </div>
                      )}
                      
                      {donorInfo.donor_type && (
                        <div>
                          <Label className="text-sm font-medium">Donor Type</Label>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            <Badge variant="outline">
                              {DonorUtils.getDonorTypeLabel(donorInfo.donor_type)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {donorInfo.sperm_bank && (
                        <div>
                          <Label className="text-sm font-medium">Sperm Bank</Label>
                          <div className="p-2 bg-muted rounded-md text-sm">
                            {donorInfo.sperm_bank}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm font-medium">Anonymous Status</Label>
                        <div className="p-2 bg-muted rounded-md text-sm">
                          <Badge variant={donorInfo.is_anonymous ? "secondary" : "default"}>
                            {DonorUtils.getAnonymityStatus(donorInfo.is_anonymous)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground">No donor information available</p>
              )}
            </TabsContent>
          )}

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
  person: Person | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (person?: Person) => void;
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
        <PersonCard person={person} onEdit={onEdit} variant="detailed" />
      </DialogContent>
    </Dialog>
  );
}