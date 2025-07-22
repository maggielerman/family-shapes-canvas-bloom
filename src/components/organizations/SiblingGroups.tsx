import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Users,
  UserPlus,
  MessageCircle,
  Settings,
  Eye,
  MoreHorizontal,
  Crown,
  Bell,
  BellOff,
  Mail,
  Phone,
  Share2,
  Lock,
  Globe,
  Heart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiblingGroup, SiblingGroupMembership } from "@/types/organization";
import { Person } from "@/types/person";
import { Donor } from "@/types/donor";

interface SiblingGroupsProps {
  organizationId: string;
  canManage: boolean;
}

interface SiblingGroupWithData extends SiblingGroup {
  donor?: Donor;
  members?: (SiblingGroupMembership & { person?: Person })[];
  recent_activity?: any[];
}

export function SiblingGroups({ organizationId, canManage }: SiblingGroupsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<SiblingGroupWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SiblingGroupWithData | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchSiblingGroups();
  }, [organizationId]);

  const fetchSiblingGroups = async () => {
    try {
      setLoading(true);

      // Fetch sibling groups for this organization
      const { data: groupsData, error: groupsError } = await supabase
        .from('sibling_groups')
        .select(`
          *,
          donors (*),
          sibling_group_memberships (
            *,
            persons (*)
          )
        `)
        .eq('organization_id', organizationId);

      if (groupsError) throw groupsError;

      // Process the data
      const processedGroups: SiblingGroupWithData[] = (groupsData || []).map(group => ({
        ...group,
        donor: group.donors,
        members: group.sibling_group_memberships?.map((membership: any) => ({
          ...membership,
          person: membership.persons
        })) || [],
        member_count: group.sibling_group_memberships?.length || 0
      }));

      setGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching sibling groups:', error);
      toast({
        title: "Error",
        description: "Failed to load sibling groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSiblingGroup = async (groupData: Partial<SiblingGroup>) => {
    if (!canManage) return;

    try {
      const { error } = await supabase
        .from('sibling_groups')
        .insert({
          ...groupData,
          organization_id: organizationId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sibling group created successfully"
      });

      fetchSiblingGroups();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating sibling group:', error);
      toast({
        title: "Error",
        description: "Failed to create sibling group",
        variant: "destructive"
      });
    }
  };

  const toggleNotifications = async (groupId: string, enabled: boolean) => {
    try {
      // First, get the person_id associated with the current user
      const { data: personData, error: personError } = await supabase
        .from('persons')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_self', true)
        .single();

      if (personError || !personData) {
        throw new Error('Could not find person record for current user');
      }

      // Update user's notification preferences for this group using the correct person_id
      const { error } = await supabase
        .from('sibling_group_memberships')
        .update({
          notification_preferences: {
            new_members: enabled,
            group_updates: enabled,
            direct_messages: enabled
          }
        })
        .eq('sibling_group_id', groupId)
        .eq('person_id', personData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Notifications ${enabled ? 'enabled' : 'disabled'} for this group`
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  };

  const getPrivacyBadge = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Badge variant="outline"><Globe className="w-3 h-3 mr-1" />Public</Badge>;
      case 'members_only':
        return <Badge variant="default"><Users className="w-3 h-3 mr-1" />Members Only</Badge>;
      case 'private':
        return <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Private</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchTerm || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.donor?.donor_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrivacy = filterPrivacy === 'all' || group.privacy_level === filterPrivacy;
    
    return matchesSearch && matchesPrivacy;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Sibling Groups</h2>
          <p className="text-muted-foreground">
            Connect and manage donor sibling communities
          </p>
        </div>
        
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups by name, description, or donor number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterPrivacy} onValueChange={setFilterPrivacy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="members_only">Members Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No sibling groups found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterPrivacy !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first sibling group to connect donor siblings"
              }
            </p>
            {canManage && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      {getPrivacyBadge(group.privacy_level)}
                      {group.auto_add_new_siblings && (
                        <Badge variant="outline" className="text-xs">Auto-Add</Badge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedGroup(group);
                        setShowDetailsDialog(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Group Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleNotifications(group.id, true)}>
                        <Bell className="w-4 h-4 mr-2" />
                        Enable Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleNotifications(group.id, false)}>
                        <BellOff className="w-4 h-4 mr-2" />
                        Disable Notifications
                      </DropdownMenuItem>
                      {canManage && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Group Settings
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {group.donor && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Donor:</span>
                      <Badge variant="outline" className="text-xs">
                        #{group.donor.donor_number || 'Unknown'}
                      </Badge>
                      {group.donor.sperm_bank && (
                        <span className="text-xs text-muted-foreground">
                          {group.donor.sperm_bank}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {group.member_count || 0} member{(group.member_count || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {group.latest_activity && (
                      <span className="text-xs text-muted-foreground">
                        Active recently
                      </span>
                    )}
                  </div>

                  {/* Member Avatars */}
                  {group.members && group.members.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 3).map((member, index) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                            <AvatarImage src={member.person?.profile_photo_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {member.person?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(group.member_count || 0) > 3 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{(group.member_count || 0) - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowDetailsDialog(true);
                      }}
                    >
                      View Group
                    </Button>
                    {group.allow_contact_sharing && (
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <CreateSiblingGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        organizationId={organizationId}
        onGroupCreated={fetchSiblingGroups}
      />

      {/* Group Details Dialog */}
      <SiblingGroupDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        group={selectedGroup}
        canManage={canManage}
        onUpdate={fetchSiblingGroups}
      />
    </div>
  );
}

interface CreateSiblingGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onGroupCreated: () => void;
}

function CreateSiblingGroupDialog({ open, onOpenChange, organizationId, onGroupCreated }: CreateSiblingGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    donor_id: '',
    privacy_level: 'members_only',
    auto_add_new_siblings: true,
    allow_contact_sharing: true,
    allow_photo_sharing: true,
    allow_medical_sharing: false
  });
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDonors();
    }
  }, [open]);

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_donor_database')
        .select(`
          donors (*)
        `)
        .eq('organization_id', organizationId);

      if (error) throw error;
      setDonors(data?.map(item => item.donors).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.donor_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sibling_groups')
        .insert({
          ...formData,
          organization_id: organizationId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sibling group created successfully"
      });

      setFormData({
        name: '',
        description: '',
        donor_id: '',
        privacy_level: 'members_only',
        auto_add_new_siblings: true,
        allow_contact_sharing: true,
        allow_photo_sharing: true,
        allow_medical_sharing: false
      });
      onOpenChange(false);
      onGroupCreated();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create sibling group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Sibling Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Donor 12345 Siblings"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor">Donor</Label>
              <Select 
                value={formData.donor_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, donor_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.donor_number ? `#${donor.donor_number}` : 'Unknown'} 
                      {donor.sperm_bank && ` - ${donor.sperm_bank}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the group..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Privacy Level</Label>
            <Select 
              value={formData.privacy_level} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, privacy_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see</SelectItem>
                <SelectItem value="members_only">Members Only - Only organization members</SelectItem>
                <SelectItem value="private">Private - Invitation only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-add new siblings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically add new siblings when they're discovered
                </p>
              </div>
              <Switch
                checked={formData.auto_add_new_siblings}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_add_new_siblings: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow contact sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Members can share contact information
                </p>
              </div>
              <Switch
                checked={formData.allow_contact_sharing}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_contact_sharing: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow photo sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Members can share photos in the group
                </p>
              </div>
              <Switch
                checked={formData.allow_photo_sharing}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_photo_sharing: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow medical history sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Members can share medical information
                </p>
              </div>
              <Switch
                checked={formData.allow_medical_sharing}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_medical_sharing: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.donor_id}>
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SiblingGroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: SiblingGroupWithData | null;
  canManage: boolean;
  onUpdate: () => void;
}

function SiblingGroupDetailsDialog({ open, onOpenChange, group, canManage, onUpdate }: SiblingGroupDetailsDialogProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{group.name}</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Detailed group view coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SiblingGroups;