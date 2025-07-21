import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Baby, Dna, GitBranch, Layers } from 'lucide-react';
import { getGenerationColorPalette } from '@/utils/generationUtils';

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
  const generationColors = getGenerationColorPalette().slice(0, 6); // Show first 6 generations

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Generation Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Generation Colors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">
            Each generation has a unique color. Siblings share the same generation color.
          </div>
          <div className="grid grid-cols-2 gap-2">
            {generationColors.map(gen => (
              <div key={gen.generation} className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-xs">
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: gen.color }}
                ></div>
                <span>{gen.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relationship Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Connection Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">
            Lines show generational connections. Sibling relationships are color-coded only.
          </div>
          <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
            {relationshipTypes.filter(type => 
              ['parent', 'child', 'sibling', 'partner', 'donor'].includes(type.value)
            ).map(type => {
              const Icon = type.icon;
              const isGenerational = ['parent', 'child'].includes(type.value);
              const isSibling = type.value === 'sibling';
              
              return (
                <div key={type.value} className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-xs">
                  <div 
                    className={`w-3 h-3 ${isGenerational ? 'rounded-sm' : 'rounded-full'} ${isSibling ? 'border-2 border-dashed' : ''}`}
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <Icon className="w-3 h-3" />
                  <span className="flex-1">{type.label}</span>
                  {isGenerational && <span className="text-xs text-muted-foreground">line</span>}
                  {isSibling && <span className="text-xs text-muted-foreground">color</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { relationshipTypes }; 