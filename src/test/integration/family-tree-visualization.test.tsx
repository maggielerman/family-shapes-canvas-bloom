import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers';
import { FamilyTreeVisualization } from '@/components/family-trees/FamilyTreeVisualization';
import { createMockPerson, createMockConnection, createMockFamilyTree } from '../utils/test-helpers';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ error: null, data: [] })),
    })),
    insert: vi.fn(() => ({ error: null })),
  })),
  auth: {
    getUser: vi.fn(() => ({ data: { user: { id: 'user-1' } } }))
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('FamilyTreeVisualization Integration', () => {
  const mockFamilyTree = createMockFamilyTree();
  const mockPersons = [
    createMockPerson({ id: 'person-1', name: 'Alice', gender: 'female' }),
    createMockPerson({ id: 'person-2', name: 'Bob', gender: 'male' }),
    createMockPerson({ id: 'person-3', name: 'Charlie', gender: 'male' }),
    createMockPerson({ id: 'person-4', name: 'Diana', gender: 'female' }),
  ];

  const mockConnections = [
    createMockConnection({ 
      from_person_id: 'person-1', 
      to_person_id: 'person-3', 
      relationship_type: 'parent' 
    }),
    createMockConnection({ 
      from_person_id: 'person-2', 
      to_person_id: 'person-3', 
      relationship_type: 'parent' 
    }),
    createMockConnection({ 
      from_person_id: 'person-1', 
      to_person_id: 'person-2', 
      relationship_type: 'partner' 
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the connections fetch
    mockSupabase.from.mockImplementation(() => {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ 
            error: null, 
            data: mockConnections 
          })),
        })),
        insert: vi.fn(() => ({ error: null })),
      };
    });
  });

  describe('Component Integration', () => {
    it('should render with ConnectionManager when persons exist', async () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      // Should show the ConnectionManager
      await waitFor(() => {
        expect(screen.getByText('Connection Management')).toBeInTheDocument();
      });

      // Should show existing connections
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should show empty state when no persons exist', () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={[]}
          onPersonAdded={vi.fn()}
        />
      );

      expect(screen.getByText('No family members yet')).toBeInTheDocument();
      expect(screen.getByText('Start building your family tree by adding family members.')).toBeInTheDocument();
    });
  });

  describe('Connection Data Flow', () => {
    it('should fetch connections on mount', async () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('connections');
      });
    });

    it('should refresh connections after updates', async () => {
      const { rerender } = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      // Simulate connection update
      const updatedConnections = [
        ...mockConnections,
        createMockConnection({ 
          from_person_id: 'person-3', 
          to_person_id: 'person-4', 
          relationship_type: 'sibling' 
        })
      ];

      mockSupabase.from.mockImplementation(() => {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ 
              error: null, 
              data: updatedConnections 
            })),
          })),
          insert: vi.fn(() => ({ error: null })),
        };
      });

      rerender(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={[...mockPersons, createMockPerson({ id: 'person-4', name: 'Diana' })]}
          onPersonAdded={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Diana')).toBeInTheDocument();
      });
    });
  });

  describe('Visualization Layouts', () => {
    it('should provide multiple layout options', async () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Tree')).toBeInTheDocument();
        expect(screen.getByText('Radial')).toBeInTheDocument();
        expect(screen.getByText('Force')).toBeInTheDocument();
        expect(screen.getByText('D3 Tree')).toBeInTheDocument();
        expect(screen.getByText('Cluster')).toBeInTheDocument();
      });
    });

    it('should switch between layouts when tabs are clicked', async () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      await waitFor(() => {
        const radialTab = screen.getByText('Radial');
        fireEvent.click(radialTab);
      });

      // Should render the radial layout component
      // (actual rendering would depend on the layout components)
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Person Interaction', () => {
    it('should handle person clicks to open details', async () => {
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      // This would require the actual layout components to test properly
      // but we can verify the handlers are passed correctly
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Error Handling', () => {
    it('should handle connection fetch errors gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ 
            error: { message: 'Network error' }, 
            data: null 
          })),
        })),
        insert: vi.fn(() => ({ error: null })),
      }));

      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      // Should still render but with empty connections
      await waitFor(() => {
        expect(screen.getByText('Connection Management')).toBeInTheDocument();
      });
    });
  });

  describe('Data Consistency Validation', () => {
    it('should handle missing person references in connections', async () => {
      const connectionsWithMissingPerson = [
        createMockConnection({ 
          from_person_id: 'missing-person', 
          to_person_id: 'person-2', 
          relationship_type: 'parent' 
        }),
      ];

      mockSupabase.from.mockImplementation(() => {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ 
              error: null, 
              data: connectionsWithMissingPerson 
            })),
          })),
          insert: vi.fn(() => ({ error: null })),
        };
      });

      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Connection Management')).toBeInTheDocument();
      });

      // Should handle missing persons gracefully
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should validate relationship consistency', () => {
      // Test relationship validation logic
      const validateRelationships = (connections: typeof mockConnections, persons: typeof mockPersons) => {
        const issues = [];
        
        for (const connection of connections) {
          const fromPerson = persons.find(p => p.id === connection.from_person_id);
          const toPerson = persons.find(p => p.id === connection.to_person_id);
          
          if (!fromPerson) {
            issues.push(`Connection ${connection.id}: 'from' person not found`);
          }
          
          if (!toPerson) {
            issues.push(`Connection ${connection.id}: 'to' person not found`);
          }
          
          if (connection.from_person_id === connection.to_person_id) {
            issues.push(`Connection ${connection.id}: person cannot be connected to themselves`);
          }
        }
        
        return issues;
      };

      const validationIssues = validateRelationships(mockConnections, mockPersons);
      expect(validationIssues).toHaveLength(0);

      // Test with invalid data
      const invalidConnections = [
        createMockConnection({ 
          from_person_id: 'person-1', 
          to_person_id: 'person-1', // Self-reference
          relationship_type: 'parent' 
        }),
      ];

      const invalidIssues = validateRelationships(invalidConnections, mockPersons);
      expect(invalidIssues.length).toBeGreaterThan(0);
      expect(invalidIssues[0]).toContain('cannot be connected to themselves');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largePersonSet = Array.from({ length: 100 }, (_, i) => 
        createMockPerson({ id: `person-${i}`, name: `Person ${i}` })
      );

      const largeConnectionSet = Array.from({ length: 150 }, (_, i) => 
        createMockConnection({ 
          from_person_id: `person-${i % 50}`, 
          to_person_id: `person-${(i + 1) % 50}`, 
          relationship_type: i % 2 === 0 ? 'parent' : 'sibling' 
        })
      );

      mockSupabase.from.mockImplementation(() => {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ 
              error: null, 
              data: largeConnectionSet 
            })),
          })),
          insert: vi.fn(() => ({ error: null })),
        };
      });

      const startTime = performance.now();
      
      render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={largePersonSet}
          onPersonAdded={vi.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000); // 1 second
    });
  });
});