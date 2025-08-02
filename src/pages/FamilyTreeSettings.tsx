import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
  Settings,
  AlertTriangle,
  Info,
  Calendar,
  Link,
  Download,
  Upload,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Bell,
  Palette,
  Layout,
  Database,
  Archive,
  History,
  Key,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { ExportImportDialog } from "@/components/family-trees/ExportImportDialog";

interface FamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'shared' | 'public';
  created_at: string;
  updated_at: string;
  user_id: string;
  settings?: {
    allow_comments?: boolean;
    allow_edits?: boolean;
    require_approval?: boolean;
    auto_backup?: boolean;
    backup_frequency?: 'daily' | 'weekly' | 'monthly';
    theme?: 'default' | 'dark' | 'light';
            layout?: 'force' | 'radial' | 'dagre';
    privacy_level?: 'strict' | 'moderate' | 'open';
    notification_preferences?: {
      new_members?: boolean;
      updates?: boolean;
      comments?: boolean;
      shares?: boolean;
    };
  };
  _count?: {
    persons: number;
    connections: number;
    members: number;
  };
}

interface SharingLink {
  id: string;
  link_token: string;
  access_level: 'view' | 'edit' | 'admin';
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

interface TreeMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joined_at: string;
  user: {
    email: string;
    full_name?: string;
  };
}

