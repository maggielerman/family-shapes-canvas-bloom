import { describe, it, expect } from 'vitest';
import { RelationshipTypeHelpers, relationshipTypes } from '@/types/relationshipTypes';
import { ConnectionUtils } from '@/types/connection';

describe('Consolidation Working Tests', () => {
  describe('RelationshipTypeHelpers', () => {
    it('should provide all expected relationship types', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      expect(types).toContain('parent');
      expect(types).toContain('child');
      expect(types).toContain('sibling');
      expect(types).toContain('partner');
      expect(types).toContain('spouse');
      expect(types).toContain('donor');
      expect(types.length).toBe(11);
    });

    it('should provide types for UI selection', () => {
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      
      expect(Array.isArray(selectionTypes)).toBe(true);
      expect(selectionTypes.length).toBe(11);
      
      const parentType = selectionTypes.find(t => t.value === 'parent');
      expect(parentType).toBeDefined();
      expect(parentType?.label).toBe('Parent');
      expect(parentType?.icon).toBeDefined();
      expect(parentType?.color).toBeDefined();
    });

    it('should correctly identify bidirectional relationships', () => {
      expect(RelationshipTypeHelpers.isBidirectional('sibling')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('partner')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('parent')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('child')).toBe(false);
    });

    it('should provide correct reciprocal types', () => {
      expect(RelationshipTypeHelpers.getReciprocalType('parent')).toBe('child');
      expect(RelationshipTypeHelpers.getReciprocalType('child')).toBe('parent');
      expect(RelationshipTypeHelpers.getReciprocalType('sibling')).toBe('sibling');
      expect(RelationshipTypeHelpers.getReciprocalType('partner')).toBe('partner');
    });
  });

  describe('ConnectionUtils', () => {
    it('should validate connection data correctly', () => {
      const validData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };
      
      expect(ConnectionUtils.validate(validData)).toHaveLength(0);
    });

    it('should detect invalid connection data', () => {
      const invalidData = {
        from_person_id: '',
        to_person_id: 'person-2',
        relationship_type: 'invalid-type',
        family_tree_id: 'tree-1'
      };
      
      const errors = ConnectionUtils.validate(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('From person is required');
      expect(errors).toContain('Invalid relationship type');
    });

    it('should deduplicate bidirectional connections', () => {
      const connections = [
        {
          id: 'conn-1',
          from_person_id: 'person-a',
          to_person_id: 'person-b',
          relationship_type: 'sibling',
          family_tree_id: 'tree-1',
          group_id: null,
          organization_id: null,
          notes: null,
          metadata: null,
          created_at: null,
          updated_at: null
        },
        {
          id: 'conn-2',
          from_person_id: 'person-b',
          to_person_id: 'person-a',
          relationship_type: 'sibling',
          family_tree_id: 'tree-1',
          group_id: null,
          organization_id: null,
          notes: null,
          metadata: null,
          created_at: null,
          updated_at: null
        }
      ];

      const deduplicated = ConnectionUtils.deduplicate(connections);
      expect(deduplicated).toHaveLength(1);
    });

    it('should maintain canonical direction for bidirectional relationships', () => {
      const result1 = ConnectionUtils.getCanonicalDirection('person-z', 'person-a', 'sibling');
      const result2 = ConnectionUtils.getCanonicalDirection('person-a', 'person-z', 'sibling');
      
      expect(result1).toEqual(result2);
      expect(result1.from_person_id).toBe('person-a'); // Lexicographically smaller
      expect(result1.to_person_id).toBe('person-z');
    });

    it('should preserve direction for directional relationships', () => {
      const result = ConnectionUtils.getCanonicalDirection('parent-id', 'child-id', 'parent');
      
      expect(result.from_person_id).toBe('parent-id');
      expect(result.to_person_id).toBe('child-id');
    });
  });

  describe('Legacy Compatibility', () => {
    it('should maintain backward compatibility with relationshipTypes export', () => {
      expect(relationshipTypes).toBeDefined();
      expect(Array.isArray(relationshipTypes)).toBe(true);
      expect(relationshipTypes.length).toBe(11);
      
      relationshipTypes.forEach((type: any) => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('icon');
        expect(type).toHaveProperty('color');
      });
    });
  });

  describe('No Regressions', () => {
    it('should have all expected utility functions', () => {
      expect(typeof ConnectionUtils.isBidirectional).toBe('function');
      expect(typeof ConnectionUtils.getReciprocalType).toBe('function');
      expect(typeof ConnectionUtils.getCanonicalDirection).toBe('function');
      expect(typeof ConnectionUtils.areEquivalent).toBe('function');
      expect(typeof ConnectionUtils.deduplicate).toBe('function');
      expect(typeof ConnectionUtils.exists).toBe('function');
      expect(typeof ConnectionUtils.validate).toBe('function');
    });

    it('should have all expected helper functions', () => {
      expect(typeof RelationshipTypeHelpers.getAllTypes).toBe('function');
      expect(typeof RelationshipTypeHelpers.getConfig).toBe('function');
      expect(typeof RelationshipTypeHelpers.getForSelection).toBe('function');
      expect(typeof RelationshipTypeHelpers.getBidirectionalTypes).toBe('function');
      expect(typeof RelationshipTypeHelpers.getDirectionalTypes).toBe('function');
      expect(typeof RelationshipTypeHelpers.getIcon).toBe('function');
      expect(typeof RelationshipTypeHelpers.getColor).toBe('function');
      expect(typeof RelationshipTypeHelpers.getLabel).toBe('function');
      expect(typeof RelationshipTypeHelpers.isBidirectional).toBe('function');
      expect(typeof RelationshipTypeHelpers.getReciprocalType).toBe('function');
    });
  });

  describe('Performance', () => {
    it('should not be significantly slow for typical operations', () => {
      const start = performance.now();
      
      // Perform typical operations
      for (let i = 0; i < 100; i++) {
        RelationshipTypeHelpers.getAllTypes();
        RelationshipTypeHelpers.getForSelection();
        RelationshipTypeHelpers.isBidirectional('sibling');
        RelationshipTypeHelpers.getReciprocalType('parent');
        
        ConnectionUtils.isBidirectional('partner');
        ConnectionUtils.getReciprocalType('child');
        ConnectionUtils.getCanonicalDirection('a', 'b', 'sibling');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete quickly (generous threshold for CI environments)
      expect(duration).toBeLessThan(500);
    });
  });
});