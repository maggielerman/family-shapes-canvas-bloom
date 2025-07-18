import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Share2, 
  Copy, 
  Globe, 
  Lock, 
  Users, 
  Calendar,
  Link,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Info,
  Check,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FamilyTree {
  id: string;
  name: string;
  description?: string | null;
  visibility: string;
  user_id: string;
}

interface SharingLink {
  id: string;
  link_token: string;
  access_level: string;
  max_uses?: number | null;
  current_uses: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}

interface SharingSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyTree: FamilyTree;
  onTreeUpdated: () => void;
}

export function SharingSettingsDialog({
  open,
  onOpenChange,
  familyTree,
  onTreeUpdated
}: SharingSettingsDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sharingLinks, setSharingLinks] = useState<SharingLink[]>([]);
  const [newLinkSettings, setNewLinkSettings] = useState({
    access_level: 'view',
    max_uses: '',
    expires_in_days: '30',
    emails: '',
    message: ''
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSharingLinks();
    }
  }, [open, familyTree.id]);

  const fetchSharingLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('sharing_links')
        .select('*')
        .eq('family_tree_id', familyTree.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharingLinks(data || []);
    } catch (error) {
      console.error('Error fetching sharing links:', error);
      toast({
        title: "Error",
        description: "Failed to load sharing links",
        variant: "destructive",
      });
    }
  };

  const updateTreeVisibility = async (visibility: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('family_trees')
        .update({ visibility })
        .eq('id', familyTree.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Tree visibility updated to ${visibility}`,
      });

      onTreeUpdated();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update tree visibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSharingLink = async () => {
    try {
      setLoading(true);
      
      const expiresAt = newLinkSettings.expires_in_days && newLinkSettings.expires_in_days !== 'never' 
        ? new Date(Date.now() + parseInt(newLinkSettings.expires_in_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('sharing_links')
        .insert({
          family_tree_id: familyTree.id,
          created_by: familyTree.user_id,
          access_level: newLinkSettings.access_level,
          max_uses: newLinkSettings.max_uses ? parseInt(newLinkSettings.max_uses) : null,
          expires_at: expiresAt,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // If emails are provided, send the sharing link
      if (newLinkSettings.emails.trim()) {
        const emails = newLinkSettings.emails
          .split(',')
          .map(email => email.trim())
          .filter(email => email);

        if (emails.length > 0) {
          await sendSharingLink(data.id, emails, newLinkSettings.message);
        }
      }

      toast({
        title: "Success",
        description: newLinkSettings.emails 
          ? "Sharing link created and invitations sent successfully"
          : "Sharing link created successfully",
      });

      fetchSharingLinks();
      setNewLinkSettings({
        access_level: 'view',
        max_uses: '',
        expires_in_days: '30',
        emails: '',
        message: ''
      });
    } catch (error) {
      console.error('Error creating sharing link:', error);
      toast({
        title: "Error",
        description: "Failed to create sharing link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSharingLink = async (linkId: string, emails: string[], message?: string) => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', familyTree.user_id)
        .single();

      const { data: result, error } = await supabase.functions.invoke('send-sharing-link', {
        body: {
          linkId,
          emails,
          message,
          senderName: userProfile?.full_name
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send invitations');
      }
      
      if (result?.failed > 0) {
        toast({
          title: "Partially Sent",
          description: `${result.sent} invitations sent, ${result.failed} failed`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error sending sharing link:', error);
      toast({
        title: "Warning",
        description: "Link created but failed to send some invitations",
        variant: "default",
      });
    }
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sharing_links')
        .update({ is_active: isActive })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Link ${isActive ? 'activated' : 'deactivated'}`,
      });

      fetchSharingLinks();
    } catch (error) {
      console.error('Error updating link status:', error);
      toast({
        title: "Error",
        description: "Failed to update link status",
        variant: "destructive",
      });
    }
  };

  const deleteSharingLink = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to delete this sharing link?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sharing_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sharing link deleted",
      });

      fetchSharingLinks();
    } catch (error) {
      console.error('Error deleting sharing link:', error);
      toast({
        title: "Error",
        description: "Failed to delete sharing link",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (linkToken: string) => {
    const url = `${window.location.origin}/shared/tree/${familyTree.id}?token=${linkToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(linkToken);
      toast({
        title: "Copied!",
        description: "Sharing link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const getPublicUrl = () => {
    return `${window.location.origin}/public/tree/${familyTree.id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isLinkExpired = (expiresAt: string | null) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  const isLinkUsedUp = (link: SharingLink) => {
    return link.max_uses && link.current_uses >= link.max_uses;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Sharing Settings - {familyTree.name}
          </DialogTitle>
          <DialogDescription>
            Manage who can access your family tree and how they can interact with it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                General Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Public Access</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow anyone to view this family tree without authentication
                  </p>
                </div>
                <Switch
                  checked={familyTree.visibility === 'public'}
                  onCheckedChange={(checked) => 
                    updateTreeVisibility(checked ? 'public' : 'private')
                  }
                  disabled={loading}
                />
              </div>

              {familyTree.visibility === 'public' && (
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Your family tree is publicly visible. Anyone with the link can view it.
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        value={getPublicUrl()}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getPublicUrl(), '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Private Sharing Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link className="w-4 h-4" />
                Private Sharing Links
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create secure links to share your family tree with specific people, even if it's private.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Link */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Access Level</Label>
                        <Select
                          value={newLinkSettings.access_level}
                          onValueChange={(value) => 
                            setNewLinkSettings(prev => ({ ...prev, access_level: value }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="comment">View & Comment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Max Uses (optional)</Label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          value={newLinkSettings.max_uses}
                          onChange={(e) => 
                            setNewLinkSettings(prev => ({ ...prev, max_uses: e.target.value }))
                          }
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Expires In (days)</Label>
                        <Select
                          value={newLinkSettings.expires_in_days}
                          onValueChange={(value) => 
                            setNewLinkSettings(prev => ({ ...prev, expires_in_days: value }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="7">1 week</SelectItem>
                            <SelectItem value="30">1 month</SelectItem>
                            <SelectItem value="90">3 months</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Email Addresses (comma separated)</Label>
                      <Input
                        placeholder="user1@example.com, user2@example.com"
                        value={newLinkSettings.emails}
                        onChange={(e) => 
                          setNewLinkSettings(prev => ({ ...prev, emails: e.target.value }))
                        }
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Personal Message (optional)</Label>
                      <Textarea
                        placeholder="Add a personal message to include with the invitation..."
                        value={newLinkSettings.message}
                        onChange={(e) => 
                          setNewLinkSettings(prev => ({ ...prev, message: e.target.value }))
                        }
                        className="h-16 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={createSharingLink}
                        disabled={loading}
                        size="sm"
                        className="h-8"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {newLinkSettings.emails ? 'Create & Send Link' : 'Create Link'}
                      </Button>
                      {newLinkSettings.emails && (
                        <Button
                          variant="outline"
                          onClick={() => setNewLinkSettings(prev => ({ ...prev, emails: '', message: '' }))}
                          size="sm"
                          className="h-8"
                        >
                          Clear Emails
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Links */}
              <div className="space-y-3">
                {sharingLinks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sharing links created yet</p>
                  </div>
                ) : (
                  sharingLinks.map((link) => (
                    <Card key={link.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={link.is_active ? "default" : "secondary"}>
                                {link.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                {link.access_level}
                              </Badge>
                              {isLinkExpired(link.expires_at) && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                              {isLinkUsedUp(link) && (
                                <Badge variant="destructive">Used Up</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Created {formatDate(link.created_at)}</span>
                              {link.expires_at && (
                                <>
                                  <span>•</span>
                                  <span>Expires {formatDate(link.expires_at)}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>
                                Used {link.current_uses}
                                {link.max_uses ? ` / ${link.max_uses}` : ''} times
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Input
                                value={`${window.location.origin}/shared/tree/${familyTree.id}?token=${link.link_token}`}
                                readOnly
                                className="text-xs font-mono"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(link.link_token)}
                                disabled={!link.is_active || isLinkExpired(link.expires_at) || isLinkUsedUp(link)}
                              >
                                {copiedLink === link.link_token ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleLinkStatus(link.id, !link.is_active)}
                            >
                              {link.is_active ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSharingLink(link.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Note:</strong> Public trees and shared links show limited personal information. 
              Email addresses and phone numbers are never displayed to public viewers.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
