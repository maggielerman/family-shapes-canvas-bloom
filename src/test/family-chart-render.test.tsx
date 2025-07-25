import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FamilyChartLayout } from '@/components/family-trees/layouts/FamilyChartLayout';
import { Person } from '@/types/person';
import { Connection } from '@/types/connection';

// Mock the family-chart library
vi.mock('family-chart', () => ({
  default: {
    createChart: vi.fn(() => ({
      store: {
        updateTree: vi.fn()
      },
      getCard: vi.fn(() => () => document.createElementNS('http://www.w3.org/2000/svg', 'g'))
    })),
    CardHtml: vi.fn(() => document.createElementNS('http://www.w3.org/2000/svg', 'g'))
  }
}));

describe('FamilyChartLayout Rendering', () => {
  const mockPersons: Person[] = [
    {
      id: '1',
      name: 'John Doe',
      gender: 'male',
      date_of_birth: '1980-01-01',
      profile_photo_url: undefined,
      is_self: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      family_tree_id: 'tree1'
    },
    {
      id: '2',
      name: 'Jane Doe',
      gender: 'female',
      date_of_birth: '1982-01-01',
      profile_photo_url: undefined,
      is_self: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      family_tree_id: 'tree1'
    }
  ];

  const mockConnections: Connection[] = [
    {
      id: 'conn1',
      from_person_id: '1',
      to_person_id: '2',
      relationship_type: 'spouse',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockRelationshipTypes = [
    { value: 'parent', label: 'Parent', color: '#3b82f6' },
    { value: 'child', label: 'Child', color: '#10b981' },
    { value: 'spouse', label: 'Spouse', color: '#f59e0b' }
  ];

  it('should render chart container and not show loading spinner', async () => {
    render(
      <FamilyChartLayout
        persons={mockPersons}
        connections={mockConnections}
        relationshipTypes={mockRelationshipTypes}
        width={800}
        height={600}
        currentLayout="family-chart"
        onLayoutChange={vi.fn()}
      />
    );

    // Should not show loading spinner (component should render chart directly)
    const loadingSpinner = screen.queryByTestId('loading-spinner');
    expect(loadingSpinner).not.toBeInTheDocument();

    // Should show the chart container
    const chartContainer = screen.getByRole('generic'); // The main container div
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(
      <FamilyChartLayout
        persons={[]}
        connections={[]}
        relationshipTypes={mockRelationshipTypes}
        width={800}
        height={600}
        currentLayout="family-chart"
        onLayoutChange={vi.fn()}
      />
    );

    // Should not show loading spinner
    const loadingSpinner = screen.queryByTestId('loading-spinner');
    expect(loadingSpinner).not.toBeInTheDocument();

    // Should still render the container
    const chartContainer = screen.getByRole('generic');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render toolbar and layout switcher', () => {
    render(
      <FamilyChartLayout
        persons={mockPersons}
        connections={mockConnections}
        relationshipTypes={mockRelationshipTypes}
        width={800}
        height={600}
        currentLayout="family-chart"
        onLayoutChange={vi.fn()}
      />
    );

    // Should show toolbar buttons
    expect(screen.getByTitle('Center on John Doe')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom to fit all nodes')).toBeInTheDocument();

    // Should show layout switcher
    expect(screen.getByText('Family Chart')).toBeInTheDocument();
  });
}); 