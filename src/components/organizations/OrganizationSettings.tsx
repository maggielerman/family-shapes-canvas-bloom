import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Settings,
  Shield,
  Users,
  Database,
  Heart,
  MessageCircle,
  Palette,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Organization, OrganizationSettings as OrgSettings, OrganizationUtils } from "@/types/organization";

interface OrganizationSettingsProps {
  organizationId: string;
  organization: Organization;
  isOwner: boolean;
  onUpdate: () => void;
}

export function OrganizationSettings({ organizationId, organization, isOwner, onUpdate }: OrganizationSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<OrgSettings>(
    organization.settings as OrgSettings || OrganizationUtils.getDefaultSettings()
  );
  const [basicInfo, setBasicInfo] = useState({
    name: organization.name,
    description: organization.description || '',
    visibility: organization.visibility || 'private',
    domain: organization.domain || '',
  });

  const handleSaveBasicInfo = async () => {
    if (!isOwner) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: basicInfo.name,
          description: basicInfo.description || null,
          visibility: basicInfo.visibility,
          domain: basicInfo.domain || null,
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Basic information updated successfully"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast({
        title: "Error",
        description: "Failed to update basic information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!isOwner) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: settings as any
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Organization Deleted",
        description: "The organization has been permanently deleted"
      });

      // Redirect to organizations list
      window.location.href = '/organizations';
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive"
      });
    }
  };

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only organization owners can access settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="siblings">Siblings</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update your organization's basic details and visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={basicInfo.domain}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your organization..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={basicInfo.visibility} 
                  onValueChange={(value) => setBasicInfo(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private - Invitation only
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public - Anyone can discover
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveBasicInfo} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Basic Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Permissions Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Permissions
              </CardTitle>
              <CardDescription>
                Control who can discover and join your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Public Discovery</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your organization to appear in public searches
                  </p>
                </div>
                <Switch
                  checked={settings.allow_public_discovery}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_public_discovery: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Member Invitations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow members to invite new people to the organization
                  </p>
                </div>
                <Switch
                  checked={settings.allow_member_invites}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_member_invites: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Approval Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Require admin approval for new members joining
                  </p>
                </div>
                <Switch
                  checked={settings.require_approval_for_joins}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_approval_for_joins: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Data Sharing Level</Label>
                <Select 
                  value={settings.data_sharing_level} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, data_sharing_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Data Sharing</SelectItem>
                    <SelectItem value="members_only">Members Only</SelectItem>
                    <SelectItem value="approved_orgs">Approved Organizations</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Medical History</Label>
                  <Switch
                    checked={settings.share_medical_history}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, share_medical_history: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Contact Info</Label>
                  <Switch
                    checked={settings.share_contact_info}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, share_contact_info: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Photos</Label>
                  <Switch
                    checked={settings.share_photos}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, share_photos: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donor Database Tab */}
        <TabsContent value="donors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Donor Database Settings
              </CardTitle>
              <CardDescription>
                Configure how donor information is managed and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Donor Database</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow organization to maintain a donor database
                  </p>
                </div>
                <Switch
                  checked={settings.enable_donor_database}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_donor_database: checked }))}
                />
              </div>

              {settings.enable_donor_database && (
                <>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Public Donor Search</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow public searching of verified donor profiles
                      </p>
                    </div>
                    <Switch
                      checked={settings.donor_search_enabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, donor_search_enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Anonymous Donors</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymous donor profiles in the database
                      </p>
                    </div>
                    <Switch
                      checked={settings.allow_anonymous_donors}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_anonymous_donors: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require manual verification of all donor entries
                      </p>
                    </div>
                    <Switch
                      checked={settings.require_donor_verification}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_donor_verification: checked }))}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Donor Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sibling Groups Tab */}
        <TabsContent value="siblings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Sibling Groups Settings
              </CardTitle>
              <CardDescription>
                Configure how donor sibling groups are managed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Sibling Groups</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow creation and management of donor sibling groups
                  </p>
                </div>
                <Switch
                  checked={settings.enable_sibling_groups}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_sibling_groups: checked }))}
                />
              </div>

              {settings.enable_sibling_groups && (
                <>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto-Create Groups</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create sibling groups for new donors
                      </p>
                    </div>
                    <Switch
                      checked={settings.auto_create_sibling_groups}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_create_sibling_groups: checked }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Default Notification Settings</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">New Sibling Alerts</Label>
                        <Switch
                          checked={settings.sibling_notification_settings?.new_sibling_alerts}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            sibling_notification_settings: {
                              ...prev.sibling_notification_settings,
                              new_sibling_alerts: checked
                            }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Donor Updates</Label>
                        <Switch
                          checked={settings.sibling_notification_settings?.donor_update_alerts}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            sibling_notification_settings: {
                              ...prev.sibling_notification_settings,
                              donor_update_alerts: checked
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Frequency</Label>
                    <Select 
                      value={settings.sibling_notification_settings?.frequency} 
                      onValueChange={(value: any) => setSettings(prev => ({
                        ...prev,
                        sibling_notification_settings: {
                          ...prev.sibling_notification_settings,
                          frequency: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="monthly">Monthly Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Sibling Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Communication Settings
              </CardTitle>
              <CardDescription>
                Configure messaging and community features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Messaging</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow members to send direct messages
                  </p>
                </div>
                <Switch
                  checked={settings.enable_messaging}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_messaging: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Community Forums</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable organization-wide discussion forums
                  </p>
                </div>
                <Switch
                  checked={settings.enable_forums}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_forums: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Moderation Level</Label>
                <Select 
                  value={settings.moderation_level} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, moderation_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Moderation</SelectItem>
                    <SelectItem value="basic">Basic Filtering</SelectItem>
                    <SelectItem value="strict">Strict Moderation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Communication Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Custom Branding
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Custom Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.custom_logo_url || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom_logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.custom_colors?.primary || '#000000'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        custom_colors: {
                          ...prev.custom_colors,
                          primary: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.custom_colors?.secondary || '#666666'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        custom_colors: {
                          ...prev.custom_colors,
                          secondary: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Branding
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently affect your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Organization
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the organization
                        and remove all associated data including members, donors, and sibling groups.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteOrganization}>
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrganizationSettings;