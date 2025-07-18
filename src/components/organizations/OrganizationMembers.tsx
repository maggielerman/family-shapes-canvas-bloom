import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MoreHorizontal, 
  Shield, 
  Edit3, 
  Eye, 
  UserMinus,
  Calendar,
  Mail
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by: string;
  user_profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface PendingInvitation {
  id: string;
  invitee_email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface OrganizationMembersProps {
  organizationId: string;
  canManage: boolean;
  currentUserId?: string;
}

export function OrganizationMembers({ organizationId, canManage, currentUserId }: OrganizationMembersProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
    fetchPendingInvitations();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_memberships')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          invited_by,
          user_profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive"
      });
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingInvitations(data || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('organization_memberships')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully"
      });

      fetchMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Member has been removed from the organization"
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled"
      });

      fetchPendingInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit3 className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'editor':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({members.length})
          </CardTitle>
          <CardDescription>
            Current members of this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user_profiles?.avatar_url} />
                          <AvatarFallback>
                            {getInitials(member.user_profiles?.full_name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user_profiles?.full_name || 'Unknown User'}
                          </p>
                          {member.user_id === currentUserId && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(member.joined_at)}
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        {member.user_id !== currentUserId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'viewer')}>
                                Change to Viewer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'editor')}>
                                Change to Editor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'admin')}>
                                Change to Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => removeMember(member.id)}
                                className="text-destructive"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending invitations</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {invitation.invitee_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role)} className="flex items-center gap-1 w-fit">
                          {getRoleIcon(invitation.role)}
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(invitation.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invitation.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}