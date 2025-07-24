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
  console.log('familyChartAdapter: Starting transformation with', persons.length, 'persons and', connections.length, 'connections');
  
  // Create a map to build relationships
  const nodeMap = new Map<string, any>();
  
  // Initialize all persons as nodes with the correct structure
  persons.forEach(person => {
    const node = {
      id: person.id,
      data: {
        name: person.name || 'Unknown',
        gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
        birthday: person.date_of_birth || undefined,
        avatar: person.profile_photo_url || undefined,
        // Add additional data for reference
        person: person
      },
      rels: {
        spouses: [],
        children: [],
        parents: []
      }
    };
    
    nodeMap.set(person.id, node);
  });

  console.log('familyChartAdapter: Created initial nodes:', Array.from(nodeMap.values()));

  // Process connections to establish relationships
  connections.forEach(connection => {
    const fromNode = nodeMap.get(connection.from_person_id);
    const toNode = nodeMap.get(connection.to_person_id);
    
    if (!fromNode || !toNode) {
      console.log('familyChartAdapter: Skipping connection - node not found:', connection);
      return;
    }

    switch (connection.relationship_type) {
      case 'parent':
        // from_person is parent of to_person
        if (!toNode.rels.parents) toNode.rels.parents = [];
        toNode.rels.parents.push(fromNode.id);
        
        if (!fromNode.rels.children) fromNode.rels.children = [];
        fromNode.rels.children.push(toNode.id);
        
        console.log('familyChartAdapter: Set parent relationship:', fromNode.data.name, '->', toNode.data.name);
        break;
        
      case 'child':
        // from_person is child of to_person
        if (!fromNode.rels.parents) fromNode.rels.parents = [];
        fromNode.rels.parents.push(toNode.id);
        
        if (!toNode.rels.children) toNode.rels.children = [];
        toNode.rels.children.push(fromNode.id);
        
        console.log('familyChartAdapter: Set parent relationship:', toNode.data.name, '->', fromNode.data.name);
        break;
        
      case 'spouse':
      case 'partner':
        // Add partners/spouses
        if (!fromNode.rels.spouses) fromNode.rels.spouses = [];
        if (!toNode.rels.spouses) toNode.rels.spouses = [];
        
        if (!fromNode.rels.spouses.includes(toNode.id)) {
          fromNode.rels.spouses.push(toNode.id);
        }
        if (!toNode.rels.spouses.includes(fromNode.id)) {
          toNode.rels.spouses.push(fromNode.id);
        }
        console.log('familyChartAdapter: Set partner relationship:', fromNode.data.name, '<->', toNode.data.name);
        break;
        
      // Note: Other relationship types like 'sibling' are typically derived 
      // from parent relationships in family-chart, so we don't need to handle them explicitly
    }
  });

  const result = {
    nodes: Array.from(nodeMap.values())
  };
  
  console.log('familyChartAdapter: Final transformed data:', result);
  return result;
}

/**
 * Find the root node for the family tree (typically the oldest generation or marked as self)
 */
export function findRootNode(nodes: any[], persons: Person[]): string | undefined {
  // First, try to find a person marked as self
  const selfPerson = persons.find(p => p.is_self === true);
  if (selfPerson) {
    return selfPerson.id;
  }
  
  // If no self person, find someone without parents (root of tree)
  const rootNode = nodes.find(node => !node.rels.parents || node.rels.parents.length === 0);
  if (rootNode) {
    return rootNode.id;
  }
  
  // Fallback to first node
  return nodes.length > 0 ? nodes[0].id : undefined;
} 