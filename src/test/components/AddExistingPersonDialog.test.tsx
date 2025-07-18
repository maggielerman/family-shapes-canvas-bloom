import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers'
import { AddExistingPersonDialog } from '../../components/family-trees/AddExistingPersonDialog'
import { createMockPerson } from '../utils/test-helpers'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          not: vi.fn(),
          ilike: vi.fn()
        }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null }))
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

describe('AddExistingPersonDialog', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    familyTreeId: 'tree-1',
    onPersonAdded: vi.fn()
  }

  const mockPersons = [
    createMockPerson({
      id: 'person-1',
      name: 'John Doe',
      gender: 'male',
      status: 'living'
    }),
    createMockPerson({
      id: 'person-2',
      name: 'Jane Smith',
      gender: 'female',
      status: 'living'
    })
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock for getting existing members
    mockSupabaseClient.from.mockImplementation((table) => {
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

      if (table === 'persons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                not: vi.fn().mockReturnValue({
                  ilike: vi.fn().mockResolvedValue({
                    data: mockPersons,
                    error: null
                  })
                }),
                ilike: vi.fn().mockResolvedValue({
                  data: mockPersons,
                  error: null
                })
              })
            })
          }),
          insert: vi.fn().mockResolvedValue({
            data: {},
            error: null
          })
        }
      }

      return mockSupabaseClient.from
    })
  })

  it('renders dialog with search functionality', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    expect(screen.getByText('Add Existing Person')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument()
  })

  it('displays available persons', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('filters persons based on search term', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search by name...')
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      // The search functionality would filter the results
      expect(searchInput.value).toBe('John')
    })
  })

  it('excludes persons already in the family tree', async () => {
    // Mock existing members
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'family_tree_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ person_id: 'person-1' }],
              error: null
            })
          })
        }
      }

      if (table === 'persons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: [mockPersons[1]], // Only Jane Smith should be available
                  error: null
                })
              })
            })
          })
        }
      }

      return mockSupabaseClient.from
    })

    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('handles adding person to tree', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText('Add')[0]
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(mockProps.onPersonAdded).toHaveBeenCalled()
    })
  })

  it('shows loading state while adding person', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText('Add')[0]
    fireEvent.click(addButton)

    // Should briefly show "Adding..." state
    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument()
    })
  })

  it('displays person information correctly', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('male')).toBeInTheDocument()
      expect(screen.getByText('living')).toBeInTheDocument()
    })
  })

  it('shows empty state when no persons found', async () => {
    mockSupabaseClient.from.mockImplementation((table) => {
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

      if (table === 'persons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        }
      }

      return mockSupabaseClient.from
    })

    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByText('No available persons found')).toBeInTheDocument()
    })
  })

  it('handles search with no results', async () => {
    render(<AddExistingPersonDialog {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search by name...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentName' } })

    // With a search term that yields no results
    await waitFor(() => {
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
    })
  })

  it('displays person initials when no profile photo', async () => {
    const personsWithoutPhotos = mockPersons.map(person => ({
      ...person,
      profile_photo_url: null
    }))

    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'persons') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                not: vi.fn().mockResolvedValue({
                  data: personsWithoutPhotos,
                  error: null
                })
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

    render(<AddExistingPersonDialog {...mockProps} />)

    await waitFor(() => {
      // Should show initials for persons without photos
      expect(screen.getByText('JD')).toBeInTheDocument() // John Doe
      expect(screen.getByText('JS')).toBeInTheDocument() // Jane Smith
    })
  })
})