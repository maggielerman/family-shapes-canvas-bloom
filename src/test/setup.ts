import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client with factory function
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'user-1' } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ error: null, data: null })),
          order: vi.fn(() => ({ error: null, data: [] })),
        })),
        insert: vi.fn(() => ({ error: null })),
        update: vi.fn(() => ({ error: null })),
        delete: vi.fn(() => ({ error: null })),
      })),
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