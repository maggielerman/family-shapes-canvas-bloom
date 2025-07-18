import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Users, 
  TreePine,
  Link as LinkIcon,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";

interface OrganizationStatsProps {
  organizationId: string;
}

interface Stats {
  memberCount: number;
  groupCount: number;
  personCount: number;
  connectionCount: number;
  familyTreeCount: number;
  recentActivity: number;
}

export function OrganizationStats({ organizationId }: OrganizationStatsProps) {
  const [stats, setStats] = useState<Stats>({
    memberCount: 0,
    groupCount: 0,
    personCount: 0,
    connectionCount: 0,
    familyTreeCount: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [organizationId]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch member count
      const { count: memberCount } = await supabase
        .from('organization_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch group count
      const { count: groupCount } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch person count
      const { count: personCount } = await supabase
        .from('persons')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch connection count
      const { count: connectionCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Fetch family tree count
      const { count: familyTreeCount } = await supabase
        .from('family_trees')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Calculate recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentPersons } = await supabase
        .from('persons')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const { count: recentConnections } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      setStats({
        memberCount: memberCount || 0,
        groupCount: groupCount || 0,
        personCount: personCount || 0,
        connectionCount: connectionCount || 0,
        familyTreeCount: familyTreeCount || 0,
        recentActivity: (recentPersons || 0) + (recentConnections || 0)
      });

    } catch (error) {
      console.error('Error fetching organization stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    description: string; 
    trend?: string; 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Members"
          value={stats.memberCount}
          icon={Users}
          description="Active organization members"
        />
        
        <StatCard
          title="Groups"
          value={stats.groupCount}
          icon={Users}
          description="Family and sibling groups"
        />
        
        <StatCard
          title="People"
          value={stats.personCount}
          icon={Users}
          description="Total people in database"
        />
        
        <StatCard
          title="Connections"
          value={stats.connectionCount}
          icon={LinkIcon}
          description="Family relationships mapped"
        />
        
        <StatCard
          title="Family Trees"
          value={stats.familyTreeCount}
          icon={TreePine}
          description="Complete family trees"
        />
        
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          icon={Activity}
          description="New entries in last 30 days"
          trend={stats.recentActivity > 0 ? "Active" : "Quiet"}
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Metrics
            </CardTitle>
            <CardDescription>
              Organization growth overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. connections per person</span>
                <span className="font-medium">
                  {stats.personCount > 0 ? (stats.connectionCount / stats.personCount).toFixed(1) : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">People per group</span>
                <span className="font-medium">
                  {stats.groupCount > 0 ? (stats.personCount / stats.groupCount).toFixed(1) : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active members</span>
                <span className="font-medium">{stats.memberCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Summary
            </CardTitle>
            <CardDescription>
              Recent organization activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New entries (30 days)</span>
                <Badge variant={stats.recentActivity > 0 ? "default" : "secondary"}>
                  {stats.recentActivity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total database size</span>
                <span className="font-medium">
                  {stats.personCount + stats.connectionCount} records
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion rate</span>
                <Badge variant="outline">
                  {stats.personCount > 0 && stats.connectionCount > 0 ? "Good" : "Getting Started"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}