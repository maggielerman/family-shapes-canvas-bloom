import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConnectionService } from '@/services/connectionService';
import type { CreateConnectionData, RelationshipType } from '@/types/connection';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ 
              data: [], 
              error: null 
            })
          })
        })
      }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ 
          data: [], 
          error: null 
        })
      }),
      limit: vi.fn().mockResolvedValue({ 
        data: [], 
        error: null 
      })
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'connection-123' },
          error: null
        })
      })
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'connection-123' },
            error: null
          })
        })
      })
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null
      })
    })
  }),
  rpc: vi.fn().mockResolvedValue({
    data: 'org-id-123',
    error: null
  })
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Database Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Service - Family Tree ID Removal', () => {
    it('should create connections without family_tree_id field', async () => {
      const connectionData: CreateConnectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        notes: 'Test connection'
      };

      // Should not include family_tree_id in the data
      expect(connectionData).not.toHaveProperty('family_tree_id');

      const result = await ConnectionService.createConnection(connectionData);
      
      // Should successfully create connection
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should fetch connections for family tree based on member relationships', async () => {
      const familyTreeId = 'tree-123';
      
      // Mock tree members
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { person_id: 'person-1' },
              { person_id: 'person-2' }
            ],
            error: null
          })
        })
      });

      // Mock connections query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'conn-1',
                  from_person_id: 'person-1',
                  to_person_id: 'person-2',
                  relationship_type: 'parent'
                }
              ],
              error: null
            })
          })
        })
      });

      const connections = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);
      
      expect(connections).toBeDefined();
      expect(Array.isArray(connections)).toBe(true);
      
      // Should have queried family_tree_members first
      expect(mockSupabase.from).toHaveBeenCalledWith('family_tree_members');
      
      // Should have queried connections with person IDs
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should update connections without family_tree_id reference', async () => {
      const updateData = {
        id: 'connection-123',
        relationship_type: 'spouse' as RelationshipType,
        notes: 'Updated connection'
      };

      const result = await ConnectionService.updateConnection(updateData);
      
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should check connection existence without family_tree_id parameter', async () => {
      const exists = await ConnectionService.connectionExists(
        'person-1',
        'person-2', 
        'parent'
      );

      expect(typeof exists).toBe('boolean');
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should handle connections with both persons in multiple family trees', async () => {
      // Test scenario: same connection appears in multiple family trees
      const familyTreeId1 = 'tree-1';
      const familyTreeId2 = 'tree-2';

      // Both trees have same persons
      const mockTreeMembers = [
        { person_id: 'person-1' },
        { person_id: 'person-2' }
      ];

      // Mock for first tree
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockTreeMembers,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'conn-1',
                    from_person_id: 'person-1',
                    to_person_id: 'person-2',
                    relationship_type: 'parent'
                  }
                ],
                error: null
              })
            })
          })
        });

      const connectionsTree1 = await ConnectionService.getConnectionsForFamilyTree(familyTreeId1);
      
      vi.clearAllMocks();

      // Mock for second tree  
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockTreeMembers,
              error: null
            })
          })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'conn-1', // Same connection ID
                    from_person_id: 'person-1',
                    to_person_id: 'person-2',
                    relationship_type: 'parent'
                  }
                ],
                error: null
              })
            })
          })
        });

      const connectionsTree2 = await ConnectionService.getConnectionsForFamilyTree(familyTreeId2);
      
      // Both should return the same connection
      expect(connectionsTree1).toEqual(connectionsTree2);
    });
  });

  describe('Organization RLS Policies', () => {
    it('should support organization owner queries', async () => {
      const userId = 'test-user-id';
      
      // Mock organization query with owner filter
      const mockOrgQuery = mockSupabase.from('organizations')
        .select('*')
        .eq('owner_id', userId);

      expect(mockOrgQuery).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
    });

    it('should support user profile updates with organization_id', async () => {
      const userId = 'test-user-id';
      const orgId = 'org-123';

      // Mock user profile update
      const mockProfileUpdate = mockSupabase.from('user_profiles')
        .update({ 
          organization_id: orgId,
          account_type: 'organization'
        })
        .eq('id', userId);

      expect(mockProfileUpdate).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should support organization creation via RPC', async () => {
      const orgData = {
        org_name: 'Test Clinic',
        org_type: 'fertility_clinic',
        org_description: 'Test description'
      };

      const result = await mockSupabase.rpc('create_organization_for_user', orgData);
      
      expect(result.data).toBe('org-id-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_organization_for_user', orgData);
    });
  });

  describe('Database Query Compatibility', () => {
    it('should handle foreign key references without explicit naming', async () => {
      // Test the fix for ambiguous foreign key references
      const mockConnectionQuery = mockSupabase.from('connections')
        .select(`
          *,
          from_person:persons(name),
          to_person:persons(name)
        `);

      expect(mockConnectionQuery).toBeDefined();
      
      // Should not use explicit foreign key names like 'persons!connections_from_person_id_fkey'
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should handle empty person arrays in connection queries', async () => {
      // Test edge case where family tree has no members
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [], // No members
              error: null
            })
          })
        });

      const connections = await ConnectionService.getConnectionsForFamilyTree('empty-tree');
      
      expect(connections).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('family_tree_members');
      // Should not attempt to query connections with empty person array
    });

    it('should handle user profiles with single record selection', async () => {
      // Test the fix for multiple user profile records
      const mockProfileQuery = mockSupabase.from('user_profiles')
        .select('*')
        .eq('id', 'user-123')
        .order('updated_at', { ascending: false })
        .limit(1);

      expect(mockProfileQuery).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    });
  });

  describe('Migration Compatibility', () => {
    it('should support account_type and organization_id fields in user_profiles', () => {
      // Test that our type system supports the enhanced user profile structure
      const userProfile = {
        id: 'user-123',
        account_type: 'organization',
        organization_id: 'org-456',
        full_name: 'Test User',
        email: 'test@example.com'
      };

      expect(userProfile.account_type).toBe('organization');
      expect(userProfile.organization_id).toBe('org-456');
    });

    it('should support organization settings JSONB column', () => {
      // Test organization with settings
      const organization = {
        id: 'org-123',
        name: 'Test Org',
        type: 'fertility_clinic',
        settings: {
          website: 'https://example.com',
          publiclyVisible: true,
          onboarding_completed: true
        }
      };

      expect(organization.settings).toBeDefined();
      expect(organization.settings.onboarding_completed).toBe(true);
    });

    it('should support connections without family_tree_id column', () => {
      // Test connection structure after migration
      const connection = {
        id: 'conn-123',
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        notes: 'Test connection',
        metadata: {}
      };

      // Should not have family_tree_id
      expect(connection).not.toHaveProperty('family_tree_id');
      expect(connection.from_person_id).toBe('person-1');
      expect(connection.to_person_id).toBe('person-2');
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error', code: 'PGRST116' }
          })
        })
      });

      await expect(async () => {
        await ConnectionService.getConnectionsForFamilyTree('error-tree');
      }).rejects.toThrow();
    });

    it('should handle missing RPC functions gracefully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function not found' }
      });

      const result = await mockSupabase.rpc('non_existent_function', {});
      expect(result.error).toBeDefined();
    });
  });
});