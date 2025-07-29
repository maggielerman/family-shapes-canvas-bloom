import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { RelationshipTypeHelpers } from "@/types/relationshipTypes";

export function XYFlowLegend() {
  // Use centralized relationship types
  const relationshipTypes = RelationshipTypeHelpers.getForSelection();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Relationship Legend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {relationshipTypes.filter(type => 
            ['parent', 'child', 'partner', 'sibling', 'donor', 'spouse'].includes(type.value)
          ).map((type) => {
            const IconComponent = type.icon;
            return (
              <Badge 
                key={type.value} 
                variant="outline" 
                className="flex items-center gap-1 justify-start p-2 h-auto"
                style={{ borderColor: type.color }}
              >
                <IconComponent className="w-3 h-3" />
                <span className="text-xs">{type.label}</span>
              </Badge>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <strong>Visual Tree:</strong> Only parent-child connections shown as lines. 
          Sibling relationships indicated by shared generation colors.
        </div>
      </CardContent>
    </Card>
  );
} 