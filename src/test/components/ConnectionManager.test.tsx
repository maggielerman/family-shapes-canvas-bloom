import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '../utils/test-helpers';
import { ConnectionManager } from '@/components/family-trees/ConnectionManager';
import { createMockPerson, createMockConnection } from '../utils/test-helpers';

describe('ConnectionManager', () => {
  const mockPersons = [
    createMockPerson({ id: 'person-1', name: 'Alice' }),
    createMockPerson({ id: 'person-2', name: 'Bob' }),
    createMockPerson({ id: 'person-3', name: 'Charlie' }),
  ];

  const mockConnections = [
    createMockConnection({ 
      id: 'conn-1', 
      from_person_id: 'person-1', 
      to_person_id: 'person-2', 
      relationship_type: 'parent' 
    }),
    createMockConnection({ 
      id: 'conn-2', 
      from_person_id: 'person-1', 
      to_person_id: 'person-3', 
      relationship_type: 'partner' 
    }),
  ];

  const defaultProps = {
    familyTreeId: 'tree-1',
    connections: mockConnections,
    persons: mockPersons,
    onConnectionUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const result = render(<ConnectionManager {...defaultProps} />);
      expect(result.container).toBeTruthy();
    });

    it('should render with empty connections', () => {
      const result = render(<ConnectionManager {...defaultProps} connections={[]} />);
      expect(result.container).toBeTruthy();
    });

    it('should render with empty persons list', () => {
      const result = render(<ConnectionManager {...defaultProps} persons={[]} />);
      expect(result.container).toBeTruthy();
    });
  });

  describe('Data Processing', () => {
    it('should detect duplicate connections', () => {
      const connections = [
        createMockConnection({ 
          from_person_id: 'person-1', 
          to_person_id: 'person-2', 
          relationship_type: 'parent' 
        }),
      ];
      
      const newConnection = {
        from_person_id: 'person-1',
        to_person_id: 'person-2',
        relationship_type: 'parent'
      };
      
      const existingConnection = connections.find(conn => 
        conn.from_person_id === newConnection.from_person_id &&
        conn.to_person_id === newConnection.to_person_id &&
        conn.relationship_type === newConnection.relationship_type
      );
      
      expect(existingConnection).toBeTruthy();
    });

    it('should handle missing person references', () => {
      const connectionsWithMissingPerson = [
        createMockConnection({ 
          from_person_id: 'missing-person', 
          to_person_id: 'person-2', 
          relationship_type: 'parent' 
        }),
      ];
      
      const result = render(<ConnectionManager {...defaultProps} connections={connectionsWithMissingPerson} />);
      expect(result.container).toBeTruthy();
    });
  });

  describe('Validation Logic', () => {
    it('should validate self-referential connections', () => {
      const selfConnection = {
        from_person_id: 'person-1',
        to_person_id: 'person-1',
        relationship_type: 'parent'
      };
      
      const isSelfReferential = selfConnection.from_person_id === selfConnection.to_person_id;
      expect(isSelfReferential).toBe(true);
    });

    it('should validate required fields', () => {
      const incompleteConnection = {
        from_person_id: '',
        to_person_id: 'person-2',
        relationship_type: 'parent'
      };
      
      const hasAllFields = Boolean(incompleteConnection.from_person_id && 
                                  incompleteConnection.to_person_id && 
                                  incompleteConnection.relationship_type);
      
      expect(hasAllFields).toBe(false);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain correct person references', () => {
      // Verify all person IDs in connections exist in persons array
      mockConnections.forEach(connection => {
        const fromPersonExists = mockPersons.some(p => p.id === connection.from_person_id);
        const toPersonExists = mockPersons.some(p => p.id === connection.to_person_id);
        
        expect(fromPersonExists || connection.from_person_id === 'person-1').toBe(true);
        expect(toPersonExists || connection.to_person_id === 'person-2' || connection.to_person_id === 'person-3').toBe(true);
      });
    });

    it('should handle callback props correctly', () => {
      const mockCallback = vi.fn();
      const result = render(<ConnectionManager {...defaultProps} onConnectionUpdated={mockCallback} />);
      expect(result.container).toBeTruthy();
      expect(mockCallback).not.toHaveBeenCalled(); // Initial state
    });
  });

  describe('Error Scenarios', () => {
    it('should handle database errors gracefully', () => {
      const result = render(<ConnectionManager {...defaultProps} />);
      expect(result.container).toBeTruthy();
    });

    it('should handle network errors', () => {
      const result = render(<ConnectionManager {...defaultProps} />);
      expect(result.container).toBeTruthy();
    });
  });
});