import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import StyleGuide from '../pages/StyleGuide';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('StyleGuide', () => {
  it('renders the style guide page with all sections', () => {
    renderWithRouter(<StyleGuide />);

    // Check main title (split across elements)
    expect(screen.getByText('Family Shapes')).toBeInTheDocument();
    expect(screen.getByText('Brand Style Guide')).toBeInTheDocument();

    // Check tab sections
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Principles')).toBeInTheDocument();

    // Check color section content (default active tab)
    expect(screen.getByText('Primary Colors')).toBeInTheDocument();
    expect(screen.getByText('Secondary Colors')).toBeInTheDocument();
    expect(screen.getByText('Semantic Colors')).toBeInTheDocument();
    expect(screen.getByText('Color Usage Guidelines')).toBeInTheDocument();
  });

  it('displays color palette information', () => {
    renderWithRouter(<StyleGuide />);

    // Check coral colors (full scale)
    expect(screen.getByText('Coral 50')).toBeInTheDocument();
    expect(screen.getByText('Coral 100')).toBeInTheDocument();
    expect(screen.getByText('Coral 200')).toBeInTheDocument();
    expect(screen.getByText('Coral 300')).toBeInTheDocument();
    expect(screen.getByText('Coral 400')).toBeInTheDocument();
    expect(screen.getByText('Coral 500')).toBeInTheDocument();
    expect(screen.getByText('Coral 600')).toBeInTheDocument();
    expect(screen.getByText('Coral 700')).toBeInTheDocument();
    expect(screen.getByText('Coral 800')).toBeInTheDocument();
    expect(screen.getByText('Coral 900')).toBeInTheDocument();

    // Check navy colors (full scale)
    expect(screen.getByText('Navy 50')).toBeInTheDocument();
    expect(screen.getByText('Navy 100')).toBeInTheDocument();
    expect(screen.getByText('Navy 200')).toBeInTheDocument();
    expect(screen.getByText('Navy 300')).toBeInTheDocument();
    expect(screen.getByText('Navy 400')).toBeInTheDocument();
    expect(screen.getByText('Navy 500')).toBeInTheDocument();
    expect(screen.getByText('Navy 600')).toBeInTheDocument();
    expect(screen.getByText('Navy 700')).toBeInTheDocument();
    expect(screen.getByText('Navy 800')).toBeInTheDocument();
    expect(screen.getByText('Navy 900')).toBeInTheDocument();

    // Check sage colors (full scale)
    expect(screen.getByText('Sage 50')).toBeInTheDocument();
    expect(screen.getByText('Sage 100')).toBeInTheDocument();
    expect(screen.getByText('Sage 200')).toBeInTheDocument();
    expect(screen.getByText('Sage 300')).toBeInTheDocument();
    expect(screen.getByText('Sage 400')).toBeInTheDocument();
    expect(screen.getByText('Sage 500')).toBeInTheDocument();
    expect(screen.getByText('Sage 600')).toBeInTheDocument();
    expect(screen.getByText('Sage 700')).toBeInTheDocument();
    expect(screen.getByText('Sage 800')).toBeInTheDocument();
    expect(screen.getByText('Sage 900')).toBeInTheDocument();

    // Check terracotta colors (full scale)
    expect(screen.getByText('Terracotta 50')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 100')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 200')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 300')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 400')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 500')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 600')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 700')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 800')).toBeInTheDocument();
    expect(screen.getByText('Terracotta 900')).toBeInTheDocument();
  });

  it('shows semantic colors', () => {
    renderWithRouter(<StyleGuide />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
}); 