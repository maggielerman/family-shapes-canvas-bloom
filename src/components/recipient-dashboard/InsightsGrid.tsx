import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  familyTrees: number;
  completionRate: number;
  largestTree: number;
  sharedTrees: number;
  publicTrees: number;
}

interface InsightsGridProps {
  stats: DashboardStats;
}

export function InsightsGrid({ stats }: InsightsGridProps) {
  return (
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
  );
} 