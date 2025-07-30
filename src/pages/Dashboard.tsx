import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  TreePine, 
  Users, 
  Building2, 
  BarChart3, 
  Home, 
  Share2, 
  User, 
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Image,
  TrendingUp,
  Activity,
  Clock,
  Eye,
  Users2,
  Network,
  GitBranch,
  Database,
  Shield,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Link,
  Copy,
  EyeOff,
  Lock,
  Globe,
  Settings,
  ExternalLink,
  QrCode
} from "lucide-react";
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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'person_added': return <User className="w-4 h-4" />;
      case 'connection_created': return <Network className="w-4 h-4" />;
      case 'tree_created': return <TreePine className="w-4 h-4" />;
      case 'media_uploaded': return <Image className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied",
        description: "Shared link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return <Lock className="w-4 h-4" />;
      case 'shared': return <Users2 className="w-4 h-4" />;
      case 'public': return <Globe className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'outline';
      case 'shared': return 'secondary';
      case 'public': return 'default';
      default: return 'outline';
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's what's happening with your family trees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
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
            {stats.familyTrees > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.sharedTrees} shared • {stats.publicTrees} public
              </div>
            )}
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
              people across all trees
            </p>
            {stats.averageTreeSize > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Avg: {stats.averageTreeSize} per tree
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              family relationships mapped
            </p>
            {stats.totalPeople > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {Math.round((stats.totalConnections / stats.totalPeople) * 100)}% connected
              </div>
            )}
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
              organizations joined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Photos and contact info added
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Largest Family Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.largestTree}</div>
            <p className="text-xs text-muted-foreground">
              people in your biggest tree
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tree Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Private</span>
                <span>{stats.familyTrees - stats.sharedTrees - stats.publicTrees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shared</span>
                <span>{stats.sharedTrees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Public</span>
                <span>{stats.publicTrees}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy & Shared Links Widget */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Manage privacy and sharing for your family trees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {familyTrees.map((tree) => (
                <div key={tree.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getVisibilityIcon(tree.visibility)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{tree.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {tree.person_count} people • {tree.connection_count} connections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getVisibilityColor(tree.visibility)} className="capitalize">
                      {tree.visibility}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/family-trees/${tree.id}`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {familyTrees.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <p>No family trees to manage privacy for</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Shared Links
            </CardTitle>
            <CardDescription>
              Links you've shared for public and shared trees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sharedLinks.length > 0 ? (
              <div className="space-y-3">
                {sharedLinks.map((link) => (
                  <div key={link.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{link.tree_name}</h4>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={link.url}
                        readOnly
                        className="text-xs h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{link.access_count} views</span>
                      <span>Created {formatTimeAgo(link.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Link className="w-12 h-12 mx-auto mb-4" />
                <p>No shared links yet</p>
                <p className="text-xs mt-1">Share your family trees to generate links</p>
              </div>
            )}
            {familyTrees.filter(t => t.visibility === 'private').length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  <span>You have {familyTrees.filter(t => t.visibility === 'private').length} private trees</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Change visibility to "shared" or "public" to generate shareable links
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="trees">Family Trees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest family tree updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.tree_name && `in ${activity.tree_name}`} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Your Family Trees
              </CardTitle>
              <CardDescription>Overview of all your family trees</CardDescription>
            </CardHeader>
            <CardContent>
              {familyTrees.length > 0 ? (
                <div className="space-y-4">
                  {familyTrees.map((tree) => (
                    <div
                      key={tree.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => navigate(`/family-trees/${tree.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{tree.name}</h4>
                          <Badge variant={tree.visibility === 'public' ? 'default' : tree.visibility === 'shared' ? 'secondary' : 'outline'}>
                            {tree.visibility}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tree.person_count} people • {tree.connection_count} connections
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatTimeAgo(tree.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{tree.person_count}</div>
                          <div className="text-xs text-muted-foreground">people</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{tree.connection_count}</div>
                          <div className="text-xs text-muted-foreground">connections</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any family trees yet
                  </p>
                  <Button onClick={() => setCreateTreeOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Family Tree
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
    </>
  );
}