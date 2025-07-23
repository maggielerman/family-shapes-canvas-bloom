import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

export interface RelationshipHierarchy {
  persons: Person[];
  connections: Connection[];
}

export interface ReciprocalMapping {
  [key: string]: string;
}

export interface RelationshipAttributes {
  biological?: boolean;
  adopted?: boolean;
  step?: boolean;
  foster?: boolean;
  legal?: boolean;
  intended?: boolean;
  ivf?: boolean;
  iui?: boolean;
  donor_conceived?: boolean;
  full?: boolean;
  half?: boolean;
  donor_sibling?: boolean;
  step_sibling?: boolean;
}

/**
 * Get the reciprocal relationship type
 */
export function getReciprocalRelationship(relationshipType: string): string {
  const reciprocals: ReciprocalMapping = {
    'parent': 'child',
    'child': 'parent',
    'partner': 'partner',
    'sibling': 'sibling',
    'donor': 'child',
    'gestational_carrier': 'child',
    'surrogate': 'child',
    'intended_parent': 'child',
    'step_parent': 'step_child',
    'step_child': 'step_parent',
    'foster_parent': 'foster_child',
    'foster_child': 'foster_parent',
    'adoptive_parent': 'adopted_child',
    'adopted_child': 'adoptive_parent'
  };
  
  return reciprocals[relationshipType] || relationshipType;
}

/**
 * Get reciprocal attributes while preserving biological/legal attributes
 */
export function getReciprocalAttributes(relationshipType: string, attributes: string[]): string[] {
  const preservedAttributes = attributes.filter(attr => {
    return [
      'biological', 'adopted', 'step', 'foster', 'legal', 
      'intended', 'ivf', 'iui', 'donor_conceived'
    ].includes(attr);
  });
  
  if (relationshipType === 'sibling') {
    const siblingAttributes = attributes.filter(attr => 
      ['full', 'half', 'donor_sibling', 'step_sibling'].includes(attr)
    );
    return [...preservedAttributes, ...siblingAttributes];
  }
  
  return preservedAttributes;
}

/**
 * Get all parents of a person
 */
export function getParents(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  return hierarchy.connections
    .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'parent')
    .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
    .filter(Boolean) as Person[];
}

/**
 * Get all children of a person
 */
export function getChildren(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  return hierarchy.connections
    .filter(conn => conn.from_person_id === personId && conn.relationship_type === 'parent')
    .map(conn => hierarchy.persons.find(p => p.id === conn.to_person_id))
    .filter(Boolean) as Person[];
}

/**
 * Get all siblings of a person
 */
export function getSiblings(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  const parents = getParents(personId, hierarchy);
  const siblings: Person[] = [];
  
  parents.forEach(parent => {
    const parentChildren = getChildren(parent.id, hierarchy);
    siblings.push(...parentChildren.filter(child => child.id !== personId));
  });
  
  return siblings;
}

/**
 * Get sibling type (full, half, step, etc.)
 */
export function getSiblingType(person1Id: string, person2Id: string, hierarchy: RelationshipHierarchy): string {
  const person1Parents = getParents(person1Id, hierarchy);
  const person2Parents = getParents(person2Id, hierarchy);
  
  const sharedParents = person1Parents.filter(p1 => 
    person2Parents.some(p2 => p2.id === p1.id)
  );
  
  if (sharedParents.length === 2) {
    return 'full';
  } else if (sharedParents.length === 1) {
    return 'half';
  } else {
    // Check for step relationships
    const person1StepParents = hierarchy.connections
      .filter(conn => conn.to_person_id === person1Id && conn.relationship_type.includes('step'))
      .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
      .filter(Boolean) as Person[];
      
    const person2StepParents = hierarchy.connections
      .filter(conn => conn.to_person_id === person2Id && conn.relationship_type.includes('step'))
      .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
      .filter(Boolean) as Person[];
      
    const sharedStepParents = person1StepParents.filter(p1 => 
      person2StepParents.some(p2 => p2.id === p1.id)
    );
    
    if (sharedStepParents.length > 0) {
      return 'step';
    }
  }
  
  return 'unknown';
}

/**
 * Get all partners of a person
 */
export function getPartners(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  return hierarchy.connections
    .filter(conn => 
      (conn.from_person_id === personId || conn.to_person_id === personId) && 
      conn.relationship_type === 'partner'
    )
    .map(conn => {
      const partnerId = conn.from_person_id === personId ? conn.to_person_id : conn.from_person_id;
      return hierarchy.persons.find(p => p.id === partnerId);
    })
    .filter(Boolean) as Person[];
}

/**
 * Get all donors for a person
 */
export function getDonors(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  return hierarchy.connections
    .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'donor')
    .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
    .filter(Boolean) as Person[];
}

/**
 * Get biological parents of a person
 */
export function getBiologicalParents(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  return hierarchy.connections
    .filter(conn => 
      conn.to_person_id === personId && 
      conn.relationship_type === 'parent' &&
      conn.metadata && 
      typeof conn.metadata === 'object' &&
      'attributes' in conn.metadata &&
      Array.isArray(conn.metadata.attributes) &&
      conn.metadata.attributes.includes('biological')
    )
    .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
    .filter(Boolean) as Person[];
}

/**
 * Get step siblings of a person
 */
