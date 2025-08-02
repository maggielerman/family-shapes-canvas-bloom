import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TreePine, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface FamilyTreesWidgetProps {
  familyTrees: FamilyTree[];
  onCreateTree: () => void;
}

export function FamilyTreesWidget({ familyTrees, onCreateTree }: FamilyTreesWidgetProps) {
  const navigate = useNavigate();

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
            <Button onClick={onCreateTree}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Family Tree
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 