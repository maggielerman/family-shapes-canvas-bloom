import { useState } from "react";
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
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Group, GroupSettings as GrpSettings, GroupUtils } from "@/types/group";

interface GroupSettingsProps {
  groupId: string;
  group: Group;
  isOwner: boolean;
  onUpdate: () => void;
}

export function GroupSettings({ groupId, group, isOwner, onUpdate }: GroupSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<GrpSettings>(
    group.settings as GrpSettings || GroupUtils.getDefaultSettings()
  );
  const [basicInfo, setBasicInfo] = useState({
    label: group.label,
    description: group.description || '',
    visibility: group.visibility || 'private',
    subdomain: group.subdomain || '',
    domain: group.domain || '',
    type: group.type
  });

  const handleSaveBasicInfo = async () => {
    if (!isOwner) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          label: basicInfo.label,
          description: basicInfo.description || null,
          visibility: basicInfo.visibility,
          subdomain: basicInfo.subdomain || null,
          domain: basicInfo.domain || null,
          type: basicInfo.type
        })
        .eq('id', groupId);

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
        .from('groups')
        .update({
          settings: settings
        })
        .eq('id', groupId);

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

  const handleDeleteGroup = async () => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group Deleted",
        description: "The group has been permanently deleted"
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive"
      });
    }
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="communication">Communication</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update your group's basic information and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Group Name</Label>
              <Input
                id="label"
                value={basicInfo.label}
                onChange={(e) => setBasicInfo({...basicInfo, label: e.target.value})}
                disabled={!isOwner}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                disabled={!isOwner}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Group Type</Label>
              <Select
                value={basicInfo.type}
                onValueChange={(value) => setBasicInfo({...basicInfo, type: value})}
                disabled={!isOwner}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family Group</SelectItem>
                  <SelectItem value="donor_siblings">Donor Siblings</SelectItem>
                  <SelectItem value="support">Support Group</SelectItem>
                  <SelectItem value="research">Research Group</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={basicInfo.visibility}
                onValueChange={(value) => setBasicInfo({...basicInfo, visibility: value})}
                disabled={!isOwner}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={basicInfo.subdomain}
                  onChange={(e) => setBasicInfo({...basicInfo, subdomain: e.target.value})}
                  disabled={!isOwner}
                  placeholder="my-group"
                />
                <span className="text-sm text-muted-foreground">.familyshapes.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain (Optional)</Label>
              <Input
                id="domain"
                value={basicInfo.domain}
                onChange={(e) => setBasicInfo({...basicInfo, domain: e.target.value})}
                disabled={!isOwner}
                placeholder="example.com"
              />
            </div>

            {isOwner && (
              <Button onClick={handleSaveBasicInfo} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Permissions
            </CardTitle>
            <CardDescription>
              Control who can see and join your group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Public Discovery</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to find this group in public searches
                </p>
              </div>
              <Switch
                checked={settings.allow_public_discovery}
                onCheckedChange={(checked) => 
                  setSettings({...settings, allow_public_discovery: checked})
                }
                disabled={!isOwner}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Member Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Allow members to invite others to the group
                </p>
              </div>
              <Switch
                checked={settings.allow_member_invites}
                onCheckedChange={(checked) => 
                  setSettings({...settings, allow_member_invites: checked})
                }
                disabled={!isOwner}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval for Joins</Label>
                <p className="text-sm text-muted-foreground">
                  New members must be approved by an admin
                </p>
              </div>
              <Switch
                checked={settings.require_approval_for_joins}
                onCheckedChange={(checked) => 
                  setSettings({...settings, require_approval_for_joins: checked})
                }
                disabled={!isOwner}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Data Sharing Level</Label>
              <Select
                value={settings.data_sharing_level || 'members_only'}
                onValueChange={(value: any) => 
                  setSettings({...settings, data_sharing_level: value})
                }
                disabled={!isOwner}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sharing</SelectItem>
                  <SelectItem value="members_only">Members Only</SelectItem>
                  <SelectItem value="approved_groups">Approved Groups</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOwner && (
              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Privacy Settings
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="features" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Donor Database
            </CardTitle>
            <CardDescription>
              Manage donor information within your group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Donor Database</Label>
                <p className="text-sm text-muted-foreground">
                  Allow the group to maintain a donor database
                </p>
              </div>
              <Switch
                checked={settings.enable_donor_database}
                onCheckedChange={(checked) => 
                  setSettings({...settings, enable_donor_database: checked})
                }
                disabled={!isOwner}
              />
            </div>

            {settings.enable_donor_database && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Donor Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to search the donor database
                    </p>
                  </div>
                  <Switch
                    checked={settings.donor_search_enabled}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, donor_search_enabled: checked})
                    }
                    disabled={!isOwner}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Sibling Groups
            </CardTitle>
            <CardDescription>
              Manage sibling connections and groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sibling Groups</Label>
                <p className="text-sm text-muted-foreground">
                  Allow creation of sibling groups within the group
                </p>
              </div>
              <Switch
                checked={settings.enable_sibling_groups}
                onCheckedChange={(checked) => 
                  setSettings({...settings, enable_sibling_groups: checked})
                }
                disabled={!isOwner}
              />
            </div>

            {isOwner && (
              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Feature Settings
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="communication" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communication Settings
            </CardTitle>
            <CardDescription>
              Configure how members communicate within the group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Messaging</Label>
                <p className="text-sm text-muted-foreground">
                  Allow members to send direct messages
                </p>
              </div>
              <Switch
                checked={settings.enable_messaging}
                onCheckedChange={(checked) => 
                  setSettings({...settings, enable_messaging: checked})
                }
                disabled={!isOwner}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Forums</Label>
                <p className="text-sm text-muted-foreground">
                  Enable discussion forums for the group
                </p>
              </div>
              <Switch
                checked={settings.enable_forums}
                onCheckedChange={(checked) => 
                  setSettings({...settings, enable_forums: checked})
                }
                disabled={!isOwner}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Moderation Level</Label>
              <Select
                value={settings.moderation_level || 'basic'}
                onValueChange={(value: any) => 
                  setSettings({...settings, moderation_level: value})
                }
                disabled={!isOwner}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Moderation</SelectItem>
                  <SelectItem value="basic">Basic Moderation</SelectItem>
                  <SelectItem value="strict">Strict Moderation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOwner && (
              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Communication Settings
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="danger" className="space-y-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that affect your entire group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg space-y-2">
              <h4 className="font-medium">Delete Group</h4>
              <p className="text-sm text-muted-foreground">
                Once you delete a group, there is no going back. All data will be permanently removed.
              </p>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete This Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the group
                        "{group.label}" and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteGroup}
                      >
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default GroupSettings;