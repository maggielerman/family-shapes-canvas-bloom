import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PersonService } from '@/services/personService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

describe('PersonService', () => {
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

  describe('createPerson', () => {
    it('should create a person successfully', async () => {
      const personData = {
        name: 'John Doe',
        date_of_birth: '1990-01-01',
        gender: 'male',
        email: 'john@example.com'
      };

      const expectedPerson = {
        id: 'person-123',
        ...personData,
        user_id: 'test-user-id'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: expectedPerson,
              error: null
            })
          })
        })
      });

      const result = await PersonService.createPerson(personData);

      expect(result).toEqual(expectedPerson);
      expect(mockSupabase.from).toHaveBeenCalledWith('persons');
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should throw error when no user is found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const personData = {
        name: 'John Doe',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };

      await expect(PersonService.createPerson(personData)).rejects.toThrow('No user found');
    });

    it('should throw error when database operation fails', async () => {
      const personData = {
        name: 'John Doe',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: '23505' }
            })
          })
        })
      });

      await expect(PersonService.createPerson(personData)).rejects.toThrow();
    });
  });

  describe('addPersonToFamilyTree', () => {
    it('should add person to family tree successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      await PersonService.addPersonToFamilyTree('person-123', 'tree-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('family_tree_members');
    });

    it('should throw error when no user is found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(
        PersonService.addPersonToFamilyTree('person-123', 'tree-456')
      ).rejects.toThrow('No user found');
    });

    it('should throw error when database operation fails', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Foreign key constraint violation' }
        })
      });

      await expect(
        PersonService.addPersonToFamilyTree('person-123', 'tree-456')
      ).rejects.toThrow();
    });
  });

  describe('createPersonAndAddToTree', () => {
    it('should create person and add to tree successfully', async () => {
      const personData = {
        name: 'Jane Doe',
        date_of_birth: '1985-06-15',
        gender: 'female'
      };

      const expectedPerson = {
        id: 'person-789',
        ...personData,
        user_id: 'test-user-id'
      };

      // Mock createPerson
      vi.spyOn(PersonService, 'createPerson').mockResolvedValue(expectedPerson as any);
      
      // Mock addPersonToFamilyTree
      vi.spyOn(PersonService, 'addPersonToFamilyTree').mockResolvedValue();

      const result = await PersonService.createPersonAndAddToTree(personData, 'tree-456');

      expect(result).toEqual(expectedPerson);
      expect(PersonService.createPerson).toHaveBeenCalledWith(personData);
      expect(PersonService.addPersonToFamilyTree).toHaveBeenCalledWith('person-789', 'tree-456');
    });

    it('should handle error when person creation fails', async () => {
      const personData = {
        name: 'Jane Doe',
        date_of_birth: '1985-06-15',
        gender: 'female'
      };

      vi.spyOn(PersonService, 'createPerson').mockRejectedValue(new Error('Person creation failed'));

      await expect(
        PersonService.createPersonAndAddToTree(personData, 'tree-456')
      ).rejects.toThrow('Person creation failed');
    });

    it('should handle error when adding to tree fails', async () => {
      const personData = {
        name: 'Jane Doe',
        date_of_birth: '1985-06-15',
        gender: 'female'
      };

      const expectedPerson = {
        id: 'person-789',
        ...personData,
        user_id: 'test-user-id'
      };

      vi.spyOn(PersonService, 'createPerson').mockResolvedValue(expectedPerson as any);
      vi.spyOn(PersonService, 'addPersonToFamilyTree').mockRejectedValue(new Error('Tree membership failed'));

      await expect(
        PersonService.createPersonAndAddToTree(personData, 'tree-456')
      ).rejects.toThrow('Tree membership failed');
    });
  });

  describe('removePersonFromFamilyTree', () => {
    it('should remove person from family tree successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      await PersonService.removePersonFromFamilyTree('person-123', 'tree-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('family_tree_members');
    });

    it('should throw error when database operation fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Delete failed' }
            })
          })
        })
      });

      await expect(
        PersonService.removePersonFromFamilyTree('person-123', 'tree-456')
      ).rejects.toThrow();
    });
  });

  describe('getPersonsInFamilyTree', () => {
    it('should get persons in family tree successfully', async () => {
      const mockPersons = [
        { person: { id: 'person-1', name: 'John Doe', gender: 'male' } },
        { person: { id: 'person-2', name: 'Jane Doe', gender: 'female' } }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockPersons,
            error: null
          })
        })
      });

      const result = await PersonService.getPersonsInFamilyTree('tree-456');

      expect(result).toEqual([
        { id: 'person-1', name: 'John Doe', gender: 'male' },
        { id: 'person-2', name: 'Jane Doe', gender: 'female' }
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith('family_tree_members');
    });

    it('should handle empty result', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      const result = await PersonService.getPersonsInFamilyTree('tree-456');

      expect(result).toEqual([]);
    });

    it('should throw error when database operation fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query failed' }
          })
        })
      });

      await expect(PersonService.getPersonsInFamilyTree('tree-456')).rejects.toThrow();
    });
  });

  describe('updatePerson', () => {
    it('should update person successfully', async () => {
      const updates = {
        name: 'John Smith',
        email: 'johnsmith@example.com'
      };

      const updatedPerson = {
        id: 'person-123',
        name: 'John Smith',
        email: 'johnsmith@example.com',
        date_of_birth: '1990-01-01',
        gender: 'male'
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedPerson,
                error: null
              })
            })
          })
        })
      });

      const result = await PersonService.updatePerson('person-123', updates);

      expect(result).toEqual(updatedPerson);
      expect(mockSupabase.from).toHaveBeenCalledWith('persons');
    });

    it('should throw error when database operation fails', async () => {
      const updates = { name: 'John Smith' };

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

      await expect(PersonService.updatePerson('person-123', updates)).rejects.toThrow();
    });
  });

  describe('deletePerson', () => {
    it('should delete person successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      await PersonService.deletePerson('person-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('persons');
    });

    it('should throw error when database operation fails', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' }
          })
        })
      });

      await expect(PersonService.deletePerson('person-123')).rejects.toThrow();
    });
  });
});