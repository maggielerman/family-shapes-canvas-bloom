import { Users, Heart, Baby, Dna } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RelationshipType {
  value: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const relationshipTypes: RelationshipType[] = [
  { 
    value: "parent", 
    label: "Parent", 
    icon: Users, 
    color: "hsl(var(--chart-1))",
    description: "Biological or adoptive parent"
  },
  { 
    value: "child", 
    label: "Child", 
    icon: Baby, 
    color: "hsl(var(--chart-2))",
    description: "Biological or adopted child"
  },
  { 
    value: "partner", 
    label: "Partner", 
    icon: Heart, 
    color: "hsl(var(--chart-3))",
    description: "Spouse or romantic partner"
  },
  { 
    value: "sibling", 
    label: "Sibling", 
    icon: Users, 
    color: "hsl(var(--chart-4))",
    description: "Brother or sister"
  },
  { 
    value: "donor", 
    label: "Donor", 
    icon: Dna, 
    color: "hsl(var(--chart-5))",
    description: "Genetic donor (sperm, egg, embryo)"
  },
  { 
    value: "gestational_carrier", 
    label: "Gestational Carrier", 
    icon: Baby, 
    color: "hsl(var(--chart-6))",
    description: "Surrogate or gestational carrier"
  },
];

interface RelationshipLegendProps {
  className?: string;
}

export function RelationshipLegend({ className = "" }: RelationshipLegendProps) {
  return (
    <div className={`bg-card border rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold mb-3 text-foreground">Relationship Types</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {relationshipTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.value}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: type.color }}
              >
                <Icon className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {type.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {type.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          <strong>Node colors:</strong> Represent the person's primary relationship type
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>Connection lines:</strong> Show the relationship type between connected people
        </p>
      </div>
    </div>
  );
}