import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateFamilyTreeDialog } from "@/components/family-trees/CreateFamilyTreeDialog";
import {
  MetricsGrid,
  InsightsGrid,
  PrivacyWidget,
  SharedLinksWidget,
  OrganizationsWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  FamilyTreesWidget
} from "@/components/recipient-dashboard";

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

interface FamilyTree {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  person_count: number;
  connection_count: number;
  last_activity: string | null;
}

interface SharedLink {
  id: string;
  tree_id: string;
  tree_name: string;
  url: string;
  created_at: string;
  expires_at?: string;
  access_count: number;
  is_active: boolean;
}

interface DashboardStats {
  familyTrees: number;
  totalPeople: number;
  totalConnections: number;
  organizations: number;
  recentActivity: number;
  averageTreeSize: number;
  largestTree: number;
  completionRate: number;
  sharedTrees: number;
  publicTrees: number;
}

interface RecentActivity {
  id: string;
  type: 'person_added' | 'connection_created' | 'tree_created' | 'media_uploaded';
  description: string;
  timestamp: string;
  tree_name?: string;
  person_name?: string;
}

export default function RecipientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    familyTrees: 0,
    totalPeople: 0,
    totalConnections: 0,
    organizations: 0,
    recentActivity: 0,
    averageTreeSize: 0,
    largestTree: 0,
    completionRate: 0,
    sharedTrees: 0,
    publicTrees: 0
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
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

      // Fetch family trees with detailed stats
      const { data: treesData, error: treesError } = await supabase
        .from('family_trees')
        .select(`
          *,
          family_tree_members(count)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (treesError) throw treesError;

      // Calculate detailed tree statistics
      const treesWithStats = await Promise.all((treesData || []).map(async (tree: any) => {
        // Get person IDs who are members of this tree
        const { data: membersData } = await supabase
          .from('family_tree_members')
          .select('person_id')
          .eq('family_tree_id', tree.id);

        const personIds = (membersData || []).map(m => m.person_id);
        
        let connectionCount = 0;
        if (personIds.length > 0) {
          // Count connections between people who are members of this tree
          const { count } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .in('from_person_id', personIds)
            .in('to_person_id', personIds);
          
          connectionCount = count || 0;
        }

        return {
          ...tree,
          person_count: tree.family_tree_members?.[0]?.count || 0,
          connection_count: connectionCount,
          last_activity: tree.updated_at
        };
      }));

      setFamilyTrees(treesWithStats);

      // Generate mock shared links (replace with real data later)
      const mockSharedLinks: SharedLink[] = treesWithStats
        .filter(tree => tree.visibility !== 'private')
        .map((tree, index) => ({
          id: `link-${tree.id}`,
          tree_id: tree.id,
          tree_name: tree.name,
          url: `${window.location.origin}/shared/tree/${tree.id}`,
          created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
          access_count: Math.floor(Math.random() * 50) + 1,
          is_active: true
        }));
      setSharedLinks(mockSharedLinks);

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

      // Calculate comprehensive statistics
      const totalPeople = treesWithStats.reduce((sum, tree) => sum + tree.person_count, 0);
      const totalConnections = treesWithStats.reduce((sum, tree) => sum + tree.connection_count, 0);
      const averageTreeSize = treesWithStats.length > 0 ? totalPeople / treesWithStats.length : 0;
      const largestTree = treesWithStats.length > 0 ? Math.max(...treesWithStats.map(t => t.person_count)) : 0;
      const sharedTrees = treesWithStats.filter(t => t.visibility === 'shared').length;
      const publicTrees = treesWithStats.filter(t => t.visibility === 'public').length;
      
      // Calculate completion rate (people with photos, contact info, etc.)
      const { data: peopleData } = await supabase
        .from('persons')
        .select('profile_photo_url, email, phone, address')
        .eq('user_id', user.id);

      const peopleWithPhotos = peopleData?.filter(p => p.profile_photo_url)?.length || 0;
      const peopleWithContact = peopleData?.filter(p => p.email || p.phone || p.address)?.length || 0;
      const totalPeopleForCompletion = peopleData?.length || 0;
      
      const completionRate = totalPeopleForCompletion > 0 
        ? Math.round(((peopleWithPhotos + peopleWithContact) / (totalPeopleForCompletion * 2)) * 100)
        : 0;

      setStats({
        familyTrees: treesWithStats.length,
        totalPeople,
        totalConnections,
        organizations: (ownedOrgs?.length || 0) + (memberOrgs?.length || 0),
        recentActivity: 0, // TODO: Implement recent activity tracking
        averageTreeSize: Math.round(averageTreeSize * 10) / 10,
        largestTree,
        completionRate,
        sharedTrees,
        publicTrees
      });

      // Generate mock recent activity (replace with real data later)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'person_added',
          description: 'Added Sarah Johnson to Smith Family Tree',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          tree_name: 'Smith Family Tree',
          person_name: 'Sarah Johnson'
        },
        {
          id: '2',
          type: 'connection_created',
          description: 'Connected John Smith and Mary Smith as spouses',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          tree_name: 'Smith Family Tree'
        },
        {
          id: '3',
          type: 'tree_created',
          description: 'Created new family tree: Johnson Family',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          tree_name: 'Johnson Family'
        }
      ];
      setRecentActivity(mockActivity);

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

  const handleCreateTree = () => {
    setCreateTreeOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's what's happening with your family trees.
          </p>
        </div>
       
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="mb-4">
        <MetricsGrid stats={stats} loading={loading} />
      </div>

      {/* Additional Insights */}
      <div className="mb-4">
        <InsightsGrid stats={stats} />
      </div>

      {/* Privacy & Shared Links Widget */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 mb-4">
        <PrivacyWidget familyTrees={familyTrees} />
        <SharedLinksWidget sharedLinks={sharedLinks} familyTrees={familyTrees} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="trees">Family Trees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <OrganizationsWidget 
              organizations={organizations} 
              onOrganizationCreated={fetchUserData} 
            />
            <QuickActionsWidget onCreateTree={handleCreateTree} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <RecentActivityWidget recentActivity={recentActivity} />
        </TabsContent>

        <TabsContent value="trees" className="space-y-4">
          <FamilyTreesWidget 
            familyTrees={familyTrees} 
            onCreateTree={handleCreateTree} 
          />
        </TabsContent>
      </Tabs>

      <CreateFamilyTreeDialog 
        open={createTreeOpen}
        onOpenChange={setCreateTreeOpen}
        onSubmit={async (data) => {
          try {
            // Create the family tree
            const { error } = await supabase
              .from('family_trees')
              .insert({
                name: data.name,
                description: data.description,
                visibility: data.visibility,
                user_id: user?.id
              });

            if (error) throw error;

            setCreateTreeOpen(false);
            fetchUserData();
            
            toast({
              title: "Family tree created",
              description: `${data.name} has been created successfully.`,
            });
          } catch (error) {
            console.error('Error creating family tree:', error);
            toast({
              title: "Error creating family tree",
              description: "Failed to create family tree. Please try again.",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
}