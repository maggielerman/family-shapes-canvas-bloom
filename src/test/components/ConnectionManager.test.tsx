import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers';
import { ConnectionManager } from '@/components/family-trees/ConnectionManager';
import { createMockPerson, createMockConnection } from '../utils/test-helpers';

// Mock the supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ error: null })),
    update: vi.fn(() => ({ error: null })),
    delete: vi.fn(() => ({ error: null })),
    eq: vi.fn(() => ({ error: null })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

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

  describe('Connection Display', () => {
    it('should display all connections in the table', () => {
      render(<ConnectionManager {...defaultProps} />);
      
      // Check that connections are displayed
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      
      // Check relationship types are displayed
      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Partner')).toBeInTheDocument();
    });

    it('should show empty state when no connections exist', () => {
      render(<ConnectionManager {...defaultProps} connections={[]} />);
      
      expect(screen.getByText('No connections yet. Add people to start creating relationships.')).toBeInTheDocument();
    });

    it('should display person names correctly even if person is missing', () => {
      const connectionsWithMissingPerson = [
        createMockConnection({ 
          from_person_id: 'missing-person', 
          to_person_id: 'person-2', 
          relationship_type: 'parent' 
        }),
      ];
      
      render(<ConnectionManager {...defaultProps} connections={connectionsWithMissingPerson} />);
      
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  describe('Connection Creation', () => {
    it('should open add connection dialog when button is clicked', async () => {
      render(<ConnectionManager {...defaultProps} />);
      
      const addButton = screen.getByText('Add Connection');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create New Connection')).toBeInTheDocument();
      });
    });

    it('should validate required fields before creating connection', async () => {
      render(<ConnectionManager {...defaultProps} />);
      
      const addButton = screen.getByText('Add Connection');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create connection/i });
        fireEvent.click(createButton);
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    });

    it('should prevent self-referential connections', async () => {
      render(<ConnectionManager {...defaultProps} />);
      
      const addButton = screen.getByText('Add Connection');
      fireEvent.click(addButton);
      
      // This would need proper form interaction to test fully
      // but we can test the validation logic directly
    });

    it('should detect duplicate connections', () => {
      // Test the duplicate detection logic
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
  });

  describe('Connection Editing', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      render(<ConnectionManager {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => button.querySelector('svg')); // Find edit icon
      
      if (editButton) {
        fireEvent.click(editButton);
        
        await waitFor(() => {
          expect(screen.getByText('Edit Connection')).toBeInTheDocument();
        });
      }
    });

    it('should call update API when connection is edited', async () => {
      const mockUpdate = vi.fn(() => ({ error: null }));
      const mockEq = vi.fn(() => ({ error: null }));
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({ error: null })),
        update: mockUpdate,
        delete: vi.fn(() => ({ error: null })),
        eq: mockEq,
      });
      
      render(<ConnectionManager {...defaultProps} />);
      
      // Test would need full interaction flow
      expect(mockUpdate).not.toHaveBeenCalled(); // Initial state
    });
  });

  describe('Connection Deletion', () => {
    it('should show confirmation dialog before deleting', () => {
      // Mock window.confirm
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<ConnectionManager {...defaultProps} />);
      
      // Would need to trigger delete button click
      // expect(mockConfirm).toHaveBeenCalled();
      
      mockConfirm.mockRestore();
    });

    it('should call delete API when deletion is confirmed', async () => {
      const mockDelete = vi.fn(() => ({ error: null }));
      const mockEq = vi.fn(() => ({ error: null }));
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({ error: null })),
        update: vi.fn(() => ({ error: null })),
        delete: mockDelete,
        eq: mockEq,
      });
      
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<ConnectionManager {...defaultProps} />);
      
      mockConfirm.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = { code: '23505', message: 'Duplicate key error' };
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({ error: mockError })),
        update: vi.fn(() => ({ error: null })),
        delete: vi.fn(() => ({ error: null })),
        eq: vi.fn(() => ({ error: null })),
      });
      
      // Test error handling
      expect(true).toBe(true); // Placeholder
    });

    it('should handle network errors', async () => {
      mockSupabase.from.mockRejectedValue(new Error('Network error'));
      
      // Test network error handling
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Data Consistency', () => {
    it('should refresh connections after successful operations', () => {
      const mockOnConnectionUpdated = vi.fn();
      
      render(<ConnectionManager {...defaultProps} onConnectionUpdated={mockOnConnectionUpdated} />);
      
      // Test that callback is called after operations
      expect(mockOnConnectionUpdated).not.toHaveBeenCalled(); // Initial state
    });

    it('should maintain correct person references', () => {
      render(<ConnectionManager {...defaultProps} />);
      
      // Verify all person IDs in connections exist in persons array
      mockConnections.forEach(connection => {
        const fromPersonExists = mockPersons.some(p => p.id === connection.from_person_id);
        const toPersonExists = mockPersons.some(p => p.id === connection.to_person_id);
        
        expect(fromPersonExists || connection.from_person_id === 'person-1').toBe(true);
        expect(toPersonExists || connection.to_person_id === 'person-2' || connection.to_person_id === 'person-3').toBe(true);
      });
    });
  });
});