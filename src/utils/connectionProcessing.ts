import { Person } from '@/types/person';
import { Connection } from '@/types/connection';
import { calculateGenerations, getGenerationalConnections, GenerationInfo } from './generationUtils';

export interface ProcessedConnections {
  validConnections: Connection[];
  generationalConnections: Connection[];
  generationMap: Map<string, GenerationInfo>;
  nodes: Person[];
}

/**
 * Standardized connection processing for all layout components
 * This ensures consistent connection filtering and generation calculation across all layouts
 */
export function processConnections(
  persons: Person[], 
  connections: Connection[]
): ProcessedConnections {
  // Filter connections to only include those between persons in this family tree
  const validPersonIds = new Set(persons.map(p => p.id));
  const validConnections = connections.filter(c => 
    validPersonIds.has(c.from_person_id) && validPersonIds.has(c.to_person_id)
  );

  // Calculate generations for color coding
  const generationMap = calculateGenerations(persons as any[], validConnections.map(c => ({
    id: c.id,
    from_person_id: c.from_person_id,
    to_person_id: c.to_person_id,
    relationship_type: c.relationship_type,
    family_tree_id: c.family_tree_id
  })));

  // Use only generational connections for tree structure
  const generationalConnections = getGenerationalConnections(validConnections.map(c => ({
    id: c.id,
    from_person_id: c.from_person_id,
    to_person_id: c.to_person_id,
    relationship_type: c.relationship_type,
    family_tree_id: c.family_tree_id
  })));

  return {
    validConnections,
    generationalConnections: generationalConnections as any[],
    generationMap,
    nodes: persons
  };
}

/**
 * Create hierarchical data structure for D3 tree/cluster layouts
 * This converts the processed connections into a hierarchical structure
 */
export function createHierarchyFromProcessedConnections(
  processed: ProcessedConnections
): Person | null {
  const { nodes, generationalConnections } = processed;
  
  if (nodes.length === 0) return null;

  // Find root person (someone who is not a child in generational connections)
  const childIds = new Set(generationalConnections.map(c => c.to_person_id));
  const rootPersons = nodes.filter(p => !childIds.has(p.id));
  
  // If we have a root person, use it; otherwise use the first person
  const root = rootPersons[0] || nodes[0];
  
  // Build the tree using the direct connection approach
  const tree = buildTreeFromConnections(root, nodes, generationalConnections, new Set());
  
  // Find persons not connected to the main tree
  const connectedIds = new Set<string>();
  collectConnectedIds(tree, connectedIds);
  
  const unconnectedPersons = nodes.filter(p => p.id !== root.id && !connectedIds.has(p.id));
  
  // Add unconnected persons as direct children of root if they exist
  if (unconnectedPersons.length > 0) {
    const existingChildren = tree.children || [];
    tree.children = [
      ...existingChildren,
      ...unconnectedPersons.map(p => ({ ...p, children: undefined }))
    ];
  }
  
  return tree;
}

/**
 * Build tree structure from connections
 */
function buildTreeFromConnections(
  person: Person, 
  allPersons: Person[], 
  connections: any[], 
  visited: Set<string>
): Person & { children?: (Person & { children?: any[] })[] } {
  if (visited.has(person.id)) return person;
  visited.add(person.id);

  const children = connections
    .filter(c => c.from_person_id === person.id)
    .map(c => allPersons.find(p => p.id === c.to_person_id))
    .filter(p => p && !visited.has(p.id))
    .map(p => buildTreeFromConnections(p!, allPersons, connections, visited));

  return {
    ...person,
    children: children.length > 0 ? children : undefined
  };
}

/**
 * Collect all connected person IDs
 */
function collectConnectedIds(node: Person & { children?: any[] }, connectedIds: Set<string>) {
  connectedIds.add(node.id);
  if (node.children) {
    node.children.forEach((child: any) => collectConnectedIds(child, connectedIds));
  }
} 