import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Calendar,
  Eye,
  Settings,
  Loader2,
  UserPlus,
  Search
} from "lucide-react";

interface Group {
  id: string;
  label: string;
  type: string;
  description: string;
  visibility: string;
  created_at: string;
  owner_id: string;
  organization_id?: string;
  _count?: {
    members: number;
  };
  role?: string;
}

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [formData, setFormData] = useState({
    label: "",
    type: "family",
    description: "",
    visibility: "private"
  });

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch groups where user is owner
      const { data: ownedGroups, error: ownedError } = await supabase
        .from('groups')
        .select(`
          id,
          label,
          type,
          description,
          visibility,
          created_at,
          owner_id,
          organization_id
        `)
        .eq('owner_id', user.id)
        .is('organization_id', null); // Only personal groups, not organization groups

      if (ownedError) throw ownedError;

      // Fetch groups where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_memberships')
        .select(`
          group_id,
          role,
          groups (
            id,
            label,
            type,
            description,
            visibility,
            created_at,
            owner_id,
            organization_id
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      // Combine owned and member groups
      const allGroups = [
        ...(ownedGroups || []).map(g => ({ ...g, role: 'owner' })),
        ...(membershipData || [])
          .filter(m => m.groups && !m.groups.organization_id) // Filter out organization groups
          .map(m => ({ ...m.groups, role: m.role }))
      ];

      // Remove duplicates (in case user is both owner and member)
      const uniqueGroups = allGroups.filter((group, index, self) =>
        index === self.findIndex((g) => g.id === group.id)
      );

      // Fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        uniqueGroups.map(async (group) => {
          const { count } = await supabase
            .from('group_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            _count: { members: count || 0 }
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);

    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          label: formData.label,
          type: formData.type,
          description: formData.description,
          visibility: formData.visibility,
          owner_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add the creator as a member with owner role
      const { error: membershipError } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'owner'
        });

      if (membershipError) throw membershipError;

      toast({
        title: "Group Created",
        description: `${formData.label} has been created successfully`
      });

      setFormData({
        label: "",
        type: "family",
        description: "",
        visibility: "private"
      });
      setCreateDialogOpen(false);
      fetchGroups();

    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode) return;

    setIsJoining(true);

    try {
      // TODO: Implement group join functionality with invitation codes
      // For now, we'll show a placeholder message
      toast({
        title: "Coming Soon",
        description: "Group join functionality will be available soon!",
      });
      
      setJoinCode("");
      setJoinDialogOpen(false);

    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatGroupType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'family':
        return 'default' as const;
      case 'donor_siblings':
        return 'secondary' as const;
      case 'support':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'admin':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Connect and collaborate with family groups and communities
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Group</DialogTitle>
                <DialogDescription>
                  Enter the invitation code to join an existing group
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Invitation Code</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter invitation code"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setJoinDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isJoining || !joinCode}>
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Group
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to connect with family members and build your community
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Group Name</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Johnson Family, Donor #123 Siblings"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Group Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="donor_siblings">Donor Siblings</SelectItem>
                      <SelectItem value="support">Support Group</SelectItem>
                      <SelectItem value="research">Research Group</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the purpose and goals of this group..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private - Invite only</SelectItem>
                      <SelectItem value="public">Public - Anyone can find and join</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Groups ({groups.length})
              </CardTitle>
              <CardDescription>
                Groups you own or are a member of
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You're not a member of any groups yet</p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join a Group
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Group
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <Link to={`/groups/${group.id}`} className="font-medium hover:underline">
                          {group.label}
                        </Link>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {group.description.length > 60 
                              ? `${group.description.substring(0, 60)}...` 
                              : group.description
                            }
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(group.type)}>
                        {formatGroupType(group.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group._count?.members || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(group.role)}>
                        {group.role || 'Member'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.visibility === 'public' ? 'default' : 'outline'}>
                        {group.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(group.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link to={`/groups/${group.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(group.role === 'owner' || group.role === 'admin') && (
                          <Link to={`/groups/${group.id}/settings`}>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}