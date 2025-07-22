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