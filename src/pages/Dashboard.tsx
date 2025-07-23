import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import CreateOrganizationDialog from "@/components/organizations/CreateOrganizationDialog";
import { useToast } from "@/hooks/use-toast";

import { 
  Heart, 
  Users, 
  Building2, 
  UserPlus, 
  Home,
  Share2,
  TreePine,
  User,
  Settings,
  ArrowRight
} from "lucide-react";

// Fixed: Removed non-existent 'Family' icon import
interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  account_type: string;
  organization_id: string | null;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  role: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const checkOrganizationSetup = useCallback(async (organizationId: string) => {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('type, description')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      // If organization type is still the default 'fertility_clinic' and has default description,
      // redirect to onboarding
      if (org.type === 'fertility_clinic' && 
          org.description === 'Organization created during signup') {
        navigate(`/organizations/${organizationId}/onboarding`);
      } else {
        navigate(`/organizations/${organizationId}`);
      }
    } catch (error) {
      console.error('Error checking organization setup:', error);
      // Fallback to organization dashboard
      navigate(`/organizations/${organizationId}`);
    }
  }, [navigate]);

  // Redirect organization accounts to their organization dashboard or onboarding
  useEffect(() => {
    if (profile && profile.account_type === 'organization') {
      if (profile.organization_id) {
        // Check if organization setup is complete by looking at the type
        checkOrganizationSetup(profile.organization_id);
      } else {
        // Handle organization accounts with null organization_id
        // This could happen if the organization was deleted or there's a data inconsistency
        toast({
          title: "Organization Access Issue",
          description: "Your organization account is not properly linked. Please contact support.",
          variant: "destructive",
        });
      }
    }
  }, [profile, checkOrganizationSetup]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setIsLoadingData(true);

      // Fetch user profile with account type and organization info
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url, bio, account_type, organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: "Error loading profile",
          description: "There was an issue loading your profile data.",
          variant: "destructive",
        });
      } else {
        setProfile(profileData);
      }

      // Only fetch organizations for individual accounts
      if (profileData?.account_type === 'individual') {
        await fetchOrganizations();
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchOrganizations = async () => {
    if (!user) return;

    try {
      // Fetch user organizations (both owned and memberships)
      const [ownedOrgsData, membershipOrgsData] = await Promise.all([
        // Organizations owned by user
        supabase
          .from('organizations')
          .select('id, name, type, description')
          .eq('owner_id', user!.id),
        
        // Organizations where user is a member
        supabase
          .from('organization_memberships')
          .select(`
            role,
            organizations (
              id,
              name,
              type,
              description
            )
          `)
          .eq('user_id', user!.id)
      ]);

      const ownedOrgs = ownedOrgsData.data?.map(org => ({
        ...org,
        role: 'owner'
      })) || [];

      const memberOrgs = membershipOrgsData.data?.map(item => ({
        id: item.organizations.id,
        name: item.organizations.name,
        type: item.organizations.type,
        description: item.organizations.description,
        role: item.role
      })) || [];

      // Combine and deduplicate organizations
      const allOrgs = [...ownedOrgs, ...memberOrgs];
      const uniqueOrgs = allOrgs.filter((org, index, self) => 
        index === self.findIndex(o => o.id === org.id)
      );
      
      setOrganizations(uniqueOrgs);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-light">Welcome back, {displayName}!</h2>
            <p className="text-muted-foreground mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/family-trees')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TreePine className="w-5 h-5 text-sage-600" />
              Family Trees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Create and manage family trees
            </p>
            <Button size="sm" className="w-full">
              View Trees
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/people')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-coral-600" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage family members and contacts
            </p>
            <Button size="sm" variant="outline" className="w-full">
              View People
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/organizations')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-dusty-600" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage organizations and groups
            </p>
            <Button size="sm" variant="outline" className="w-full">
              View All
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-navy-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage your account settings
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizations
            </CardTitle>
            <CardDescription>
              Organizations you belong to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length > 0 ? (
              <div className="space-y-4">
                 {organizations.map((org) => (
                   <div 
                     key={org.id} 
                     className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                     onClick={() => navigate(`/organizations/${org.id}`)}
                   >
                     <div>
                       <h4 className="font-medium">{org.name}</h4>
                       <p className="text-sm text-muted-foreground capitalize">
                         {org.type} • {org.description || 'No description'}
                       </p>
                     </div>
                     <Badge variant="secondary" className="capitalize">
                       {org.role}
                     </Badge>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You're not part of any organizations yet
                </p>
                <CreateOrganizationDialog onOrganizationCreated={fetchUserData} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Recent updates and connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No recent activity to show
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;