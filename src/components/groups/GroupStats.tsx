import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  TreePine, 
  Heart,
  Activity,
  TrendingUp,
  Calendar,
  Image
} from "lucide-react";

interface GroupStatsProps {
  groupId: string;
}

interface Stats {
  totalMembers: number;
  newMembersThisMonth: number;
  activeMembersThisWeek: number;
  totalDonors: number;
  totalSiblingGroups: number;
  totalMedia: number;
  growthRate: number;
}

export function GroupStats({ groupId }: GroupStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    newMembersThisMonth: 0,
    activeMembersThisWeek: 0,
    totalDonors: 0,
    totalSiblingGroups: 0,
    totalMedia: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [groupId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total members
      const { count: totalMembers } = await supabase
        .from('group_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      // Fetch new members this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newMembersThisMonth } = await supabase
        .from('group_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .gte('created_at', startOfMonth.toISOString());

      // Fetch active members this week (simplified - just counting all for now)
      const activeMembersThisWeek = totalMembers || 0; // Simplified for now

      // Fetch total donors
      const { data: donorCount } = await supabase
        .rpc('get_group_donor_count', { grp_id: groupId });

      // Fetch total sibling groups
      const { data: siblingGroupCount } = await supabase
        .rpc('get_group_sibling_groups_count', { grp_id: groupId });

      // Fetch total media
      const { count: totalMedia } = await supabase
        .from('group_media')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      // Calculate growth rate (simplified)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: membersLastMonth } = await supabase
        .from('group_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .lte('created_at', lastMonth.toISOString());

      const growthRate = membersLastMonth && membersLastMonth > 0
        ? ((totalMembers || 0) - membersLastMonth) / membersLastMonth * 100
        : 0;

      setStats({
        totalMembers: totalMembers || 0,
        newMembersThisMonth: newMembersThisMonth || 0,
        activeMembersThisWeek,
        totalDonors: donorCount || 0,
        totalSiblingGroups: siblingGroupCount || 0,
        totalMedia: totalMedia || 0,
        growthRate: Math.round(growthRate)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-16 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newMembersThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Active in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donors</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonors}</div>
            <p className="text-xs text-muted-foreground">
              In group database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.growthRate}%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sibling Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSiblingGroups}</div>
            <p className="text-xs text-muted-foreground">
              Connected sibling groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
            <p className="text-xs text-muted-foreground">
              Photos and documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSiblingGroups > 0 
                ? Math.round(stats.totalMembers / stats.totalSiblingGroups)
                : stats.totalMembers
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Members per sibling group
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Group activity over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">New members joined</span>
              </div>
              <span className="text-sm font-medium">{stats.newMembersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Media uploaded</span>
              </div>
              <span className="text-sm font-medium">Coming soon</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Connections made</span>
              </div>
              <span className="text-sm font-medium">Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GroupStats;