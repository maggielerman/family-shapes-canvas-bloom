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
  const nodeMap = new Map<string, FamilyChartNode>();
  
  // Initialize all persons as nodes with the correct structure
  persons.forEach(person => {
    const node: FamilyChartNode = {
      id: person.id,
      name: person.name || 'Unknown',
      gender: person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : undefined,
      birthday: person.date_of_birth || undefined,
      avatar: person.profile_photo_url || undefined,
      // Store the original person data for reference
      _personData: person
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
        // Set parent IDs on the child node
        if (fromNode.gender === 'M') {
          toNode.fid = fromNode.id;
        } else if (fromNode.gender === 'F') {
          toNode.mid = fromNode.id;
        }
        // If gender is unknown, we can't determine if mother or father
        // You might want to handle this case differently based on your needs
        
        console.log('familyChartAdapter: Set parent relationship:', fromNode.name, '->', toNode.name);
        break;
        
      case 'child':
        // from_person is child of to_person
        // Set parent IDs on the child node
        if (toNode.gender === 'M') {
          fromNode.fid = toNode.id;
        } else if (toNode.gender === 'F') {
          fromNode.mid = toNode.id;
        }
        
        console.log('familyChartAdapter: Set parent relationship:', toNode.name, '->', fromNode.name);
        break;
        
      case 'spouse':
      case 'partner':
        // Add partners/spouses using pids array
        if (!fromNode.pids) fromNode.pids = [];
        if (!toNode.pids) toNode.pids = [];
        
        if (!fromNode.pids.includes(toNode.id)) {
          fromNode.pids.push(toNode.id);
        }
        if (!toNode.pids.includes(fromNode.id)) {
          toNode.pids.push(fromNode.id);
        }
        console.log('familyChartAdapter: Set partner relationship:', fromNode.name, '<->', toNode.name);
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