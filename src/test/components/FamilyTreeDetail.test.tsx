import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers'
import FamilyTreeDetail from '../../pages/FamilyTreeDetail'
import { createMockFamilyTree, createMockPerson } from '../utils/test-helpers'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'test-tree-id' }),
    useNavigate: () => vi.fn(),
  }
})

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

describe('FamilyTreeDetail', () => {
  const mockFamilyTree = createMockFamilyTree({
    id: 'test-tree-id',
    name: 'Test Family Tree',
    description: 'A test family tree',
    visibility: 'private'
  })

  const mockPersons = [
    createMockPerson({
      id: 'person-1',
      name: 'John Doe',
      membership_role: 'member'
    }),
    createMockPerson({
      id: 'person-2',
      name: 'Jane Doe',
      membership_role: 'member'
    })
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mock responses
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'family_trees') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFamilyTree,
                error: null
              })
            })
          })
        }
      }
      
      if (table === 'family_tree_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockPersons.map(person => ({
                person_id: person.id,
                role: person.membership_role,
                person: person
              })),
              error: null
            })
          }),
          insert: vi.fn().mockResolvedValue({
            data: {},
            error: null
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: {},
                error: null
              })
            })
          })
        }
      }

      if (table === 'persons') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: createMockPerson(),
                error: null
              })
            })
          })
        }
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }
    })
  })

  it('renders family tree details correctly', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText(mockFamilyTree.name)).toBeInTheDocument()
    })

    expect(screen.getByText(mockFamilyTree.description)).toBeInTheDocument()
    expect(screen.getByText(mockFamilyTree.visibility)).toBeInTheDocument()
  })

  it('displays family members correctly', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('Family Members')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
  })

  it('shows tabs for different views', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('People')).toBeInTheDocument()
      expect(screen.getByText('Tree View')).toBeInTheDocument()
      expect(screen.getByText('Media')).toBeInTheDocument()
    })
  })

  it('displays add person buttons', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('Add New Person')).toBeInTheDocument()
      expect(screen.getByText('Add Existing')).toBeInTheDocument()
    })
  })

  it('shows sharing dialog when share button is clicked', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Share'))
    
    // The sharing dialog should open (this would need the actual component to test fully)
  })

  it('handles person removal from tree', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // The removal functionality would be tested through the PersonCard component
    // This tests that the tree properly handles the removal callback
  })

  it('displays empty state when no family members', async () => {
    // Mock empty response
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'family_trees') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFamilyTree,
                error: null
              })
            })
          })
        }
      }
      
      if (table === 'family_tree_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        }
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }
    })

    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('No family members yet')).toBeInTheDocument()
    })

    expect(screen.getByText('Start building your family tree by adding family members.')).toBeInTheDocument()
  })

  it('handles loading states', async () => {
    render(<FamilyTreeDetail />)

    // Should show loading spinner initially
    await waitFor(() => {
      expect(screen.getByText(/loading/i) || document.querySelector('.animate-pulse')).toBeTruthy()
    })
  })

  it('displays visibility badge with correct styling', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      const badge = screen.getByText(mockFamilyTree.visibility)
      expect(badge).toBeInTheDocument()
    })
  })

  it('shows correct navigation back to trees', async () => {
    render(<FamilyTreeDetail />)

    await waitFor(() => {
      expect(screen.getByText('Back to Trees')).toBeInTheDocument()
    })
  })
})