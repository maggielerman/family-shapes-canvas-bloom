import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver for JSDOM environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver for JSDOM environment
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Create a chainable mock builder
const createChainableMock = () => {
  const mock = {
    single: vi.fn(() => ({ error: null, data: { id: 'mock-id', name: 'Mock Data' } })),
    order: vi.fn(() => ({ error: null, data: [] })),
    in: vi.fn(() => createChainableMock()),
    eq: vi.fn(() => createChainableMock()),
    is: vi.fn(() => createChainableMock()),
    insert: vi.fn(() => ({ error: null, data: { id: 'mock-insert-id' } })),
    update: vi.fn(() => ({ error: null, data: { id: 'mock-update-id' } })),
    delete: vi.fn(() => ({ error: null, data: null })),
  };
  return mock;
};

// Mock Supabase client with factory function
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'user-1' } }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => createChainableMock()),
    })),
  },
}))

// Create a mock that can be controlled by tests
const mockConnectionService = {
  createConnection: vi.fn(() => Promise.resolve({ id: 'mock-connection-id' })),
  createConnectionWithReciprocal: vi.fn(() => Promise.resolve({ 
    main: { id: 'mock-connection-id' }, 
    reciprocal: { id: 'mock-reciprocal-id' } 
  })),
  getConnectionsForPerson: vi.fn(() => Promise.resolve([])),
  getConnectionsForFamilyTree: vi.fn(() => Promise.resolve([])),
  updateConnection: vi.fn(() => Promise.resolve({ id: 'mock-connection-id' })),
  updateConnectionWithReciprocal: vi.fn(() => Promise.resolve({ 
    main: { id: 'mock-connection-id' }, 
    reciprocal: { id: 'mock-reciprocal-id' } 
  })),
  deleteConnection: vi.fn(() => Promise.resolve()),
  deleteConnectionWithReciprocal: vi.fn(() => Promise.resolve()),
  connectionExists: vi.fn(() => Promise.resolve(false)),
};

// Mock the services directly to avoid complex Supabase mocking
vi.mock('@/services/connectionService', () => ({
  ConnectionService: mockConnectionService
}));

// Export the mock for test control
export { mockConnectionService };

vi.mock('@/services/personService', () => ({
  PersonService: {
    createPerson: vi.fn(() => Promise.resolve({ id: 'mock-person-id', name: 'Mock Person' })),
    createPersonAndAddToTree: vi.fn(() => Promise.resolve({ id: 'mock-person-id', name: 'Mock Person' })),
    addPersonToFamilyTree: vi.fn(() => Promise.resolve()),
    removePersonFromFamilyTree: vi.fn(() => Promise.resolve()),
    getPersonsInFamilyTree: vi.fn(() => Promise.resolve([])),
    updatePerson: vi.fn(() => Promise.resolve({ id: 'mock-person-id', name: 'Mock Person' })),
    deletePerson: vi.fn(() => Promise.resolve()),
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-tree-id' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => children,
}))