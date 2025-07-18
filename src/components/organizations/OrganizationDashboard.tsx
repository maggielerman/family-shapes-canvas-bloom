import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  TreePine,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Globe
} from "lucide-react";
import CreateOrganizationDialog from "./CreateOrganizationDialog";
import { OrganizationInviteDialog } from "./OrganizationInviteDialog";
import { OrganizationMembers } from "./OrganizationMembers";
import { OrganizationStats } from "./OrganizationStats";
import { OrganizationGroups } from "./OrganizationGroups";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string;
  visibility: string;
  slug: string;
  subdomain: string;
  owner_id: string;
  created_at: string;
  plan: string;
}

interface OrganizationMembership {
  id: string;
  role: string;
  joined_at: string;
  user_id: string;
}

export function OrganizationDashboard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    fetchOrganizationData();
  }, [id, user]);

  const fetchOrganizationData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Fetch user's membership in this organization
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('organization_id', id)
        .eq('user_id', user.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine if user is owner
        console.error('Membership error:', membershipError);
      } else if (membershipData) {
        setMembership(membershipData);
      }

    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: "Error",
        description: "Failed to load organization details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isOwner = organization?.owner_id === user?.id;
  const isAdmin = membership?.role === 'admin' || isOwner;
  const canManage = isAdmin;

  const formatOrganizationType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Organization Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The organization you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/organizations">
            <Button>Back to Organizations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{formatOrganizationType(organization.type)}</Badge>
              <Badge variant={organization.visibility === 'public' ? 'default' : 'outline'}>
                {organization.visibility}
              </Badge>
              {isOwner && (
                <Badge variant="destructive">Owner</Badge>
              )}
              {membership && !isOwner && (
                <Badge variant="secondary">{membership.role}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite Members
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Organization Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{organization.description || 'No description provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3" />
                {formatDate(organization.created_at)}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Subdomain</h4>
              <div className="flex items-center gap-1 text-sm">
                <Globe className="h-3 w-3" />
                {organization.subdomain}.familyshapes.com
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Plan</h4>
              <Badge variant="outline" className="text-xs">
                {organization.plan || 'Free'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="trees">Family Trees</TabsTrigger>
          {canManage && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <OrganizationStats organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembers 
            organizationId={organization.id} 
            canManage={canManage}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="groups">
          <OrganizationGroups 
            organizationId={organization.id} 
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="trees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Family Trees
              </CardTitle>
              <CardDescription>
                Family trees associated with this organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TreePine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Family trees functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canManage && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Organization usage and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Dialog */}
      <OrganizationInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organizationId={organization.id}
        organizationName={organization.name}
      />
    </div>
  );
}

export default OrganizationDashboard;