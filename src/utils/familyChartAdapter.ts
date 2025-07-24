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
        if (!toNode.rels.parents.includes(fromNode.id)) {
          toNode.rels.parents.push(fromNode.id);
        }
        
        if (!fromNode.rels.children) fromNode.rels.children = [];
        if (!fromNode.rels.children.includes(toNode.id)) {
          fromNode.rels.children.push(toNode.id);
        }
        
        console.log('familyChartAdapter: Set parent relationship:', fromNode.data.name, '->', toNode.data.name);
        break;
        
      case 'child':
        // from_person is child of to_person
        if (!fromNode.rels.parents) fromNode.rels.parents = [];
        if (!fromNode.rels.parents.includes(toNode.id)) {
          fromNode.rels.parents.push(toNode.id);
        }
        
        if (!toNode.rels.children) toNode.rels.children = [];
        if (!toNode.rels.children.includes(fromNode.id)) {
          toNode.rels.children.push(fromNode.id);
        }
        
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
          node.fid = parent.id; // father id
        } else if (parent.gender === 'female') {
          node.mid = parent.id; // mother id
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
    
    if (node.pids.length === 0) {
      delete node.pids;
    }
    
    return node;
  });
  
  console.log('familyChartAdapter: Simple nodes created:', nodes);
  return nodes;
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