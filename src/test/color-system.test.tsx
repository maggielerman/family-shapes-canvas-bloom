import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Color System', () => {
  it('applies coral primary color to primary buttons', () => {
    render(
      <div>
        <Button variant="default">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </div>
    );
    
    const primaryButton = screen.getByText('Primary Button');
    const secondaryButton = screen.getByText('Secondary Button');
    
    // Check that buttons render without errors
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
    
    // The primary button should have the primary color classes
    expect(primaryButton).toHaveClass('bg-primary', 'text-primary-foreground');
    
    // The secondary button should have the secondary color classes
    expect(secondaryButton).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders buttons with correct color variants', () => {
    render(
      <div>
        <Button variant="outline">Outline Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
    );
    
    const outlineButton = screen.getByText('Outline Button');
    const destructiveButton = screen.getByText('Destructive Button');
    
    expect(outlineButton).toBeInTheDocument();
    expect(destructiveButton).toBeInTheDocument();
  });
}); 