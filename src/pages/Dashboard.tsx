import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, TreePine, Users, Building2, BarChart3, Home, Share2, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CreateFamilyTreeDialog } from "@/components/family-trees/CreateFamilyTreeDialog";
import CreateOrganizationDialog from "@/components/organizations/CreateOrganizationDialog";

// Enhanced interfaces for better type safety
interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  role: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    familyTrees: 0,
    totalPeople: 0,
    organizations: 0,
    recentActivity: 0
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTreeOpen, setCreateTreeOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData && profileData.length > 0) {
        setProfile(profileData[0]);
      }

      // Fetch family trees count
      const { count: treesCount } = await supabase
        .from('family_trees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch owned organizations
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from('organizations')
        .select('id, name, type, description')
        .eq('owner_id', user.id);

      // Fetch organization memberships
      const { data: memberOrgs, error: memberError } = await supabase
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
        .eq('user_id', user.id);

      if (ownedError || memberError) {
        console.error('Error fetching organizations:', ownedError || memberError);
      } else {
        // Combine owned and member organizations
        const owned = (ownedOrgs || []).map(org => ({ ...org, role: 'owner' }));
        const member = (memberOrgs || [])
          .filter(item => item.organizations)
          .map(item => ({ ...item.organizations, role: item.role }));
        
        setOrganizations([...owned, ...member]);
      }

      setStats({
        familyTrees: treesCount || 0,
        totalPeople: 0, // TODO: Calculate total people across all trees
        organizations: (ownedOrgs?.length || 0) + (memberOrgs?.length || 0),
        recentActivity: 0 // TODO: Calculate recent activity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Welcome back! Here's what's happening with your family trees.</p>
        </div>
      </div>

      {/* Rest of dashboard content */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Trees</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.familyTrees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.familyTrees === 1 ? "family tree" : "family trees"} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalPeople}</div>
            <p className="text-xs text-muted-foreground">
              people in your trees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.organizations}</div>
            <p className="text-xs text-muted-foreground">
              organizations owned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">
              updates this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizations
            </CardTitle>
            <CardDescription>
              Organizations you own or are a member of
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length > 0 ? (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
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
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started with your family tree journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setCreateTreeOpen(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Family Tree
            </Button>
            <Button variant="outline" onClick={() => navigate("/people")} className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Add Family Members
            </Button>
            <Button variant="outline" onClick={() => navigate("/organizations")} className="w-full">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Organizations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest family tree updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateFamilyTreeDialog 
        open={createTreeOpen}
        onOpenChange={setCreateTreeOpen}
        onSuccess={() => {
          setCreateTreeOpen(false);
          fetchUserData();
        }}
      />
    </>
  );
}