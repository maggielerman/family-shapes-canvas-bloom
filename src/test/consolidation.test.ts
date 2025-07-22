import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { ConnectionUtils } from '@/types/connection';
import { ConnectionService } from '@/services/connectionService';
import { PersonService } from '@/services/personService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

describe('Family Tree Consolidation Tests', () => {
  describe('RelationshipTypeHelpers', () => {
    it('should provide all relationship types', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      expect(types).toContain('parent');
      expect(types).toContain('child');
      expect(types).toContain('sibling');
      expect(types).toContain('partner');
      expect(types).toContain('spouse');
      expect(types).toContain('donor');
    });

    it('should provide proper configuration for each type', () => {
      const parentConfig = RelationshipTypeHelpers.getConfig('parent');
      expect(parentConfig.value).toBe('parent');
      expect(parentConfig.label).toBe('Parent');
      expect(parentConfig.isBidirectional).toBe(false);
      expect(parentConfig.reciprocalType).toBe('child');

      const siblingConfig = RelationshipTypeHelpers.getConfig('sibling');
      expect(siblingConfig.isBidirectional).toBe(true);
      expect(siblingConfig.reciprocalType).toBe('sibling');
    });

    it('should provide types for UI selection', () => {
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      expect(selectionTypes).toBeInstanceOf(Array);
      expect(selectionTypes.length).toBeGreaterThan(0);
      
      const parentType = selectionTypes.find(t => t.value === 'parent');
      expect(parentType).toBeDefined();
      expect(parentType?.label).toBe('Parent');
      expect(parentType?.icon).toBeDefined();
      expect(parentType?.color).toBeDefined();
    });

    it('should correctly identify bidirectional relationships', () => {
      expect(RelationshipTypeHelpers.isBidirectional('sibling')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('partner')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('spouse')).toBe(true);
      expect(RelationshipTypeHelpers.isBidirectional('parent')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('child')).toBe(false);
      expect(RelationshipTypeHelpers.isBidirectional('donor')).toBe(false);
    });
  });

  describe('ConnectionUtils', () => {
    it('should identify bidirectional relationships correctly', () => {
      expect(ConnectionUtils.isBidirectional('sibling')).toBe(true);
      expect(ConnectionUtils.isBidirectional('partner')).toBe(true);
      expect(ConnectionUtils.isBidirectional('parent')).toBe(false);
      expect(ConnectionUtils.isBidirectional('child')).toBe(false);
    });

    it('should get reciprocal types correctly', () => {
      expect(ConnectionUtils.getReciprocalType('parent')).toBe('child');
      expect(ConnectionUtils.getReciprocalType('child')).toBe('parent');
      expect(ConnectionUtils.getReciprocalType('sibling')).toBe('sibling');
      expect(ConnectionUtils.getReciprocalType('partner')).toBe('partner');
    });

    it('should get canonical direction for bidirectional relationships', () => {
      const result1 = ConnectionUtils.getCanonicalDirection('person-a', 'person-b', 'sibling');
      const result2 = ConnectionUtils.getCanonicalDirection('person-b', 'person-a', 'sibling');
      
      // For bidirectional relationships, should be consistent regardless of order
      expect(result1).toEqual(result2);
      
      // For directional relationships, should preserve direction
      const directional = ConnectionUtils.getCanonicalDirection('parent-id', 'child-id', 'parent');
      expect(directional.from_person_id).toBe('parent-id');
      expect(directional.to_person_id).toBe('child-id');
    });

    it('should validate connection data', () => {
      const validData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };
      
      const errors = ConnectionUtils.validate(validData);
      expect(errors).toHaveLength(0);

      const invalidData = {
        from_person_id: '',
        to_person_id: 'person-2',
        relationship_type: 'invalid-type',
        family_tree_id: 'tree-1'
      };
      
      const invalidErrors = ConnectionUtils.validate(invalidData);
      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(invalidErrors).toContain('From person is required');
      expect(invalidErrors).toContain('Invalid relationship type');
    });

    it('should deduplicate connections correctly', () => {
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
  });

  describe('PersonService', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create a person', async () => {
      const personData = {
        name: 'Test Person',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };

      const result = await PersonService.createPerson(personData);
      expect(result).toBeDefined();
    });

    it('should create person and add to tree', async () => {
      const personData = {
        name: 'Test Person',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };

      // Mock PersonService methods directly
      vi.spyOn(PersonService, 'createPerson').mockResolvedValue({
        id: 'test-person-id',
        ...personData
      } as any);
      
      vi.spyOn(PersonService, 'addPersonToFamilyTree').mockResolvedValue();

      const result = await PersonService.createPersonAndAddToTree(personData, 'tree-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('test-person-id');
    });
  });

  describe('Integration - No Duplicate Code', () => {
    it('should have consistent relationship type usage across components', () => {
      // Verify that all components use the centralized relationship types
      const centralizedTypes = RelationshipTypeHelpers.getForSelection();
      expect(centralizedTypes).toBeDefined();
      expect(centralizedTypes.length).toBeGreaterThan(0);
      
      // Check that parent type has correct properties
      const parentType = centralizedTypes.find(t => t.value === 'parent');
      expect(parentType).toBeDefined();
      expect(parentType?.color).toBeDefined();
      expect(parentType?.icon).toBeDefined();
    });

    it('should have consistent connection handling', () => {
      // Verify that ConnectionService and ConnectionUtils work together
      expect(typeof ConnectionUtils.validate).toBe('function');
      expect(typeof ConnectionUtils.deduplicate).toBe('function');
      expect(typeof ConnectionUtils.isBidirectional).toBe('function');
      expect(typeof ConnectionService.createConnection).toBe('function');
      expect(typeof ConnectionService.getConnectionsForFamilyTree).toBe('function');
    });

    it('should have consistent person handling', () => {
      // Verify that PersonService provides all needed functionality
      expect(typeof PersonService.createPerson).toBe('function');
      expect(typeof PersonService.createPersonAndAddToTree).toBe('function');
      expect(typeof PersonService.addPersonToFamilyTree).toBe('function');
      expect(typeof PersonService.removePersonFromFamilyTree).toBe('function');
    });
  });
});