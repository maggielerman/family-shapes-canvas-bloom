import { Checkbox } from '@/components/ui/checkbox';
import { Person } from '@/types/person';
import { RelationshipType } from '@/types/connection';

// Relationship categories for filtering
export const RELATIONSHIP_CATEGORIES = {
  generational: ['parent', 'child', 'biological_parent', 'social_parent'] as RelationshipType[],
  lateral: ['sibling', 'half_sibling', 'step_sibling', 'partner', 'spouse'] as RelationshipType[],
  donor: ['donor'] as RelationshipType[],
} as const;

export type RelationshipCategory = keyof typeof RELATIONSHIP_CATEGORIES;

interface RelationshipFilters {
  generational: boolean;
  lateral: boolean;
  donor: boolean;
}

interface RelationshipFilterProps {
  relationshipFilters: RelationshipFilters;
  onRelationshipFilterChange: (category: RelationshipCategory, enabled: boolean) => void;
  className?: string;
}

export function RelationshipFilter({
  relationshipFilters,
  onRelationshipFilterChange,
  className = ''
}: RelationshipFilterProps) {
  return (
    <div className={`flex flex-col gap-3 min-w-[180px] ${className}`}>
      <div className="text-xs font-medium text-muted-foreground px-1">
        Show Relationships:
      </div>
      
      <div className="space-y-3">
        {/* Generational Relationships */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="generational"
            checked={relationshipFilters.generational}
            onCheckedChange={(checked) => 
              onRelationshipFilterChange('generational', !!checked)
            }
          />
          <label
            htmlFor="generational"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Parent-Child
          </label>
        </div>

        {/* Lateral Relationships */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="lateral"
            checked={relationshipFilters.lateral}
            onCheckedChange={(checked) => 
              onRelationshipFilterChange('lateral', !!checked)
            }
          />
          <label
            htmlFor="lateral"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Siblings & Partners
          </label>
        </div>

        {/* Donor Relationships */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="donor"
            checked={relationshipFilters.donor}
            onCheckedChange={(checked) => 
              onRelationshipFilterChange('donor', !!checked)
            }
          />
          <label
            htmlFor="donor"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Donors
          </label>
        </div>
      </div>
    </div>
  );
} 