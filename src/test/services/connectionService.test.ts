import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectionService } from '@/services/connectionService';
import { ConnectionUtils } from '@/types/connection';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

describe('ConnectionService', () => {
  const mockSupabase = supabase as any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createConnection', () => {
    it('should create a connection successfully', async () => {
      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      const expectedConnection = {
        id: 'connection-123',
        ...connectionData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: expectedConnection,
              error: null
            })
          })
        })
      });

      const result = await ConnectionService.createConnection(connectionData);

      expect(result).toEqual(expectedConnection);
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should use canonical direction for bidirectional relationships', async () => {
      const connectionData = {
        from_person_id: 'person-z',
        to_person_id: 'person-a',
        relationship_type: 'sibling',
        family_tree_id: 'tree-1'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'connection-123', ...connectionData },
              error: null
            })
          })
        })
      });

      await ConnectionService.createConnection(connectionData);

      // Should call insert with canonical direction (person-a < person-z lexicographically)
      const insertCall = mockSupabase.from().insert;
      expect(insertCall).toHaveBeenCalledWith(expect.objectContaining({
        from_person_id: 'person-a',
        to_person_id: 'person-z'
      }));
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        from_person_id: '',
        to_person_id: 'person-2',
        relationship_type: 'invalid-type',
        family_tree_id: 'tree-1'
      };

      await expect(ConnectionService.createConnection(invalidData)).rejects.toThrow('Validation failed');
    });

    it('should throw error for self-connection', async () => {
      const selfConnectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-1',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      await expect(ConnectionService.createConnection(selfConnectionData)).rejects.toThrow('Validation failed');
    });

    it('should handle database constraint errors', async () => {
      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key value violates unique constraint' }
            })
          })
        })
      });

      await expect(ConnectionService.createConnection(connectionData)).rejects.toThrow('This connection already exists');
    });

    it('should throw error when no user is found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      await expect(ConnectionService.createConnection(connectionData)).rejects.toThrow('No user found');
    });
  });

  describe('createConnectionWithReciprocal', () => {
    it('should create connection with reciprocal for directional relationships', async () => {
      const connectionData = {
        from_person_id: 'parent-1',
        to_person_id: 'child-1',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      const mainConnection = { id: 'conn-1', ...connectionData };
      const reciprocalConnection = { 
        id: 'conn-2', 
        from_person_id: 'child-1',
        to_person_id: 'parent-1',
        relationship_type: 'child',
        family_tree_id: 'tree-1'
      };

      vi.spyOn(ConnectionService, 'createConnection')
        .mockResolvedValueOnce(mainConnection as any)
        .mockResolvedValueOnce(reciprocalConnection as any);

      const result = await ConnectionService.createConnectionWithReciprocal(connectionData);

      expect(result.main).toEqual(mainConnection);
      expect(result.reciprocal).toEqual(reciprocalConnection);
      expect(ConnectionService.createConnection).toHaveBeenCalledTimes(2);
    });

    it('should not create reciprocal for bidirectional relationships', async () => {
      const connectionData = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'sibling',
        family_tree_id: 'tree-1'
      };

      const mainConnection = { id: 'conn-1', ...connectionData };

      vi.spyOn(ConnectionService, 'createConnection').mockResolvedValue(mainConnection as any);

      const result = await ConnectionService.createConnectionWithReciprocal(connectionData);

      expect(result.main).toEqual(mainConnection);
      expect(result.reciprocal).toBeUndefined();
      expect(ConnectionService.createConnection).toHaveBeenCalledTimes(1);
    });

    it('should continue if reciprocal creation fails', async () => {
      const connectionData = {
        from_person_id: 'parent-1',
        to_person_id: 'child-1',
        relationship_type: 'parent',
        family_tree_id: 'tree-1'
      };

      const mainConnection = { id: 'conn-1', ...connectionData };

      vi.spyOn(ConnectionService, 'createConnection')
        .mockResolvedValueOnce(mainConnection as any)
        .mockRejectedValueOnce(new Error('Reciprocal failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await ConnectionService.createConnectionWithReciprocal(connectionData);

      expect(result.main).toEqual(mainConnection);
      expect(result.reciprocal).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getConnectionsForPerson', () => {
    it('should get both incoming and outgoing connections', async () => {
      const personId = 'person-1';
      
      const outgoingConnections = [
        { 
          id: 'conn-1', 
          from_person_id: personId, 
          to_person_id: 'person-2',
          relationship_type: 'parent',
          to_person: { name: 'Child' }
        }
      ];

      const incomingConnections = [
        { 
          id: 'conn-2', 
          from_person_id: 'person-3', 
          to_person_id: personId,
          relationship_type: 'parent',
          from_person: { name: 'Parent' }
        }
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((field, value) => {
                if (field === 'from_person_id' && value === personId) {
                  return Promise.resolve({ data: outgoingConnections, error: null });
                } else if (field === 'to_person_id' && value === personId) {
                  return Promise.resolve({ data: incomingConnections, error: null });
                }
                return Promise.resolve({ data: [], error: null });
              })
            })
          };
        }
        return {};
      });

      const result = await ConnectionService.getConnectionsForPerson(personId);

      expect(result).toHaveLength(2);
      expect(result[0].direction).toBe('outgoing');
      expect(result[0].other_person_name).toBe('Child');
      expect(result[1].direction).toBe('incoming');
      expect(result[1].other_person_name).toBe('Parent');
    });

    it('should deduplicate bidirectional connections', async () => {
      const personId = 'person-1';
      
      const outgoingConnections = [
        { 
          id: 'conn-1', 
          from_person_id: personId, 
          to_person_id: 'person-2',
          relationship_type: 'sibling',
          to_person: { name: 'Sibling' }
        }
      ];

      const incomingConnections = [
        { 
          id: 'conn-2', 
          from_person_id: 'person-2', 
          to_person_id: personId,
          relationship_type: 'sibling',
          from_person: { name: 'Sibling' }
        }
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((field, value) => {
                if (field === 'from_person_id' && value === personId) {
                  return Promise.resolve({ data: outgoingConnections, error: null });
                } else if (field === 'to_person_id' && value === personId) {
                  return Promise.resolve({ data: incomingConnections, error: null });
                }
                return Promise.resolve({ data: [], error: null });
              })
            })
          };
        }
        return {};
      });

      const result = await ConnectionService.getConnectionsForPerson(personId);

      // Should only return one connection (outgoing), not both
      expect(result).toHaveLength(1);
      expect(result[0].direction).toBe('outgoing');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      await expect(ConnectionService.getConnectionsForPerson('person-1')).rejects.toThrow();
    });
  });

  describe('getConnectionsForFamilyTree', () => {
    it('should get both tree-specific and member connections', async () => {
      const familyTreeId = 'tree-1';
      
      const treeConnections = [
        { id: 'conn-1', family_tree_id: familyTreeId, relationship_type: 'parent' }
      ];

      const treeMembers = [
        { person_id: 'person-1' },
        { person_id: 'person-2' }
      ];

      const memberConnections = [
        { id: 'conn-2', family_tree_id: null, from_person_id: 'person-1', to_person_id: 'person-2' }
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: treeConnections, error: null }),
              is: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({ data: memberConnections, error: null })
                })
              })
            })
          };
        } else if (table === 'family_tree_members') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: treeMembers, error: null })
            })
          };
        }
        return {};
      });

      const result = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);

      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain('conn-1');
      expect(result.map(c => c.id)).toContain('conn-2');
    });

    it('should deduplicate connections', async () => {
      const familyTreeId = 'tree-1';
      
      const treeConnections = [
        { id: 'conn-1', family_tree_id: familyTreeId }
      ];

      const treeMembers = [
        { person_id: 'person-1' }
      ];

      const memberConnections = [
        { id: 'conn-1', family_tree_id: null } // Same ID as tree connection
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: treeConnections, error: null }),
              is: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({ data: memberConnections, error: null })
                })
              })
            })
          };
        } else if (table === 'family_tree_members') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: treeMembers, error: null })
            })
          };
        }
        return {};
      });

      const result = await ConnectionService.getConnectionsForFamilyTree(familyTreeId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conn-1');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      });

      await expect(ConnectionService.getConnectionsForFamilyTree('tree-1')).rejects.toThrow();
    });
  });

  describe('updateConnection', () => {
    it('should update connection successfully', async () => {
      const updateData = {
        id: 'conn-1',
        relationship_type: 'biological_parent',
        notes: 'Updated notes'
      };

      const updatedConnection = {
        id: 'conn-1',
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'biological_parent',
        notes: 'Updated notes'
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedConnection,
                error: null
              })
            })
          })
        })
      });

      const result = await ConnectionService.updateConnection(updateData);

      expect(result).toEqual(updatedConnection);
      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should handle database errors', async () => {
      const updateData = {
        id: 'conn-1',
        relationship_type: 'biological_parent'
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
              })
            })
          })
        })
      });

      await expect(ConnectionService.updateConnection(updateData)).rejects.toThrow();
    });
  });

  describe('deleteConnection', () => {
    it('should delete connection successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      await ConnectionService.deleteConnection('conn-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('connections');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' }
          })
        })
      });

      await expect(ConnectionService.deleteConnection('conn-1')).rejects.toThrow();
    });
  });

  describe('deleteConnectionWithReciprocal', () => {
    it('should delete connection and its reciprocal', async () => {
      const connection = {
        id: 'conn-1',
        from_person_id: 'parent-1',
        to_person_id: 'child-1',
        relationship_type: 'parent'
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: connection,
                  error: null
                })
              })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null
                  })
                })
              })
            })
          };
        }
        return {};
      });

      vi.spyOn(ConnectionService, 'deleteConnection').mockResolvedValue();

      await ConnectionService.deleteConnectionWithReciprocal('conn-1');

      expect(ConnectionService.deleteConnection).toHaveBeenCalledWith('conn-1');
    });

    it('should handle errors gracefully when reciprocal deletion fails', async () => {
      const connection = {
        id: 'conn-1',
        from_person_id: 'parent-1',
        to_person_id: 'child-1',
        relationship_type: 'parent'
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'connections') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: connection,
                  error: null
                })
              })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockRejectedValue(new Error('Reciprocal delete failed'))
                })
              })
            })
          };
        }
        return {};
      });

      vi.spyOn(ConnectionService, 'deleteConnection').mockResolvedValue();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await ConnectionService.deleteConnectionWithReciprocal('conn-1');

      expect(consoleSpy).toHaveBeenCalled();
      expect(ConnectionService.deleteConnection).toHaveBeenCalledWith('conn-1');

      consoleSpy.mockRestore();
    });
  });

  describe('connectionExists', () => {
    it('should return true when connection exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'conn-1' }],
                error: null
              })
            })
          })
        })
      });

      const result = await ConnectionService.connectionExists('person-1', 'person-2', 'parent');

      expect(result).toBe(true);
    });

    it('should return false when connection does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      });

      const result = await ConnectionService.connectionExists('person-1', 'person-2', 'parent');

      expect(result).toBe(false);
    });

    it('should include family tree filter when provided', async () => {
      const mockFinalEq = vi.fn().mockResolvedValue({
        data: [],
        error: null
      });
      
      const mockThirdEq = vi.fn().mockReturnValue({
        eq: mockFinalEq
      });
      
      const mockSecondEq = vi.fn().mockReturnValue({
        eq: mockThirdEq
      });
      
      const mockFirstEq = vi.fn().mockReturnValue({
        eq: mockSecondEq
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockFirstEq
        })
      });

      await ConnectionService.connectionExists('person-1', 'person-2', 'parent', 'tree-1');

      expect(mockFinalEq).toHaveBeenCalledWith('family_tree_id', 'tree-1');
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' }
              })
            })
          })
        })
      });

      await expect(ConnectionService.connectionExists('person-1', 'person-2', 'parent')).rejects.toThrow();
    });
  });
});