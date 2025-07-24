import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

export interface FamilyChartNode {
  id: string;
  pids?: string[];  // Partner/spouse IDs
  mid?: string;     // Mother ID
  fid?: string;     // Father ID
  name: string;
  gender?: 'M' | 'F';
  birthday?: string;
  avatar?: string;
  [key: string]: any;
}

export interface FamilyChartData {
  nodes: FamilyChartNode[];
}

/**
 * Transforms our Person/Connection data to family-chart library format
 */
export function transformToFamilyChartData(
  persons: Person[], 
  connections: Connection[]
): FamilyChartData {
  // Create a map to build relationships
  const nodeMap = new Map<string, FamilyChartNode>();
  
  // Initialize all persons as nodes
  persons.forEach(person => {
    const node: FamilyChartNode = {
      id: person.id,
      name: person.name || 'Unknown',
      gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
      birthday: person.date_of_birth || undefined,
      avatar: person.profile_photo_url || undefined,
      // Add additional data for reference
      person: person
    };
    
    nodeMap.set(person.id, node);
  });

  // Process connections to establish relationships
  connections.forEach(connection => {
    const fromNode = nodeMap.get(connection.from_person_id);
    const toNode = nodeMap.get(connection.to_person_id);
    
    if (!fromNode || !toNode) return;

    switch (connection.relationship_type) {
      case 'parent':
        // from_person is parent of to_person
        if (fromNode.gender === 'M') {
          toNode.fid = fromNode.id; // Father
        } else if (fromNode.gender === 'F') {
          toNode.mid = fromNode.id; // Mother
        }
        break;
        
      case 'child':
        // from_person is child of to_person
        if (toNode.gender === 'M') {
          fromNode.fid = toNode.id; // Father
        } else if (toNode.gender === 'F') {
          fromNode.mid = toNode.id; // Mother
        }
        break;
        
      case 'spouse':
      case 'partner':
        // Add partners/spouses
        if (!fromNode.pids) fromNode.pids = [];
        if (!toNode.pids) toNode.pids = [];
        
        if (!fromNode.pids.includes(toNode.id)) {
          fromNode.pids.push(toNode.id);
        }
        if (!toNode.pids.includes(fromNode.id)) {
          toNode.pids.push(fromNode.id);
        }
        break;
        
      // Note: Other relationship types like 'sibling' are typically derived 
      // from parent relationships in family-chart, so we don't need to handle them explicitly
    }
  });

  return {
    nodes: Array.from(nodeMap.values())
  };
}

/**
 * Find the root node for the family tree (typically the oldest generation or marked as self)
 */
export function findRootNode(nodes: FamilyChartNode[], persons: Person[]): string | undefined {
  // First, try to find a person marked as self
  const selfPerson = persons.find(p => p.is_self === true);
  if (selfPerson) {
    return selfPerson.id;
  }
  
  // If no self person, find someone without parents (root of tree)
  const rootNode = nodes.find(node => !node.mid && !node.fid);
  if (rootNode) {
    return rootNode.id;
  }
  
  // Fallback to first node
  return nodes.length > 0 ? nodes[0].id : undefined;
} 