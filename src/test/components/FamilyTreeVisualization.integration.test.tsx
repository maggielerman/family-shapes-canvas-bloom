import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FamilyTreeVisualization } from '@/components/family-trees/FamilyTreeVisualization';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

// Mock the heavy chart components


vi.mock('@/components/family-trees/layouts/DagreLayout', () => ({
  DagreLayout: ({ onPersonClick }: { onPersonClick: (person: Person) => void }) => (
    <div data-testid="dagre-layout">
      <button onClick={() => onPersonClick(mockPerson)}>Click Person</button>
    </div>
  )
}));

// Mock the PersonCardDialog
vi.mock('@/components/people/PersonCard', () => ({
  PersonCardDialog: ({ open, person }: { open: boolean; person: Person | null }) => (
    open && person ? (
      <div data-testid="person-card-dialog">
        <h3>{person.name}</h3>
        <button data-testid="edit-button">Edit</button>
      </div>
    ) : null
  )
}));

// Mock the EditPersonDialog
vi.mock('@/components/people/EditPersonDialog', () => ({
  EditPersonDialog: ({ open, person }: { open: boolean; person: Person | null }) => (
    open && person ? (
      <div data-testid="edit-person-dialog">
        <h3>Edit {person.name}</h3>
      </div>
    ) : null
  )
}));

// Mock the AddPersonDialog
vi.mock('@/components/family-trees/AddPersonDialog', () => ({
  AddPersonDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="add-person-dialog">Add Person Dialog</div> : null
  )
}));

// Mock the usePersonManagement hook
vi.mock('@/hooks/use-person-management', () => ({
  usePersonManagement: () => ({
    handleAddPerson: vi.fn(),
    handleAddDonor: vi.fn(),
    isSubmitting: false
  })
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the RelationshipTypeHelpers
vi.mock('@/types/relationshipTypes', () => ({
  RelationshipTypeHelpers: {
    getForSelection: () => [
      { value: 'parent', label: 'Parent' },
      { value: 'child', label: 'Child' },
      { value: 'sibling', label: 'Sibling' }
    ]
  }
}));

const mockPerson: Person = {
  id: '1',
  name: 'John Doe',
  date_of_birth: '1990-01-01',
  gender: 'male',
  status: 'living',
  created_at: '2023-01-01T00:00:00Z'
};

const mockConnections: Connection[] = [
  {
    id: '1',
    from_person_id: '1',
    to_person_id: '2',
    relationship_type: 'parent',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    notes: '',
    metadata: null,
    organization_id: null,
    group_id: null
  }
];

describe('FamilyTreeVisualization', () => {
  const defaultProps = {
    familyTreeId: 'test-tree-id',
    persons: [mockPerson],
    connections: mockConnections,
    onPersonAdded: vi.fn(),
    onConnectionsUpdated: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    expect(screen.getByTestId('radial-layout')).toBeInTheDocument();
  });

  it('shows empty state when no persons', () => {
    render(
      <FamilyTreeVisualization
        {...defaultProps}
        persons={[]}
        connections={[]}
      />
    );
    
    expect(screen.getByText('No family members yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first family member to start building your family tree')).toBeInTheDocument();
  });

  it('shows add person button in empty state', () => {
    render(
      <FamilyTreeVisualization
        {...defaultProps}
        persons={[]}
        connections={[]}
      />
    );
    
    const addButton = screen.getByRole('button', { name: /add first person/i });
    expect(addButton).toBeInTheDocument();
  });

  it('renders radial layout by default', () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    expect(screen.getByTestId('radial-layout')).toBeInTheDocument();
  });

  it('switches to dagre layout when toggle is clicked', async () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    
    // Initially shows radial layout
    expect(screen.getByTestId('radial-layout')).toBeInTheDocument();
    
    // Find and click the toggle button (it's an icon button)
    const toggleButton = screen.getByTitle('Switch to Tree view');
    toggleButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('dagre-layout')).toBeInTheDocument();
    });
  });

  it('switches back to radial layout when toggle is clicked again', async () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    
    // Click toggle to switch to dagre
    const toggleButton = screen.getByTitle('Switch to Tree view');
    toggleButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('dagre-layout')).toBeInTheDocument();
    });
    
    // Click toggle again to switch back to radial
    const radialViewButton = screen.getByTitle('Switch to Radial view');
    radialViewButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('radial-layout')).toBeInTheDocument();
    });
  });

  it('opens person dialog when person is clicked', async () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    
    const clickButton = screen.getByText('Click Person');
    clickButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('person-card-dialog')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('opens edit dialog when edit button is clicked', async () => {
    render(<FamilyTreeVisualization {...defaultProps} />);
    
    // First click to open person dialog
    const clickButton = screen.getByText('Click Person');
    clickButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('person-card-dialog')).toBeInTheDocument();
    });
    
    // Then click edit button
    const editButton = screen.getByTestId('edit-button');
    editButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-person-dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
    });
  });

  it('opens add person dialog when add button is clicked', async () => {
    render(
      <FamilyTreeVisualization
        {...defaultProps}
        persons={[]}
        connections={[]}
      />
    );
    
    const addButton = screen.getByRole('button', { name: /add first person/i });
    addButton.click();
    
    await waitFor(() => {
      expect(screen.getByTestId('add-person-dialog')).toBeInTheDocument();
    });
  });

  it('handles responsive dimensions', () => {
    // Mock getBoundingClientRect
    const mockRect = { width: 1000, height: 800 };
    Element.prototype.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);
    
    render(<FamilyTreeVisualization {...defaultProps} />);
    
    expect(Element.prototype.getBoundingClientRect).toHaveBeenCalled();
  });
});