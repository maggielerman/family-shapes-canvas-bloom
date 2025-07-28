# Enhanced Tenant Management System

## Overview

The Enhanced Tenant Management System provides a sophisticated multi-tenant architecture specifically designed for fertility clinics, cryobanks, and other donor-related organizations. This system allows seamless organization account creation during signup and provides a comprehensive onboarding experience.

## Key Features

### 1. **Dual Account Types**
- **Individual Accounts**: Personal users managing their own family data
- **Organization Accounts**: Business entities managing donor databases, sibling groups, and institutional data

### 2. **Automatic Organization Creation**
- Organizations are automatically created during signup when "Organization" account type is selected
- Unique slugs and subdomains are generated automatically
- Default settings are applied with guided onboarding to customize

### 3. **Smart Routing & Onboarding**
- New organization accounts are automatically redirected to a guided onboarding flow
- Completed organizations go directly to their dashboard
- Individual accounts use the standard dashboard

### 4. **Enhanced Data Model**
- `account_type` field in user profiles tracks individual vs organization accounts
- `organization_id` field links organization owners to their organizations
- Automatic triggers handle organization creation during user signup

## Technical Implementation

### Database Schema Changes

#### Enhanced user_profiles Table
```sql
-- New fields added to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN account_type text DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization'));

ALTER TABLE public.user_profiles 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
```

#### Automatic Organization Creation
```sql
-- Trigger function to create organizations during signup
CREATE OR REPLACE FUNCTION handle_organization_signup()
RETURNS TRIGGER AS $$
DECLARE
    org_name text;
    org_slug text;
    org_subdomain text;
    new_org_id uuid;
BEGIN
    -- Only process if this is an organization account
    IF NEW.account_type = 'organization' AND NEW.full_name IS NOT NULL THEN
        -- Create organization with generated slug/subdomain
        -- Link user profile to organization
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Authentication Flow

#### Updated SignUp Process
1. User selects account type (Individual/Organization)
2. Provides email, password, and name (individual) or organization name
3. AuthContext passes `account_type` and appropriate name field in metadata
4. Database trigger creates organization if account_type = 'organization'
5. User profile is linked to created organization

#### Signup Metadata Structure
```typescript
// Individual Account
{
  account_type: 'individual',
  full_name: 'John Doe'
}

// Organization Account  
{
  account_type: 'organization',
  organization_name: 'California Fertility Center'
}
```

### Routing Logic

#### Smart Dashboard Redirection
```typescript
// Dashboard checks account type and redirects appropriately
useEffect(() => {
  if (profile?.account_type === 'organization' && profile.organization_id) {
    checkOrganizationSetup(profile.organization_id);
  }
}, [profile]);

const checkOrganizationSetup = async (organizationId: string) => {
  const org = await fetchOrganization(organizationId);
  
  // Check if organization needs onboarding
  if (org.type === 'fertility_clinic' && 
      org.description === 'Organization created during signup') {
    navigate(`/organizations/${organizationId}/onboarding`);
  } else {
    navigate(`/organizations/${organizationId}`);
  }
};
```

#### Route Structure
```
/auth                           - Sign up/Sign in page
/dashboard                      - Individual user dashboard
/organizations/:id/onboarding   - Organization onboarding flow
/organizations/:id              - Organization dashboard
```

### Organization Onboarding Flow

#### Step 1: Organization Type Selection
- Choose from predefined types (Fertility Clinic, Sperm Bank, Egg Bank, etc.)
- Provide organization description
- Required before proceeding

#### Step 2: Organization Details
- Website, location, contact information
- Phone number and contact email
- Optional but recommended fields

#### Step 3: Completion
- Setup confirmation
- Next steps guidance
- Direct access to organization dashboard

### UI Components

#### Enhanced Auth Page
- Toggle between Individual/Organization account types
- Dynamic form fields based on selection
- Visual indicators for account type
- Improved messaging for organization accounts

#### Organization Onboarding Component
- Multi-step guided setup
- Progress tracking with visual progress bar
- Form validation and error handling
- Professional onboarding experience

#### Smart Dashboard
- Account type detection
- Automatic redirection logic
- Organization-specific features
- Individual user features

## Security & Permissions

### Row Level Security (RLS)
- Organization data is isolated by tenant
- Users can only access their own organizations
- Proper authentication checks on all queries

### Data Protection
- Organization accounts have enhanced privacy controls
- Sensitive donor information is properly protected
- Audit trails for organization activities

## Benefits for SaaS Platform

### 1. **Professional Onboarding**
- Guided setup process for business customers
- Reduces confusion and support requests
- Improves time-to-value

### 2. **Scalable Architecture**
- Clean separation between individual and business accounts
- Support for multi-organization users (future)
- Proper tenant isolation

### 3. **Business-Ready Features**
- Subdomain generation for white-labeling
- Organization settings and customization
- Team member management capabilities

### 4. **Improved User Experience**
- Context-aware routing and navigation
- Account-type specific dashboards
- Streamlined signup process

## Migration and Deployment

### Database Migration
```sql
-- Migration file: 20250130000000_enhance_tenant_management.sql
-- Adds account_type and organization_id fields
-- Creates triggers for automatic organization creation
-- Updates RLS policies
```

### Backward Compatibility
- Existing users default to 'individual' account type
- No breaking changes to existing functionality
- Gradual migration path for existing organizations

## Future Enhancements

### Planned Features
1. **Multi-Organization Users**: Allow users to be members of multiple organizations
2. **White-Label Domains**: Custom domain support for organizations
3. **Advanced Organization Settings**: Branding, themes, and customization
4. **Organization Analytics**: Usage metrics and insights
5. **Enterprise Features**: SSO, advanced security, compliance tools

### Scalability Considerations
- Horizontal scaling support with proper tenant isolation
- Database partitioning strategies for large organizations
- CDN and caching optimization for multi-tenant content

## Support and Maintenance

### Monitoring
- Organization creation metrics
- Onboarding completion rates
- User engagement by account type

### Support Workflows
- Account type identification in support tools
- Organization-specific support procedures
- Escalation paths for business customers

---

This enhanced tenant management system provides a robust foundation for the fertility clinic and cryobank SaaS platform, ensuring proper account separation, professional onboarding, and scalable architecture for business growth.