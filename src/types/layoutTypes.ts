/**
 * Centralized layout types to eliminate duplicate interfaces across layout components
 */

import { Person } from './person';
import { Connection } from './connection';
import { RelationshipType } from './connection';

// Unified interface for relationship types used in layouts
export interface LayoutRelationshipType {
  value: string;
  label: string;
  color: string;
}

// Common props for all layout components
export interface BaseLayoutProps {
  persons: Person[];
  connections: Connection[];
  relationshipTypes: LayoutRelationshipType[];
  width: number;
  height: number;
  onPersonClick?: (person: Person) => void;
}

// Node interface for force-directed layouts
export interface ForceNode extends Person {
  x?: number;
  y?: number;
  generation?: number;
  generationColor?: string;
}

// Link interface for force-directed layouts
export interface ForceLink {
  source: string | ForceNode;
  target: string | ForceNode;
  relationship_type: string;
}

// Node interface for tree layouts
export interface TreeNode extends Person {
  x?: number;
  y?: number;
  children?: TreeNode[];
}

// Helper to convert centralized relationship types to layout format
export const LayoutTypeHelpers = {
  /**
   * Convert RelationshipType to LayoutRelationshipType
   */
  convertToLayoutType: (relationshipType: RelationshipType): LayoutRelationshipType => {
    // This would typically use the centralized RelationshipTypeHelpers
    // For now, we'll provide a basic conversion
    return {
      value: relationshipType,
      label: relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1),
      color: 'hsl(var(--chart-1))'
    };
  },

  /**
   * Get layout relationship types from centralized types
   */
  getLayoutRelationshipTypes: (): LayoutRelationshipType[] => {
    // This would use the centralized RelationshipTypeHelpers
    // For now, return a basic set
    return [
      { value: 'parent', label: 'Parent', color: 'hsl(var(--chart-1))' },
      { value: 'child', label: 'Child', color: 'hsl(var(--chart-2))' },
      { value: 'partner', label: 'Partner', color: 'hsl(var(--chart-3))' },
      { value: 'sibling', label: 'Sibling', color: 'hsl(var(--chart-4))' },
      { value: 'donor', label: 'Donor', color: 'hsl(var(--chart-5))' },
    ];
  }
}; 