# Organization Features Documentation

## Overview

The organization functionality in the Family Shapes application provides a comprehensive platform for managing donor databases, coordinating complex permissions settings, sharing and gatekeeping information with donor sibling groups, and more. Organizations serve as the central hub for fertility clinics, sperm banks, donor communities, and family groups.

## Core Features

### 1. Organization Types

The application supports various types of organizations:

- **Sperm Banks** (🧬) - Facilities that collect, store, and distribute sperm donations
- **Egg Banks** (🥚) - Facilities specializing in egg donation programs
- **Fertility Clinics** (🏥) - Medical facilities providing fertility treatments
- **Donor Communities** (🤝) - Community-driven platforms for donor connections
- **Support Groups** (💙) - Groups providing emotional and informational support
- **Family Groups** (👨‍👩‍👧‍👦) - Private family organization units
- **Research Institutions** (🔬) - Academic or research-focused organizations
- **Other** (🏢) - Custom organization types

### 2. Organization Management

#### Basic Information
- Organization name and description
- Custom subdomain (`organization.familyshapes.com`)
- Custom domain support
- Organization type classification
- Visibility settings (Public/Private)

#### Membership System
- **Owner** - Full administrative control
- **Admin** - Management capabilities
- **Editor** - Content editing permissions
- **Viewer** - Read-only access

### 3. Donor Database Management

Organizations can maintain comprehensive donor databases with the following features:

#### Database Features
- **Donor Verification System** - Multi-level verification process
  - Unverified
  - Pending verification
  - Verified by admin
  - Rejected
- **Visibility Controls** - Control who can see donor information
  - Public
  - Members only
  - Admin only
- **Search and Filtering** - Advanced search capabilities
- **Import/Export** - Bulk data management
- **Custom Fields** - Organization-specific donor attributes

#### Donor Information Management
- Integration with existing donor profiles
- Physical characteristics and medical history
- Anonymous vs. known donor support
- Sperm bank affiliations
- Donor number tracking

### 4. Sibling Groups

Organizations can create and manage donor sibling groups to connect biological siblings:

#### Group Features
- **Auto-Creation** - Automatically create groups for new donors
- **Privacy Levels**
  - Public - Anyone can see
  - Members Only - Organization members only
  - Private - Invitation only
- **Notification System** - Customizable alerts for group activities
- **Communication Tools** - Group messaging and forums

#### Group Settings
- Contact sharing permissions
- Photo sharing capabilities
- Medical history sharing controls
- Auto-add new siblings when discovered

### 5. Privacy and Permissions

#### Data Sharing Controls
- **Sharing Levels**
  - No data sharing
  - Members only
  - Approved organizations
  - Public sharing
- **Content Controls**
  - Medical history sharing
  - Contact information sharing
  - Photo sharing permissions

#### Access Management
- Public discovery settings
- Member invitation permissions
- Join approval requirements
- Role-based access control

### 6. Communication Features

#### Messaging System
- Direct messages between members
- Group communications
- Organization-wide announcements

#### Community Features
- Discussion forums
- Moderation controls (None/Basic/Strict)
- Community guidelines enforcement

### 7. Organization Settings

#### Advanced Configuration
- **Custom Branding**
  - Custom logo upload
  - Color scheme customization
  - Organization-specific theming
- **Notification Settings**
  - Frequency controls (Immediate/Daily/Weekly/Monthly)
  - Alert type preferences
  - Group activity notifications

#### Security Features
- Data encryption
- Secure access controls
- Audit logging
- Compliance features

## Technical Implementation

### Database Schema

#### Organizations Table
```sql
organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  subdomain text NOT NULL,
  type text NOT NULL,
  description text,
  domain text,
  visibility text,
  plan text,
  owner_id uuid NOT NULL,
  settings jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
```

#### Organization Donor Database
```sql
organization_donor_database (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  donor_id uuid NOT NULL,
  visibility text NOT NULL,
  verification_status text NOT NULL,
  verified_by uuid,
  verified_at timestamptz,
  notes text,
  custom_fields jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
```

#### Sibling Groups
```sql
sibling_groups (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  donor_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  privacy_level text NOT NULL,
  auto_add_new_siblings boolean,
  allow_contact_sharing boolean,
  allow_photo_sharing boolean,
  allow_medical_sharing boolean,
  created_at timestamptz,
  updated_at timestamptz
)
```

### Security Features

#### Row-Level Security (RLS)
- All organization data is protected by RLS policies
- Users can only access data for organizations they're members of
- Owners have full access to their organizations
- Admins have management permissions based on their role

#### Data Protection
- Sensitive donor information is encrypted
- Access logging for audit trails
- GDPR compliance features
- Data retention policies

## User Interface

### Organization Dashboard
The main dashboard provides access to all organization features through a tabbed interface:

1. **Overview** - Statistics and recent activity
2. **Members** - Member management and invitations
3. **Donor Database** - Comprehensive donor management
4. **Sibling Groups** - Group creation and management
5. **Groups** - General group management
6. **Family Trees** - Tree visualization (coming soon)
7. **Analytics** - Usage metrics and insights (admin only)
8. **Settings** - Configuration and administration (owner only)

### Key Components

#### DonorDatabase Component
- Grid view of all donors in the organization
- Advanced search and filtering
- Verification status management
- Bulk operations support

#### SiblingGroups Component
- Visual group representation
- Member management
- Notification controls
- Privacy settings

#### OrganizationSettings Component
- Comprehensive settings management
- Tabbed interface for different setting categories
- Real-time settings updates
- Danger zone for destructive actions

## API Integration

### Organization Management
```typescript
// Create organization
POST /organizations
{
  name: string,
  type: OrganizationType,
  description?: string,
  visibility: 'public' | 'private'
}

// Update organization settings
PATCH /organizations/:id/settings
{
  settings: OrganizationSettings
}
```

### Donor Database API
```typescript
// Add donor to organization database
POST /organizations/:id/donors
{
  donor_id: string,
  visibility: string,
  verification_status: string
}

// Update verification status
PATCH /organizations/:id/donors/:donor_id
{
  verification_status: string,
  notes?: string
}
```

### Sibling Groups API
```typescript
// Create sibling group
POST /organizations/:id/sibling-groups
{
  name: string,
  donor_id: string,
  privacy_level: string,
  settings: SiblingGroupSettings
}

// Join sibling group
POST /sibling-groups/:id/members
{
  person_id: string
}
```

## Future Enhancements

### Planned Features
1. **Advanced Analytics** - Detailed usage metrics and insights
2. **Integration APIs** - Connect with external systems
3. **Mobile App** - Native mobile applications
4. **AI-Powered Matching** - Intelligent sibling discovery
5. **Video Conferencing** - Built-in communication tools
6. **Document Management** - Secure file sharing and storage

### Scalability Considerations
- Horizontal scaling support
- CDN integration for media files
- Caching layers for performance
- Load balancing for high availability

## Best Practices

### For Organization Administrators
1. **Regular Data Audits** - Review and verify donor information regularly
2. **Privacy Training** - Ensure staff understand privacy controls
3. **Member Onboarding** - Provide clear guidelines for new members
4. **Communication Guidelines** - Establish community standards

### For Developers
1. **Security First** - Always implement proper access controls
2. **Data Validation** - Validate all user inputs
3. **Error Handling** - Provide meaningful error messages
4. **Performance Monitoring** - Track system performance metrics

## Support and Resources

### Documentation
- API documentation
- User guides
- Administrator manuals
- Developer resources

### Community
- User forums
- Support channels
- Feature requests
- Bug reporting

---

This comprehensive organization system provides the foundation for managing complex donor databases, facilitating sibling connections, and maintaining secure, compliant operations for fertility-related organizations.