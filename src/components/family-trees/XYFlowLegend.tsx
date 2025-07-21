import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Baby, Dna, GitBranch } from 'lucide-react';

const relationshipTypes = [
  { value: "parent", label: "Parent", icon: Users, color: "#3b82f6" },
  { value: "child", label: "Child", icon: Baby, color: "#10b981" },
  { value: "partner", label: "Partner", icon: Heart, color: "#ef4444" },
  { value: "sibling", label: "Sibling", icon: Users, color: "#8b5cf6" },
  { value: "half_sibling", label: "Half Sibling", icon: Users, color: "#f59e0b" },
  { value: "donor", label: "Donor", icon: Dna, color: "#06b6d4" },
  { value: "biological_parent", label: "Biological Parent", icon: Users, color: "#84cc16" },
  { value: "social_parent", label: "Social Parent", icon: Users, color: "#f97316" },
  { value: "step_sibling", label: "Step Sibling", icon: Users, color: "#ec4899" },
  { value: "spouse", label: "Spouse", icon: Heart, color: "#dc2626" },
  { value: "other", label: "Other", icon: GitBranch, color: "#6b7280" },
];

export function XYFlowLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Relationship Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {relationshipTypes.map(type => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                ></div>
                <Icon className="w-3 h-3" />
                <span>{type.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { relationshipTypes }; 