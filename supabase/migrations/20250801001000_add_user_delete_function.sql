-- Migration: Add delete_user_data helper
-- Date: 2025-08-01T00:10:00Z
-- Description:
--   Creates public.delete_user_data(uuid) which cascades deletes across user-owned tables and removes the auth user via auth.delete_user.
--   Grants EXECUTE on the function to authenticated & service_role roles so it can be invoked from Edge Functions.

-- SECURITY DEFINER allows the function to bypass RLS while still being audited.

create or replace function public.delete_user_data(p_user_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Remove settings first (no FK dependencies)
  delete from public.user_settings   where user_id = p_user_uuid;
  -- Media
  delete from public.media_files     where user_id = p_user_uuid;
  -- Trees & people
  delete from public.family_trees    where user_id = p_user_uuid;
  delete from public.persons         where user_id = p_user_uuid;
  -- Orgs owned by the user
  delete from public.organizations   where owner_id = p_user_uuid;

  -- Finally remove the auth user (requires service role capability)
  perform auth.delete_user(p_user_uuid);
end;
$$;

comment on function public.delete_user_data(uuid)
  is 'Cascade-deletes a user and their related data; used by Edge Function delete-account.';

grant execute on function public.delete_user_data(uuid) to authenticated, service_role;

-- End ---------------------------------------------------------------------- 