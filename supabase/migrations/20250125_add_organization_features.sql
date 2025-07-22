-- Migration to add enhanced organization features
-- This includes donor database, sibling groups, and other organization enhancements

-- Create organization_donor_database table
CREATE TABLE IF NOT EXISTS public.organization_donor_database (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  donor_id uuid NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  visibility text NOT NULL DEFAULT 'members_only' CHECK (visibility IN ('public', 'members_only', 'admin_only')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  notes text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, donor_id)
);

-- Create sibling_groups table
CREATE TABLE IF NOT EXISTS public.sibling_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
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
  UNIQUE(organization_id, donor_id)
);

-- Create sibling_group_memberships table
CREATE TABLE IF NOT EXISTS public.sibling_group_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sibling_group_id uuid NOT NULL REFERENCES public.sibling_groups(id) ON DELETE CASCADE,
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_donor_database_org_id ON public.organization_donor_database(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_donor_database_donor_id ON public.organization_donor_database(donor_id);
CREATE INDEX IF NOT EXISTS idx_organization_donor_database_verification ON public.organization_donor_database(verification_status);

CREATE INDEX IF NOT EXISTS idx_sibling_groups_org_id ON public.sibling_groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_sibling_groups_donor_id ON public.sibling_groups(donor_id);

CREATE INDEX IF NOT EXISTS idx_sibling_group_memberships_group_id ON public.sibling_group_memberships(sibling_group_id);
CREATE INDEX IF NOT EXISTS idx_sibling_group_memberships_person_id ON public.sibling_group_memberships(person_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_donor_database_updated_at 
  BEFORE UPDATE ON public.organization_donor_database 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sibling_groups_updated_at 
  BEFORE UPDATE ON public.sibling_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.organization_donor_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sibling_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sibling_group_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_donor_database
CREATE POLICY "Organization members can view donor database entries"
  ON public.organization_donor_database FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = organization_donor_database.organization_id
      AND om.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_donor_database.organization_id
      AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage donor database entries"
  ON public.organization_donor_database FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = organization_donor_database.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_donor_database.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- RLS Policies for sibling_groups
CREATE POLICY "Organization members can view sibling groups"
  ON public.sibling_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = sibling_groups.organization_id
      AND om.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = sibling_groups.organization_id
      AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage sibling groups"
  ON public.sibling_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = sibling_groups.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = sibling_groups.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- RLS Policies for sibling_group_memberships
CREATE POLICY "Users can view sibling group memberships for accessible groups"
  ON public.sibling_group_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sibling_groups sg
      JOIN public.organization_memberships om ON om.organization_id = sg.organization_id
      WHERE sg.id = sibling_group_memberships.sibling_group_id
      AND om.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sibling_groups sg
      JOIN public.organizations o ON o.id = sg.organization_id
      WHERE sg.id = sibling_group_memberships.sibling_group_id
      AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own sibling group memberships"
  ON public.sibling_group_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.persons p
      WHERE p.id = sibling_group_memberships.person_id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sibling_groups sg
      JOIN public.organizations o ON o.id = sg.organization_id
      WHERE sg.id = sibling_group_memberships.sibling_group_id
      AND o.owner_id = auth.uid()
    )
  );

-- Add helpful functions
CREATE OR REPLACE FUNCTION get_organization_donor_count(org_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.organization_donor_database
    WHERE organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_organization_sibling_groups_count(org_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.sibling_groups
    WHERE organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_donor_database TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sibling_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sibling_group_memberships TO authenticated;

GRANT EXECUTE ON FUNCTION get_organization_donor_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_sibling_groups_count(uuid) TO authenticated;