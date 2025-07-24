import { describe, it, expect, vi } from 'vitest';
import { transformToFamilyChartData } from '@/utils/familyChartAdapter';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

describe('familyChartAdapter', () => {
  describe('transformToFamilyChartData', () => {
    it('should handle parents with unknown gender by assigning them to available slots', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'male' },
        { id: 'parent1', name: 'Parent 1', gender: undefined }, // Unknown gender
        { id: 'parent2', name: 'Parent 2', gender: 'female' }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'parent1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn2',
          from_person_id: 'parent2',
          to_person_id: 'child1',
          relationship_type: 'parent'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // Parent with unknown gender should be assigned to the available fid slot
      expect(childNode?.fid).toBe('parent1');
      expect(childNode?.mid).toBe('parent2');
      expect(childNode?._allParents).toEqual(['parent1', 'parent2']);
    });

    it('should handle multiple parents of the same gender', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'female' },
        { id: 'father1', name: 'Father 1', gender: 'male' },
        { id: 'father2', name: 'Father 2', gender: 'male' },
        { id: 'mother1', name: 'Mother 1', gender: 'female' }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'father1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn2',
          from_person_id: 'father2',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn3',
          from_person_id: 'mother1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // First father should be in fid, second should be in _additionalFathers
      expect(childNode?.fid).toBe('father1');
      expect(childNode?.mid).toBe('mother1');
      expect(childNode?._additionalFathers).toEqual(['father2']);
      expect(childNode?._allParents).toEqual(['father1', 'father2', 'mother1']);
    });

    it('should handle all parents with unknown gender', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'male' },
        { id: 'parent1', name: 'Parent 1', gender: undefined },
        { id: 'parent2', name: 'Parent 2', gender: null as any },
        { id: 'parent3', name: 'Parent 3', gender: undefined }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'parent1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn2',
          from_person_id: 'parent2',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn3',
          from_person_id: 'parent3',
          to_person_id: 'child1',
          relationship_type: 'parent'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // First two unknown gender parents should fill fid and mid slots
      expect(childNode?.fid).toBe('parent1');
      expect(childNode?.mid).toBe('parent2');
      // Third parent should go to _unknownGenderParents
      expect(childNode?._unknownGenderParents).toEqual(['parent3']);
      expect(childNode?._allParents).toEqual(['parent1', 'parent2', 'parent3']);
    });

    it('should handle child relationships with unknown gender parents', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'female' },
        { id: 'parent1', name: 'Parent 1', gender: undefined }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'child1',
          to_person_id: 'parent1',
          relationship_type: 'child'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // Parent with unknown gender should be assigned to fid slot (first available)
      expect(childNode?.fid).toBe('parent1');
      expect(childNode?.mid).toBeUndefined();
      expect(childNode?._allParents).toEqual(['parent1']);
    });

    it('should preserve all parent connections in _allParents array', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'male' },
        { id: 'father1', name: 'Father 1', gender: 'male' },
        { id: 'father2', name: 'Father 2', gender: 'male' },
        { id: 'mother1', name: 'Mother 1', gender: 'female' },
        { id: 'mother2', name: 'Mother 2', gender: 'female' },
        { id: 'parent1', name: 'Parent 1', gender: undefined }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'father1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn2',
          from_person_id: 'father2',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn3',
          from_person_id: 'mother1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn4',
          from_person_id: 'mother2',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn5',
          from_person_id: 'parent1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // All parents should be preserved in _allParents
      expect(childNode?._allParents).toHaveLength(5);
      expect(childNode?._allParents).toContain('father1');
      expect(childNode?._allParents).toContain('father2');
      expect(childNode?._allParents).toContain('mother1');
      expect(childNode?._allParents).toContain('mother2');
      expect(childNode?._allParents).toContain('parent1');

      // Standard fields should have first of each gender
      expect(childNode?.fid).toBe('father1');
      expect(childNode?.mid).toBe('mother1');

      // Additional parents should be in custom arrays
      expect(childNode?._additionalFathers).toEqual(['father2']);
      expect(childNode?._additionalMothers).toEqual(['mother2']);
      expect(childNode?._unknownGenderParents).toEqual(['parent1']);
    });

    it('should not duplicate parent IDs in _allParents array', () => {
      const persons: Person[] = [
        { id: 'child1', name: 'Child 1', gender: 'male' },
        { id: 'parent1', name: 'Parent 1', gender: 'male' }
      ];

      const connections: Connection[] = [
        { 
          id: 'conn1',
          from_person_id: 'parent1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        },
        { 
          id: 'conn2',
          from_person_id: 'parent1',
          to_person_id: 'child1',
          relationship_type: 'parent'
        }
      ];

      const result = transformToFamilyChartData(persons, connections);
      const childNode = result.nodes.find(n => n.id === 'child1');

      // Parent should only appear once in _allParents
      expect(childNode?._allParents).toEqual(['parent1']);
      expect(childNode?.fid).toBe('parent1');
    });
  });
});