export default function FamilyTreeSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharingLinks, setSharingLinks] = useState<SharingLink[]>([]);
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Form states
  const [treeName, setTreeName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");
  const [visibility, setVisibility] = useState<'private' | 'shared' | 'public'>('private');
  const [settings, setSettings] = useState({
    allow_comments: false,
    allow_edits: false,
    require_approval: true,
    auto_backup: true,
    backup_frequency: 'weekly' as const,
    theme: 'default' as const,
    layout: 'force' as const,
    privacy_level: 'moderate' as const,
    notification_preferences: {
      new_members: true,
      updates: true,
      comments: false,
      shares: true,
    },
  });

  useEffect(() => {
    if (id) {
      fetchFamilyTree();
      fetchSharingLinks();
      fetchMembers();
    }
  }, [id]);

  const fetchFamilyTree = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('family_trees')
        .select(`
          *,
          _count:family_tree_members(count)
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setFamilyTree(data);
      setTreeName(data.name);
      setTreeDescription(data.description || "");
      setVisibility(data.visibility);
      setSettings({
        allow_comments: data.settings?.allow_comments ?? false,
        allow_edits: data.settings?.allow_edits ?? false,
        require_approval: data.settings?.require_approval ?? true,
        auto_backup: data.settings?.auto_backup ?? true,
        backup_frequency: data.settings?.backup_frequency ?? 'weekly',
        theme: data.settings?.theme ?? 'default',
        layout: data.settings?.layout ?? 'force',
        privacy_level: data.settings?.privacy_level ?? 'moderate',
        notification_preferences: data.settings?.notification_preferences ?? {
          new_members: true,
          updates: true,
          comments: false,
          shares: true,
        },
      });
    } catch (error) {
      console.error('Error fetching family tree:', error);
      toast({
        title: "Error",
        description: "Failed to load family tree settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSharingLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('sharing_links')
        .select('*')
        .eq('family_tree_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharingLinks(data || []);
    } catch (error) {
      console.error('Error fetching sharing links:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_tree_members')
        .select(`
          *,
          user:users(email, full_name)
        `)
        .eq('family_tree_id', id);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSave = async () => {
    if (!familyTree) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('family_trees')
        .update({
          name: treeName,
          description: treeDescription,
          visibility,
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', familyTree.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Family tree settings have been updated successfully",
      });

      // Refresh the tree data
      await fetchFamilyTree();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTree = async () => {
    if (!familyTree) return;

    try {
      setSaving(true);
      
      // Delete sharing links first
      await supabase
        .from('sharing_links')
        .delete()
        .eq('family_tree_id', familyTree.id);

      // Delete family tree members
      await supabase
        .from('family_tree_members')
        .delete()
        .eq('family_tree_id', familyTree.id);

      // Delete the family tree
      const { error } = await supabase
        .from('family_trees')
        .delete()
        .eq('id', familyTree.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Tree Deleted",
        description: "Family tree has been permanently deleted",
      });

      navigate('/family-trees');
    } catch (error) {
      console.error('Error deleting tree:', error);
      toast({
        title: "Error",
        description: "Failed to delete family tree",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const createSharingLink = async () => {
    try {
      const linkToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('sharing_links')
        .insert({
          family_tree_id: familyTree!.id,
          link_token: linkToken,
          access_level: 'view',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          max_uses: 10,
          current_uses: 0,
          is_active: true,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Sharing Link Created",
        description: "A new sharing link has been generated",
      });

      await fetchSharingLinks();
    } catch (error) {
      console.error('Error creating sharing link:', error);
      toast({
        title: "Error",
        description: "Failed to create sharing link",
        variant: "destructive",
      });
    }
  };

  const deactivateSharingLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('sharing_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Link Deactivated",
        description: "Sharing link has been deactivated",
      });

      await fetchSharingLinks();
    } catch (error) {
      console.error('Error deactivating link:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate sharing link",
        variant: "destructive",
      });
    }
  };

  const copySharingLink = (linkToken: string) => {
    const link = `${window.location.origin}/shared/tree/${linkToken}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Sharing link has been copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Family Tree Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The family tree you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/family-trees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Family Trees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/family-trees/${familyTree.id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tree
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Family Tree Settings</h1>
            <p className="text-muted-foreground">
              Manage settings for "{familyTree.name}"
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the name, description, and visibility of your family tree
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tree-name">Tree Name</Label>
                  <Input
                    id="tree-name"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    placeholder="Enter tree name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private
                        </div>
                      </SelectItem>
                      <SelectItem value="shared">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Shared
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={treeDescription}
                  onChange={(e) => setTreeDescription(e.target.value)}
                  placeholder="Describe your family tree"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Display Settings
              </CardTitle>
              <CardDescription>
                Customize how your family tree is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => setSettings({ ...settings, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="layout">Default Layout</Label>
                  <Select value={settings.layout} onValueChange={(value: any) => setSettings({ ...settings, layout: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="force">Force Directed</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="dagre">Hierarchical</SelectItem>
      
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sharing Settings */}
        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Sharing Links
              </CardTitle>
              <CardDescription>
                Create and manage sharing links for your family tree
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Active Sharing Links</h3>
                  <p className="text-sm text-muted-foreground">
                    {sharingLinks.filter(link => link.is_active).length} active links
                  </p>
                </div>
                <Button onClick={createSharingLink} size="sm">
                  <Link className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </div>

              <div className="space-y-3">
                {sharingLinks.filter(link => link.is_active).map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={link.access_level === 'admin' ? 'default' : 'secondary'}>
                          {link.access_level}
                        </Badge>
                        <span className="text-sm font-mono">
                          {link.link_token.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {new Date(link.created_at).toLocaleDateString()}
                        {link.expires_at && ` • Expires ${new Date(link.expires_at).toLocaleDateString()}`}
                        {link.max_uses && ` • ${link.current_uses}/${link.max_uses} uses`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copySharingLink(link.link_token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateSharingLink(link.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {sharingLinks.filter(link => link.is_active).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active sharing links</p>
                    <p className="text-sm">Create a sharing link to allow others to view your family tree</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control who can view and edit your family tree
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Let members add comments to the family tree
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_comments}
                    onCheckedChange={(checked) => setSettings({ ...settings, allow_comments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow Edits</Label>
                    <p className="text-sm text-muted-foreground">
                      Let members edit the family tree structure
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_edits}
                    onCheckedChange={(checked) => setSettings({ ...settings, allow_edits: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Require approval for new members and changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_approval}
                    onCheckedChange={(checked) => setSettings({ ...settings, require_approval: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="privacy-level">Privacy Level</Label>
                <Select value={settings.privacy_level} onValueChange={(value: any) => setSettings({ ...settings, privacy_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict - Only you can see details</SelectItem>
                    <SelectItem value="moderate">Moderate - Members can see basic info</SelectItem>
                    <SelectItem value="open">Open - Anyone can see details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New Members</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when someone joins the tree
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.new_members}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_preferences: {
                        ...settings.notification_preferences,
                        new_members: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Tree Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when the tree structure changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.updates}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_preferences: {
                        ...settings.notification_preferences,
                        updates: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when someone comments
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.comments}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_preferences: {
                        ...settings.notification_preferences,
                        comments: checked
                      }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Shares</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when someone shares the tree
                    </p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.shares}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notification_preferences: {
                        ...settings.notification_preferences,
                        shares: checked
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tree Members
              </CardTitle>
              <CardDescription>
                Manage who has access to your family tree
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {member.user.full_name || member.user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {members.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No members yet</p>
                    <p className="text-sm">You're the only one with access to this tree</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Export
              </CardTitle>
              <CardDescription>
                Manage data backup and export options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your family tree data
                  </p>
                </div>
                <Switch
                  checked={settings.auto_backup}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_backup: checked })}
                />
              </div>

              {settings.auto_backup && (
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={settings.backup_frequency} onValueChange={(value: any) => setSettings({ ...settings, backup_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Tree
                </Button>
                <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Tree
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Maintenance
              </CardTitle>
              <CardDescription>
                Advanced maintenance and optimization options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rebuild Indexes
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Old Data
                </Button>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Delete Family Tree</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this family tree and all its data. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Tree
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportImportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        mode="export"
        familyTreeId={familyTree.id}
        familyTreeName={familyTree.name}
      />

      {/* Import Dialog */}
      <ExportImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        mode="import"
        familyTreeId={familyTree.id}
        familyTreeName={familyTree.name}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Family Tree
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{familyTree.name}"? This action cannot be undone and will remove all data including:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{familyTree._count?.persons || 0} people</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Link className="w-4 h-4" />
              <span>{familyTree._count?.connections || 0} connections</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4" />
              <span>{sharingLinks.length} sharing links</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{members.length} members</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTree} disabled={saving}>
              {saving ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 