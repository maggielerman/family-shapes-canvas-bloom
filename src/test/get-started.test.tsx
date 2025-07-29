import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GetStarted from '../pages/GetStarted';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GetStarted Page', () => {
  it('renders the organization-focused value proposition', () => {
    renderWithRouter(<GetStarted />);
    
    // Check for the main heading text (split across elements)
    expect(screen.getByText('Streamline Your')).toBeInTheDocument();
    expect(screen.getByText('Donor Management')).toBeInTheDocument();
    expect(screen.getByText(/Join the waitlist for our comprehensive platform/)).toBeInTheDocument();
  });

  it('displays the organization badge', () => {
    renderWithRouter(<GetStarted />);
    
    expect(screen.getByText('For Organizations')).toBeInTheDocument();
  });

  it('shows key benefits for organizations', () => {
    renderWithRouter(<GetStarted />);
    
    expect(screen.getByText('Key Benefits:')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive donor database management')).toBeInTheDocument();
    expect(screen.getByText('Family connection tracking and privacy controls')).toBeInTheDocument();
    expect(screen.getByText('Advanced reporting and analytics tools')).toBeInTheDocument();
    expect(screen.getByText('Multi-tenant organization support')).toBeInTheDocument();
  });

  it('displays the waitlist form for organizations', () => {
    renderWithRouter(<GetStarted />);

    expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
    expect(screen.getByText('Full Name *')).toBeInTheDocument();
    expect(screen.getByText('Title *')).toBeInTheDocument();
    expect(screen.getByText('Organization Name *')).toBeInTheDocument();
    expect(screen.getByText('Organization Type *')).toBeInTheDocument();
    expect(screen.getByText('Work Email *')).toBeInTheDocument();
    expect(screen.getByText('Additional needs or requirements (Optional)')).toBeInTheDocument();
  });

  it('shows organization type dropdown options', () => {
    renderWithRouter(<GetStarted />);
    
    // Click on the organization type dropdown to open it
    const organizationTypeDropdown = screen.getByText('Select your organization type');
    fireEvent.click(organizationTypeDropdown);
    
    // Check that all options are displayed (use getAllByText since there are multiple elements)
    expect(screen.getAllByText('Traditional Cryobank')).toHaveLength(2); // option and span
    expect(screen.getAllByText('Cryostorage Startup')).toHaveLength(2);
    expect(screen.getAllByText('Donor-Matching Startup')).toHaveLength(2);
    expect(screen.getAllByText('Other')).toHaveLength(2);
  });

  it('displays minimal CTAs for other audiences', () => {
    renderWithRouter(<GetStarted />);
    
    // The CTAs should now be inside the form, so we need to look for them there
    expect(screen.getByText('Looking for something else?')).toBeInTheDocument();
    expect(screen.getByText("I'm a Family")).toBeInTheDocument();
    expect(screen.getByText("I'm a Donor")).toBeInTheDocument();
  });

  it('redirects family users to auth page', () => {
    renderWithRouter(<GetStarted />);
    
    const familyButton = screen.getByText("I'm a Family");
    expect(familyButton).toBeInTheDocument();
    
    fireEvent.click(familyButton);
    
    // Should redirect to auth page
    expect(window.location.href).toBe('/auth?redirect=/dashboard');
  });

  it('opens donor dialog for donor users', () => {
    renderWithRouter(<GetStarted />);
    
    const donorButton = screen.getByText("I'm a Donor");
    expect(donorButton).toBeInTheDocument();
    
    fireEvent.click(donorButton);
    
    // Should open donor dialog with specific form fields
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument(); // More specific selector
    expect(screen.getByText('What interests you most? (Optional)')).toBeInTheDocument();
  });
}); 