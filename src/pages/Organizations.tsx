import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import CreateOrganizationDialog from "@/components/organizations/CreateOrganizationDialog";
import { useToast } from "@/hooks/use-toast";

import {
  Building2,
  Users,
  Settings,
  Crown,
  MoreHorizontal,
  UserPlus,
  Eye,
  Home
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  subdomain: string;
  visibility: string;
  plan: string;
  role: string;
  member_count?: number;
}

const Organizations = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const [ownedOrgsData, membershipOrgsData] = await Promise.all([
        // Organizations owned by user
        supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user!.id),
        
        // Organizations where user is a member
        supabase
          .from('organization_memberships')
          .select(`
            role,
            organizations (*)
          `)
          .eq('user_id', user!.id)
      ]);

      const ownedOrgs = ownedOrgsData.data?.map(org => ({
        ...org,
        role: 'owner'
      })) || [];

      const memberOrgs = membershipOrgsData.data?.map(item => ({
        ...item.organizations,
        role: item.role
      })) || [];

      // Combine and deduplicate organizations
      const allOrgs = [...ownedOrgs, ...memberOrgs];
      const uniqueOrgs = allOrgs.filter((org, index, self) => 
        index === self.findIndex(o => o.id === org.id)
      );
      
      // Get member counts for each organization
      const orgsWithCounts = await Promise.all(
        uniqueOrgs.map(async (org) => {
          const { count } = await supabase
            .from('organization_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
          
          return {
            ...org,
            member_count: (count || 0) + 1 // +1 for owner
          };
        })
      );
      
      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const getOrgTypeIcon = (type: string) => {
    switch (type) {
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'clinic':
        return '🏥';
      case 'sperm_bank':
        return '🧬';
      case 'support_group':
        return '🤝';
      default:
        return '🏢';
    }
  };

  const getOrgInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your family groups, clinics, and other organizations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard', { state: { viewPersonalDashboard: true } })}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Personal Dashboard
          </Button>
          <CreateOrganizationDialog onOrganizationCreated={fetchOrganizations} />
        </div>
      </div>

      {organizations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first organization to start managing family connections
            </p>
            <CreateOrganizationDialog onOrganizationCreated={fetchOrganizations} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getOrgInitials(org.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">{getOrgTypeIcon(org.type)}</span>
                        <span className="text-sm text-muted-foreground capitalize">
                          {org.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {org.role === 'owner' && (
                        <>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Members
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Organization
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {org.description && (
                    <p className="text-sm text-muted-foreground">
                      {org.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {org.member_count} member{org.member_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={org.role === 'owner' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {org.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                        {org.role}
                      </Badge>
                      <Badge 
                        variant={org.visibility === 'public' ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {org.visibility}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      Open
                    </Button>
                    {org.role === 'owner' && (
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizations;