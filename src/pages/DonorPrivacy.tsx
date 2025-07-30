import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPersonIdFromUserId } from "@/utils/donorUtils";
import { 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Shield,
  Info,
  Save,
  AlertCircle,
  Users,
  Building2,
  Heart,
  MessageSquare,
  FileText,
  Camera
} from "lucide-react";

interface PrivacySettings {
  // Overall Privacy Level
  privacyLevel: 'anonymous' | 'semi-open' | 'open';
  
  // What Recipient Families Can See
  showBasicInfo: boolean;
  showPhysicalCharacteristics: boolean;
  showEducation: boolean;
  showOccupation: boolean;
  showInterests: boolean;
  showPersonalStatement: boolean;
  showContactInfo: boolean;
  showHealthHistory: boolean;
  showPhotos: boolean;
  
  // What Clinics/Organizations Can See
  clinicCanViewProfile: boolean;
  clinicCanContactDirectly: boolean;
  
  // Communication Preferences
  allowFamilyMessages: boolean;
  allowClinicMessages: boolean;
  requireMessageApproval: boolean;
  messageNotifications: boolean;
  
  // Data Sharing
  allowDataSharing: boolean;
  allowResearch: boolean;
}

const DonorPrivacy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    privacyLevel: 'anonymous',
    showBasicInfo: true,
    showPhysicalCharacteristics: true,
    showEducation: false,
    showOccupation: false,
    showInterests: false,
    showPersonalStatement: false,
    showContactInfo: false,
    showHealthHistory: true,
    showPhotos: false,
    clinicCanViewProfile: true,
    clinicCanContactDirectly: false,
    allowFamilyMessages: true,
    allowClinicMessages: true,
    requireMessageApproval: true,
    messageNotifications: true,
    allowDataSharing: false,
    allowResearch: false
  });

  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  useEffect(() => {
    // Update individual settings based on privacy level
    if (privacySettings.privacyLevel === 'anonymous') {
      setPrivacySettings(prev => ({
        ...prev,
        showEducation: false,
        showOccupation: false,
        showInterests: false,
        showPersonalStatement: false,
        showContactInfo: false,
        showPhotos: false,
        requireMessageApproval: true
      }));
    } else if (privacySettings.privacyLevel === 'open') {
      setPrivacySettings(prev => ({
        ...prev,
        showEducation: true,
        showOccupation: true,
        showInterests: true,
        showPersonalStatement: true,
        showContactInfo: true,
        showPhotos: true,
        requireMessageApproval: false
      }));
    }
  }, [privacySettings.privacyLevel]);

  const loadPrivacySettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('is_anonymous, metadata')
        .eq('person_id', personId)
        .single();

      if (error) throw error;

      if (donorData) {
        const privacy = donorData.metadata?.privacy_settings || {};
        const isAnonymous = donorData.is_anonymous ?? true;
        
        setPrivacySettings({
          privacyLevel: isAnonymous ? 'anonymous' : (privacy.privacy_level || 'semi-open'),
          showBasicInfo: privacy.show_basic_info ?? true,
          showPhysicalCharacteristics: privacy.show_physical_characteristics ?? true,
          showEducation: privacy.show_education ?? !isAnonymous,
          showOccupation: privacy.show_occupation ?? !isAnonymous,
          showInterests: privacy.show_interests ?? !isAnonymous,
          showPersonalStatement: privacy.show_personal_statement ?? !isAnonymous,
          showContactInfo: privacy.show_contact_info ?? false,
          showHealthHistory: privacy.show_health_history ?? true,
          showPhotos: privacy.show_photos ?? false,
          clinicCanViewProfile: privacy.clinic_can_view_profile ?? true,
          clinicCanContactDirectly: privacy.clinic_can_contact_directly ?? false,
          allowFamilyMessages: privacy.allow_family_messages ?? true,
          allowClinicMessages: privacy.allow_clinic_messages ?? true,
          requireMessageApproval: privacy.require_message_approval ?? true,
          messageNotifications: privacy.message_notifications ?? true,
          allowDataSharing: privacy.allow_data_sharing ?? false,
          allowResearch: privacy.allow_research ?? false
        });

        // Load preview data
        loadPreviewData();
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Error loading privacy settings",
        description: "Failed to load your privacy preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreviewData = async () => {
    if (!user) return;
    
    try {
      // First get the person ID from the user ID
      const personId = await getPersonIdFromUserId(user.id);
      if (!personId) {
        throw new Error('Person record not found');
      }
      
      const { data: donorData } = await supabase
        .from('donors')
        .select(`
          *,
          person:person_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('person_id', personId)
        .single();

      if (donorData) {
        setPreviewData(donorData);
      }
    } catch (error) {
      console.error('Error loading preview data:', error);
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
      
      const privacyMetadata = {
        privacy_settings: {
          privacy_level: privacySettings.privacyLevel,
          show_basic_info: privacySettings.showBasicInfo,
          show_physical_characteristics: privacySettings.showPhysicalCharacteristics,
          show_education: privacySettings.showEducation,
          show_occupation: privacySettings.showOccupation,
          show_interests: privacySettings.showInterests,
          show_personal_statement: privacySettings.showPersonalStatement,
          show_contact_info: privacySettings.showContactInfo,
          show_health_history: privacySettings.showHealthHistory,
          show_photos: privacySettings.showPhotos,
          clinic_can_view_profile: privacySettings.clinicCanViewProfile,
          clinic_can_contact_directly: privacySettings.clinicCanContactDirectly,
          allow_family_messages: privacySettings.allowFamilyMessages,
          allow_clinic_messages: privacySettings.allowClinicMessages,
          require_message_approval: privacySettings.requireMessageApproval,
          message_notifications: privacySettings.messageNotifications,
          allow_data_sharing: privacySettings.allowDataSharing,
          allow_research: privacySettings.allowResearch
        }
      };

      const { error } = await supabase
        .from('donors')
        .update({ 
          is_anonymous: privacySettings.privacyLevel === 'anonymous',
          metadata: privacyMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('person_id', personId);

      if (error) throw error;

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error saving privacy settings",
        description: "Failed to save your privacy preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof PrivacySettings) => (checked: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const getPrivacyLevelDescription = (level: string) => {
    switch (level) {
      case 'anonymous':
        return "Your identity is completely hidden. Only basic donor information and physical characteristics are shared.";
      case 'semi-open':
        return "Some personal information is shared, but your full identity remains private. You control what's visible.";
      case 'open':
        return "Your full profile is visible to recipient families. Direct communication may be possible.";
      default:
        return "";
    }
  };

  const getPreviewContent = () => {
    if (!previewData) return null;

    const visibleData: any = {
      donorNumber: previewData.donor_number,
      donorType: previewData.donor_type,
      cryobank: previewData.sperm_bank
    };

    if (privacySettings.showPhysicalCharacteristics) {
      visibleData.physicalCharacteristics = {
        height: previewData.height,
        weight: previewData.weight,
        eyeColor: previewData.eye_color,
        hairColor: previewData.hair_color,
        ethnicity: previewData.ethnicity,
        bloodType: previewData.blood_type
      };
    }

    if (privacySettings.showEducation) {
      visibleData.education = previewData.education_level;
    }

    if (privacySettings.showOccupation) {
      visibleData.occupation = previewData.metadata?.occupation;
    }

    if (privacySettings.showInterests) {
      visibleData.interests = previewData.metadata?.interests;
    }

    if (privacySettings.showPersonalStatement) {
      visibleData.personalStatement = previewData.notes;
    }

    if (privacySettings.showContactInfo && privacySettings.privacyLevel === 'open') {
      visibleData.contact = {
        name: `${previewData.person?.first_name} ${previewData.person?.last_name}`,
        email: previewData.person?.email
      };
    }

    return visibleData;
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy Settings</h1>
          <p className="text-muted-foreground">
            Control how your information is shared with families and organizations
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Current Privacy Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Privacy Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={privacySettings.privacyLevel}
            onValueChange={(value) => setPrivacySettings(prev => ({ 
              ...prev, 
              privacyLevel: value as 'anonymous' | 'semi-open' | 'open' 
            }))}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="anonymous" id="anonymous" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="anonymous" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <Lock className="h-4 w-4" />
                      Anonymous
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getPrivacyLevelDescription('anonymous')}
                    </p>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="semi-open" id="semi-open" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="semi-open" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <Eye className="h-4 w-4" />
                      Semi-Open
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getPrivacyLevelDescription('semi-open')}
                    </p>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="open" id="open" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="open" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" />
                      Open
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getPrivacyLevelDescription('open')}
                    </p>
                  </Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your privacy settings determine what information is visible to recipient families and organizations.
              You can change these settings at any time.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recipient Families
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {privacySettings.allowFamilyMessages 
                    ? "Can send you messages" 
                    : "Cannot contact you"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {privacySettings.showContactInfo && privacySettings.privacyLevel === 'open'
                    ? "Can see your contact information"
                    : "Cannot see your contact information"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Clinics & Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {privacySettings.clinicCanViewProfile
                    ? "Can view your profile"
                    : "Cannot view your profile"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {privacySettings.clinicCanContactDirectly
                    ? "Can contact you directly"
                    : "Must go through platform"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Information Visibility</CardTitle>
              <CardDescription>
                Choose what information is visible to recipient families
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="basic">Basic Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Donor number, type, and cryobank
                    </p>
                  </div>
                  <Switch
                    id="basic"
                    checked={privacySettings.showBasicInfo}
                    onCheckedChange={handleToggle('showBasicInfo')}
                    disabled={true} // Always visible
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="physical">Physical Characteristics</Label>
                    <p className="text-sm text-muted-foreground">
                      Height, weight, eye color, hair color, etc.
                    </p>
                  </div>
                  <Switch
                    id="physical"
                    checked={privacySettings.showPhysicalCharacteristics}
                    onCheckedChange={handleToggle('showPhysicalCharacteristics')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="health">Health History</Label>
                    <p className="text-sm text-muted-foreground">
                      Medical conditions and health updates
                    </p>
                  </div>
                  <Switch
                    id="health"
                    checked={privacySettings.showHealthHistory}
                    onCheckedChange={handleToggle('showHealthHistory')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="education">Education Level</Label>
                    <p className="text-sm text-muted-foreground">
                      Your educational background
                    </p>
                  </div>
                  <Switch
                    id="education"
                    checked={privacySettings.showEducation}
                    onCheckedChange={handleToggle('showEducation')}
                    disabled={privacySettings.privacyLevel === 'anonymous'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="occupation">Occupation</Label>
                    <p className="text-sm text-muted-foreground">
                      Your current profession
                    </p>
                  </div>
                  <Switch
                    id="occupation"
                    checked={privacySettings.showOccupation}
                    onCheckedChange={handleToggle('showOccupation')}
                    disabled={privacySettings.privacyLevel === 'anonymous'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="interests">Interests & Hobbies</Label>
                    <p className="text-sm text-muted-foreground">
                      Your personal interests
                    </p>
                  </div>
                  <Switch
                    id="interests"
                    checked={privacySettings.showInterests}
                    onCheckedChange={handleToggle('showInterests')}
                    disabled={privacySettings.privacyLevel === 'anonymous'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="statement">Personal Statement</Label>
                    <p className="text-sm text-muted-foreground">
                      Your message to families
                    </p>
                  </div>
                  <Switch
                    id="statement"
                    checked={privacySettings.showPersonalStatement}
                    onCheckedChange={handleToggle('showPersonalStatement')}
                    disabled={privacySettings.privacyLevel === 'anonymous'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contact">Contact Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Name and email (Open donors only)
                    </p>
                  </div>
                  <Switch
                    id="contact"
                    checked={privacySettings.showContactInfo}
                    onCheckedChange={handleToggle('showContactInfo')}
                    disabled={privacySettings.privacyLevel !== 'open'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="photos">Photos</Label>
                    <p className="text-sm text-muted-foreground">
                      Profile and additional photos
                    </p>
                  </div>
                  <Switch
                    id="photos"
                    checked={privacySettings.showPhotos}
                    onCheckedChange={handleToggle('showPhotos')}
                    disabled={privacySettings.privacyLevel === 'anonymous'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>
                Control how families and organizations can contact you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Message Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="family-messages">Allow Family Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Recipient families can send you messages
                    </p>
                  </div>
                  <Switch
                    id="family-messages"
                    checked={privacySettings.allowFamilyMessages}
                    onCheckedChange={handleToggle('allowFamilyMessages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="clinic-messages">Allow Clinic Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Clinics can send you updates
                    </p>
                  </div>
                  <Switch
                    id="clinic-messages"
                    checked={privacySettings.allowClinicMessages}
                    onCheckedChange={handleToggle('allowClinicMessages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="approval">Require Message Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Review messages before they're delivered
                    </p>
                  </div>
                  <Switch
                    id="approval"
                    checked={privacySettings.requireMessageApproval}
                    onCheckedChange={handleToggle('requireMessageApproval')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for new messages
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={privacySettings.messageNotifications}
                    onCheckedChange={handleToggle('messageNotifications')}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Organization Access</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="clinic-view">Clinic Profile Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Clinics can view your donor profile
                    </p>
                  </div>
                  <Switch
                    id="clinic-view"
                    checked={privacySettings.clinicCanViewProfile}
                    onCheckedChange={handleToggle('clinicCanViewProfile')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="clinic-contact">Direct Clinic Contact</Label>
                    <p className="text-sm text-muted-foreground">
                      Clinics can contact you directly
                    </p>
                  </div>
                  <Switch
                    id="clinic-contact"
                    checked={privacySettings.clinicCanContactDirectly}
                    onCheckedChange={handleToggle('clinicCanContactDirectly')}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Data Usage</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data with partner clinics
                    </p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={privacySettings.allowDataSharing}
                    onCheckedChange={handleToggle('allowDataSharing')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="research">Research Participation</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow use in anonymized research studies
                    </p>
                  </div>
                  <Switch
                    id="research"
                    checked={privacySettings.allowResearch}
                    onCheckedChange={handleToggle('allowResearch')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              This is how your profile appears to recipient families based on your current privacy settings.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>
                Privacy Level: {privacySettings.privacyLevel.charAt(0).toUpperCase() + privacySettings.privacyLevel.slice(1).replace('-', ' ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="space-y-4">
                  {/* Basic Information - Always visible */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Basic Information
                    </h4>
                    <div className="grid gap-2 text-sm pl-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donor Number:</span>
                        <span>{previewData.donor_number || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donor Type:</span>
                        <span>{previewData.donor_type?.charAt(0).toUpperCase() + previewData.donor_type?.slice(1)}</span>
                      </div>
                      {previewData.sperm_bank && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cryobank/Clinic:</span>
                          <span>{previewData.sperm_bank}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Characteristics */}
                  {privacySettings.showPhysicalCharacteristics && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Physical Characteristics
                      </h4>
                      <div className="grid gap-2 text-sm pl-6">
                        {previewData.height && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Height:</span>
                            <span>{previewData.height}</span>
                          </div>
                        )}
                        {previewData.weight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{previewData.weight}</span>
                          </div>
                        )}
                        {previewData.eye_color && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Eye Color:</span>
                            <span>{previewData.eye_color}</span>
                          </div>
                        )}
                        {previewData.hair_color && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hair Color:</span>
                            <span>{previewData.hair_color}</span>
                          </div>
                        )}
                        {previewData.ethnicity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ethnicity:</span>
                            <span>{previewData.ethnicity}</span>
                          </div>
                        )}
                        {previewData.blood_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Blood Type:</span>
                            <span>{previewData.blood_type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Health Information */}
                  {privacySettings.showHealthHistory && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Health Information
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        Health history is available to view
                      </p>
                    </div>
                  )}

                  {/* Additional Information */}
                  {(privacySettings.showEducation || privacySettings.showOccupation) && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Additional Information
                      </h4>
                      <div className="grid gap-2 text-sm pl-6">
                        {privacySettings.showEducation && previewData.education_level && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Education:</span>
                            <span>{previewData.education_level}</span>
                          </div>
                        )}
                        {privacySettings.showOccupation && previewData.metadata?.occupation && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Occupation:</span>
                            <span>{previewData.metadata.occupation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  {(privacySettings.showInterests || privacySettings.showPersonalStatement) && (
                    <div>
                      {privacySettings.showInterests && previewData.metadata?.interests && (
                        <div className="mb-3">
                          <h4 className="font-medium mb-2">Interests & Hobbies</h4>
                          <p className="text-sm text-muted-foreground pl-6">
                            {previewData.metadata.interests}
                          </p>
                        </div>
                      )}
                      {privacySettings.showPersonalStatement && previewData.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Personal Message</h4>
                          <p className="text-sm text-muted-foreground pl-6">
                            {previewData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Information */}
                  {privacySettings.showContactInfo && privacySettings.privacyLevel === 'open' && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Contact Information
                      </h4>
                      <div className="grid gap-2 text-sm pl-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{previewData.person?.first_name} {previewData.person?.last_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{previewData.person?.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {privacySettings.showPhotos && privacySettings.privacyLevel !== 'anonymous' && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Photos
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        Profile photos are visible
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Loading preview...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorPrivacy;