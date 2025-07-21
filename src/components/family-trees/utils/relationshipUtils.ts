import { relationshipTypes } from '../XYFlowLegend';

export interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id?: string | null;
}

// Define which relationship types are bidirectional (symmetric)
const BIDIRECTIONAL_RELATIONSHIPS = [
  'sibling',
  'half_sibling', 
  'step_sibling',
  'partner',
  'spouse',
  'other'
];

// Define which relationship types are directional (asymmetric)
const DIRECTIONAL_RELATIONSHIPS = [
  'parent',
  'child',
  'donor',
  'biological_parent',
  'social_parent'
];

/**
 * Check if a relationship type is bidirectional
 */
export function isBidirectionalRelationship(relationshipType: string): boolean {
  return BIDIRECTIONAL_RELATIONSHIPS.includes(relationshipType);
}

/**
 * Check if a relationship type is directional
 */
export function isDirectionalRelationship(relationshipType: string): boolean {
  return DIRECTIONAL_RELATIONSHIPS.includes(relationshipType);
}

/**
 * Get the canonical direction for a relationship
 * For bidirectional relationships, always return the lexicographically smaller ID first
 */
export function getCanonicalDirection(personAId: string, personBId: string, relationshipType: string): {
  from_person_id: string;
  to_person_id: string;
} {
  if (isBidirectionalRelationship(relationshipType)) {
    // For bidirectional relationships, always use lexicographically smaller ID as "from"
    return personAId < personBId 
      ? { from_person_id: personAId, to_person_id: personBId }
      : { from_person_id: personBId, to_person_id: personAId };
  }
  
  // For directional relationships, preserve the original direction
  return { from_person_id: personAId, to_person_id: personBId };
}

/**
 * Check if two connections represent the same relationship
 */
export function areConnectionsEquivalent(conn1: Connection, conn2: Connection): boolean {
  if (conn1.relationship_type !== conn2.relationship_type) {
    return false;
  }

  if (isBidirectionalRelationship(conn1.relationship_type)) {
    // For bidirectional relationships, check both directions
    return (
      (conn1.from_person_id === conn2.from_person_id && conn1.to_person_id === conn2.to_person_id) ||
      (conn1.from_person_id === conn2.to_person_id && conn1.to_person_id === conn2.from_person_id)
    );
  }

  // For directional relationships, check exact match
  return conn1.from_person_id === conn2.from_person_id && conn1.to_person_id === conn2.to_person_id;
}

/**
 * Deduplicate connections by removing bidirectional duplicates
 */
export function deduplicateConnections(connections: Connection[]): Connection[] {
  const uniqueConnections: Connection[] = [];
  const seen = new Set<string>();

  for (const connection of connections) {
    const key = isBidirectionalRelationship(connection.relationship_type)
      ? `${connection.relationship_type}:${[connection.from_person_id, connection.to_person_id].sort().join('-')}`
      : `${connection.relationship_type}:${connection.from_person_id}-${connection.to_person_id}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueConnections.push(connection);
    }
  }

  return uniqueConnections;
}

/**
 * Get display text for a connection
 */
export function getConnectionDisplayText(connection: Connection, getPersonName: (id: string) => string): string {
  const fromName = getPersonName(connection.from_person_id);
  const toName = getPersonName(connection.to_person_id);
  const relationshipLabel = relationshipTypes.find(rt => rt.value === connection.relationship_type)?.label || connection.relationship_type;

  if (isBidirectionalRelationship(connection.relationship_type)) {
    // For bidirectional relationships, show both names without direction
    return `${fromName} ↔ ${toName} (${relationshipLabel})`;
  }

  // For directional relationships, show direction
  return `${fromName} → ${toName} (${relationshipLabel})`;
}

/**
 * Check if a connection already exists (for creation validation)
 */
export function connectionExists(
  connections: Connection[], 
  fromPersonId: string, 
  toPersonId: string, 
  relationshipType: string
): boolean {
  return connections.some(conn => 
    conn.relationship_type === relationshipType && 
    areConnectionsEquivalent(conn, { 
      id: '', 
      from_person_id: fromPersonId, 
      to_person_id: toPersonId, 
      relationship_type: relationshipType 
    })
  );
} 