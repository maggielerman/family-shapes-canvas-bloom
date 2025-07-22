-- Migration: Secure delete_user_data (add backup & audit, restrict execute)
-- Date: 2025-08-01T00:20:00Z
-- Description:
--   • Creates tables deletion_backups and audit_events if not present.
--   • Replaces delete_user_data(uuid) to (1) store user data snapshot via export_user_data_json,
--     (2) insert audit event, (3) cascade-delete data, and (4) remove auth user.
--   • Revokes EXECUTE on the function from the authenticated role so only service_role can run it.

-- 0. Safety: enable extension for uuid generation if not already
create extension if not exists "uuid-ossp";

-- 1. Tables ------------------------------------------------------------------
create table if not exists public.deletion_backups (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.audit_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null,
  event_type  text not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- 2. Replace function --------------------------------------------------------
create or replace function public.delete_user_data(p_user_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Backup current state
  insert into public.deletion_backups(user_id, payload)
  values (
    p_user_uuid,
    public.export_user_data_json(p_user_uuid, '[]'::jsonb)
  );

  -- Audit event
  insert into public.audit_events(user_id, event_type, metadata)
  values (p_user_uuid, 'account_deleted', jsonb_build_object('performed_by', current_user));

  -- Remove settings first (no FK dependencies)
  delete from public.user_settings   where user_id = p_user_uuid;
  -- Media
  delete from public.media_files     where user_id = p_user_uuid;
  -- Trees & people
  delete from public.family_trees    where user_id = p_user_uuid;
  delete from public.persons         where user_id = p_user_uuid;
  -- Orgs owned by the user
  delete from public.organizations   where owner_id = p_user_uuid;

  -- Finally remove the auth user
  perform auth.delete_user(p_user_uuid);
end;
$$;

comment on function public.delete_user_data(uuid)
  is 'Cascade-deletes a user and their related data. Creates backup & audit row; callable only by service_role.';

-- 3. Permissions -------------------------------------------------------------
revoke execute on function public.delete_user_data(uuid) from authenticated;
grant execute on function public.delete_user_data(uuid) to service_role;

-- End ---------------------------------------------------------------------- 