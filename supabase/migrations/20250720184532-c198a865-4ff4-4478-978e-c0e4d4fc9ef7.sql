-- Security fixes based on Supabase linter recommendations
-- This migration addresses function search path security issues

-- Fix function search paths by setting them explicitly for security
-- These changes are safe and only improve security without breaking functionality

-- Update existing functions to have secure search paths
ALTER FUNCTION public.check_organization_owner(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.column_exists(text, text) SET search_path = 'public';
ALTER FUNCTION public.create_user_settings() SET search_path = 'public';
ALTER FUNCTION public.get_table_columns(text) SET search_path = 'public';
ALTER FUNCTION public.get_postgres_version() SET search_path = 'public';
ALTER FUNCTION public.validate_family_connection() SET search_path = 'public';
ALTER FUNCTION public.get_table_triggers(text) SET search_path = 'public';
ALTER FUNCTION public.get_user_tenant_groups(uuid) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.get_table_constraints(text) SET search_path = 'public';
ALTER FUNCTION public.get_policies_for_table(text) SET search_path = 'public';
ALTER FUNCTION public.get_family_members(uuid) SET search_path = 'public';
ALTER FUNCTION public.log_tenant_activity() SET search_path = 'public';
ALTER FUNCTION public.verify_tenant_isolation() SET search_path = 'public';

-- Add indexes for foreign key performance improvements
-- These are safe additions that only improve query performance

-- Index for organization_id foreign keys
CREATE INDEX IF NOT EXISTS idx_persons_organization_id ON public.persons(organization_id);
CREATE INDEX IF NOT EXISTS idx_connections_organization_id ON public.connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_family_trees_organization_id ON public.family_trees(organization_id);

-- Index for user_id foreign keys  
CREATE INDEX IF NOT EXISTS idx_persons_user_id ON public.persons(user_id);
CREATE INDEX IF NOT EXISTS idx_family_trees_user_id ON public.family_trees(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON public.media_files(user_id);

-- Index for group_id foreign keys
CREATE INDEX IF NOT EXISTS idx_connections_group_id ON public.connections(group_id);
CREATE INDEX IF NOT EXISTS idx_family_trees_group_id ON public.family_trees(group_id);

-- Index for family_tree_id foreign keys
CREATE INDEX IF NOT EXISTS idx_connections_family_tree_id ON public.connections(family_tree_id);
CREATE INDEX IF NOT EXISTS idx_family_tree_members_family_tree_id ON public.family_tree_members(family_tree_id);
CREATE INDEX IF NOT EXISTS idx_family_tree_media_family_tree_id ON public.family_tree_media(family_tree_id);

-- Index for person_id foreign keys
CREATE INDEX IF NOT EXISTS idx_family_tree_members_person_id ON public.family_tree_members(person_id);
CREATE INDEX IF NOT EXISTS idx_person_media_person_id ON public.person_media(person_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_person_id ON public.group_memberships(person_id);

-- Common query patterns
CREATE INDEX IF NOT EXISTS idx_family_trees_visibility ON public.family_trees(visibility);
CREATE INDEX IF NOT EXISTS idx_organizations_visibility ON public.organizations(visibility);
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON public.groups(visibility);

-- Composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_user ON public.organization_memberships(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_user ON public.group_memberships(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_links_active_expires ON public.sharing_links(is_active, expires_at) WHERE is_active = true;