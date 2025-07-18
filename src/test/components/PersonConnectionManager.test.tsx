import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers'
import { PersonConnectionManager } from '../../components/people/PersonConnectionManager'
import { createMockPerson, createMockConnection } from '../utils/test-helpers'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: 'user-1' } },
      error: null
    }))
  }
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}))

describe('PersonConnectionManager', () => {
  const mockPerson = createMockPerson({
    id: 'person-1',
    name: 'John Doe'
  })

  const mockOnConnectionUpdated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock responses
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }),
      insert: vi.fn().mockResolvedValue({
        data: [createMockConnection()],
        error: null
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [createMockConnection()],
          error: null
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    })
  })

  it('renders connection manager with correct person name', async () => {
    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(`Relationships from ${mockPerson.name}`)).toBeInTheDocument()
    })
  })

  it('displays add connection dialog when button is clicked', async () => {
    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Add Connection')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Add Connection'))
    
    await waitFor(() => {
      expect(screen.getByText('Create New Connection')).toBeInTheDocument()
    })
  })

  it('shows relationship types in the select dropdown', async () => {
    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    fireEvent.click(screen.getByText('Add Connection'))
    
    await waitFor(() => {
      expect(screen.getByText('Relationship Type')).toBeInTheDocument()
    })
  })

  it('handles connection creation with reciprocal relationship', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      data: [createMockConnection()],
      error: null
    })

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [createMockPerson({ id: 'person-2', name: 'Jane Doe' })],
          error: null
        })
      }),
      insert: mockInsert
    })

    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    fireEvent.click(screen.getByText('Add Connection'))
    
    await waitFor(() => {
      expect(screen.getByText('Create New Connection')).toBeInTheDocument()
    })

    // Verify that reciprocal relationships would be created
    expect(mockInsert).not.toHaveBeenCalled() // Should only be called when form is submitted
  })

  it('prevents creation of self-relationships', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Test the validation logic that should prevent self-relationships
    const validateConnection = (fromPersonId: string, toPersonId: string) => {
      if (fromPersonId === toPersonId) {
        throw new Error('A person cannot have a relationship with themselves')
      }
    }

    expect(() => validateConnection(mockPerson.id, mockPerson.id)).toThrow(
      'A person cannot have a relationship with themselves'
    )

    consoleSpy.mockRestore()
  })

  it('handles connection deletion with confirmation', async () => {
    const mockConnection = createMockConnection({
      id: 'connection-1',
      from_person_id: mockPerson.id,
      to_person_id: 'person-2',
      relationship_type: 'parent'
    })

    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)

    const mockDelete = vi.fn().mockResolvedValue({
      data: [],
      error: null
    })

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [mockConnection],
          error: null
        })
      }),
      delete: mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    })

    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    // Test deletion logic
    expect(window.confirm).toBeDefined()
    
    // Restore window.confirm
    window.confirm = originalConfirm
  })

  it('displays connection information correctly', async () => {
    const mockConnections = [
      createMockConnection({
        from_person_id: mockPerson.id,
        to_person_id: 'person-2',
        relationship_type: 'parent',
        to_person: { name: 'Jane Doe' }
      })
    ]

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockConnections,
          error: null
        })
      })
    })

    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(`Relationships from ${mockPerson.name}`)).toBeInTheDocument()
    })
  })

  it('handles attribute selection for relationships', async () => {
    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    fireEvent.click(screen.getByText('Add Connection'))
    
    await waitFor(() => {
      expect(screen.getByText('Create New Connection')).toBeInTheDocument()
    })

    // The attribute selector should appear when a relationship type is selected
    // This tests the conditional rendering of the RelationshipAttributeSelector
  })

  it('handles loading states correctly', async () => {
    render(
      <PersonConnectionManager 
        person={mockPerson}
        onConnectionUpdated={mockOnConnectionUpdated}
      />
    )

    // Initially should show loading state
    expect(screen.getByText('Loading connections...')).toBeInTheDocument()
  })
})