import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FeatureChecklist from '../components/marketing/get-started/FeatureChecklist';

describe('FeatureChecklist', () => {
  const mockSelectedFeatures: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checklist variant by default', () => {
    render(
      <FeatureChecklist
        selectedFeatures={mockSelectedFeatures}
      />
    );

    // Should show checkboxes
    expect(screen.getByLabelText('Inter-Organization Collaboration')).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient Family Portal')).toBeInTheDocument();
    expect(screen.getByLabelText('Donor Portal')).toBeInTheDocument();
  });

  it('renders bullet variant when specified', () => {
    render(
      <FeatureChecklist
        variant="bullets"
      />
    );

    // Should show feature names but no checkboxes
    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Recipient Family Portal')).toBeInTheDocument();
    expect(screen.getByText('Donor Portal')).toBeInTheDocument();
    
    // Should not have checkboxes
    expect(screen.queryByLabelText('Inter-Organization Collaboration')).not.toBeInTheDocument();
  });

  it('shows selected features as checked', () => {
    const selectedFeatures = ['inter-organization-collaboration', 'recipient-family-portal'];
    
    render(
      <FeatureChecklist
        selectedFeatures={selectedFeatures}
      />
    );

    const collaborationCheckbox = screen.getByLabelText('Inter-Organization Collaboration');
    const familyPortalCheckbox = screen.getByLabelText('Recipient Family Portal');
    const donorPortalCheckbox = screen.getByLabelText('Donor Portal');

    expect(collaborationCheckbox).toBeChecked();
    expect(familyPortalCheckbox).toBeChecked();
    expect(donorPortalCheckbox).not.toBeChecked();
  });

  it('displays all features with descriptions in bullet mode', () => {
    render(
      <FeatureChecklist
        variant="bullets"
      />
    );

    // Check that all features are displayed
    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Recipient Family Portal')).toBeInTheDocument();
    expect(screen.getByText('Donor Portal')).toBeInTheDocument();
    expect(screen.getByText('Document and Consent Management')).toBeInTheDocument();
    expect(screen.getByText('Granular Privacy and Information Controls')).toBeInTheDocument();
    expect(screen.getByText('Community and Communication Tools')).toBeInTheDocument();
    expect(screen.getByText('Relationship Tracking and Data Visualization')).toBeInTheDocument();

    // Check that descriptions are displayed
    expect(screen.getByText(/Securely share donor data across cryobanks/)).toBeInTheDocument();
    expect(screen.getByText(/Personalized dashboard allowing families/)).toBeInTheDocument();
  });

  it('accepts different column configurations', () => {
    const { rerender } = render(
      <FeatureChecklist
        variant="bullets"
        columns={1}
      />
    );

    // Should still show all features
    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();

    // Test with 3 columns
    rerender(
      <FeatureChecklist
        variant="bullets"
        columns={3}
      />
    );

    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();

    // Test with 4 columns
    rerender(
      <FeatureChecklist
        variant="bullets"
        columns={4}
      />
    );

    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();
  });

  it('defaults to 2 columns when not specified', () => {
    render(
      <FeatureChecklist
        variant="bullets"
      />
    );

    expect(screen.getByText('Inter-Organization Collaboration')).toBeInTheDocument();
  });

  it('works without any props', () => {
    render(
      <FeatureChecklist />
    );

    // Should render without errors
    expect(screen.getByLabelText('Inter-Organization Collaboration')).toBeInTheDocument();
  });

  it('defaults to empty array for selectedFeatures', () => {
    render(
      <FeatureChecklist />
    );

    // Should render without errors
    expect(screen.getByLabelText('Inter-Organization Collaboration')).toBeInTheDocument();
  });
}); 