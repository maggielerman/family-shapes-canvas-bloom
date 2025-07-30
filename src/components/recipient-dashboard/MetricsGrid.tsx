import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Users, Network, Building2 } from "lucide-react";

interface DashboardStats {
  familyTrees: number;
  totalPeople: number;
  totalConnections: number;
  organizations: number;
  averageTreeSize: number;
  sharedTrees: number;
  publicTrees: number;
}

interface MetricsGridProps {
  stats: DashboardStats;
  loading: boolean;
}

export function MetricsGrid({ stats, loading }: MetricsGridProps) {
  return (
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
  );
} 