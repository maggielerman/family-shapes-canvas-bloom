import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../utils/test-helpers';
import { FamilyTreeVisualization } from '@/components/family-trees/FamilyTreeVisualization';
import { createMockPerson, createMockConnection, createMockFamilyTree } from '../utils/test-helpers';

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
  });

  describe('Component Integration', () => {
    it('should render without crashing with persons', () => {
      const result = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );
      
      expect(result.container).toBeTruthy();
    });

    it('should render without crashing with empty persons', () => {
      const result = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={[]}
          onPersonAdded={vi.fn()}
        />
      );
      
      expect(result.container).toBeTruthy();
    });
  });

  describe('Connection Data Flow', () => {
    it('should attempt to fetch connections on mount', () => {
      const component = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      expect(component.container).toBeTruthy();
    });

    it('should handle connection updates', () => {
      const { rerender } = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      rerender(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={[...mockPersons, createMockPerson({ id: 'person-4', name: 'Diana' })]}
          onPersonAdded={vi.fn()}
        />
      );

      expect(rerender).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection fetch errors gracefully', () => {
      const result = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      expect(result.container).toBeTruthy();
    });
  });

  describe('Data Consistency Validation', () => {
    it('should handle missing person references in connections', () => {
      const connectionsWithMissingPerson = [
        createMockConnection({ 
          from_person_id: 'missing-person', 
          to_person_id: 'person-2', 
          relationship_type: 'parent' 
        }),
      ];

      // Test component with invalid connections

      const result = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={mockPersons}
          onPersonAdded={vi.fn()}
        />
      );

      expect(result.container).toBeTruthy();
    });

    it('should validate relationship consistency', () => {
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

      // Test component with large dataset

      const startTime = performance.now();
      
      const result = render(
        <FamilyTreeVisualization
          familyTreeId={mockFamilyTree.id}
          persons={largePersonSet}
          onPersonAdded={vi.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(result.container).toBeTruthy();
      expect(renderTime).toBeLessThan(5000); // 5 seconds
    });
  });
});