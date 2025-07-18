import { useState, useEffect } from "react";
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
  Users,
  Calendar,
  Eye,
  Settings,
  Loader2
} from "lucide-react";

interface Group {
  id: string;
  label: string;
  type: string;
  description: string;
  visibility: string;
  created_at: string;
  _count?: {
    members: number;
  };
}

interface OrganizationGroupsProps {
  organizationId: string;
  canManage: boolean;
}

export function OrganizationGroups({ organizationId, canManage }: OrganizationGroupsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    type: "family",
    description: "",
    visibility: "private"
  });

  useEffect(() => {
    fetchGroups();
  }, [organizationId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          label,
          type,
          description,
          visibility,
          created_at
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        (data || []).map(async (group) => {
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
      const { data, error } = await supabase
        .from('groups')
        .insert({
          label: formData.label,
          type: formData.type,
          description: formData.description,
          visibility: formData.visibility,
          organization_id: organizationId,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

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
      case 'sibling_group':
        return 'secondary' as const;
      case 'clinic_cohort':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groups ({groups.length})
              </CardTitle>
              <CardDescription>
                Family groups, sibling groups, and other organizational units
              </CardDescription>
            </div>
            {canManage && (
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
                      Create a new group to organize family members and relationships
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
                          <SelectItem value="sibling_group">Sibling Group</SelectItem>
                          <SelectItem value="clinic_cohort">Clinic Cohort</SelectItem>
                          <SelectItem value="regional_group">Regional Group</SelectItem>
                          <SelectItem value="donor_group">Donor Group</SelectItem>
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
                        placeholder="Describe the purpose and scope of this group..."
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
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <UserGroup className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No groups created yet</p>
              {canManage && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Group
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Created</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{group.label}</p>
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
                    {canManage && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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