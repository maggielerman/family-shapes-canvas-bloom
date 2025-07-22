import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Mail } from "lucide-react";

interface PendingInvitation {
  id: string;
  invitee_email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface OrganizationInvitationsProps {
  organizationId: string;
  canManage: boolean;
}

export function OrganizationInvitations({ organizationId, canManage }: OrganizationInvitationsProps) {
  const { toast } = useToast();
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingInvitations();
  }, [organizationId]);

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
      toast({ title: 'Error', description: 'Failed to load invitations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
      toast({ title: 'Invitation Cancelled', description: 'The invitation has been cancelled' });
      fetchPendingInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({ title: 'Error', description: 'Failed to cancel invitation', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations ({pendingInvitations.length})
        </CardTitle>
        <CardDescription>Invitations that haven't been accepted yet</CardDescription>
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
                {canManage && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{invitation.invitee_email}</TableCell>
                  <TableCell><Badge variant="outline">{invitation.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(invitation.created_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(invitation.expires_at)}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => cancelInvitation(invitation.id)}>
                        Cancel
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 