import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPersonIdFromUserId } from "@/utils/donorUtils";
import { 
  Save, 
  User, 
  Lock, 
  Eye, 
  Camera,
  Info,
  Calendar,
  MapPin,
  GraduationCap,
  Dna,
  Heart,
  Shield
} from "lucide-react";

interface DonorProfileData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Donor Information
  donorNumber: string;
  cryobankName: string;
  donorType: 'sperm' | 'egg' | 'embryo' | 'other';
  donationYear: string;
  
  // Physical Characteristics
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  ethnicity: string;
  bloodType: string;
  
  // Additional Information
  educationLevel: string;
  occupation: string;
  interests: string;
  personalStatement: string;
  
  // Privacy Settings
  isAnonymous: boolean;
  showContactInfo: boolean;
  showMedicalHistory: boolean;
}

const DonorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [profileData, setProfileData] = useState<DonorProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    donorNumber: "",
    cryobankName: "",
    donorType: "sperm",
    donationYear: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    ethnicity: "",
    bloodType: "",
    educationLevel: "",
    occupation: "",
    interests: "",
    personalStatement: "",
    isAnonymous: true,
    showContactInfo: false,
    showMedicalHistory: false
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      // Load donor data
      const { data: donorData, error } = await supabase
        .from('donors')
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            date_of_birth,
            email,
            phone
          )
        `)
        .eq('person_id', personId)
        .single();

      if (error) throw error;

      if (donorData) {
        setProfileData({
          firstName: donorData.person?.first_name || "",
          lastName: donorData.person?.last_name || "",
          email: donorData.person?.email || user.email || "",
          phone: donorData.person?.phone || "",
          dateOfBirth: donorData.person?.date_of_birth || "",
          donorNumber: donorData.donor_number || "",
          cryobankName: donorData.sperm_bank || "",
          donorType: donorData.donor_type || "sperm",
          donationYear: donorData.metadata?.donation_year || "",
          height: donorData.height || "",
          weight: donorData.weight || "",
          eyeColor: donorData.eye_color || "",
          hairColor: donorData.hair_color || "",
          ethnicity: donorData.ethnicity || "",
          bloodType: donorData.blood_type || "",
          educationLevel: donorData.education_level || "",
          occupation: donorData.metadata?.occupation || "",
          interests: donorData.metadata?.interests || "",
          personalStatement: donorData.notes || "",
          isAnonymous: donorData.is_anonymous ?? true,
          showContactInfo: donorData.metadata?.show_contact_info || false,
          showMedicalHistory: donorData.metadata?.show_medical_history || false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      // Update person data
      const { error: personError } = await supabase
        .from('persons')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          date_of_birth: profileData.dateOfBirth,
          email: profileData.email,
          phone: profileData.phone
        })
        .eq('user_id', user.id);

      if (personError) throw personError;

      // Update donor data
      const { error: donorError } = await supabase
        .from('donors')
        .update({
          donor_number: profileData.donorNumber,
          sperm_bank: profileData.cryobankName,
          donor_type: profileData.donorType,
          height: profileData.height,
          weight: profileData.weight,
          eye_color: profileData.eyeColor,
          hair_color: profileData.hairColor,
          ethnicity: profileData.ethnicity,
          blood_type: profileData.bloodType,
          education_level: profileData.educationLevel,
          notes: profileData.personalStatement,
          is_anonymous: profileData.isAnonymous,
          metadata: {
            donation_year: profileData.donationYear,
            occupation: profileData.occupation,
            interests: profileData.interests,
            show_contact_info: profileData.showContactInfo,
            show_medical_history: profileData.showMedicalHistory
          }
        })
        .eq('person_id', personId);

      if (donorError) throw donorError;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Failed to save your profile changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof DonorProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field: keyof DonorProfileData) => (value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof DonorProfileData) => (checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donor Profile</h1>
          <p className="text-muted-foreground">
            Manage your donor information and privacy settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              loadProfile();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-medium">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Donor #{profileData.donorNumber || "Not set"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profileData.isAnonymous ? "secondary" : "default"}>
                  {profileData.isAnonymous ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Anonymous
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Open
                    </>
                  )}
                </Badge>
                <Badge variant="outline">
                  {profileData.donorType.charAt(0).toUpperCase() + profileData.donorType.slice(1)} Donor
                </Badge>
              </div>
            </div>
            {isEditing && (
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal and donor identification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange('lastName')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange('email')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange('dateOfBirth')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorType">Donor Type</Label>
                  <Select
                    value={profileData.donorType}
                    onValueChange={handleSelectChange('donorType')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sperm">Sperm Donor</SelectItem>
                      <SelectItem value="egg">Egg Donor</SelectItem>
                      <SelectItem value="embryo">Embryo Donor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorNumber">Donor Number</Label>
                  <Input
                    id="donorNumber"
                    value={profileData.donorNumber}
                    onChange={handleInputChange('donorNumber')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cryobankName">Cryobank/Clinic Name</Label>
                  <Input
                    id="cryobankName"
                    value={profileData.cryobankName}
                    onChange={handleInputChange('cryobankName')}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Physical Characteristics</CardTitle>
              <CardDescription>Your physical attributes and characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    placeholder="e.g., 5'10 or 178cm"
                    value={profileData.height}
                    onChange={handleInputChange('height')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 170lbs or 77kg"
                    value={profileData.weight}
                    onChange={handleInputChange('weight')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eyeColor">Eye Color</Label>
                  <Select
                    value={profileData.eyeColor}
                    onValueChange={handleSelectChange('eyeColor')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eye color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="hazel">Hazel</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <Select
                    value={profileData.hairColor}
                    onValueChange={handleSelectChange('hairColor')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="blonde">Blonde</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ethnicity">Ethnicity</Label>
                  <Input
                    id="ethnicity"
                    placeholder="e.g., Caucasian, Asian, etc."
                    value={profileData.ethnicity}
                    onChange={handleInputChange('ethnicity')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={profileData.bloodType}
                    onValueChange={handleSelectChange('bloodType')}
                    disabled={!isEditing}
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Education, interests, and personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={profileData.educationLevel}
                    onValueChange={handleSelectChange('educationLevel')}
                    disabled={!isEditing}
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
                      <SelectItem value="professional">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="Your current occupation"
                    value={profileData.occupation}
                    onChange={handleInputChange('occupation')}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Hobbies</Label>
                  <Textarea
                    id="interests"
                    placeholder="Share your interests and hobbies..."
                    value={profileData.interests}
                    onChange={handleInputChange('interests')}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalStatement">Personal Statement</Label>
                  <Textarea
                    id="personalStatement"
                    placeholder="Share a message for recipient families (optional)..."
                    value={profileData.personalStatement}
                    onChange={handleInputChange('personalStatement')}
                    disabled={!isEditing}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is how your profile appears to recipient families based on your privacy settings.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                {profileData.isAnonymous 
                  ? "Anonymous Donor View - Limited information shown"
                  : "Open Donor View - Full information shown"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Always shown */}
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Donor Number:</span>
                      <span>{profileData.donorNumber || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Donor Type:</span>
                      <span>{profileData.donorType.charAt(0).toUpperCase() + profileData.donorType.slice(1)}</span>
                    </div>
                    {profileData.cryobankName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cryobank/Clinic:</span>
                        <span>{profileData.cryobankName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical Characteristics - Always shown */}
                <div>
                  <h4 className="font-medium mb-2">Physical Characteristics</h4>
                  <div className="grid gap-2 text-sm">
                    {profileData.height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <span>{profileData.height}</span>
                      </div>
                    )}
                    {profileData.weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{profileData.weight}</span>
                      </div>
                    )}
                    {profileData.eyeColor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Eye Color:</span>
                        <span>{profileData.eyeColor.charAt(0).toUpperCase() + profileData.eyeColor.slice(1)}</span>
                      </div>
                    )}
                    {profileData.hairColor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hair Color:</span>
                        <span>{profileData.hairColor.charAt(0).toUpperCase() + profileData.hairColor.slice(1)}</span>
                      </div>
                    )}
                    {profileData.ethnicity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ethnicity:</span>
                        <span>{profileData.ethnicity}</span>
                      </div>
                    )}
                    {profileData.bloodType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blood Type:</span>
                        <span>{profileData.bloodType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info - Only shown if not anonymous */}
                {!profileData.isAnonymous && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Additional Information</h4>
                      <div className="grid gap-2 text-sm">
                        {profileData.educationLevel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Education:</span>
                            <span>{profileData.educationLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        )}
                        {profileData.occupation && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Occupation:</span>
                            <span>{profileData.occupation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {profileData.interests && (
                      <div>
                        <h4 className="font-medium mb-2">Interests & Hobbies</h4>
                        <p className="text-sm text-muted-foreground">{profileData.interests}</p>
                      </div>
                    )}

                    {profileData.personalStatement && (
                      <div>
                        <h4 className="font-medium mb-2">Personal Message</h4>
                        <p className="text-sm text-muted-foreground">{profileData.personalStatement}</p>
                      </div>
                    )}

                    {profileData.showContactInfo && (
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{profileData.firstName} {profileData.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{profileData.email}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorProfile;