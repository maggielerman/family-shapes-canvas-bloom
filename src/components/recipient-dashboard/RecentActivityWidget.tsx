import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, Network, TreePine, Image } from "lucide-react";

interface RecentActivity {
  id: string;
  type: 'person_added' | 'connection_created' | 'tree_created' | 'media_uploaded';
  description: string;
  timestamp: string;
  tree_name?: string;
  person_name?: string;
}

interface RecentActivityWidgetProps {
  recentActivity: RecentActivity[];
}

export function RecentActivityWidget({ recentActivity }: RecentActivityWidgetProps) {
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

  return (
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
  );
} 