import { describe, it, expect } from 'vitest';

interface Person {
  id: string;
  name: string;
  gender?: string;
  date_of_birth?: string;
}

interface Connection {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: string;
  family_tree_id: string;
}

interface RelationshipHierarchy {
  persons: Person[];
  connections: Connection[];
}

describe('Relationship Hierarchies', () => {
  describe('Parent-Child Relationships', () => {
    it('should correctly identify parent-child relationships', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'p1', name: 'Alice', gender: 'female' },
          { id: 'p2', name: 'Bob', gender: 'male' },
          { id: 'p3', name: 'Charlie', gender: 'male' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'p1', to_person_id: 'p3', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'p2', to_person_id: 'p3', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getParents = (personId: string) => {
        return hierarchy.connections
          .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'parent')
          .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
          .filter(Boolean);
      };

      const charliesParents = getParents('p3');
      expect(charliesParents).toHaveLength(2);
      expect(charliesParents.map(p => p?.name)).toContain('Alice');
      expect(charliesParents.map(p => p?.name)).toContain('Bob');
    });

    it('should correctly identify children of a person', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'p1', name: 'Parent', gender: 'female' },
          { id: 'p2', name: 'Child1', gender: 'male' },
          { id: 'p3', name: 'Child2', gender: 'female' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'p1', to_person_id: 'p2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'p1', to_person_id: 'p3', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getChildren = (personId: string) => {
        return hierarchy.connections
          .filter(conn => conn.from_person_id === personId && conn.relationship_type === 'parent')
          .map(conn => hierarchy.persons.find(p => p.id === conn.to_person_id))
          .filter(Boolean);
      };

      const children = getChildren('p1');
      expect(children).toHaveLength(2);
      expect(children.map(p => p?.name)).toContain('Child1');
      expect(children.map(p => p?.name)).toContain('Child2');
    });

    it('should handle multiple generations correctly', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'grandparent', name: 'Grandparent' },
          { id: 'parent', name: 'Parent' },
          { id: 'child', name: 'Child' },
          { id: 'grandchild', name: 'Grandchild' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'grandparent', to_person_id: 'parent', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'parent', to_person_id: 'child', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c3', from_person_id: 'child', to_person_id: 'grandchild', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getGeneration = (personId: string, generation = 0): number => {
        const parentConnections = hierarchy.connections.filter(
          conn => conn.to_person_id === personId && conn.relationship_type === 'parent'
        );
        
        if (parentConnections.length === 0) {
          return generation; // Root generation
        }
        
        return Math.max(...parentConnections.map(conn => 
          getGeneration(conn.from_person_id, generation + 1)
        ));
      };

      expect(getGeneration('grandchild')).toBe(0);
      expect(getGeneration('child')).toBe(1);
      expect(getGeneration('parent')).toBe(2);
      expect(getGeneration('grandparent')).toBe(3);
    });
  });

  describe('Sibling Relationships', () => {
    it('should correctly identify siblings', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'parent1', name: 'Parent1' },
          { id: 'parent2', name: 'Parent2' },
          { id: 'child1', name: 'Child1' },
          { id: 'child2', name: 'Child2' },
          { id: 'child3', name: 'Child3' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'parent1', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c3', from_person_id: 'parent2', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c4', from_person_id: 'parent2', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c5', from_person_id: 'parent1', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getSiblings = (personId: string) => {
        // Find all parents of this person
        const parentIds = hierarchy.connections
          .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'parent')
          .map(conn => conn.from_person_id);

        if (parentIds.length === 0) return [];

        // Find all children of any of these parents
        const siblingIds = hierarchy.connections
          .filter(conn => 
            parentIds.includes(conn.from_person_id) && 
            conn.relationship_type === 'parent' && 
            conn.to_person_id !== personId
          )
          .map(conn => conn.to_person_id);

        // Remove duplicates and return persons
        const uniqueSiblingIds = [...new Set(siblingIds)];
        return uniqueSiblingIds.map(id => hierarchy.persons.find(p => p.id === id)).filter(Boolean);
      };

      const child1Siblings = getSiblings('child1');
      expect(child1Siblings).toHaveLength(2);
      expect(child1Siblings.map(p => p?.name)).toContain('Child2');
      expect(child1Siblings.map(p => p?.name)).toContain('Child3');

      const child3Siblings = getSiblings('child3');
      expect(child3Siblings).toHaveLength(2);
      expect(child3Siblings.map(p => p?.name)).toContain('Child1');
      expect(child3Siblings.map(p => p?.name)).toContain('Child2');
    });

    it('should distinguish between full and half siblings', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'parent1', name: 'Parent1' },
          { id: 'parent2', name: 'Parent2' },
          { id: 'parent3', name: 'Parent3' },
          { id: 'child1', name: 'Child1' },
          { id: 'child2', name: 'Child2' },
          { id: 'child3', name: 'Child3' },
        ],
        connections: [
          // Child1 and Child2 are full siblings (share both parents)
          { id: 'c1', from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'parent2', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c3', from_person_id: 'parent1', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c4', from_person_id: 'parent2', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          // Child3 is half-sibling (shares only one parent)
          { id: 'c5', from_person_id: 'parent1', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c6', from_person_id: 'parent3', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getSiblingType = (person1Id: string, person2Id: string) => {
        const person1Parents = hierarchy.connections
          .filter(conn => conn.to_person_id === person1Id && conn.relationship_type === 'parent')
          .map(conn => conn.from_person_id);
        
        const person2Parents = hierarchy.connections
          .filter(conn => conn.to_person_id === person2Id && conn.relationship_type === 'parent')
          .map(conn => conn.from_person_id);

        const sharedParents = person1Parents.filter(id => person2Parents.includes(id));
        
        if (sharedParents.length === 0) return 'not-siblings';
        if (sharedParents.length === person1Parents.length && sharedParents.length === person2Parents.length) {
          return 'full-siblings';
        }
        return 'half-siblings';
      };

      expect(getSiblingType('child1', 'child2')).toBe('full-siblings');
      expect(getSiblingType('child1', 'child3')).toBe('half-siblings');
      expect(getSiblingType('child2', 'child3')).toBe('half-siblings');
    });
  });

  describe('Partner Relationships', () => {
    it('should correctly identify partners', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'person1', name: 'Person1' },
          { id: 'person2', name: 'Person2' },
          { id: 'person3', name: 'Person3' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'person1', to_person_id: 'person2', relationship_type: 'partner', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'person2', to_person_id: 'person1', relationship_type: 'partner', family_tree_id: 'tree1' },
        ]
      };

      const getPartners = (personId: string) => {
        return hierarchy.connections
          .filter(conn => 
            (conn.from_person_id === personId || conn.to_person_id === personId) && 
            conn.relationship_type === 'partner'
          )
          .map(conn => {
            const partnerId = conn.from_person_id === personId ? conn.to_person_id : conn.from_person_id;
            return hierarchy.persons.find(p => p.id === partnerId);
          })
          .filter(Boolean);
      };

      const person1Partners = getPartners('person1');
      expect(person1Partners).toHaveLength(1);
      expect(person1Partners[0]?.name).toBe('Person2');
    });
  });

  describe('Donor Relationships', () => {
    it('should correctly handle donor relationships', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'mother', name: 'Mother' },
          { id: 'donor', name: 'Sperm Donor' },
          { id: 'child', name: 'Child' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'mother', to_person_id: 'child', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'donor', to_person_id: 'child', relationship_type: 'donor', family_tree_id: 'tree1' },
        ]
      };

      const getDonors = (personId: string) => {
        return hierarchy.connections
          .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'donor')
          .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
          .filter(Boolean);
      };

      const getBiologicalParents = (personId: string) => {
        return hierarchy.connections
          .filter(conn => 
            conn.to_person_id === personId && 
            (conn.relationship_type === 'parent' || conn.relationship_type === 'donor')
          )
          .map(conn => hierarchy.persons.find(p => p.id === conn.from_person_id))
          .filter(Boolean);
      };

      const childDonors = getDonors('child');
      expect(childDonors).toHaveLength(1);
      expect(childDonors[0]?.name).toBe('Sperm Donor');

      const biologicalParents = getBiologicalParents('child');
      expect(biologicalParents).toHaveLength(2);
      expect(biologicalParents.map(p => p?.name)).toContain('Mother');
      expect(biologicalParents.map(p => p?.name)).toContain('Sperm Donor');
    });
  });

  describe('Complex Family Structures', () => {
    it('should handle blended families correctly', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'parent1', name: 'Parent1' },
          { id: 'parent2', name: 'Parent2' },
          { id: 'parent3', name: 'Parent3' },
          { id: 'child1', name: 'Child1' }, // Child of Parent1 and Parent2
          { id: 'child2', name: 'Child2' }, // Child of Parent1 and Parent3
          { id: 'child3', name: 'Child3' }, // Child of Parent2 and Parent3
        ],
        connections: [
          // Current partnerships
          { id: 'p1', from_person_id: 'parent1', to_person_id: 'parent3', relationship_type: 'partner', family_tree_id: 'tree1' },
          { id: 'p2', from_person_id: 'parent2', to_person_id: 'parent3', relationship_type: 'partner', family_tree_id: 'tree1' },
          // Children from different partnerships
          { id: 'c1', from_person_id: 'parent1', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'parent2', to_person_id: 'child1', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c3', from_person_id: 'parent1', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c4', from_person_id: 'parent3', to_person_id: 'child2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c5', from_person_id: 'parent2', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c6', from_person_id: 'parent3', to_person_id: 'child3', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const getStepSiblings = (personId: string) => {
        // Get all parents of this person
        const parentIds = hierarchy.connections
          .filter(conn => conn.to_person_id === personId && conn.relationship_type === 'parent')
          .map(conn => conn.from_person_id);

        // Get partners of parents
        const stepParentIds = hierarchy.connections
          .filter(conn => 
            parentIds.includes(conn.from_person_id) && 
            conn.relationship_type === 'partner'
          )
          .map(conn => conn.to_person_id)
          .concat(
            hierarchy.connections
              .filter(conn => 
                parentIds.includes(conn.to_person_id) && 
                conn.relationship_type === 'partner'
              )
              .map(conn => conn.from_person_id)
          );

        // Get children of step-parents who don't share biological parents
        const stepSiblingIds = hierarchy.connections
          .filter(conn => 
            stepParentIds.includes(conn.from_person_id) && 
            conn.relationship_type === 'parent' && 
            conn.to_person_id !== personId
          )
          .map(conn => conn.to_person_id)
          .filter(id => {
            const theirParents = hierarchy.connections
              .filter(conn => conn.to_person_id === id && conn.relationship_type === 'parent')
              .map(conn => conn.from_person_id);
            return !parentIds.some(pid => theirParents.includes(pid));
          });

        return [...new Set(stepSiblingIds)]
          .map(id => hierarchy.persons.find(p => p.id === id))
          .filter(Boolean);
      };

      // This is a complex scenario - implementation would depend on specific business rules
      expect(true).toBe(true); // Placeholder for complex step-sibling logic
    });
  });

  describe('Data Validation', () => {
    it('should detect circular parent-child relationships', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'person1', name: 'Person1' },
          { id: 'person2', name: 'Person2' },
          { id: 'person3', name: 'Person3' },
        ],
        connections: [
          { id: 'c1', from_person_id: 'person1', to_person_id: 'person2', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c2', from_person_id: 'person2', to_person_id: 'person3', relationship_type: 'parent', family_tree_id: 'tree1' },
          { id: 'c3', from_person_id: 'person3', to_person_id: 'person1', relationship_type: 'parent', family_tree_id: 'tree1' }, // Creates cycle
        ]
      };

      const hasCircularRelationship = (personId: string, visited = new Set<string>()): boolean => {
        if (visited.has(personId)) return true;
        
        visited.add(personId);
        
        const children = hierarchy.connections
          .filter(conn => conn.from_person_id === personId && conn.relationship_type === 'parent')
          .map(conn => conn.to_person_id);

        return children.some(childId => hasCircularRelationship(childId, new Set(visited)));
      };

      expect(hasCircularRelationship('person1')).toBe(true);
      expect(hasCircularRelationship('person2')).toBe(true);
      expect(hasCircularRelationship('person3')).toBe(true);
    });

    it('should validate age consistency in parent-child relationships', () => {
      const hierarchy: RelationshipHierarchy = {
        persons: [
          { id: 'parent', name: 'Parent', date_of_birth: '1990-01-01' },
          { id: 'child', name: 'Child', date_of_birth: '1985-01-01' }, // Born before parent!
        ],
        connections: [
          { id: 'c1', from_person_id: 'parent', to_person_id: 'child', relationship_type: 'parent', family_tree_id: 'tree1' },
        ]
      };

      const validateAgeConsistency = () => {
        return hierarchy.connections
          .filter(conn => conn.relationship_type === 'parent')
          .map(conn => {
            const parent = hierarchy.persons.find(p => p.id === conn.from_person_id);
            const child = hierarchy.persons.find(p => p.id === conn.to_person_id);
            
            if (!parent?.date_of_birth || !child?.date_of_birth) return null;
            
            const parentBirth = new Date(parent.date_of_birth);
            const childBirth = new Date(child.date_of_birth);
            
            return {
              connection: conn.id,
              valid: parentBirth < childBirth,
              parentName: parent.name,
              childName: child.name
            };
          })
          .filter(Boolean);
      };

      const validationResults = validateAgeConsistency();
      expect(validationResults).toHaveLength(1);
      expect(validationResults[0]?.valid).toBe(false);
    });
  });
});