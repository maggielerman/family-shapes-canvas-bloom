import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Users2, Globe, Eye, Settings } from "lucide-react";
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

interface PrivacyWidgetProps {
  familyTrees: FamilyTree[];
}

export function PrivacyWidget({ familyTrees }: PrivacyWidgetProps) {
  const navigate = useNavigate();

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
  );
} 