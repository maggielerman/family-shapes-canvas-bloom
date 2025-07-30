-- Migration: Add support for donors as a distinct user type

-- 1. Create user_profiles table to track user types
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('individual', 'donor', 'organization')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);

-- 2. Add person_type to persons table
ALTER TABLE public.persons 
ADD COLUMN IF NOT EXISTS person_type TEXT;

-- Update existing data
UPDATE public.persons 
SET person_type = CASE 
  WHEN user_id IS NOT NULL AND donor = true THEN 'donor'
  WHEN user_id IS NOT NULL THEN 'individual'
  ELSE 'family_member'
END
WHERE person_type IS NULL;

-- Add constraint after data migration
ALTER TABLE public.persons 
ADD CONSTRAINT person_type_check 
CHECK (person_type IN ('individual', 'donor', 'family_member'));

-- 3. Create donor_profiles table for registered donor users
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.persons(id),
  
  -- Profile fields
  donor_number TEXT,
  cryobank_name TEXT,
  donor_type TEXT CHECK (donor_type IN ('sperm', 'egg', 'embryo', 'other')),
  
  -- Physical characteristics (moved from persons)
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
CREATE INDEX idx_donor_profiles_user_id ON public.donor_profiles(user_id);
CREATE INDEX idx_donor_profiles_person_id ON public.donor_profiles(person_id);

-- 4. Create messaging tables
CREATE TABLE IF NOT EXISTS public.donor_message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  family_id UUID, -- Will reference families/organizations
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
  recipient_id UUID REFERENCES auth.users(id),
  content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messaging
CREATE INDEX idx_donor_messages_thread_id ON public.donor_messages(thread_id);
CREATE INDEX idx_donor_messages_sender_id ON public.donor_messages(sender_id);
CREATE INDEX idx_donor_messages_recipient_id ON public.donor_messages(recipient_id);

-- 5. Create activity log
CREATE TABLE IF NOT EXISTS public.donor_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_profile_id UUID REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_donor_activity_log_donor_profile_id ON public.donor_activity_log(donor_profile_id);
CREATE INDEX idx_donor_activity_log_created_at ON public.donor_activity_log(created_at DESC);

-- 6. Enable RLS on new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_activity_log ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- donor_profiles policies
CREATE POLICY "Users can view own donor profile" ON public.donor_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view non-anonymous donor profiles" ON public.donor_profiles
  FOR SELECT USING (
    is_anonymous = false OR
    auth.uid() = user_id
  );

-- donor_messages policies
CREATE POLICY "Users can view their messages" ON public.donor_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON public.donor_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- donor_message_threads policies
CREATE POLICY "Users can view their threads" ON public.donor_message_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_message_threads.donor_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- donor_activity_log policies
CREATE POLICY "Users can view own activity" ON public.donor_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_activity_log.donor_profile_id
      AND dp.user_id = auth.uid()
    )
  );

-- 8. Create function to automatically create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user_profile if user_type is provided in metadata
  IF NEW.raw_user_meta_data->>'user_type' IS NOT NULL THEN
    INSERT INTO public.user_profiles (user_id, user_type)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'user_type');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Update existing users (migrate current users to individual type)
INSERT INTO public.user_profiles (user_id, user_type)
SELECT 
  au.id,
  CASE 
    WHEN p.donor = true THEN 'donor'
    ELSE 'individual'
  END as user_type
FROM auth.users au
LEFT JOIN public.persons p ON p.user_id = au.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = au.id
);

-- 10. Create helper function to check user type
CREATE OR REPLACE FUNCTION public.get_user_type(user_id UUID)
RETURNS TEXT AS $$
  SELECT user_type FROM public.user_profiles WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER;