# Donor Portal Manual Testing Checklist

## Pre-Migration Functionality Tests
Verify these still work after running the migration:

### 1. Individual User Authentication
- [ ] Can sign up as individual user
- [ ] Can sign in as individual user
- [ ] Dashboard loads correctly
- [ ] Can access all individual features (People, Family Trees, etc.)
- [ ] Sidebar shows correct navigation items

### 2. Organization Authentication
- [ ] Can sign up as organization
- [ ] Can sign in as organization user
- [ ] Organization dashboard loads
- [ ] Can access organization-specific features
- [ ] Sidebar shows organization navigation

### 3. Existing Data Integrity
- [ ] Existing persons records are intact
- [ ] Existing donors records are intact
- [ ] User profiles still have correct account_type values

## Donor Portal Feature Tests

### 1. Donor Signup Flow
- [ ] Navigate to `/donor/auth`
- [ ] Fill out signup form with:
  - Email
  - Password
  - Full name
  - Donor number (optional)
  - Cryobank name (optional)
  - Donor type (sperm/egg/embryo/other)
  - Privacy preference (anonymous checkbox)
  - Consent checkboxes
- [ ] Submit form
- [ ] Success message appears
- [ ] Check database:
  - [ ] `user_profiles` has entry with `account_type = 'donor'`
  - [ ] `persons` has entry with `donor = true`
  - [ ] `donors` table has entry
  - [ ] `donor_profiles` table has entry (if migration ran successfully)

### 2. Donor Sign In
- [ ] Sign out if logged in
- [ ] Navigate to `/donor/auth`
- [ ] Use donor credentials
- [ ] Successfully redirected to `/donor/dashboard`
- [ ] Non-donors cannot access donor portal (get redirected)

### 3. Donor Dashboard
- [ ] Dashboard loads without errors
- [ ] Shows correct stats:
  - [ ] Connected families (0 for new donor)
  - [ ] Profile completeness percentage
  - [ ] Privacy level (Anonymous/Semi-Open/Open)
  - [ ] Unread messages (0)
- [ ] Health update reminder shows correctly
- [ ] Quick action buttons work:
  - [ ] Complete Profile → `/donor/profile`
  - [ ] Update Health Info → `/donor/health`
  - [ ] View Messages → `/donor/communication`
  - [ ] Manage Privacy → `/donor/privacy`
- [ ] Recent activity section displays (empty for new donor)

### 4. Donor Profile Management
- [ ] Navigate to `/donor/profile`
- [ ] All tabs load: Basic Info, Physical, Additional
- [ ] Can edit profile:
  - [ ] Click Edit button
  - [ ] Modify fields
  - [ ] Save changes
  - [ ] Verify changes persist after page reload
- [ ] Preview tab shows correct information based on privacy settings

### 5. Health Information
- [ ] Navigate to `/donor/health`
- [ ] All tabs load: General, Conditions, Medications, Allergies, Lifestyle
- [ ] Can add medical conditions
- [ ] Can add medications
- [ ] Can add allergies
- [ ] Can update lifestyle factors
- [ ] Save changes
- [ ] Last updated timestamp updates
- [ ] Dashboard health reminder reflects new update

### 6. Privacy Settings
- [ ] Navigate to `/donor/privacy`
- [ ] Can change privacy level (Anonymous/Semi-Open/Open)
- [ ] Individual privacy toggles work correctly
- [ ] Some toggles are disabled based on privacy level
- [ ] Communication preferences can be updated
- [ ] Preview shows correct visible information
- [ ] Changes persist after save

### 7. Communication Center
- [ ] Navigate to `/donor/communication`
- [ ] Page loads without errors
- [ ] Shows placeholder message (since tables are new)
- [ ] Tabs are visible: Inbox, Pending, Archived

### 8. Navigation & Access Control
- [ ] Sidebar shows donor-specific navigation
- [ ] Cannot access individual user pages while logged in as donor
- [ ] Donor Portal link appears in sidebar for non-donor users
- [ ] Protected routes work:
  - [ ] Non-authenticated users → `/donor/auth`
  - [ ] Non-donor authenticated users → `/donor/auth`
  - [ ] Donors can access all donor pages

### 9. Database Verification
Run these queries in Supabase SQL editor:

```sql
-- Check user_profiles constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'user_profiles_account_type_check';

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('donor_profiles', 'donor_message_threads', 'donor_messages', 'donor_recipient_connections', 'donor_activity_log');

-- Check donor profiles created
SELECT up.account_type, p.donor, d.*, dp.*
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN persons p ON p.user_id = u.id
LEFT JOIN donors d ON d.person_id = p.id
LEFT JOIN donor_profiles dp ON dp.user_id = u.id
WHERE up.account_type = 'donor';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('donor_profiles', 'donor_messages', 'donor_message_threads');
```

## Performance Tests
- [ ] Pages load quickly (< 2 seconds)
- [ ] No console errors in browser
- [ ] No failed network requests
- [ ] Build completes without warnings

## Edge Cases
- [ ] Sign up with existing email shows appropriate error
- [ ] Invalid form submissions show validation errors
- [ ] Network errors are handled gracefully
- [ ] Missing data doesn't crash pages

## Mobile Responsiveness
- [ ] Test all donor pages on mobile viewport
- [ ] Navigation menu works on mobile
- [ ] Forms are usable on mobile
- [ ] Tables/lists are scrollable

## Final Verification
- [ ] Run `npm run build` - no errors
- [ ] Run `npm test` - all tests pass
- [ ] Deploy to staging/preview - works correctly
- [ ] No regression in existing features