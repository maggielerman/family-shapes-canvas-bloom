# Donor User Type Migration Plan

## Current State Analysis

### Existing Data Model
1. **persons table**: 
   - Has a boolean `donor` field (true/false)
   - Linked to auth users via `user_id`
   - No `person_type` field exists
   - Represents people in family trees (can be created without auth)

2. **donors table**:
   - Stores donor-specific attributes (blood type, height, etc.)
   - Links to persons via `person_id`
   - Designed for donors added by users, not self-registered donors

3. **Auth system**:
   - Uses Supabase Auth (auth.users)
   - No built-in user type differentiation
   - User metadata stored in `raw_user_meta_data`

### Current Problems
1. No clear distinction between user types at the auth level
2. `persons` table mixes authenticated users with non-authenticated family members
3. No proper access control based on user type
4. Missing tables for donor-specific features (messaging, connections)

## Proposed Data Model Changes

### 1. Add User Type Support

#### Option A: Add user_profiles table (Recommended)
```sql
-- New table to extend auth.users with app-specific data
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'donor', 'organization')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
```

#### Option B: Use auth.users metadata
- Store user_type in `raw_user_meta_data`
- Less ideal as it's harder to query and enforce

### 2. Separate Donor Users from Family Tree Donors

```sql
-- Rename existing donors table to family_tree_donors
ALTER TABLE donors RENAME TO family_tree_donors;

-- Create new table for registered donor users
CREATE TABLE donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES persons(id),
  
  -- Profile fields
  donor_number TEXT,
  cryobank_name TEXT,
  donor_type TEXT CHECK (donor_type IN ('sperm', 'egg', 'embryo', 'other')),
  
  -- Physical characteristics
  height TEXT,
  weight TEXT,
  eye_color TEXT,
  hair_color TEXT,
  ethnicity TEXT,
  blood_type TEXT,
  
  -- Additional info
  education_level TEXT,
  occupation TEXT,
  interests TEXT,
  personal_statement TEXT,
  
  -- Medical
  medical_history JSONB,
  last_health_update TIMESTAMP WITH TIME ZONE,
  
  -- Privacy
  is_anonymous BOOLEAN DEFAULT true,
  privacy_settings JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

### 3. Add Donor-Specific Tables

```sql
-- Connections between donors and recipient families
CREATE TABLE donor_recipient_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES donor_profiles(id) ON DELETE CASCADE,
  family_id UUID, -- Reference to a family or organization
  status TEXT CHECK (status IN ('pending', 'active', 'blocked', 'archived')),
  initiated_by TEXT CHECK (initiated_by IN ('donor', 'family')),
  connection_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messaging system
CREATE TABLE donor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  content TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message threads
CREATE TABLE donor_message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES donor_profiles(id),
  family_id UUID,
  subject TEXT,
  status TEXT CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for donors
CREATE TABLE donor_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES donor_profiles(id),
  activity_type TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Update Persons Table

```sql
-- Add person_type to distinguish between different types of persons
ALTER TABLE persons 
ADD COLUMN person_type TEXT CHECK (person_type IN ('individual', 'donor', 'family_member'));

-- Migrate existing data
UPDATE persons 
SET person_type = CASE 
  WHEN user_id IS NOT NULL AND donor = true THEN 'donor'
  WHEN user_id IS NOT NULL THEN 'individual'
  ELSE 'family_member'
END;

-- Make person_type NOT NULL after migration
ALTER TABLE persons 
ALTER COLUMN person_type SET NOT NULL;
```

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1)
1. Create `user_profiles` table
2. Create migration to populate user_profiles for existing users
3. Update auth flow to create user_profile on signup
4. Add RLS policies for user_profiles

### Phase 2: Donor Profile System (Week 1-2)
1. Create `donor_profiles` table
2. Migrate existing donor data where applicable
3. Update donor signup flow to create donor_profile
4. Add RLS policies for donor_profiles

### Phase 3: Communication Features (Week 2)
1. Create messaging tables
2. Implement message approval workflow
3. Add activity logging
4. Create RLS policies for all new tables

### Phase 4: Access Control (Week 2-3)
1. Update all queries to check user_type
2. Implement route guards based on user_type
3. Update UI to show/hide features based on user_type
4. Add comprehensive testing

## Migration Strategy

### For Existing Data
1. All current auth users get `user_type = 'individual'`
2. Persons with `donor = true` and `user_id` get `person_type = 'donor'`
3. Create donor_profiles for any existing donor users

### For New Users
1. Signup flow must specify user type
2. Create appropriate profile record on signup
3. Set proper defaults based on user type

## RLS Policies Examples

```sql
-- user_profiles: Users can only read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- donor_profiles: Public read for non-anonymous, restricted for anonymous
CREATE POLICY "View donor profiles" ON donor_profiles
  FOR SELECT USING (
    CASE 
      WHEN is_anonymous = false THEN true
      WHEN auth.uid() = user_id THEN true
      ELSE false
    END
  );

-- donor_messages: Complex policy for message visibility
CREATE POLICY "View messages" ON donor_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM donor_profiles dp
      WHERE dp.user_id = auth.uid() 
      AND dp.id IN (
        SELECT donor_profile_id FROM donor_message_threads
        WHERE id = donor_messages.thread_id
      )
    )
  );
```

## Code Updates Required

1. **AuthContext**: Add user type detection
2. **ProtectedRoute**: Create type-specific route guards
3. **Navigation**: Show/hide based on user type
4. **API calls**: Update to use new tables
5. **Types**: Generate new types from updated schema

## Benefits

1. **Clear separation**: Donor users vs family tree donors
2. **Proper access control**: Type-based permissions
3. **Scalability**: Easy to add new user types
4. **Data integrity**: Enforced at database level
5. **Performance**: Indexed lookups by user type

## Risks and Mitigation

1. **Risk**: Breaking existing functionality
   - **Mitigation**: Careful migration with backwards compatibility

2. **Risk**: Complex RLS policies
   - **Mitigation**: Thorough testing, clear documentation

3. **Risk**: Performance impact
   - **Mitigation**: Proper indexing, query optimization

## Timeline

- Week 1: Core infrastructure and donor profiles
- Week 2: Communication features and access control
- Week 3: Testing, bug fixes, and deployment

## Next Steps

1. Review and approve plan
2. Create database migration scripts
3. Update TypeScript types
4. Implement auth flow changes
5. Update all affected components