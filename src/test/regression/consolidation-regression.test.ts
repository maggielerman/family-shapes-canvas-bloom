import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RelationshipTypeHelpers } from '@/types/relationshipTypes';
import { ConnectionUtils, RelationshipType } from '@/types/connection';
import { ConnectionService } from '@/services/connectionService';
import { PersonService } from '@/services/personService';

// Mock Supabase for all tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
        })
      }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis()
    }))
  }
}));

describe('Consolidation Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('No Breaking Changes', () => {
    it('should maintain all relationship types from before consolidation', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      // Ensure all expected relationship types exist
      const expectedTypes = [
        'parent', 'child', 'partner', 'sibling', 'half_sibling',
        'step_sibling', 'spouse', 'donor', 'biological_parent',
        'social_parent', 'other'
      ];
      
      expectedTypes.forEach(type => {
        expect(types).toContain(type);
      });
      
      expect(types.length).toBe(expectedTypes.length);
    });

    it('should maintain backward compatibility with legacy relationshipTypes export', async () => {
      // Import the legacy export to ensure it still exists
      const { relationshipTypes } = await import('@/types/relationshipTypes');
      
      expect(relationshipTypes).toBeDefined();
      expect(Array.isArray(relationshipTypes)).toBe(true);
      expect(relationshipTypes.length).toBeGreaterThan(0);
      
      // Should have the same structure as before
      relationshipTypes.forEach((type: any) => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('icon');
        expect(type).toHaveProperty('color');
      });
    });

    it('should maintain all ConnectionUtils functions', () => {
      // Verify all expected utility functions exist
      expect(typeof ConnectionUtils.isBidirectional).toBe('function');
      expect(typeof ConnectionUtils.getReciprocalType).toBe('function');
      expect(typeof ConnectionUtils.getCanonicalDirection).toBe('function');
      expect(typeof ConnectionUtils.areEquivalent).toBe('function');
      expect(typeof ConnectionUtils.deduplicate).toBe('function');
      expect(typeof ConnectionUtils.exists).toBe('function');
      expect(typeof ConnectionUtils.validate).toBe('function');
    });

    it('should maintain all ConnectionService methods', () => {
      // Verify all expected service methods exist
      expect(typeof ConnectionService.createConnection).toBe('function');
      expect(typeof ConnectionService.createConnectionWithReciprocal).toBe('function');
      expect(typeof ConnectionService.getConnectionsForPerson).toBe('function');
      expect(typeof ConnectionService.getConnectionsForFamilyTree).toBe('function');
      expect(typeof ConnectionService.updateConnection).toBe('function');
      expect(typeof ConnectionService.updateConnectionWithReciprocal).toBe('function');
      expect(typeof ConnectionService.deleteConnection).toBe('function');
      expect(typeof ConnectionService.deleteConnectionWithReciprocal).toBe('function');
      expect(typeof ConnectionService.connectionExists).toBe('function');
    });

    it('should maintain all PersonService methods', () => {
      // Verify all expected service methods exist
      expect(typeof PersonService.createPerson).toBe('function');
      expect(typeof PersonService.addPersonToFamilyTree).toBe('function');
      expect(typeof PersonService.createPersonAndAddToTree).toBe('function');
      expect(typeof PersonService.removePersonFromFamilyTree).toBe('function');
      expect(typeof PersonService.getPersonsInFamilyTree).toBe('function');
      expect(typeof PersonService.updatePerson).toBe('function');
      expect(typeof PersonService.deletePerson).toBe('function');
    });
  });

  describe('Functional Regression Tests', () => {
    it('should correctly identify bidirectional relationships as before', () => {
      // Test that bidirectional logic hasn't changed
      expect(ConnectionUtils.isBidirectional('sibling')).toBe(true);
      expect(ConnectionUtils.isBidirectional('partner')).toBe(true);
      expect(ConnectionUtils.isBidirectional('spouse')).toBe(true);
      expect(ConnectionUtils.isBidirectional('parent')).toBe(false);
      expect(ConnectionUtils.isBidirectional('child')).toBe(false);
      expect(ConnectionUtils.isBidirectional('donor')).toBe(false);
    });

    it('should correctly get reciprocal types as before', () => {
      // Test that reciprocal logic hasn't changed
      expect(ConnectionUtils.getReciprocalType('parent')).toBe('child');
      expect(ConnectionUtils.getReciprocalType('child')).toBe('parent');
      expect(ConnectionUtils.getReciprocalType('sibling')).toBe('sibling');
      expect(ConnectionUtils.getReciprocalType('partner')).toBe('partner');
      expect(ConnectionUtils.getReciprocalType('donor')).toBe('child');
    });

    it('should maintain canonical direction logic', () => {
      // Test bidirectional canonical direction
      const result1 = ConnectionUtils.getCanonicalDirection('person-z', 'person-a', 'sibling');
      const result2 = ConnectionUtils.getCanonicalDirection('person-a', 'person-z', 'sibling');
      
      expect(result1).toEqual(result2);
      expect(result1.from_person_id).toBe('person-a'); // Lexicographically smaller
      expect(result1.to_person_id).toBe('person-z');

      // Test directional relationship
      const directional = ConnectionUtils.getCanonicalDirection('parent-id', 'child-id', 'parent');
      expect(directional.from_person_id).toBe('parent-id');
      expect(directional.to_person_id).toBe('child-id');
    });

    it('should maintain validation logic', () => {
      // Valid connection
      const validData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };
      
      expect(ConnectionUtils.validate(validData)).toHaveLength(0);

      // Invalid connection (self-relationship)
      const selfConnection = {
        from_person_id: 'person-1',
        to_person_id: 'person-1',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };
      
      const errors = ConnectionUtils.validate(selfConnection);
      expect(errors).toContain('A person cannot have a relationship with themselves');

      // Invalid relationship type
      const invalidType = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'invalid-type',
        family_tree_id: 'tree-1'
      };
      
      const typeErrors = ConnectionUtils.validate(invalidType);
      expect(typeErrors).toContain('Invalid relationship type');
    });

    it('should maintain deduplication logic', () => {
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

  describe('Service Integration Tests', () => {
    it('should maintain connection creation flow', async () => {
      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent' as RelationshipType,
        family_tree_id: 'tree-1'
      };

      // Should not throw and should call expected Supabase methods
      await expect(ConnectionService.createConnection(connectionData)).resolves.toBeDefined();
    });

    it('should maintain person creation flow', async () => {
      const personData = {
        name: 'Test Person',
        date_of_birth: '1990-01-01',
        gender: 'male',
        status: 'living'
      };

      // Should not throw and should call expected Supabase methods
      await expect(PersonService.createPerson(personData)).resolves.toBeDefined();
    });

    it('should maintain person and tree association flow', async () => {
      const personData = {
        name: 'Test Person',
        date_of_birth: '1990-01-01',
        gender: 'male',
        status: 'living'
      };

      // Should not throw and should complete both operations
      await expect(
        PersonService.createPersonAndAddToTree(personData, 'tree-1')
      ).resolves.toBeDefined();
    });
  });

  describe('Type Safety Regression', () => {
    it('should maintain type safety for relationship types', () => {
      const types = RelationshipTypeHelpers.getAllTypes();
      
      types.forEach(type => {
        // Should be able to get config without TypeScript errors
        const config = RelationshipTypeHelpers.getConfig(type);
        expect(config).toBeDefined();
        expect(config.value).toBe(type);
        
        // Should be able to check bidirectionality
        const isBidirectional = RelationshipTypeHelpers.isBidirectional(type);
        expect(typeof isBidirectional).toBe('boolean');
        
        // Should be able to get reciprocal type
        const reciprocal = RelationshipTypeHelpers.getReciprocalType(type);
        expect(reciprocal === null || typeof reciprocal === 'string').toBe(true);
      });
    });

    it('should maintain type compatibility with existing interfaces', () => {
      // Test that the consolidated types are compatible with expected interfaces
      const selectionTypes = RelationshipTypeHelpers.getForSelection();
      
      selectionTypes.forEach(type => {
        expect(typeof type.value).toBe('string');
        expect(typeof type.label).toBe('string');
        expect(typeof type.color).toBe('string');
        expect(type.icon).toBeDefined();
      });
    });
  });

  describe('Error Handling Regression', () => {
    it('should maintain proper error handling in services', async () => {
      // Import the mock to control it
      const { mockConnectionService } = await import('../setup');
      
      // Mock the service to throw an error
      mockConnectionService.createConnection.mockRejectedValueOnce(new Error('Database error'));

      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent' as RelationshipType,
        family_tree_id: 'tree-1'
      };

      // Should throw error properly
      await expect(ConnectionService.createConnection(connectionData)).rejects.toThrow('Database error');
    });

    it('should maintain validation error messages', () => {
      const invalidData = {
        from_person_id: '',
        to_person_id: '',
        relationship_type: '',
        family_tree_id: 'tree-1'
      };

      const errors = ConnectionUtils.validate(invalidData);
      
      expect(errors).toContain('From person is required');
      expect(errors).toContain('To person is required');
      expect(errors).toContain('Relationship type is required');
    });
  });

  describe('Performance Regression', () => {
    it('should not significantly slow down relationship type operations', () => {
      const start = performance.now();
      
      // Perform typical operations
      for (let i = 0; i < 1000; i++) {
        RelationshipTypeHelpers.getAllTypes();
        RelationshipTypeHelpers.getForSelection();
        RelationshipTypeHelpers.isBidirectional('sibling');
        RelationshipTypeHelpers.getReciprocalType('parent');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete quickly (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // 100ms threshold
    });

    it('should not significantly slow down connection utilities', () => {
      const connections = Array.from({ length: 100 }, (_, i) => ({
        id: `conn-${i}`,
        from_person_id: `person-${i}`,
        to_person_id: `person-${i + 1}`,
        relationship_type: i % 2 === 0 ? 'parent' : 'sibling',
        family_tree_id: 'tree-1',
        group_id: null,
        organization_id: null,
        notes: null,
        metadata: null,
        created_at: null,
        updated_at: null
      }));

      const start = performance.now();
      
      // Perform deduplication on large array
      ConnectionUtils.deduplicate(connections);
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete quickly
      expect(duration).toBeLessThan(50); // 50ms threshold
    });
  });
});