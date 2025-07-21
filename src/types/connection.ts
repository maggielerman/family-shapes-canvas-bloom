import { Tables } from '@/integrations/supabase/types';

// Base Connection type from database schema
export type Connection = Tables<'connections'>;

// Create and Update types for type safety
import { Json } from '@/integrations/supabase/types';

export type CreateConnectionData = {
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
  group_id?: string | null;
  organization_id?: string | null;
  notes?: string | null;
  metadata?: Json;
};

export type UpdateConnectionData = Partial<Omit<CreateConnectionData, 'from_person_id' | 'to_person_id'>> & {
  id: string;
};

// Extended Connection type for UI components that need additional computed fields
export interface ConnectionWithDetails extends Connection {
  direction?: 'incoming' | 'outgoing';
  other_person_name?: string;
  other_person_id?: string;
}

// Relationship type definitions aligned with database constraints
export const RELATIONSHIP_TYPES = [
  'parent',
  'child', 
  'partner',
  'sibling',
  'half_sibling',
  'donor',
  'biological_parent',
  'social_parent',
  'step_sibling',
  'spouse',
  'other'
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];

// Relationship type configuration for UI
export interface RelationshipTypeConfig {
  value: RelationshipType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isBidirectional: boolean;
  reciprocalType?: RelationshipType;
}

// Utility functions for connection management
export const ConnectionUtils = {
  /**
   * Check if a relationship type is bidirectional (symmetric)
   */
  isBidirectional: (relationshipType: RelationshipType): boolean => {
    const bidirectionalTypes: RelationshipType[] = [
      'sibling', 'half_sibling', 'step_sibling', 'partner', 'spouse', 'other'
    ];
    return bidirectionalTypes.includes(relationshipType);
  },

  /**
   * Get the reciprocal relationship type
   */
  getReciprocalType: (relationshipType: RelationshipType): RelationshipType | null => {
    const reciprocals: Record<RelationshipType, RelationshipType> = {
      'parent': 'child',
      'child': 'parent',
      'partner': 'partner',
      'sibling': 'sibling',
      'half_sibling': 'half_sibling',
      'step_sibling': 'step_sibling',
      'spouse': 'spouse',
      'donor': 'child',
      'biological_parent': 'child',
      'social_parent': 'child',
      'other': 'other'
    };
    return reciprocals[relationshipType] || null;
  },

  /**
   * Get canonical direction for a relationship (for bidirectional relationships)
   */
  getCanonicalDirection: (
    personAId: string, 
    personBId: string, 
    relationshipType: RelationshipType
  ): { from_person_id: string; to_person_id: string } => {
    if (ConnectionUtils.isBidirectional(relationshipType)) {
      // For bidirectional relationships, use lexicographically smaller ID as "from"
      return personAId < personBId 
        ? { from_person_id: personAId, to_person_id: personBId }
        : { from_person_id: personBId, to_person_id: personAId };
    }
    
    // For directional relationships, preserve original direction
    return { from_person_id: personAId, to_person_id: personBId };
  },

  /**
   * Check if two connections represent the same relationship
   */
  areEquivalent: (conn1: Connection, conn2: Connection): boolean => {
    if (conn1.relationship_type !== conn2.relationship_type) {
      return false;
    }

    if (ConnectionUtils.isBidirectional(conn1.relationship_type as RelationshipType)) {
      // For bidirectional relationships, check both directions
      return (
        (conn1.from_person_id === conn2.from_person_id && conn1.to_person_id === conn2.to_person_id) ||
        (conn1.from_person_id === conn2.to_person_id && conn1.to_person_id === conn2.from_person_id)
      );
    }

    // For directional relationships, check exact match
    return conn1.from_person_id === conn2.from_person_id && conn1.to_person_id === conn2.to_person_id;
  },

  /**
   * Deduplicate connections by removing bidirectional duplicates
   */
  deduplicate: (connections: Connection[]): Connection[] => {
    const uniqueConnections: Connection[] = [];
    const seen = new Set<string>();

    for (const connection of connections) {
      const key = ConnectionUtils.isBidirectional(connection.relationship_type as RelationshipType)
        ? `${connection.relationship_type}:${[connection.from_person_id, connection.to_person_id].sort().join('-')}`
        : `${connection.relationship_type}:${connection.from_person_id}-${connection.to_person_id}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueConnections.push(connection);
      }
    }

    return uniqueConnections;
  },

  /**
   * Check if a connection already exists
   */
  exists: (
    connections: Connection[], 
    fromPersonId: string, 
    toPersonId: string, 
    relationshipType: RelationshipType
  ): boolean => {
    return connections.some(conn => 
      conn.relationship_type === relationshipType && 
      ConnectionUtils.areEquivalent(conn, { 
        id: '', 
        from_person_id: fromPersonId, 
        to_person_id: toPersonId, 
        relationship_type: relationshipType,
        family_tree_id: null,
        group_id: null,
        organization_id: null,
        notes: null,
        metadata: null,
        created_at: null,
        updated_at: null
      } as Connection)
    );
  },

  /**
   * Validate connection data
   */
  validate: (data: CreateConnectionData): string[] => {
    const errors: string[] = [];

    if (!data.from_person_id) errors.push('From person is required');
    if (!data.to_person_id) errors.push('To person is required');
    if (!data.relationship_type) errors.push('Relationship type is required');
    
    if (data.from_person_id && data.to_person_id && data.from_person_id === data.to_person_id) {
      errors.push('A person cannot have a relationship with themselves');
    }

    if (data.relationship_type && !RELATIONSHIP_TYPES.includes(data.relationship_type as RelationshipType)) {
      errors.push('Invalid relationship type');
    }

    return errors;
  }
}; 