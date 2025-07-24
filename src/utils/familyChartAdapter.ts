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
  // Custom fields for handling complex family structures
  _additionalFathers?: string[];    // Additional fathers when multiple exist
  _additionalMothers?: string[];    // Additional mothers when multiple exist
  _unknownGenderParents?: string[]; // Parents with unknown gender
  _personData?: Person;             // Original person data
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
          if (toNode.fid && toNode.fid !== fromNode.id) {
            // Multiple fathers - store additional fathers in custom array
            if (!toNode._additionalFathers) toNode._additionalFathers = [];
            toNode._additionalFathers.push(fromNode.id);
            console.warn(`familyChartAdapter: Multiple fathers detected for ${toNode.name}. Additional father ${fromNode.name} stored in _additionalFathers array.`);
          } else {
            toNode.fid = fromNode.id;
          }
        } else if (fromNode.gender === 'F') {
          if (toNode.mid && toNode.mid !== fromNode.id) {
            // Multiple mothers - store additional mothers in custom array
            if (!toNode._additionalMothers) toNode._additionalMothers = [];
            toNode._additionalMothers.push(fromNode.id);
            console.warn(`familyChartAdapter: Multiple mothers detected for ${toNode.name}. Additional mother ${fromNode.name} stored in _additionalMothers array.`);
          } else {
            toNode.mid = fromNode.id;
          }
        } else {
          // Gender unknown - store in a generic parents array
          if (!toNode._unknownGenderParents) toNode._unknownGenderParents = [];
          toNode._unknownGenderParents.push(fromNode.id);
          console.warn(`familyChartAdapter: Parent ${fromNode.name} has unknown gender for child ${toNode.name}. Stored in _unknownGenderParents array.`);
        }
        
        console.log('familyChartAdapter: Set parent relationship:', fromNode.name, '->', toNode.name);
        break;
        
      case 'child':
        // from_person is child of to_person
        // Set parent IDs on the child node
        if (toNode.gender === 'M') {
          if (fromNode.fid && fromNode.fid !== toNode.id) {
            // Multiple fathers - store additional fathers in custom array
            if (!fromNode._additionalFathers) fromNode._additionalFathers = [];
            fromNode._additionalFathers.push(toNode.id);
            console.warn(`familyChartAdapter: Multiple fathers detected for ${fromNode.name}. Additional father ${toNode.name} stored in _additionalFathers array.`);
          } else {
            fromNode.fid = toNode.id;
          }
        } else if (toNode.gender === 'F') {
          if (fromNode.mid && fromNode.mid !== toNode.id) {
            // Multiple mothers - store additional mothers in custom array
            if (!fromNode._additionalMothers) fromNode._additionalMothers = [];
            fromNode._additionalMothers.push(toNode.id);
            console.warn(`familyChartAdapter: Multiple mothers detected for ${fromNode.name}. Additional mother ${toNode.name} stored in _additionalMothers array.`);
          } else {
            fromNode.mid = toNode.id;
          }
        } else {
          // Gender unknown - store in a generic parents array
          if (!fromNode._unknownGenderParents) fromNode._unknownGenderParents = [];
          fromNode._unknownGenderParents.push(toNode.id);
          console.warn(`familyChartAdapter: Parent ${toNode.name} has unknown gender for child ${fromNode.name}. Stored in _unknownGenderParents array.`);
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

/**
 * Utility function to get all parent IDs for a node, including those in custom fields
 */
export function getAllParentIds(node: FamilyChartNode): string[] {
  const parents: string[] = [];
  
  if (node.fid) parents.push(node.fid);
  if (node.mid) parents.push(node.mid);
  if (node._additionalFathers) parents.push(...node._additionalFathers);
  if (node._additionalMothers) parents.push(...node._additionalMothers);
  if (node._unknownGenderParents) parents.push(...node._unknownGenderParents);
  
  return parents;
}

/**
 * Get detailed parent information for a node
 */
export function getParentInfo(node: FamilyChartNode): {
  primary: { fathers: string[], mothers: string[] },
  additional: { fathers: string[], mothers: string[] },
  unknownGender: string[],
  total: number
} {
  return {
    primary: {
      fathers: node.fid ? [node.fid] : [],
      mothers: node.mid ? [node.mid] : []
    },
    additional: {
      fathers: node._additionalFathers || [],
      mothers: node._additionalMothers || []
    },
    unknownGender: node._unknownGenderParents || [],
    total: getAllParentIds(node).length
  };
} 