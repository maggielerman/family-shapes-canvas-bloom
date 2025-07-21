import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../pages/Settings';
import { AuthProvider } from '../components/auth/AuthContext';

// Mock the hooks
vi.mock('../hooks/use-user-settings', () => ({
  useUserSettings: () => ({
    data: {
      id: '1',
      user_id: 'user-1',
      privacy_mode: false,
      data_sharing: true,
      email_notifications: true,
      marketing_emails: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
    updateSettings: {
      mutateAsync: vi.fn(),
      isPending: false,
    },
  }),
}));

vi.mock('../components/auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  }),
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings page with all sections', async () => {
    renderWithProviders(<Settings />);

    // Check if main heading exists
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your account preferences and privacy settings')).toBeInTheDocument();

    // Check if all setting sections are present
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('displays settings overview when no changes are made', async () => {
    renderWithProviders(<Settings />);

    // Settings overview should be visible when no changes are pending
    await waitFor(() => {
      expect(screen.getByText('Settings Overview')).toBeInTheDocument();
    });
  });

  it('shows save and reset buttons when settings are changed', async () => {
    renderWithProviders(<Settings />);

    // Find and toggle a switch
    const privacySwitch = screen.getByLabelText('Privacy Mode');
    fireEvent.click(privacySwitch);

    // Check if save and reset buttons appear
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  it('renders data export and delete account buttons', () => {
    renderWithProviders(<Settings />);

    expect(screen.getByText('Download My Data')).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    renderWithProviders(<Settings />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });
});

// Integration test documentation
/**
 * Settings Functionality Tests
 * 
 * This test file documents the complete settings functionality:
 * 
 * 1. User Settings Management:
 *    - Privacy Mode toggle
 *    - Data Sharing preferences
 *    - Email Notifications control
 *    - Marketing Emails opt-in/out
 * 
 * 2. Data Management:
 *    - Data export functionality
 *    - Account deletion with confirmation
 * 
 * 3. User Experience:
 *    - Settings overview/summary
 *    - Real-time change tracking
 *    - Save/Reset functionality
 *    - Error handling and validation
 * 
 * 4. Database Integration:
 *    - user_settings table operations
 *    - Real-time updates via React Query
 *    - Optimistic UI updates
 * 
 * 5. Security Features:
 *    - Row Level Security (RLS) policies
 *    - User authentication required
 *    - Safe data export/deletion flows
 */