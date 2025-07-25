import { Person } from './person';
import { Connection } from './connection';

/**
 * Represents a union/marriage between two or more people
 */
export interface UnionNode {
  id: string;
  parents: Person[];
  unionType: 'marriage' | 'partnership' | 'donor_relationship' | 'other';
  // Visual positioning data for layout
  x?: number;
  y?: number;
  // Optional metadata
  startDate?: string;
  endDate?: string;
  notes?: string;
}

/**
 * Enhanced connection that can connect to either a person or a union
 */
export interface EnhancedConnection {
  id: string;
  fromPersonId?: string;
  fromUnionId?: string;
  toPersonId?: string;
  toUnionId?: string;
  relationshipType: string;
  // Original connection reference for traceability
  originalConnectionId?: string;
  // Metadata
  attributes?: Record<string, any>;
}

/**
 * A family unit containing parents (via union) and their children
 */
export interface FamilyUnit {
  id: string;
  union: UnionNode;
  children: Person[];
  // Optional grouping metadata
  generation?: number;
  familyName?: string;
}

/**
 * The processed data structure with union nodes
 */
export interface UnionProcessedData {
  persons: Person[];
  unions: UnionNode[];
  enhancedConnections: EnhancedConnection[];
  familyUnits: FamilyUnit[];
  // Keep original data for reference
  originalConnections: Connection[];
}

/**
 * Configuration for union processing
 */
export interface UnionProcessingConfig {
  // Minimum number of shared children to create a union
  minSharedChildren: number;
  // Whether to create unions for single parents with children
  includeSingleParents: boolean;
  // Whether to group sibling relationships
  groupSiblings: boolean;
  // Custom union detection logic
  customUnionDetector?: (persons: Person[], connections: Connection[]) => UnionNode[];
}

/**
 * Result of analyzing potential unions in the data
 */
export interface UnionAnalysis {
  potentialUnions: {
    parents: Person[];
    sharedChildren: Person[];
    confidence: number;
    suggestedType: UnionNode['unionType'];
  }[];
  singleParents: {
    parent: Person;
    children: Person[];
  }[];
  siblingGroups: {
    siblings: Person[];
    commonParents: Person[];
  }[];
} 