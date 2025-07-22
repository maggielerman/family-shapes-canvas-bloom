import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Save,
  X,
  User,
  Dna,
  FileText,
  Heart,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Ruler,
  Weight,
  Palette,
  GraduationCap,
  TestTube,
  Shield,
  Building
} from "lucide-react";
import { Donor, DonorUtils, UpdateDonorData } from "@/types/donor";
import { Person, PersonUtils } from "@/types/person";
import { OrganizationDonorDatabase } from "@/types/organization";
import { DonorService } from "@/services/donorService";

interface DonorWithDatabase extends Donor {
  database_entry?: OrganizationDonorDatabase;
  person?: Person;
  sibling_count?: number;
}

interface DonorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: DonorWithDatabase | null;
  canManage: boolean;
  onUpdate: () => void;
}

export function DonorDetailsDialog({ 
  open, 
  onOpenChange, 
  donor, 
  canManage, 
  onUpdate 
}: DonorDetailsDialogProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Donor>>({});

  useEffect(() => {
    if (donor && open) {
      setEditData({
        donor_number: donor.donor_number || '',
        sperm_bank: donor.sperm_bank || '',
        donor_type: donor.donor_type || 'sperm',
        is_anonymous: donor.is_anonymous ?? true,
        height: donor.height || '',
        weight: donor.weight || '',
        eye_color: donor.eye_color || '',
        hair_color: donor.hair_color || '',
        ethnicity: donor.ethnicity || '',
        blood_type: donor.blood_type || '',
        education_level: donor.education_level || '',
        notes: donor.notes || '',
      });
    }
  }, [donor, open]);

  const handleSave = async () => {
    if (!donor || !canManage) return;

    try {
      setSaving(true);
      
      const updateData: UpdateDonorData = {
        id: donor.id,
        ...editData,
      };

      await DonorService.updateDonor(updateData);
      
      toast({
        title: "Success",
        description: "Donor details updated successfully",
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating donor:', error);
      toast({
        title: "Error",
        description: "Failed to update donor details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (donor) {
      setEditData({
        donor_number: donor.donor_number || '',
        sperm_bank: donor.sperm_bank || '',
        donor_type: donor.donor_type || 'sperm',
        is_anonymous: donor.is_anonymous ?? true,
        height: donor.height || '',
        weight: donor.weight || '',
        eye_color: donor.eye_color || '',
        hair_color: donor.hair_color || '',
        ethnicity: donor.ethnicity || '',
        blood_type: donor.blood_type || '',
        education_level: donor.education_level || '',
        notes: donor.notes || '',
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!donor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {donor.person?.name || `Donor ${donor.donor_number || 'Details'}`}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Edit donor information' : 'View donor details'}
              </DialogDescription>
            </div>
            {canManage && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={donor.person?.profile_photo_url || undefined} />
                  <AvatarFallback className="text-lg font-semibold">
                    {donor.person?.name ? getInitials(donor.person.name) : 
                     donor.donor_number ? `#${donor.donor_number}` : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {donor.person?.name || `Donor ${donor.donor_number || 'Unknown'}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {donor.donor_type && (
                      <Badge variant="outline">
                        <Dna className="w-3 h-3 mr-1" />
                        {DonorUtils.getDonorTypeLabel(donor.donor_type)}
                      </Badge>
                    )}
                    <Badge variant={donor.is_anonymous ? "secondary" : "default"}>
                      {DonorUtils.getAnonymityStatus(donor.is_anonymous)}
                    </Badge>
                    {donor.database_entry && (
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        {donor.database_entry.verification_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="person">Person Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="donor_number">Donor Number</Label>
                      {isEditing ? (
                        <Input
                          id="donor_number"
                          value={editData.donor_number || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, donor_number: e.target.value }))}
                          placeholder="e.g., D12345"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md">
                          {donor.donor_number || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sperm_bank">Sperm Bank</Label>
                      {isEditing ? (
                        <Input
                          id="sperm_bank"
                          value={editData.sperm_bank || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, sperm_bank: e.target.value }))}
                          placeholder="e.g., California Cryobank"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.sperm_bank || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="donor_type">Donor Type</Label>
                      {isEditing ? (
                        <Select 
                          value={editData.donor_type || 'sperm'} 
                          onValueChange={(value) => setEditData(prev => ({ ...prev, donor_type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sperm">Sperm</SelectItem>
                            <SelectItem value="egg">Egg</SelectItem>
                            <SelectItem value="embryo">Embryo</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <TestTube className="w-4 h-4 mr-2 text-muted-foreground" />
                          {DonorUtils.getDonorTypeLabel(donor.donor_type)}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="education_level">Education Level</Label>
                      {isEditing ? (
                        <Select 
                          value={editData.education_level || ''} 
                          onValueChange={(value) => setEditData(prev => ({ ...prev, education_level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">High School</SelectItem>
                            <SelectItem value="some_college">Some College</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="doctorate">Doctorate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.education_level || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="is_anonymous">Anonymous Donor</Label>
                    {isEditing ? (
                      <Switch
                        id="is_anonymous"
                        checked={editData.is_anonymous || false}
                        onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_anonymous: checked }))}
                      />
                    ) : (
                      <Badge variant={donor.is_anonymous ? "secondary" : "default"}>
                        {DonorUtils.getAnonymityStatus(donor.is_anonymous)}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={editData.notes || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes about the donor..."
                        rows={3}
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md min-h-[80px]">
                        {donor.notes || 'No notes available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="physical" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Physical Characteristics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="height">Height</Label>
                      {isEditing ? (
                        <Input
                          id="height"
                          value={editData.height || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value }))}
                          placeholder="e.g., 6'0&quot;"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Ruler className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.height || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      {isEditing ? (
                        <Input
                          id="weight"
                          value={editData.weight || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, weight: e.target.value }))}
                          placeholder="e.g., 180 lbs"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Weight className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.weight || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="blood_type">Blood Type</Label>
                      {isEditing ? (
                        <Select 
                          value={editData.blood_type || ''} 
                          onValueChange={(value) => setEditData(prev => ({ ...prev, blood_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.blood_type || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="eye_color">Eye Color</Label>
                      {isEditing ? (
                        <Input
                          id="eye_color"
                          value={editData.eye_color || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, eye_color: e.target.value }))}
                          placeholder="e.g., Blue"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.eye_color || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="hair_color">Hair Color</Label>
                      {isEditing ? (
                        <Input
                          id="hair_color"
                          value={editData.hair_color || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, hair_color: e.target.value }))}
                          placeholder="e.g., Brown"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md flex items-center">
                          <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
                          {donor.hair_color || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ethnicity">Ethnicity</Label>
                      {isEditing ? (
                        <Input
                          id="ethnicity"
                          value={editData.ethnicity || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, ethnicity: e.target.value }))}
                          placeholder="e.g., Caucasian"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded-md">
                          {donor.ethnicity || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Medical History</p>
                    {donor.medical_history && typeof donor.medical_history === 'object' ? (
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(donor.medical_history, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-sm">No medical history recorded</p>
                    )}
                  </div>
                  
                  {donor.metadata && (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground mb-2">Additional Metadata</p>
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(donor.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="person" className="space-y-4 mt-4">
              {donor.person ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label>Full Name</Label>
                          <div className="p-2 bg-muted rounded-md">
                            {donor.person.name}
                          </div>
                        </div>
                        
                        {donor.person.date_of_birth && (
                          <div>
                            <Label>Date of Birth</Label>
                            <div className="p-2 bg-muted rounded-md flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                              {donor.person.date_of_birth}
                              {PersonUtils.getAge(donor.person) && (
                                <span className="ml-2 text-muted-foreground">
                                  (Age {PersonUtils.getAge(donor.person)})
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {donor.person.birth_place && (
                          <div>
                            <Label>Birth Place</Label>
                            <div className="p-2 bg-muted rounded-md flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              {donor.person.birth_place}
                            </div>
                          </div>
                        )}

                        {donor.person.gender && (
                          <div>
                            <Label>Gender</Label>
                            <div className="p-2 bg-muted rounded-md">
                              {donor.person.gender}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {donor.person.email && (
                          <div>
                            <Label>Email</Label>
                            <div className="p-2 bg-muted rounded-md flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                              {donor.person.email}
                            </div>
                          </div>
                        )}

                        {donor.person.phone && (
                          <div>
                            <Label>Phone</Label>
                            <div className="p-2 bg-muted rounded-md flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              {donor.person.phone}
                            </div>
                          </div>
                        )}

                        {donor.person.address && (
                          <div>
                            <Label>Address</Label>
                            <div className="p-2 bg-muted rounded-md flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              {donor.person.address}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label>Status</Label>
                          <div className="p-2 bg-muted rounded-md">
                            <Badge variant={donor.person.status === 'living' ? 'default' : 'secondary'}>
                              {donor.person.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {donor.person.notes && (
                      <div>
                        <Label>Personal Notes</Label>
                        <div className="p-3 bg-muted rounded-md">
                          {donor.person.notes}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No person record linked to this donor
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}