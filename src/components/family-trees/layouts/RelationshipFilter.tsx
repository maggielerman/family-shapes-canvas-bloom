import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Filter, Check } from 'lucide-react';
import { Person } from '@/types/person';
import { RelationshipType } from '@/types/connection';
import { RELATIONSHIP_CATEGORIES, RelationshipCategory } from './relationshipConstants';

interface RelationshipFilterProps {
  relationshipFilters: Record<RelationshipCategory, boolean>;
  onRelationshipFilterChange: (category: RelationshipCategory, enabled: boolean) => void;
  className?: string;
}

interface FilterOption {
  value: RelationshipCategory;
  label: string;
  description: string;
  enabled: boolean;
}

export function RelationshipFilter({ 
  relationshipFilters, 
  onRelationshipFilterChange, 
  className = '' 
}: RelationshipFilterProps) {
  const filterOptions: FilterOption[] = [
    {
      value: 'generational',
      label: 'Parent-Child',
      description: 'Parents, children, grandparents',
      enabled: relationshipFilters.generational
    },
    {
      value: 'lateral',
      label: 'Siblings & Partners',
      description: 'Siblings, spouses, cousins',
      enabled: relationshipFilters.lateral
    },
    {
      value: 'donor',
      label: 'Donors',
      description: 'Donor relationships',
      enabled: relationshipFilters.donor
    }
  ];

  const enabledCount = filterOptions.filter(option => option.enabled).length;
  const allFiltersEnabled = enabledCount === filterOptions.length;

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-40 justify-between bg-background/80 backdrop-blur-sm"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm">
                {allFiltersEnabled ? 'All Types' : `${enabledCount} Types`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {enabledCount}/{filterOptions.length}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <div className="text-sm font-medium mb-3">Relationship Types</div>
            <div className="space-y-3">
              {filterOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`filter-${option.value}`}
                    checked={option.enabled}
                    onCheckedChange={(checked) => 
                      onRelationshipFilterChange(option.value, !!checked)
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1 flex-1">
                    <label 
                      htmlFor={`filter-${option.value}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {option.label}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  {option.enabled && (
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                Toggle relationship types to show/hide connections in the visualization
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 