export function getStepSiblings(personId: string, hierarchy: RelationshipHierarchy): Person[] {
  const stepParents = hierarchy.connections
    .filter(conn => 
      conn.to_person_id === personId && 
      conn.relationship_type.includes('step')
    )
    .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
    .filter(Boolean) as Person[];
  
  const stepSiblings: Person[] = [];
  
  stepParents.forEach(stepParent => {
    const stepParentChildren = getChildren(stepParent.id, hierarchy);
    stepSiblings.push(...stepParentChildren.filter(child => child.id !== personId));
  });
  
  return stepSiblings;
}

/**
 * Check for circular relationships
 */
export function hasCircularRelationship(personId: string, hierarchy: RelationshipHierarchy, visited = new Set<string>()): boolean {
  if (visited.has(personId)) {
    return true;
  }
  
  visited.add(personId);
  
  const children = getChildren(personId, hierarchy);
  for (const child of children) {
    if (hasCircularRelationship(child.id, hierarchy, new Set(visited))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate age consistency in relationships
 */
export function validateAgeConsistency(hierarchy: RelationshipHierarchy): boolean {
  for (const person of hierarchy.persons) {
    if (!person.date_of_birth) continue;
    
    const parents = getParents(person.id, hierarchy);
    for (const parent of parents) {
      if (!parent.date_of_birth) continue;
      
      const personBirth = new Date(person.date_of_birth);
      const parentBirth = new Date(parent.date_of_birth);
      
      if (personBirth <= parentBirth) {
        return false; // Child born before or same time as parent
      }
    }
  }
  
  return true;
}

/**
 * Get generation level of a person
 */
export function getGeneration(personId: string, hierarchy: RelationshipHierarchy, generation = 0): number {
  const parentConnections = hierarchy.connections.filter(
    conn => conn.to_person_id === personId && conn.relationship_type === 'parent'
  );
  
  if (parentConnections.length === 0) {
    return generation; // Root generation
  }
  
  // Find the highest generation among parents
  let maxParentGeneration = generation;
  for (const conn of parentConnections) {
    const parentGeneration = getGeneration(conn.from_person_id, hierarchy, generation + 1);
    maxParentGeneration = Math.max(maxParentGeneration, parentGeneration);
  }
  
  return maxParentGeneration;
}

/**
 * Get all ancestors of a person
 */
export function getAncestors(personId: string, hierarchy: RelationshipHierarchy, maxGenerations = 10): Person[] {
  const ancestors: Person[] = [];
  const visited = new Set<string>();
  
  function collectAncestors(currentId: string, generation: number) {
    if (generation >= maxGenerations || visited.has(currentId)) {
      return;
    }
    
    visited.add(currentId);
    const parents = getParents(currentId, hierarchy);
    
    for (const parent of parents) {
      ancestors.push(parent);
      collectAncestors(parent.id, generation + 1);
    }
  }
  
  collectAncestors(personId, 0);
  return ancestors;
}

/**
 * Get all descendants of a person
 */
export function getDescendants(personId: string, hierarchy: RelationshipHierarchy, maxGenerations = 10): Person[] {
  const descendants: Person[] = [];
  const visited = new Set<string>();
  
  function collectDescendants(currentId: string, generation: number) {
    if (generation >= maxGenerations || visited.has(currentId)) {
      return;
    }
    
    visited.add(currentId);
    const children = getChildren(currentId, hierarchy);
    
    for (const child of children) {
      descendants.push(child);
      collectDescendants(child.id, generation + 1);
    }
  }
  
  collectDescendants(personId, 0);
  return descendants;
}

/**
 * Validate relationship consistency
 */
export function validateRelationshipConsistency(hierarchy: RelationshipHierarchy): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for circular relationships
  for (const person of hierarchy.persons) {
    if (hasCircularRelationship(person.id, hierarchy)) {
      errors.push(`Circular relationship detected for person: ${person.name}`);
    }
  }
  
  // Check age consistency
  if (!validateAgeConsistency(hierarchy)) {
    errors.push('Age inconsistency detected in relationships');
  }
  
  // Check for duplicate connections
  const connectionIds = new Set<string>();
  for (const connection of hierarchy.connections) {
    const connectionKey = `${connection.from_person_id}-${connection.to_person_id}-${connection.relationship_type}`;
    if (connectionIds.has(connectionKey)) {
      errors.push(`Duplicate connection detected: ${connectionKey}`);
    }
    connectionIds.add(connectionKey);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get family tree statistics
 */
export function getFamilyTreeStats(hierarchy: RelationshipHierarchy) {
  const totalPersons = hierarchy.persons.length;
  const totalConnections = hierarchy.connections.length;
  
  const generations = new Set<number>();
  for (const person of hierarchy.persons) {
    generations.add(getGeneration(person.id, hierarchy));
  }
  
  const rootPersons = hierarchy.persons.filter(person => 
    getParents(person.id, hierarchy).length === 0
  );
  
  const leafPersons = hierarchy.persons.filter(person => 
    getChildren(person.id, hierarchy).length === 0
  );
  
  return {
    totalPersons,
    totalConnections,
    generationCount: generations.size,
    rootPersons: rootPersons.length,
    leafPersons: leafPersons.length,
    averageConnectionsPerPerson: totalConnections / totalPersons
  };
} 