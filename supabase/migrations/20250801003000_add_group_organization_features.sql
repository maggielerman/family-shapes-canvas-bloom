-- Migration to add organization-like features to groups
-- This maintains backward compatibility while adding new functionality

-- Add new columns to groups table
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS subdomain text,
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';

-- Add unique constraints for slug and subdomain
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_subdomain ON public.groups(subdomain) WHERE subdomain IS NOT NULL;

-- Update existing groups with default slugs
UPDATE public.groups 
SET slug = LOWER(REGEXP_REPLACE(label, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Update existing groups with default subdomains
UPDATE public.groups 
SET subdomain = LOWER(REGEXP_REPLACE(label, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE subdomain IS NULL;

-- Create group_invitations table
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id uuid REFERENCES auth.users(id),
  invitee_email text NOT NULL,
  role text DEFAULT 'member',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  token text DEFAULT gen_random_uuid()::text UNIQUE,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  CHECK (role IN ('viewer', 'editor', 'admin'))
);

-- Create group_donor_database table
CREATE TABLE IF NOT EXISTS public.group_donor_database (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  visibility text NOT NULL DEFAULT 'members_only' CHECK (visibility IN ('public', 'members_only', 'admin_only')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  notes text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, donor_id)
);

-- Create group_sibling_groups table
CREATE TABLE IF NOT EXISTS public.group_sibling_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  privacy_level text NOT NULL DEFAULT 'members_only' CHECK (privacy_level IN ('public', 'members_only', 'private')),
  auto_add_new_siblings boolean DEFAULT true,
  allow_contact_sharing boolean DEFAULT true,
  allow_photo_sharing boolean DEFAULT true,
  allow_medical_sharing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, donor_id)
);

-- Create group_sibling_group_memberships table
CREATE TABLE IF NOT EXISTS public.group_sibling_group_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sibling_group_id uuid NOT NULL REFERENCES public.group_sibling_groups(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
  notification_preferences jsonb DEFAULT '{
    "new_members": true,
    "group_updates": true,
    "direct_messages": true
  }',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(sibling_group_id, person_id)
);

-- Create group_media table
CREATE TABLE IF NOT EXISTS public.group_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  media_file_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  added_by uuid NOT NULL REFERENCES auth.users(id),
  description text,
  folder_id uuid,
  sort_order integer,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee_email ON public.group_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON public.group_invitations(status);

CREATE INDEX IF NOT EXISTS idx_group_donor_database_group_id ON public.group_donor_database(group_id);
CREATE INDEX IF NOT EXISTS idx_group_donor_database_donor_id ON public.group_donor_database(donor_id);
CREATE INDEX IF NOT EXISTS idx_group_donor_database_verification ON public.group_donor_database(verification_status);

CREATE INDEX IF NOT EXISTS idx_group_sibling_groups_group_id ON public.group_sibling_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_group_sibling_groups_donor_id ON public.group_sibling_groups(donor_id);

CREATE INDEX IF NOT EXISTS idx_group_sibling_group_memberships_group_id ON public.group_sibling_group_memberships(sibling_group_id);
CREATE INDEX IF NOT EXISTS idx_group_sibling_group_memberships_person_id ON public.group_sibling_group_memberships(person_id);

CREATE INDEX IF NOT EXISTS idx_group_media_group_id ON public.group_media(group_id);
CREATE INDEX IF NOT EXISTS idx_group_media_media_file_id ON public.group_media(media_file_id);

-- Add updated_at triggers
CREATE TRIGGER update_group_donor_database_updated_at 
  BEFORE UPDATE ON public.group_donor_database 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_sibling_groups_updated_at 
  BEFORE UPDATE ON public.group_sibling_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_donor_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sibling_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_sibling_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_invitations
CREATE POLICY "Group members can view invitations"
  ON public.group_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_invitations.group_id
      AND gm.user_id = auth.uid()
    )
    OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Group admins can manage invitations"
  ON public.group_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_invitations.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_invitations.group_id
      AND g.owner_id = auth.uid()
    )
  );

-- RLS Policies for group_donor_database
CREATE POLICY "Group members can view donor database entries"
  ON public.group_donor_database FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_donor_database.group_id
      AND gm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_donor_database.group_id
      AND g.owner_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage donor database entries"
  ON public.group_donor_database FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_donor_database.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_donor_database.group_id
      AND g.owner_id = auth.uid()
    )
  );

-- RLS Policies for group_sibling_groups
CREATE POLICY "Group members can view sibling groups"
  ON public.group_sibling_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_sibling_groups.group_id
      AND gm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_sibling_groups.group_id
      AND g.owner_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage sibling groups"
  ON public.group_sibling_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_sibling_groups.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_sibling_groups.group_id
      AND g.owner_id = auth.uid()
    )
  );

-- RLS Policies for group_sibling_group_memberships
CREATE POLICY "Users can view sibling group memberships for accessible groups"
  ON public.group_sibling_group_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_sibling_groups gsg
      JOIN public.group_memberships gm ON gm.group_id = gsg.group_id
      WHERE gsg.id = group_sibling_group_memberships.sibling_group_id
      AND gm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.group_sibling_groups gsg
      JOIN public.groups g ON g.id = gsg.group_id
      WHERE gsg.id = group_sibling_group_memberships.sibling_group_id
      AND g.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own sibling group memberships"
  ON public.group_sibling_group_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = group_sibling_group_memberships.person_id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.group_sibling_groups gsg
      JOIN public.groups g ON g.id = gsg.group_id
      WHERE gsg.id = group_sibling_group_memberships.sibling_group_id
      AND g.owner_id = auth.uid()
    )
  );

-- RLS Policies for group_media
CREATE POLICY "Group members can view media"
  ON public.group_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_media.group_id
      AND gm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_media.group_id
      AND g.owner_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add media"
  ON public.group_media FOR INSERT
  WITH CHECK (
    added_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = group_media.group_id
        AND gm.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.groups g
        WHERE g.id = group_media.group_id
        AND g.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own media"
  ON public.group_media FOR UPDATE
  USING (added_by = auth.uid());

CREATE POLICY "Users can delete their own media"
  ON public.group_media FOR DELETE
  USING (
    added_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_media.group_id
      AND g.owner_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_donor_database TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_sibling_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_sibling_group_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_media TO authenticated;

-- Helper functions
CREATE OR REPLACE FUNCTION get_group_donor_count(grp_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_donor_database
    WHERE group_id = grp_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_group_sibling_groups_count(grp_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_sibling_groups
    WHERE group_id = grp_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_donor_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_sibling_groups_count(uuid) TO authenticated;