# Get Started Page

## Overview

The Get Started page serves as a unified entry point for all three user audiences (families, cryobanks/clinics, and donors) with a primary focus on organizations. It features a two-column layout that prioritizes organization waitlist signups while providing minimal CTAs for other user types.

## Design Philosophy

The page is designed with organizations (cryobanks and clinics) as the primary target audience, reflecting the business priority to capture leads from these high-value prospects. The layout emphasizes the organization value proposition and waitlist form while keeping other user flows accessible but secondary.

## Page Structure

### Main Two-Column Layout

#### Left Column - Value Proposition & Form
- **Organization Badge**: Clear identification of target audience
- **Value Proposition**: "Streamline Your Donor Management" with compelling description
- **Key Benefits**: Four bullet points highlighting core features
- **Waitlist Form**: Comprehensive form with feature selection

#### Right Column - Visual Placeholder
- **Image Placeholder**: Gradient background with placeholder content
- **Future Enhancement**: Will display organization dashboard preview or feature illustrations

### Bottom Section - Secondary CTAs
- **Minimal CTAs**: Compact buttons for families and donors
- **Clear Separation**: Visual divider with "Looking for something else?" heading

## Form Features

### Organization Waitlist Form

#### Basic Information
- Organization Name (required)
- Contact Name (required)
- Email (required)

#### Feature Selection
- **Checkbox Section**: "What features interest you the most?"
- **8 Feature Options**: Each with icon, label, and description
  - Donor Database Management
  - Family Connection Tracking
  - Privacy & Security Controls
  - Reporting & Analytics
  - Document Management
  - Multi-tenant Organization Support
  - API & System Integration
  - Compliance & Regulatory Tools

#### Additional Information
- **Optional Text Area**: "Additional needs or requirements"
- **Submit Button**: "Join Waitlist"

### Donor Interest Form (Dialog)
- Name (required)
- Email (required)
- Interests (optional text area)

## User Flows

### Primary Flow - Organization Waitlist
1. User lands on page and sees organization-focused content
2. User fills out organization information
3. User selects relevant features of interest
4. User optionally adds additional requirements
5. User submits form and receives confirmation
6. Organization receives email notification

### Secondary Flow - Family Users
1. User clicks "I'm a Family" button
2. User is redirected to `/auth?redirect=/dashboard`
3. User can sign up and access the dashboard immediately

### Secondary Flow - Donor Users
1. User clicks "I'm a Donor" button
2. Dialog opens with donor interest form
3. User fills out form and submits
4. User receives confirmation and stays updated on donor features

## Technical Implementation

### Form State Management
- Uses React `useState` for form data
- Separate state for organization and donor forms
- Feature selection managed with array state

### Email Integration
- Uses existing `send-contact-form` Supabase Edge Function
- Enhanced message format includes selected features
- Separate handling for organization vs donor submissions

### Responsive Design
- Uses responsive utility classes from `index.css`
- Two-column layout on desktop, stacked on mobile
- Consistent spacing and typography patterns

## Testing

### Test Coverage
- Page rendering and content display
- Form field validation and interaction
- Feature checkbox selection functionality
- User flow testing for all three audiences
- Dialog opening and form submission

### Key Test Scenarios
- Organization form with feature selection
- Family user redirection
- Donor dialog interaction
- Form validation and submission

## Future Enhancements

### Visual Improvements
- Replace placeholder with actual organization dashboard preview
- Add animations for feature selection
- Implement progress indicators for form completion

### Feature Enhancements
- Add form validation with real-time feedback
- Implement auto-save for partial form completion
- Add analytics tracking for feature selection patterns
- Consider A/B testing different value propositions

### Integration Opportunities
- Connect with CRM for lead management
- Implement retargeting based on feature selection
- Add social proof elements (testimonials, logos)
- Consider live chat for immediate support

## Accessibility

### Form Accessibility
- Proper labels and ARIA attributes for checkboxes
- Keyboard navigation support
- Screen reader friendly feature descriptions
- Clear error states and validation messages

### Visual Accessibility
- High contrast color scheme
- Clear typography hierarchy
- Responsive design for all screen sizes
- Touch-friendly interface elements

## Analytics & Tracking

### Key Metrics
- Waitlist form completion rate
- Feature selection patterns
- User flow conversion rates
- Geographic distribution of signups

### Implementation
- Form submission tracking
- Feature selection analytics
- User journey tracking
- A/B testing framework ready

## Content Strategy

### Value Proposition
- Focus on pain points specific to fertility clinics and cryobanks
- Emphasize efficiency and compliance benefits
- Highlight competitive advantages

### Feature Descriptions
- Clear, benefit-focused language
- Industry-specific terminology
- Actionable and measurable outcomes

### Call-to-Action Optimization
- Primary CTA: "Join Waitlist" (clear and specific)
- Secondary CTAs: Minimal but accessible
- Consistent button styling and placement 