import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'

// Test data factories
export const createMockPerson = (overrides = {}) => ({
  id: 'person-1',
  name: 'John Doe',
  date_of_birth: '1990-01-01',
  birth_place: 'New York',
  gender: 'male',
  profile_photo_url: null,
  email: 'john@example.com',
  phone: '555-1234',
  address: '123 Main St',
  status: 'living',
  notes: 'Test person',
  donor: false,
  used_ivf: false,
  used_iui: false,
  fertility_treatments: null,
  is_self: false,
  created_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
  organization_id: null,
  ...overrides,
})

export const createMockConnection = (overrides = {}) => ({
  id: 'connection-1',
  from_person_id: 'person-1',
  to_person_id: 'person-2',
  relationship_type: 'parent',
  family_tree_id: 'tree-1',
  group_id: null,
  organization_id: null,
  metadata: { attributes: [] },
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockFamilyTree = (overrides = {}) => ({
  id: 'tree-1',
  name: 'Test Family Tree',
  description: 'A test family tree',
  visibility: 'private',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1',
  organization_id: null,
  group_id: null,
  tree_data: {},
  settings: {},
  ...overrides,
})

// Custom render with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }