# Donor Portal MVP Documentation

## Overview

The Donor Portal is a comprehensive platform that enables donors (sperm, egg, embryo) to manage their profiles, control privacy settings, track health updates, and communicate securely with recipient families and cryobank/clinic staff.

## Key Features

### 1. Self-Service Onboarding (<3 minutes)
- **Route**: `/donor/auth`
- **Features**:
  - Quick signup with essential information
  - Choice of donor type (sperm, egg, embryo, other)
  - Initial privacy preference (anonymous/open)
  - Optional donor number and cryobank information
  - Consent management

### 2. Donor Dashboard
- **Route**: `/donor/dashboard`
- **Features**:
  - Overview of connected families count
  - Profile completeness indicator
  - Health update status and reminders
  - Unread messages count
  - Quick action buttons
  - Recent activity feed

### 3. Profile Management
- **Route**: `/donor/profile`
- **Features**:
  - Basic information editing
  - Physical characteristics
  - Education and occupation
  - Personal interests and statement
  - Real-time preview of how profile appears to families

### 4. Health Information Management
- **Route**: `/donor/health`
- **Features**:
  - General health status
  - Medical conditions tracking
  - Medications management
  - Allergies list
  - Family medical history
  - Lifestyle factors
  - **12-month update reminders** with visual status indicators

### 5. Privacy Controls
- **Route**: `/donor/privacy`
- **Features**:
  - Three privacy levels:
    - **Anonymous**: Only basic info and physical characteristics
    - **Semi-Open**: Controlled personal information sharing
    - **Open**: Full profile visibility with contact options
  - Granular visibility controls for each data type
  - Communication preferences
  - Message approval settings
  - Live preview of profile based on settings

### 6. Communication Center
- **Route**: `/donor/communication`
- **Features**:
  - Threaded conversations with families
  - Message approval queue (if enabled)
  - Archive functionality
  - Read receipts
  - Search and filter capabilities
  - Secure, policy-compliant messaging

## Technical Implementation

### Database Schema

#### Key Tables:
- `persons`: Base user information with `person_type = 'donor'`
- `donors`: Donor-specific data including:
  - Physical characteristics
  - Medical history (JSONB)
  - Privacy settings (in metadata JSONB)
  - Anonymous flag
- `donor_family_threads`: Message threads
- `donor_family_messages`: Individual messages with approval status

### Authentication Flow

1. Donor signs up at `/donor/auth`
2. Creates auth user with metadata `user_type: 'donor'`
3. Creates person record with `person_type: 'donor'`
4. Creates donor record with initial privacy settings
5. Redirects to donor dashboard

### Privacy Implementation

Privacy settings stored in `donors.metadata.privacy_settings`:
```json
{
  "privacy_level": "anonymous|semi-open|open",
  "show_basic_info": true,
  "show_physical_characteristics": true,
  "show_education": false,
  "show_occupation": false,
  "show_interests": false,
  "show_personal_statement": false,
  "show_contact_info": false,
  "show_health_history": true,
  "show_photos": false,
  "allow_family_messages": true,
  "require_message_approval": true,
  "message_notifications": true
}
```

### Health Update Tracking

Medical history stored in `donors.medical_history`:
```json
{
  "last_updated": "2024-01-30T10:00:00Z",
  "general_health": "Good overall health",
  "conditions": [...],
  "medications": [...],
  "allergies": [...],
  "family_history": "...",
  "lifestyle_factors": {
    "smoking": "never",
    "alcohol": "occasional",
    "exercise": "regular"
  }
}
```

## Success Metrics

### v0.1 Success Criteria:

1. **Self-service onboarding**: ✅ Donor can claim or create profile in <3 minutes
   - Simple form with minimal required fields
   - Clear privacy options upfront
   - Immediate access to dashboard

2. **Health info freshness**: ✅ Portal surfaces clear "last updated" status
   - Visual indicators (green/yellow/red)
   - 12-month reminder threshold
   - Dashboard alerts for overdue updates

3. **Granular anonymity controls**: ✅ Donor can preview appearance to families/clinics
   - Live preview tab showing exact visibility
   - Separate controls for each data category
   - Different views for families vs clinics

## Integration Points

### With Existing Codebase:

1. **Authentication**: Extends existing `AuthContext` and `supabase.auth`
2. **Navigation**: Adds donor-specific items to `SidebarLayout`
3. **Database**: Uses existing `persons` table with new `donors` table
4. **Styling**: Uses existing UI components and design system
5. **Communication**: Can integrate with existing messaging infrastructure

### Security Considerations:

- All donor data encrypted at rest
- Row-level security policies enforce access control
- Message approval system prevents unwanted contact
- Audit trail for all profile and privacy changes
- HIPAA-compliant data handling for health information

## Future Enhancements

1. **Photo Management**: Upload and manage donor photos with privacy controls
2. **Document Storage**: Secure storage for genetic test results
3. **Multi-clinic Support**: Link profile to multiple cryobanks
4. **Sibling Registry**: Optional participation in sibling connection features
5. **Advanced Analytics**: Donation impact metrics and family tree visualizations
6. **Mobile App**: Native mobile experience for on-the-go updates

## Testing Guide

### Manual Testing Steps:

1. **Signup Flow**:
   - Navigate to `/for-donors`
   - Click "Access Donor Portal"
   - Complete signup form
   - Verify email
   - Access dashboard

2. **Profile Management**:
   - Edit all profile fields
   - Check preview tab
   - Save changes
   - Verify updates persist

3. **Health Updates**:
   - Add medical conditions
   - Add medications
   - Check reminder status
   - Verify 12-month threshold alerts

4. **Privacy Controls**:
   - Toggle between privacy levels
   - Check preview updates
   - Test individual field controls
   - Verify message approval settings

5. **Communication**:
   - Send test message (if connections exist)
   - Test message approval flow
   - Archive conversations
   - Search functionality

## Support

For questions or issues:
- Technical Support: support@familyshapes.com
- Privacy Questions: privacy@familyshapes.com
- General Inquiries: hello@familyshapes.com