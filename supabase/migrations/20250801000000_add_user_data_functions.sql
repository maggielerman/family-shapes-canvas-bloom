-- Migration: Add user data export function (no account deletion)
-- Date: 2025-08-01
-- Description:
--   Creates public.export_user_data_json(uuid, jsonb) which aggregates the user’s data into a single JSONB blob.
--   Grants EXECUTE on the function to authenticated & service_role roles so it can be invoked from Edge Functions.

-- Use SECURITY DEFINER so the function runs with owner privileges (bypasses RLS while still audit-safe).

--  Export-user data --------------------------------------------------------
create or replace function public.export_user_data_json(
  p_user_uuid uuid,
  p_include jsonb default '[]'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb := '{}'::jsonb;
begin
  if (p_include = '[]'::jsonb or p_include ? 'settings') then
    result := result || jsonb_build_object('user_settings', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from public.user_settings t where t.user_id = p_user_uuid
    ));
  end if;

  if (p_include = '[]'::jsonb or p_include ? 'profile') then
    result := result || jsonb_build_object('user_profile', (
      select row_to_json(u) from public.user_profiles u where u.id = p_user_uuid
    ));
  end if;

  if (p_include = '[]'::jsonb or p_include ? 'family_trees') then
    result := result || jsonb_build_object('family_trees', (
      select coalesce(jsonb_agg(ft), '[]'::jsonb) from public.family_trees ft where ft.user_id = p_user_uuid
    ));
  end if;

  if (p_include = '[]'::jsonb or p_include ? 'people') then
    result := result || jsonb_build_object('persons', (
      select coalesce(jsonb_agg(p), '[]'::jsonb) from public.persons p where p.user_id = p_user_uuid
    ));
  end if;

  if (p_include = '[]'::jsonb or p_include ? 'media') then
    result := result || jsonb_build_object('media_files', (
      select coalesce(jsonb_agg(m), '[]'::jsonb) from public.media_files m where m.user_id = p_user_uuid
    ));
  end if;

  return result;
end;
$$;

comment on function public.export_user_data_json(uuid, jsonb)
  is 'Aggregates a user\'s data into JSONB for export; used by Edge Function export-user-data.';

grant execute on function public.export_user_data_json(uuid, jsonb) to authenticated, service_role;

-- Convenience index for export speed ---------------------------------------
create index if not exists idx_media_files_user_id on public.media_files(user_id);

-- End ---------------------------------------------------------------------- 