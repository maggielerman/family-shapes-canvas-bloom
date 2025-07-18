import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../utils/test-helpers'
import { PublicFamilyTreeViewer } from '../../components/family-trees/PublicFamilyTreeViewer'
import { createMockFamilyTree, createMockPerson } from '../utils/test-helpers'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      }))
    }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: null },
      error: null
    }))
  }
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient
}))

describe('PublicFamilyTreeViewer', () => {
  const mockFamilyTree = createMockFamilyTree({
    id: 'public-tree-1',
    name: 'Public Family Tree',
    description: 'A publicly accessible family tree',
    visibility: 'public'
  })

  const mockPersons = [
    createMockPerson({
      id: 'person-1',
      name: 'John Public',
      status: 'living'
    }),
    createMockPerson({
      id: 'person-2', 
      name: 'Jane Public',
      status: 'living'
    })
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default public access
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
              data: mockPersons.map(person => ({ person })),
              error: null
            })
          })
        }
      }

      if (table === 'connections') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        }
      }

      return mockSupabaseClient.from
    })
  })

  it('renders public family tree correctly', async () => {
    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Public Family Tree')).toBeInTheDocument()
    })

    expect(screen.getByText('Public Family Tree')).toBeInTheDocument()
    expect(screen.getByText('Read Only')).toBeInTheDocument()
  })

  it('displays family members in public view', async () => {
    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Family Members (2)')).toBeInTheDocument()
    })
  })

  it('shows access restriction for private trees', async () => {
    // Mock private tree response
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'family_trees') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            })
          })
        }
      }
      return mockSupabaseClient.from
    })

    render(
      <PublicFamilyTreeViewer 
        treeId="private-tree-1"
        isPublicLink={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })
  })

  it('handles sharing link access', async () => {
    // Mock sharing link validation
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'sharing_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'link-1',
                    link_token: 'valid-token',
                    is_active: true,
                    expires_at: null,
                    max_uses: null,
                    current_uses: 0
                  },
                  error: null
                })
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: {},
              error: null
            })
          })
        }
      }

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

      return mockSupabaseClient.from()
    })

    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={true}
        accessToken="valid-token"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Public Family Tree')).toBeInTheDocument()
    })
  })

  it('shows tabs for different views', async () => {
    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Family Tree')).toBeInTheDocument()
      expect(screen.getByText('Family Members (2)')).toBeInTheDocument()
      expect(screen.getByText('About This Tree')).toBeInTheDocument()
    })
  })

  it('displays read-only warning', async () => {
    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('This is a read-only view. You can explore the family relationships but cannot make changes.')).toBeInTheDocument()
    })
  })

  it('handles expired sharing links', async () => {
    // Mock expired sharing link
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === 'sharing_links') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'link-1',
                    link_token: 'expired-token',
                    is_active: true,
                    expires_at: '2023-01-01T00:00:00Z', // Past date
                    max_uses: null,
                    current_uses: 0
                  },
                  error: null
                })
              })
            })
          })
        }
      }
      return mockSupabaseClient.from()
    })

    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={true}
        accessToken="expired-token"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    })
  })

  it('displays tree statistics in about section', async () => {
    render(
      <PublicFamilyTreeViewer 
        treeId="public-tree-1"
        isPublicLink={false}
      />
    )

    // Click on About tab
    const aboutTab = screen.getByText('About This Tree')
    aboutTab.click()

    await waitFor(() => {
      expect(screen.getByText('2 people')).toBeInTheDocument()
      expect(screen.getByText('0 connections')).toBeInTheDocument()
    })
  })
})