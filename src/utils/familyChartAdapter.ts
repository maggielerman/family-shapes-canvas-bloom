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
  img?: string;
  // Custom fields for handling complex family structures
  _additionalFathers?: string[];    // Additional fathers when multiple exist
  _additionalMothers?: string[];    // Additional mothers when multiple exist
  _unknownGenderParents?: string[]; // Parents with unknown gender
  _allParents?: string[];           // All parent IDs for reference
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
      img: person.profile_photo_url || undefined,
      pids: [], // Initialize partner IDs array
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
        // Store all parents in a custom array for reference
        if (!toNode._allParents) toNode._allParents = [];
        if (!toNode._allParents.includes(fromNode.id)) {
          toNode._allParents.push(fromNode.id);
        }
        
        // Set parent IDs on the child node
        if (fromNode.gender === 'M') {
          if (toNode.fid && toNode.fid !== fromNode.id) {
            // Multiple fathers - store additional fathers in custom array
            if (!toNode._additionalFathers) toNode._additionalFathers = [];
            if (!toNode._additionalFathers.includes(fromNode.id)) {
              toNode._additionalFathers.push(fromNode.id);
              console.warn(`familyChartAdapter: Multiple fathers detected for ${toNode.name}. Additional father ${fromNode.name} stored in _additionalFathers array.`);
            }
          } else {
            toNode.fid = fromNode.id;
          }
        } else if (fromNode.gender === 'F') {
          if (toNode.mid && toNode.mid !== fromNode.id) {
            // Multiple mothers - store additional mothers in custom array
            if (!toNode._additionalMothers) toNode._additionalMothers = [];
            if (!toNode._additionalMothers.includes(fromNode.id)) {
              toNode._additionalMothers.push(fromNode.id);
              console.warn(`familyChartAdapter: Multiple mothers detected for ${toNode.name}. Additional mother ${fromNode.name} stored in _additionalMothers array.`);
            }
          } else {
            toNode.mid = fromNode.id;
          }
        } else {
          // Gender unknown - try to assign to available parent slot
          // First check if this parent is already assigned
          if (toNode.fid === fromNode.id || toNode.mid === fromNode.id) {
            // Parent already assigned, skip
            console.log(`familyChartAdapter: Parent ${fromNode.name} already assigned to ${toNode.name}, skipping duplicate.`);
          } else if (!toNode.fid) {
            // No father assigned yet, use this slot
            toNode.fid = fromNode.id;
            console.warn(`familyChartAdapter: Parent ${fromNode.name} with unknown gender assigned as father for ${toNode.name}.`);
          } else if (!toNode.mid) {
            // No mother assigned yet, use this slot
            toNode.mid = fromNode.id;
            console.warn(`familyChartAdapter: Parent ${fromNode.name} with unknown gender assigned as mother for ${toNode.name}.`);
          } else {
            // Both slots filled, store in unknown gender parents array
            if (!toNode._unknownGenderParents) toNode._unknownGenderParents = [];
            if (!toNode._unknownGenderParents.includes(fromNode.id)) {
              toNode._unknownGenderParents.push(fromNode.id);
              console.warn(`familyChartAdapter: Parent ${fromNode.name} has unknown gender and cannot be assigned to standard slots for child ${toNode.name}. Stored in _unknownGenderParents array.`);
            }
          }
        }
        
        console.log('familyChartAdapter: Set parent relationship:', fromNode.name, '->', toNode.name);
        break;
        
      case 'child':
        // from_person is child of to_person
        // Store all parents in a custom array for reference
        if (!fromNode._allParents) fromNode._allParents = [];
        if (!fromNode._allParents.includes(toNode.id)) {
          fromNode._allParents.push(toNode.id);
        }
        
        // Set parent IDs on the child node
        if (toNode.gender === 'M') {
          if (fromNode.fid && fromNode.fid !== toNode.id) {
            // Multiple fathers - store additional fathers in custom array
            if (!fromNode._additionalFathers) fromNode._additionalFathers = [];
            if (!fromNode._additionalFathers.includes(toNode.id)) {
              fromNode._additionalFathers.push(toNode.id);
              console.warn(`familyChartAdapter: Multiple fathers detected for ${fromNode.name}. Additional father ${toNode.name} stored in _additionalFathers array.`);
            }
          } else {
            fromNode.fid = toNode.id;
          }
        } else if (toNode.gender === 'F') {
          if (fromNode.mid && fromNode.mid !== toNode.id) {
            // Multiple mothers - store additional mothers in custom array
            if (!fromNode._additionalMothers) fromNode._additionalMothers = [];
            if (!fromNode._additionalMothers.includes(toNode.id)) {
              fromNode._additionalMothers.push(toNode.id);
              console.warn(`familyChartAdapter: Multiple mothers detected for ${fromNode.name}. Additional mother ${toNode.name} stored in _additionalMothers array.`);
            }
          } else {
            fromNode.mid = toNode.id;
          }
        } else {
          // Gender unknown - try to assign to available parent slot
          // First check if this parent is already assigned
          if (fromNode.fid === toNode.id || fromNode.mid === toNode.id) {
            // Parent already assigned, skip
            console.log(`familyChartAdapter: Parent ${toNode.name} already assigned to ${fromNode.name}, skipping duplicate.`);
          } else if (!fromNode.fid) {
            // No father assigned yet, use this slot
            fromNode.fid = toNode.id;
            console.warn(`familyChartAdapter: Parent ${toNode.name} with unknown gender assigned as father for ${fromNode.name}.`);
          } else if (!fromNode.mid) {
            // No mother assigned yet, use this slot
            fromNode.mid = toNode.id;
            console.warn(`familyChartAdapter: Parent ${toNode.name} with unknown gender assigned as mother for ${fromNode.name}.`);
          } else {
            // Both slots filled, store in unknown gender parents array
            if (!fromNode._unknownGenderParents) fromNode._unknownGenderParents = [];
            if (!fromNode._unknownGenderParents.includes(toNode.id)) {
              fromNode._unknownGenderParents.push(toNode.id);
              console.warn(`familyChartAdapter: Parent ${toNode.name} has unknown gender and cannot be assigned to standard slots for child ${fromNode.name}. Stored in _unknownGenderParents array.`);
            }
          }
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
 * Alternative transformation that creates a simpler, flatter structure
 * This is more commonly used by D3-based family tree libraries
 */
export function transformToSimpleFamilyData(
  persons: Person[],
  connections: Connection[]
): any[] {
  console.log('familyChartAdapter: Creating simple family data structure');
  
  // Create nodes with basic properties
  const nodes = persons.map(person => {
    const node: any = {
      id: person.id,
      name: person.name || 'Unknown',
      gender: person.gender === 'male' ? 'male' : person.gender === 'female' ? 'female' : undefined,
      img: person.profile_photo_url || undefined,
      // Store the original person data
      _data: person
    };
    
    // Find parent connections
    // Case 1: relationship_type is 'parent' and from_person is the parent of to_person (current person)
    // Case 2: relationship_type is 'child' and to_person is the parent of from_person (current person)
    const parentConnections = connections.filter(conn => {
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        // from_person is parent of current person
        return true;
      }
      if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        // to_person is parent of current person
        return true;
      }
      return false;
    });
    
    // Find spouse connections
    const spouseConnections = connections.filter(
      conn => (conn.from_person_id === person.id || conn.to_person_id === person.id) &&
      (conn.relationship_type === 'spouse' || conn.relationship_type === 'partner')
    );
    
    // Set parent IDs
    parentConnections.forEach(conn => {
      let parentId: string;
      
      // Determine which person is the parent based on relationship type
      if (conn.relationship_type === 'parent' && conn.to_person_id === person.id) {
        // from_person is the parent
        parentId = conn.from_person_id;
      } else if (conn.relationship_type === 'child' && conn.from_person_id === person.id) {
        // to_person is the parent
        parentId = conn.to_person_id;
      } else {
        return; // Skip if we can't determine the parent
      }
      
      const parent = persons.find(p => p.id === parentId);
      if (parent) {
        if (parent.gender === 'male') {
          // Only set if not already set (to prevent overwriting)
          if (!node.fid) {
            node.fid = parent.id; // father id
          }
        } else if (parent.gender === 'female') {
          // Only set if not already set (to prevent overwriting)
          if (!node.mid) {
            node.mid = parent.id; // mother id
          }
        } else {
          // If gender is unknown, use fallback logic similar to transformToFamilyChartData
          if (!node.mid) {
            node.mid = parent.id;
          } else if (!node.fid) {
            node.fid = parent.id;
          }
        }
      }
    });
    
    // Set partner IDs (pids)
    node.pids = [];
    spouseConnections.forEach(conn => {
      const partnerId = conn.from_person_id === person.id ? conn.to_person_id : conn.from_person_id;
      if (!node.pids.includes(partnerId)) {
        node.pids.push(partnerId);
      }
    });
    
    // Keep empty pids arrays to maintain consistency with transformToFamilyChartData
    // (removed the deletion of empty pids)
    
    return node;
  });
  
  console.log('familyChartAdapter: Simple nodes created:', nodes);
  return nodes;
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
  // In family-chart format, a node without parents has no mid (mother) and no fid (father)
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