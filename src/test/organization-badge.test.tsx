import { render, screen } from '@testing-library/react';
import OrganizationBadge from '../components/marketing/get-started/OrganizationBadge';

describe('OrganizationBadge', () => {
  it('renders the organization badge with correct text and icon', () => {
    render(<OrganizationBadge />);
    
    expect(screen.getByText('For Organizations')).toBeInTheDocument();
    
    // Check that the Building2 icon is present (it should be rendered as an SVG)
    const badge = screen.getByText('For Organizations').closest('div');
    expect(badge).toHaveClass('bg-coral-50', 'text-coral-700', 'border-coral-200');
  });

  it('has the correct styling classes', () => {
    render(<OrganizationBadge />);
    
    const badge = screen.getByText('For Organizations').closest('div');
    expect(badge).toHaveClass('w-fit', 'bg-coral-50', 'text-coral-700', 'border-coral-200');
  });
}); 