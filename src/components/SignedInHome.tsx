import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { 
  TreePine, 
  Users, 
  Building2, 
  Camera, 
  Plus,
  ArrowRight,
  Activity,
  Heart,
  Star,
  Calendar,
  UserPlus
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface RecentActivity {
  id: string;
  type: 'family_tree' | 'person' | 'organization' | 'media';
  title: string;
  description: string;
  date: string;
  icon: any;
}

interface QuickStats {
  familyTrees: number;
  people: number;
  organizations: number;
  mediaItems: number;
}

const SignedInHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<QuickStats>({ familyTrees: 0, people: 0, organizations: 0, mediaItems: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch quick stats
      const [familyTreesData, peopleData, organizationsData, mediaData] = await Promise.all([
        supabase.from('family_trees').select('id', { count: 'exact' }).eq('user_id', user!.id),
        supabase.from('people').select('id', { count: 'exact' }).eq('user_id', user!.id),
        // Count organizations where user is owner or member
        supabase.from('organization_memberships').select('organization_id', { count: 'exact' }).eq('user_id', user!.id),
        supabase.from('media_items').select('id', { count: 'exact' }).eq('user_id', user!.id)
      ]);

      setStats({
        familyTrees: familyTreesData.count || 0,
        people: peopleData.count || 0,
        organizations: organizationsData.count || 0,
        mediaItems: mediaData.count || 0
      });

      // Generate mock recent activity (in a real app, this would come from an activity log)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'person',
          title: 'Added new person',
          description: 'Added Sarah Johnson to the family tree',
          date: '2 hours ago',
          icon: UserPlus
        },
        {
          id: '2',
          type: 'family_tree',
          title: 'Updated family tree',
          description: 'Modified Johnson Family Tree structure',
          date: '1 day ago',
          icon: TreePine
        },
        {
          id: '3',
          type: 'media',
          title: 'Uploaded photos',
          description: 'Added 5 new family photos',
          date: '3 days ago',
          icon: Camera
        }
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Create Family Tree',
      description: 'Start building your family history',
      icon: TreePine,
      href: '/family-trees',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Add Person',
      description: 'Add a new family member',
      icon: UserPlus,
      href: '/people',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Upload Media',
      description: 'Share photos and documents',
      icon: Camera,
      href: '/media',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Join Organization',
      description: 'Connect with family groups',
      icon: Building2,
      href: '/organizations',
      color: 'from-orange-500 to-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Avatar className="h-20 w-20 ring-4 ring-coral-200">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-coral-100 text-coral-700 text-2xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-navy-800">
              {getGreeting()}, {profile?.full_name || 'there'}!
            </h1>
            <p className="text-lg text-navy-600 mt-2">
              Welcome back to your family story
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <TreePine className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-navy-800">{stats.familyTrees}</div>
              <div className="text-sm text-navy-600">Family Trees</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-navy-800">{stats.people}</div>
              <div className="text-sm text-navy-600">People</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-navy-800">{stats.organizations}</div>
              <div className="text-sm text-navy-600">Organizations</div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-navy-800">{stats.mediaItems}</div>
              <div className="text-sm text-navy-600">Media Items</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-coral-600" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Jump right into building your family story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-gradient-to-r hover:scale-105">
                        <CardContent className="p-6">
                          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} mb-4`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-navy-800 mb-2">{action.title}</h3>
                          <p className="text-sm text-navy-600 mb-4">{action.description}</p>
                          <div className="flex items-center text-coral-600 text-sm font-medium group-hover:text-coral-700">
                            Get started
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Section */}
            <Card className="bg-gradient-to-r from-coral-500 to-dusty-500 text-white border-0 shadow-md">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Discover Your Heritage</h3>
                    <p className="text-coral-100 mb-4">
                      Connect with distant relatives and uncover hidden family stories.
                    </p>
                    <Button variant="secondary" className="bg-white text-coral-600 hover:bg-gray-100">
                      Explore Features
                    </Button>
                  </div>
                  <Heart className="h-16 w-16 text-coral-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-coral-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Your latest updates and changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        <activity.icon className="h-4 w-4 text-navy-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-800">
                          {activity.title}
                        </p>
                        <p className="text-sm text-navy-600">
                          {activity.description}
                        </p>
                        <p className="text-xs text-navy-500 mt-1">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-navy-600">No recent activity</p>
                    <p className="text-xs text-navy-500">Start building your family tree!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/family-trees">
                  <Button variant="ghost" className="w-full justify-start">
                    <TreePine className="h-4 w-4 mr-2" />
                    Family Trees
                  </Button>
                </Link>
                <Link to="/people">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    People
                  </Button>
                </Link>
                <Link to="/organizations">
                  <Button variant="ghost" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Organizations
                  </Button>
                </Link>
                <Link to="/media">
                  <Button variant="ghost" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Media
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignedInHome;