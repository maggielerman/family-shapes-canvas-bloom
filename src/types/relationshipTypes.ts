import { 
  Users, 
  Heart, 
  Baby, 
  Dna, 
  GitBranch 
} from 'lucide-react';
import { RelationshipTypeConfig, RelationshipType } from './connection';

// Centralized relationship type configuration
export const RELATIONSHIP_TYPE_CONFIGS: Record<RelationshipType, RelationshipTypeConfig> = {
  parent: {
    value: 'parent',
    label: 'Parent',
    icon: Users,
    color: 'hsl(var(--chart-1))',
    isBidirectional: false,
    reciprocalType: 'child'
  },
  child: {
    value: 'child',
    label: 'Child',
    icon: Baby,
    color: 'hsl(var(--chart-2))',
    isBidirectional: false,
    reciprocalType: 'parent'
  },
  partner: {
    value: 'partner',
    label: 'Partner',
    icon: Heart,
    color: 'hsl(var(--chart-3))',
    isBidirectional: true,
    reciprocalType: 'partner'
  },
  sibling: {
    value: 'sibling',
    label: 'Sibling',
    icon: Users,
    color: 'hsl(var(--chart-4))',
    isBidirectional: true,
    reciprocalType: 'sibling'
  },
  half_sibling: {
    value: 'half_sibling',
    label: 'Half Sibling',
    icon: Users,
    color: 'hsl(var(--chart-4))',
    isBidirectional: true,
    reciprocalType: 'half_sibling'
  },
  step_sibling: {
    value: 'step_sibling',
    label: 'Step Sibling',
    icon: Users,
    color: 'hsl(var(--chart-4))',
    isBidirectional: true,
    reciprocalType: 'step_sibling'
  },
  spouse: {
    value: 'spouse',
    label: 'Spouse',
    icon: Heart,
    color: 'hsl(var(--chart-3))',
    isBidirectional: true,
    reciprocalType: 'spouse'
  },
  donor: {
    value: 'donor',
    label: 'Donor',
    icon: Dna,
    color: 'hsl(var(--chart-5))',
    isBidirectional: false,
    reciprocalType: 'child'
  },
  biological_parent: {
    value: 'biological_parent',
    label: 'Biological Parent',
    icon: Users,
    color: 'hsl(var(--chart-1))',
    isBidirectional: false,
    reciprocalType: 'child'
  },
  social_parent: {
    value: 'social_parent',
    label: 'Social Parent',
    icon: Users,
    color: 'hsl(var(--chart-1))',
    isBidirectional: false,
    reciprocalType: 'child'
  },
  other: {
    value: 'other',
    label: 'Other',
    icon: GitBranch,
    color: 'hsl(var(--muted-foreground))',
    isBidirectional: true,
    reciprocalType: 'other'
  }
};

// Helper functions for relationship types
export const RelationshipTypeHelpers = {
  /**
   * Get configuration for a relationship type
   */
  getConfig: (type: RelationshipType): RelationshipTypeConfig => {
    return RELATIONSHIP_TYPE_CONFIGS[type];
  },

  /**
   * Get all relationship types as an array
   */
  getAllTypes: (): RelationshipType[] => {
    return Object.keys(RELATIONSHIP_TYPE_CONFIGS) as RelationshipType[];
  },

  /**
   * Get relationship types for UI selection (with labels and icons)
   */
  getForSelection: (): Array<{ value: RelationshipType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> => {
    return Object.values(RELATIONSHIP_TYPE_CONFIGS).map(config => ({
      value: config.value,
      label: config.label,
      icon: config.icon,
      color: config.color
    }));
  },

  /**
   * Get bidirectional relationship types only
   */
  getBidirectionalTypes: (): RelationshipType[] => {
    return Object.values(RELATIONSHIP_TYPE_CONFIGS)
      .filter(config => config.isBidirectional)
      .map(config => config.value);
  },

  /**
   * Get directional relationship types only
   */
  getDirectionalTypes: (): RelationshipType[] => {
    return Object.values(RELATIONSHIP_TYPE_CONFIGS)
      .filter(config => !config.isBidirectional)
      .map(config => config.value);
  },

  /**
   * Get icon for a relationship type
   */
  getIcon: (type: RelationshipType): React.ComponentType<{ className?: string }> => {
    return RELATIONSHIP_TYPE_CONFIGS[type].icon;
  },

  /**
   * Get color for a relationship type
   */
  getColor: (type: RelationshipType): string => {
    return RELATIONSHIP_TYPE_CONFIGS[type].color;
  },

  /**
   * Get label for a relationship type
   */
  getLabel: (type: RelationshipType): string => {
    return RELATIONSHIP_TYPE_CONFIGS[type].label;
  },

  /**
   * Check if a relationship type is bidirectional
   */
  isBidirectional: (type: RelationshipType): boolean => {
    return RELATIONSHIP_TYPE_CONFIGS[type].isBidirectional;
  },

  /**
   * Get reciprocal type for a relationship type
   */
  getReciprocalType: (type: RelationshipType): RelationshipType | null => {
    return RELATIONSHIP_TYPE_CONFIGS[type].reciprocalType || null;
  }
};

// Export the legacy relationshipTypes array for backward compatibility
// This should be gradually replaced with the new configuration
export const relationshipTypes = RelationshipTypeHelpers.getForSelection(); 