import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Settings, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Globe 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import SidebarLayout from "@/components/layouts/SidebarLayout";

interface Organization {
  id: string;
  name: string;
  description: string | null;
  type: string;
  visibility: string;
  owner_id: string;
}

interface OrganizationMember {
  user_id: string;
  role: string;
  full_name: string;
  email: string;
}

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchOrganizationDetails();
  }, [user, id]);

  const fetchOrganizationDetails = async () => {
    if (!id) return;

    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (orgError) throw orgError;

      setOrganization(orgData);
      setIsOwner(orgData.owner_id === user?.id);

      // Fetch organization members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('organization_memberships')
        .select(`
          user_id,
          role
        `)
        .eq('organization_id', id);

      if (membersError) throw membersError;

      // Fetch user profiles separately
      const memberIds = membersData?.map(m => m.user_id) || [];
      let profilesData = [];
      
      if (memberIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', memberIds);
        
        profilesData = profiles || [];
      }

      const formattedMembers = membersData?.map(member => {
        const profile = profilesData.find(p => p.id === member.user_id);
        return {
          user_id: member.user_id,
          role: member.role,
          full_name: profile?.full_name || 'Unknown User',
          email: 'Email not available' // We don't have email in user_profiles
        };
      }) || [];

      setMembers(formattedMembers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load organization details',
        variant: 'destructive'
      });
    }
  };

  const inviteMember = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: id,
          inviter_id: user?.id,
          invitee_email: inviteEmail,
          role: 'viewer'
        });

      if (error) throw error;

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteEmail}`
      });

      setInviteEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    }
  };

  const toggleVisibility = async () => {
    if (!id || !organization) return;

    const newVisibility = organization.visibility === 'public' ? 'private' : 'public';

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ visibility: newVisibility })
        .eq('id', id);

      if (error) throw error;

      setOrganization(prev => prev ? { ...prev, visibility: newVisibility } : null);

      toast({
        title: 'Visibility Updated',
        description: `Organization is now ${newVisibility}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive'
      });
    }
  };

  if (!organization) return <div>Loading...</div>;

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Building2 className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <p className="text-muted-foreground">{organization.description}</p>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={toggleVisibility}
                className="flex items-center"
              >
                {organization.visibility === 'public' ? (
                  <>
                    <Globe className="mr-2 w-4 h-4" /> Make Private
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 w-4 h-4" /> Make Public
                  </>
                )}
              </Button>
              <Button variant="secondary">
                <Settings className="mr-2 w-4 h-4" /> Settings
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Members Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 w-5 h-5" /> Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map(member => (
                  <div 
                    key={member.user_id} 
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span>{member.full_name}</span>
                      <Badge variant="secondary" className="ml-2">{member.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {isOwner && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-4">
                      <UserPlus className="mr-2 w-4 h-4" /> Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input 
                        placeholder="Enter email address" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                      <Button 
                        onClick={inviteMember}
                        disabled={!inviteEmail}
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="mr-2 w-5 h-5" /> Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pending invitations logic will be added later */}
              <p className="text-muted-foreground">No pending invitations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default OrganizationDetails;