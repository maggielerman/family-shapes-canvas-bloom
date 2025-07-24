import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TreePine, Users, Building2, BarChart3 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CreateFamilyTreeDialog } from "@/components/family-trees/CreateFamilyTreeDialog";
import CreateOrganizationDialog from "@/components/organizations/CreateOrganizationDialog";
import { DatabaseTest } from "@/components/debug/DatabaseTest";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    familyTrees: 0,
    totalPeople: 0,
    organizations: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [createTreeOpen, setCreateTreeOpen] = useState(false);
  

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    try {
      // Fetch family trees count
      const { count: treesCount } = await supabase
        .from('family_trees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch organizations count (owned)
      const { count: orgsCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      setStats({
        familyTrees: treesCount || 0,
        totalPeople: 0, // TODO: Calculate total people across all trees
        organizations: orgsCount || 0,
        recentActivity: 0 // TODO: Calculate recent activity
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your family trees.</p>
      </div>

      {/* Debug Component - Remove this after debugging */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Mode</h3>
        <p className="text-yellow-700 text-sm mb-4">This debug component will help identify database connection issues. Please run the test and check the console.</p>
        <DatabaseTest />
      </div>

      {/* Rest of dashboard content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
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
                         <CreateOrganizationDialog 
               onOrganizationCreated={() => {
                 fetchDashboardStats();
               }}
             />
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
          fetchDashboardStats();
        }}
      />

    </div>
  );
}