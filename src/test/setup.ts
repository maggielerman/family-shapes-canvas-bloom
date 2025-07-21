import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client with factory function
let mockPersons: any[] = [];
let mockConnections: any[] = [];

const supabaseMock: any = {
  auth: {
    getUser: vi.fn(() => ({ data: { user: { id: 'user-1' } } })),
  },
  from: (table: string) => ({
    select: vi.fn((columns: string) => {
      // Handle complex select queries with joins
      if (columns.includes('to_person:persons!connections_to_person_id_fkey(name)')) {
        // This is for outgoing connections query
        return {
          eq: vi.fn((field: string, value: string) => ({
            then: (cb: any) => {
              const filteredConnections = mockConnections.filter(c => c[field] === value);
              const enrichedConnections = filteredConnections.map(conn => ({
                ...conn,
                to_person: mockPersons.find(p => p.id === conn.to_person_id) || { name: 'Unknown' }
              }));
              return cb({ data: enrichedConnections, error: null });
            }
          }))
        };
      }
      
      if (columns.includes('from_person:persons!connections_from_person_id_fkey(name)')) {
        // This is for incoming connections query
        return {
          eq: vi.fn((field: string, value: string) => ({
            then: (cb: any) => {
              const filteredConnections = mockConnections.filter(c => c[field] === value);
              const enrichedConnections = filteredConnections.map(conn => ({
                ...conn,
                from_person: mockPersons.find(p => p.id === conn.from_person_id) || { name: 'Unknown' }
              }));
              return cb({ data: enrichedConnections, error: null });
            }
          }))
        };
      }
      
      // Simple select for persons
      if (table === 'persons') {
        return {
          neq: vi.fn((field: string, value: string) => ({
            then: (cb: any) => {
              const filteredPersons = mockPersons.filter(p => p[field] !== value);
              return cb({ data: filteredPersons, error: null });
            }
          })),
          then: (cb: any) => {
            return cb({ data: mockPersons, error: null });
          }
        };
      }
      
      // Simple select for connections
      if (table === 'connections') {
        return {
          then: (cb: any) => {
            return cb({ data: mockConnections, error: null });
          }
        };
      }
      
      return {
        then: (cb: any) => {
          return cb({ data: [], error: null });
        }
      };
    }),
    insert: vi.fn(() => ({ error: null })),
    update: vi.fn(() => ({ error: null })),
    delete: vi.fn(() => ({ error: null })),
  }),
};

supabaseMock.__setMockPersons = (data: any[]) => { mockPersons = data; };
supabaseMock.__setMockConnections = (data: any[]) => { mockConnections = data; };

vi.mock('@/integrations/supabase/client', () => ({
  supabase: supabaseMock,
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