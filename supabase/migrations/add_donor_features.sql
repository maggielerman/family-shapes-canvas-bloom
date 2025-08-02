-- Migration: Add donor-specific features to existing schema

-- 1. Update user_profiles account_type constraint if needed
-- First check if constraint exists and drop it
DO $$ 
BEGIN
  ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_account_type_check;
END $$;

-- Add updated constraint that includes 'donor'
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_account_type_check 
CHECK (account_type IN ('individual', 'donor', 'organization'));

-- 2. Create donor_profiles table for donor-specific data
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link to existing persons record if applicable
  person_id UUID REFERENCES public.persons(id),
  
  -- Donor identification
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
  privacy_settings JSONB DEFAULT '{
    "privacy_level": "anonymous",
    "allow_family_messages": true,
    "allow_clinic_messages": true,
    "require_message_approval": true,
    "message_notifications": true,
    "show_basic_info": true,
    "show_physical_characteristics": true,
    "show_health_history": true,
    "show_education": false,
    "show_occupation": false,
    "show_interests": false,
    "show_personal_statement": false,
    "show_contact_info": false,
    "show_photos": false
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donor_profiles_user_id ON public.donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_person_id ON public.donor_profiles(person_id);

-- 3. Create messaging tables for donor communication
CREATE TABLE IF NOT EXISTS public.donor_message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id), -- Could be family member or org staff
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.donor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES public.donor_message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messaging
CREATE INDEX IF NOT EXISTS idx_donor_messages_thread_id ON public.donor_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_donor_messages_sender_id ON public.donor_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_donor_message_threads_donor_profile_id ON public.donor_message_threads(donor_profile_id);

-- 4. Create donor-recipient connections table
CREATE TABLE IF NOT EXISTS public.donor_recipient_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  connection_type TEXT CHECK (connection_type IN ('family', 'clinic')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked', 'archived')),
  initiated_by TEXT CHECK (initiated_by IN ('donor', 'recipient', 'organization')),
  connected_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_recipient_connections_donor_id ON public.donor_recipient_connections(donor_profile_id);
CREATE INDEX IF NOT EXISTS idx_donor_recipient_connections_recipient_id ON public.donor_recipient_connections(recipient_user_id);

-- 5. Create activity log for donor actions
CREATE TABLE IF NOT EXISTS public.donor_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_activity_log_donor_profile_id ON public.donor_activity_log(donor_profile_id);
CREATE INDEX IF NOT EXISTS idx_donor_activity_log_created_at ON public.donor_activity_log(created_at DESC);

-- 6. Enable RLS on new tables
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_recipient_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activity_log ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- donor_profiles policies
CREATE POLICY "Users can manage own donor profile" ON public.donor_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Recipients can view connected donor profiles" ON public.donor_profiles
  FOR SELECT USING (
    -- Allow if there's an active connection
    EXISTS (
      SELECT 1 FROM public.donor_recipient_connections drc
      WHERE drc.donor_profile_id = donor_profiles.id
      AND drc.recipient_user_id = auth.uid()
      AND drc.status = 'active'
    )
    -- Respect privacy settings
    AND (
      NOT is_anonymous OR
      (privacy_settings->>'privacy_level')::text != 'anonymous'
    )
  );

-- donor_messages policies
CREATE POLICY "Users can view their messages" ON public.donor_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() IN (
      SELECT dmt.recipient_user_id 
      FROM public.donor_message_threads dmt 
      WHERE dmt.id = donor_messages.thread_id
    ) OR
    auth.uid() IN (
      SELECT dp.user_id 
      FROM public.donor_profiles dp
      JOIN public.donor_message_threads dmt ON dmt.donor_profile_id = dp.id
      WHERE dmt.id = donor_messages.thread_id
    )
  );

CREATE POLICY "Users can send messages" ON public.donor_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- donor_message_threads policies
CREATE POLICY "Users can view their threads" ON public.donor_message_threads
  FOR SELECT USING (
    auth.uid() = recipient_user_id OR
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_message_threads.donor_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- donor_recipient_connections policies
CREATE POLICY "Users can view their connections" ON public.donor_recipient_connections
  FOR SELECT USING (
    auth.uid() = recipient_user_id OR
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_recipient_connections.donor_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- donor_activity_log policies
CREATE POLICY "Donors can view own activity" ON public.donor_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_activity_log.donor_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- 8. Create function to handle donor signup
CREATE OR REPLACE FUNCTION public.handle_donor_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user_profiles has account_type = 'donor'
  IF EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = NEW.id AND account_type = 'donor'
  ) THEN
    -- Create donor_profile record
    INSERT INTO public.donor_profiles (user_id)
    VALUES (NEW.id);
    
    -- Log the signup
    INSERT INTO public.donor_activity_log (
      donor_profile_id,
      activity_type,
      description
    )
    SELECT 
      dp.id,
      'signup',
      'Donor account created'
    FROM public.donor_profiles dp
    WHERE dp.user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for donor signup
DROP TRIGGER IF EXISTS on_donor_user_created ON public.user_profiles;
CREATE TRIGGER on_donor_user_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW 
  WHEN (NEW.account_type = 'donor')
  EXECUTE FUNCTION public.handle_donor_signup();

-- 9. Add helper function to check if user is a donor
CREATE OR REPLACE FUNCTION public.is_donor(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = $1 AND account_type = 'donor'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 10. Add function to get donor profile
CREATE OR REPLACE FUNCTION public.get_donor_profile(user_id UUID)
RETURNS TABLE (
  donor_profile_id UUID,
  person_id UUID,
  donor_number TEXT,
  cryobank_name TEXT,
  account_type TEXT
) AS $$
  SELECT 
    dp.id as donor_profile_id,
    dp.person_id,
    dp.donor_number,
    dp.cryobank_name,
    up.account_type
  FROM public.donor_profiles dp
  JOIN public.user_profiles up ON up.id = dp.user_id
  WHERE dp.user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER;