

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_organization_owner"("org_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE id = org_id AND owner_id = user_id
  );
$$;


ALTER FUNCTION "public"."check_organization_owner"("org_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."column_exists"("table_name" "text", "column_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
$_$;


ALTER FUNCTION "public"."column_exists"("table_name" "text", "column_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_organization_for_user"("org_name" "text", "org_type" "text" DEFAULT 'fertility_clinic'::"text", "org_description" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    org_slug text;
    org_subdomain text;
    new_org_id uuid;
    current_user_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Ensure user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create an organization';
    END IF;
    
    -- Ensure organization name is provided
    IF org_name IS NULL OR trim(org_name) = '' THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;
    
    -- Generate slug and subdomain from organization name
    org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
    org_slug := trim(both '-' from org_slug);
    
    -- Ensure slug uniqueness by appending random suffix if needed
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) LOOP
        org_slug := org_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
    END LOOP;
    
    org_subdomain := org_slug;
    
    -- Ensure subdomain uniqueness
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE subdomain = org_subdomain) LOOP
        org_subdomain := org_subdomain || '-' || substr(gen_random_uuid()::text, 1, 8);
    END LOOP;
    
    -- Create the organization
    INSERT INTO public.organizations (
        name,
        slug,
        subdomain,
        type,
        description,
        visibility,
        owner_id
    ) VALUES (
        org_name,
        org_slug,
        org_subdomain,
        org_type,
        COALESCE(org_description, 'Organization created during signup'),
        'private',
        current_user_id
    ) RETURNING id INTO new_org_id;
    
    -- Update user profile to link to organization
    UPDATE public.user_profiles 
    SET organization_id = new_org_id
    WHERE id = current_user_id;
    
    RETURN new_org_id;
END;
$$;


ALTER FUNCTION "public"."create_organization_for_user"("org_name" "text", "org_type" "text", "org_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_settings"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_settings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_data"("p_user_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."delete_user_data"("p_user_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_user_data"("p_user_uuid" "uuid") IS 'Cascade-deletes a user and their related data. Creates backup & audit row; callable only by service_role.';



CREATE OR REPLACE FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb") IS 'Aggregates a user''s data into JSONB for export; used by Edge Function export-user-data.';



CREATE OR REPLACE FUNCTION "public"."get_donor_profile"("user_id" "uuid") RETURNS TABLE("donor_profile_id" "uuid", "person_id" "uuid", "donor_number" "text", "cryobank_name" "text", "account_type" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $_$
  SELECT 
    dp.id as donor_profile_id,
    dp.person_id,
    dp.donor_number,
    dp.cryobank_name,
    up.account_type
  FROM public.donor_profiles dp
  JOIN public.user_profiles up ON up.id = dp.user_id
  WHERE dp.user_id = $1;
$_$;


ALTER FUNCTION "public"."get_donor_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_family_members"("group_uuid" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "date_of_birth" "date", "birth_place" "text", "gender" "text", "status" "text", "date_of_death" "date", "death_place" "text", "profile_photo_url" "text", "email" "text", "phone" "text", "address" "text", "preferred_contact_method" "text", "social_media_links" "jsonb", "used_ivf" boolean, "used_iui" boolean, "fertility_treatments" "jsonb", "donor" boolean, "notes" "text", "metadata" "jsonb", "user_id" "uuid", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "role" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check if the group exists
    IF NOT EXISTS (SELECT 1 FROM groups WHERE id = group_uuid) THEN
        RAISE EXCEPTION 'Group with ID % does not exist', group_uuid;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.date_of_birth,
        p.birth_place,
        p.gender,
        p.status,
        p.date_of_death,
        p.death_place,
        p.profile_photo_url,
        p.email,
        p.phone,
        p.address,
        p.preferred_contact_method,
        p.social_media_links,
        p.used_ivf,
        p.used_iui,
        p.fertility_treatments,
        p.donor,
        p.notes,
        p.metadata,
        p.user_id,
        p.created_at,
        p.updated_at,
        gm.role
    FROM persons p
    INNER JOIN group_memberships gm ON p.id = gm.person_id
    WHERE gm.group_id = group_uuid;
END;
$$;


ALTER FUNCTION "public"."get_family_members"("group_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_family_members"("group_uuid" "uuid") IS 'Returns all persons who are members of the specified group with their membership roles';



CREATE OR REPLACE FUNCTION "public"."get_group_donor_count"("grp_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_donor_database
    WHERE group_id = grp_id
  );
END;
$$;


ALTER FUNCTION "public"."get_group_donor_count"("grp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_sibling_groups_count"("grp_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_sibling_groups
    WHERE group_id = grp_id
  );
END;
$$;


ALTER FUNCTION "public"."get_group_sibling_groups_count"("grp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_policies_for_table"("table_name" "text") RETURNS TABLE("policy_name" "text", "policy_command" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
    SELECT 
        pol.polname as policy_name,
        pol.polcmd as policy_command
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' 
    AND cls.relname = $1;
$_$;


ALTER FUNCTION "public"."get_policies_for_table"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_postgres_version"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT version();
$$;


ALTER FUNCTION "public"."get_postgres_version"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_columns"("table_name" "text") RETURNS TABLE("column_name" "text", "data_type" "text", "is_nullable" "text", "column_default" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
    SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = $1
    ORDER BY c.ordinal_position;
$_$;


ALTER FUNCTION "public"."get_table_columns"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_constraints"("table_name" "text") RETURNS TABLE("constraint_name" "text", "constraint_type" "text", "column_name" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
    SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' 
    AND tc.table_name = $1
    ORDER BY tc.constraint_type, tc.constraint_name;
$_$;


ALTER FUNCTION "public"."get_table_constraints"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_triggers"("table_name" "text") RETURNS TABLE("trigger_name" "text", "event_manipulation" "text", "action_timing" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
    SELECT 
        t.trigger_name,
        t.event_manipulation,
        t.action_timing
    FROM information_schema.triggers t
    WHERE t.event_object_schema = 'public' 
    AND t.event_object_table = $1;
$_$;


ALTER FUNCTION "public"."get_table_triggers"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_tenant_groups"("user_uuid" "uuid") RETURNS TABLE("group_id" "uuid", "role" "text", "is_owner" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id as group_id,
        COALESCE(gm.role, 'owner') as role,
        (g.owner_id = user_uuid) as is_owner
    FROM groups g
    LEFT JOIN group_memberships gm ON g.id = gm.group_id AND gm.user_id = user_uuid
    WHERE g.owner_id = user_uuid OR gm.user_id = user_uuid;
END;
$$;


ALTER FUNCTION "public"."get_user_tenant_groups"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_donor_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_donor_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Create user profile for new auth user
    INSERT INTO public.user_profiles (
        id,
        full_name,
        organization_id
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NULL -- No organization for new users
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_donor"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $_$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = $1 AND account_type = 'donor'
  );
$_$;


ALTER FUNCTION "public"."is_donor"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_tenant_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Automatically log activities with tenant context
    IF TG_OP = 'INSERT' THEN
        INSERT INTO family_activity (
            group_id,
            user_id,
            action_type,
            target_type,
            target_id,
            details
        ) VALUES (
            COALESCE(NEW.group_id, (
                SELECT group_id FROM group_memberships 
                WHERE person_id = NEW.id 
                LIMIT 1
            )),
            auth.uid(),
            TG_TABLE_NAME || '_created',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO family_activity (
            group_id,
            user_id,
            action_type,
            target_type,
            target_id,
            details
        ) VALUES (
            COALESCE(NEW.group_id, OLD.group_id, (
                SELECT group_id FROM group_memberships 
                WHERE person_id = NEW.id 
                LIMIT 1
            )),
            auth.uid(),
            TG_TABLE_NAME || '_updated',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO family_activity (
            group_id,
            user_id,
            action_type,
            target_type,
            target_id,
            details
        ) VALUES (
            COALESCE(OLD.group_id, (
                SELECT group_id FROM group_memberships 
                WHERE person_id = OLD.id 
                LIMIT 1
            )),
            auth.uid(),
            TG_TABLE_NAME || '_deleted',
            TG_TABLE_NAME,
            OLD.id,
            jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."log_tenant_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_family_connection"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Prevent someone from being their own parent/child
    IF NEW.from_person_id = NEW.to_person_id THEN
        RAISE EXCEPTION 'A person cannot have a relationship with themselves';
    END IF;
    
    -- Add more validation logic as needed
    -- For example: prevent circular parent-child relationships
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_family_connection"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_tenant_isolation"() RETURNS TABLE("table_name" "text", "policy_name" "text", "has_tenant_filter" boolean, "potential_leaks" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- This function helps verify that all policies properly isolate tenant data
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        policyname as policy_name,
        (qual IS NOT NULL AND qual LIKE '%group%') as has_tenant_filter,
        0 as potential_leaks -- Placeholder for actual leak detection
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('persons', 'groups', 'connections', 'group_memberships', 'family_invitations');
END;
$$;


ALTER FUNCTION "public"."verify_tenant_isolation"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."album_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "album_id" "uuid" NOT NULL,
    "media_file_id" "uuid" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."album_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "from_person_id" "uuid",
    "to_person_id" "uuid",
    "relationship_type" "text" NOT NULL,
    "group_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    "notes" "text",
    CONSTRAINT "connections_check" CHECK (("from_person_id" <> "to_person_id")),
    CONSTRAINT "connections_relationship_type_check" CHECK (("relationship_type" = ANY (ARRAY['parent'::"text", 'child'::"text", 'partner'::"text", 'sibling'::"text", 'half_sibling'::"text", 'donor'::"text", 'biological_parent'::"text", 'social_parent'::"text", 'step_sibling'::"text", 'spouse'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deletion_backups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."deletion_backups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donor_activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "donor_profile_id" "uuid",
    "activity_type" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."donor_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donor_message_threads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "donor_profile_id" "uuid",
    "recipient_user_id" "uuid",
    "subject" "text",
    "status" "text" DEFAULT 'active'::"text",
    "last_message_at" timestamp with time zone,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donor_message_threads_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."donor_message_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donor_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid",
    "sender_id" "uuid",
    "content" "text",
    "status" "text" DEFAULT 'sent'::"text",
    "is_read" boolean DEFAULT false,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donor_messages_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'sent'::"text"])))
);


ALTER TABLE "public"."donor_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donor_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "person_id" "uuid",
    "donor_number" "text",
    "cryobank_name" "text",
    "donor_type" "text",
    "height" "text",
    "weight" "text",
    "eye_color" "text",
    "hair_color" "text",
    "ethnicity" "text",
    "blood_type" "text",
    "education_level" "text",
    "occupation" "text",
    "interests" "text",
    "personal_statement" "text",
    "medical_history" "jsonb",
    "last_health_update" timestamp with time zone,
    "is_anonymous" boolean DEFAULT true,
    "privacy_settings" "jsonb" DEFAULT '{"show_photos": false, "privacy_level": "anonymous", "show_education": false, "show_interests": false, "show_basic_info": true, "show_occupation": false, "show_contact_info": false, "show_health_history": true, "allow_clinic_messages": true, "allow_family_messages": true, "message_notifications": true, "show_personal_statement": false, "require_message_approval": true, "show_physical_characteristics": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donor_profiles_donor_type_check" CHECK (("donor_type" = ANY (ARRAY['sperm'::"text", 'egg'::"text", 'embryo'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."donor_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donor_recipient_connections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "donor_profile_id" "uuid",
    "recipient_user_id" "uuid",
    "organization_id" "uuid",
    "connection_type" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "initiated_by" "text",
    "connected_at" timestamp with time zone,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donor_recipient_connections_connection_type_check" CHECK (("connection_type" = ANY (ARRAY['family'::"text", 'clinic'::"text"]))),
    CONSTRAINT "donor_recipient_connections_initiated_by_check" CHECK (("initiated_by" = ANY (ARRAY['donor'::"text", 'recipient'::"text", 'organization'::"text"]))),
    CONSTRAINT "donor_recipient_connections_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'blocked'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."donor_recipient_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "donor_number" "text",
    "sperm_bank" "text",
    "donor_type" "text" DEFAULT 'sperm'::"text",
    "is_anonymous" boolean DEFAULT true,
    "height" "text",
    "weight" "text",
    "eye_color" "text",
    "hair_color" "text",
    "ethnicity" "text",
    "blood_type" "text",
    "education_level" "text",
    "medical_history" "jsonb",
    "person_id" "uuid",
    "notes" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donors_donor_type_check" CHECK (("donor_type" = ANY (ARRAY['sperm'::"text", 'egg'::"text", 'embryo'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."donors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "inviter_id" "uuid" NOT NULL,
    "invitee_email" "text" NOT NULL,
    "invitee_id" "uuid",
    "role" "text" DEFAULT 'viewer'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "message" "text",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "family_invitations_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"]))),
    CONSTRAINT "family_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."family_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_tree_folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_tree_id" "uuid" NOT NULL,
    "parent_folder_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."family_tree_folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_tree_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_tree_id" "uuid" NOT NULL,
    "media_file_id" "uuid" NOT NULL,
    "folder_id" "uuid",
    "added_by" "uuid" NOT NULL,
    "tags" "text"[],
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."family_tree_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_tree_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "family_tree_id" "uuid" NOT NULL,
    "person_id" "uuid" NOT NULL,
    "added_by" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."family_tree_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_trees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "visibility" "text" DEFAULT 'private'::"text" NOT NULL,
    "tree_data" "jsonb" DEFAULT '{}'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid",
    "group_id" "uuid",
    CONSTRAINT "family_trees_visibility_check" CHECK (("visibility" = ANY (ARRAY['private'::"text", 'shared'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."family_trees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."function_deployments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "function_name" "text" NOT NULL,
    "version" "text" NOT NULL,
    "deployed_at" timestamp with time zone DEFAULT "now"(),
    "changes_description" "text",
    "status" "text" DEFAULT 'pending'::"text"
);


ALTER TABLE "public"."function_deployments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_donor_database" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "donor_id" "uuid" NOT NULL,
    "visibility" "text" DEFAULT 'members_only'::"text" NOT NULL,
    "verification_status" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "notes" "text",
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_donor_database_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['unverified'::"text", 'pending'::"text", 'verified'::"text", 'rejected'::"text"]))),
    CONSTRAINT "group_donor_database_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'members_only'::"text", 'admin_only'::"text"])))
);


ALTER TABLE "public"."group_donor_database" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid",
    "inviter_id" "uuid",
    "invitee_email" "text" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "token" "text" DEFAULT ("gen_random_uuid"())::"text",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_invitations_role_check" CHECK (("role" = ANY (ARRAY['viewer'::"text", 'editor'::"text", 'admin'::"text"]))),
    CONSTRAINT "group_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."group_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "media_file_id" "uuid" NOT NULL,
    "added_by" "uuid" NOT NULL,
    "description" "text",
    "folder_id" "uuid",
    "sort_order" integer,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_memberships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "person_id" "uuid",
    "group_id" "uuid",
    "user_id" "uuid",
    "role" "text" DEFAULT 'viewer'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_memberships_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text", 'parent'::"text", 'child'::"text", 'donor'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."group_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_sibling_group_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sibling_group_id" "uuid" NOT NULL,
    "person_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notification_preferences" "jsonb" DEFAULT '{"new_members": true, "group_updates": true, "direct_messages": true}'::"jsonb",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_sibling_group_memberships_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'left'::"text"])))
);


ALTER TABLE "public"."group_sibling_group_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_sibling_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "donor_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "privacy_level" "text" DEFAULT 'members_only'::"text" NOT NULL,
    "auto_add_new_siblings" boolean DEFAULT true,
    "allow_contact_sharing" boolean DEFAULT true,
    "allow_photo_sharing" boolean DEFAULT true,
    "allow_medical_sharing" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_sibling_groups_privacy_level_check" CHECK (("privacy_level" = ANY (ARRAY['public'::"text", 'members_only'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."group_sibling_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "label" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "visibility" "text" DEFAULT 'private'::"text",
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "slug" "text",
    "subdomain" "text",
    "domain" "text",
    "plan" "text" DEFAULT 'free'::"text",
    CONSTRAINT "groups_type_check" CHECK (("type" = ANY (ARRAY['nuclear'::"text", 'extended'::"text", 'donor_network'::"text", 'dibling_group'::"text", 'fertility_clinic'::"text", 'sperm_bank'::"text"]))),
    CONSTRAINT "groups_visibility_check" CHECK (("visibility" = ANY (ARRAY['private'::"text", 'public'::"text", 'unlisted'::"text", 'organization'::"text"])))
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "visibility" "text" DEFAULT 'private'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "media_albums_visibility_check" CHECK (("visibility" = ANY (ARRAY['private'::"text", 'shared'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."media_albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "mime_type" "text" NOT NULL,
    "bucket_name" "text" DEFAULT 'family-photos'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "folder_id" "uuid"
);


ALTER TABLE "public"."media_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_folders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_folder_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."media_folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "inviter_id" "uuid",
    "invitee_email" "text" NOT NULL,
    "role" "text" DEFAULT 'viewer'::"text",
    "token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'base64'::"text") NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."organization_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "media_file_id" "uuid" NOT NULL,
    "added_by" "uuid" NOT NULL,
    "folder_id" "uuid",
    "sort_order" integer DEFAULT 0,
    "tags" "text"[],
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_memberships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "role" "text" DEFAULT 'viewer'::"text",
    "invited_by" "uuid",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_memberships_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."organization_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "subdomain" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "plan" "text" DEFAULT 'free'::"text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "visibility" "text" DEFAULT 'private'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organizations_plan_check" CHECK (("plan" = ANY (ARRAY['free'::"text", 'pro'::"text", 'enterprise'::"text"]))),
    CONSTRAINT "organizations_type_check" CHECK (("type" = ANY (ARRAY['family_network'::"text", 'fertility_clinic'::"text", 'sperm_bank'::"text", 'donor_network'::"text", 'dibling_group'::"text", 'community'::"text"]))),
    CONSTRAINT "organizations_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'shared'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."person_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "person_id" "uuid" NOT NULL,
    "media_file_id" "uuid" NOT NULL,
    "is_profile_photo" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."person_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."persons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "date_of_birth" "date",
    "birth_place" "text",
    "gender" "text",
    "status" "text" DEFAULT 'living'::"text",
    "date_of_death" "date",
    "death_place" "text",
    "profile_photo_url" "text",
    "email" "text",
    "phone" "text",
    "address" "text",
    "preferred_contact_method" "text",
    "social_media_links" "jsonb",
    "used_ivf" boolean DEFAULT false,
    "used_iui" boolean DEFAULT false,
    "fertility_treatments" "jsonb",
    "donor" boolean DEFAULT false,
    "notes" "text",
    "metadata" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    "is_self" boolean DEFAULT false,
    CONSTRAINT "persons_preferred_contact_method_check" CHECK (("preferred_contact_method" = ANY (ARRAY['email'::"text", 'phone'::"text", 'mail'::"text", 'none'::"text"]))),
    CONSTRAINT "persons_status_check" CHECK (("status" = ANY (ARRAY['living'::"text", 'deceased'::"text"])))
);


ALTER TABLE "public"."persons" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."persons_with_groups" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."name",
    "p"."date_of_birth",
    "p"."birth_place",
    "p"."gender",
    "p"."status",
    "p"."date_of_death",
    "p"."death_place",
    "p"."profile_photo_url",
    "p"."email",
    "p"."phone",
    "p"."address",
    "p"."preferred_contact_method",
    "p"."social_media_links",
    "p"."used_ivf",
    "p"."used_iui",
    "p"."fertility_treatments",
    "p"."donor",
    "p"."notes",
    "p"."metadata",
    "p"."user_id",
    "p"."created_at",
    "p"."updated_at",
    "p"."organization_id",
    COALESCE("json_agg"("json_build_object"('group_id', "gm"."group_id", 'group_label', "g"."label", 'group_type', "g"."type", 'role', "gm"."role")) FILTER (WHERE ("gm"."group_id" IS NOT NULL)), '[]'::json) AS "group_memberships"
   FROM (("public"."persons" "p"
     LEFT JOIN "public"."group_memberships" "gm" ON (("p"."id" = "gm"."person_id")))
     LEFT JOIN "public"."groups" "g" ON (("gm"."group_id" = "g"."id")))
  GROUP BY "p"."id", "p"."name", "p"."date_of_birth", "p"."birth_place", "p"."gender", "p"."status", "p"."date_of_death", "p"."death_place", "p"."profile_photo_url", "p"."email", "p"."phone", "p"."address", "p"."preferred_contact_method", "p"."social_media_links", "p"."used_ivf", "p"."used_iui", "p"."fertility_treatments", "p"."donor", "p"."notes", "p"."metadata", "p"."user_id", "p"."created_at", "p"."updated_at", "p"."organization_id";


ALTER VIEW "public"."persons_with_groups" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."persons_with_trees" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "name",
    NULL::"date" AS "date_of_birth",
    NULL::"text" AS "birth_place",
    NULL::"text" AS "gender",
    NULL::"text" AS "status",
    NULL::"date" AS "date_of_death",
    NULL::"text" AS "death_place",
    NULL::"text" AS "profile_photo_url",
    NULL::"text" AS "email",
    NULL::"text" AS "phone",
    NULL::"text" AS "address",
    NULL::"text" AS "preferred_contact_method",
    NULL::"jsonb" AS "social_media_links",
    NULL::boolean AS "used_ivf",
    NULL::boolean AS "used_iui",
    NULL::"jsonb" AS "fertility_treatments",
    NULL::boolean AS "donor",
    NULL::"text" AS "notes",
    NULL::"jsonb" AS "metadata",
    NULL::"uuid" AS "user_id",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"uuid" AS "organization_id",
    NULL::boolean AS "is_self",
    NULL::json AS "family_trees";


ALTER VIEW "public"."persons_with_trees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sharing_links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "family_tree_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "link_token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text") NOT NULL,
    "access_level" "text" DEFAULT 'view'::"text",
    "password_hash" "text",
    "max_uses" integer,
    "current_uses" integer DEFAULT 0,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "invited_emails" "text"[],
    "group_id" "uuid",
    "organization_id" "uuid",
    CONSTRAINT "sharing_links_access_level_check" CHECK (("access_level" = ANY (ARRAY['view'::"text", 'comment'::"text", 'edit'::"text"]))),
    CONSTRAINT "sharing_links_single_target_check" CHECK (((("family_tree_id" IS NOT NULL) AND ("group_id" IS NULL) AND ("organization_id" IS NULL)) OR (("family_tree_id" IS NULL) AND ("group_id" IS NOT NULL) AND ("organization_id" IS NULL)) OR (("family_tree_id" IS NULL) AND ("group_id" IS NULL) AND ("organization_id" IS NOT NULL))))
);


ALTER TABLE "public"."sharing_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "bio" "text",
    "location" "text",
    "phone" "text",
    "website" "text",
    "birth_date" "date",
    "preferred_contact" "text" DEFAULT 'email'::"text",
    "account_type" "text" DEFAULT 'individual'::"text",
    "organization_id" "uuid",
    CONSTRAINT "user_profiles_account_type_check" CHECK (("account_type" = ANY (ARRAY['individual'::"text", 'donor'::"text", 'organization'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_profiles"."bio" IS 'User biography or description';



COMMENT ON COLUMN "public"."user_profiles"."location" IS 'User location (city, country)';



COMMENT ON COLUMN "public"."user_profiles"."phone" IS 'User phone number';



COMMENT ON COLUMN "public"."user_profiles"."website" IS 'User website URL';



CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email_notifications" boolean DEFAULT true,
    "marketing_emails" boolean DEFAULT false,
    "privacy_mode" boolean DEFAULT false,
    "data_sharing" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_album_id_media_file_id_key" UNIQUE ("album_id", "media_file_id");



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_events"
    ADD CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_from_person_id_to_person_id_relationship_type_key" UNIQUE ("from_person_id", "to_person_id", "relationship_type");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deletion_backups"
    ADD CONSTRAINT "deletion_backups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donor_activity_log"
    ADD CONSTRAINT "donor_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donor_message_threads"
    ADD CONSTRAINT "donor_message_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donor_messages"
    ADD CONSTRAINT "donor_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donor_profiles"
    ADD CONSTRAINT "donor_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donor_profiles"
    ADD CONSTRAINT "donor_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."donor_recipient_connections"
    ADD CONSTRAINT "donor_recipient_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donors"
    ADD CONSTRAINT "donors_donor_number_sperm_bank_key" UNIQUE ("donor_number", "sperm_bank");



ALTER TABLE ONLY "public"."donors"
    ADD CONSTRAINT "donors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_invitations"
    ADD CONSTRAINT "family_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_tree_folders"
    ADD CONSTRAINT "family_tree_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_tree_media"
    ADD CONSTRAINT "family_tree_media_family_tree_id_media_file_id_key" UNIQUE ("family_tree_id", "media_file_id");



ALTER TABLE ONLY "public"."family_tree_media"
    ADD CONSTRAINT "family_tree_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_tree_members"
    ADD CONSTRAINT "family_tree_members_family_tree_id_person_id_key" UNIQUE ("family_tree_id", "person_id");



ALTER TABLE ONLY "public"."family_tree_members"
    ADD CONSTRAINT "family_tree_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_trees"
    ADD CONSTRAINT "family_trees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."function_deployments"
    ADD CONSTRAINT "function_deployments_function_name_key" UNIQUE ("function_name");



ALTER TABLE ONLY "public"."function_deployments"
    ADD CONSTRAINT "function_deployments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_donor_database"
    ADD CONSTRAINT "group_donor_database_group_id_donor_id_key" UNIQUE ("group_id", "donor_id");



ALTER TABLE ONLY "public"."group_donor_database"
    ADD CONSTRAINT "group_donor_database_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."group_media"
    ADD CONSTRAINT "group_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_memberships"
    ADD CONSTRAINT "group_memberships_person_id_group_id_role_key" UNIQUE ("person_id", "group_id", "role");



ALTER TABLE ONLY "public"."group_memberships"
    ADD CONSTRAINT "group_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_sibling_group_memberships"
    ADD CONSTRAINT "group_sibling_group_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_sibling_group_memberships"
    ADD CONSTRAINT "group_sibling_group_memberships_sibling_group_id_person_id_key" UNIQUE ("sibling_group_id", "person_id");



ALTER TABLE ONLY "public"."group_sibling_groups"
    ADD CONSTRAINT "group_sibling_groups_group_id_donor_id_key" UNIQUE ("group_id", "donor_id");



ALTER TABLE ONLY "public"."group_sibling_groups"
    ADD CONSTRAINT "group_sibling_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_albums"
    ADD CONSTRAINT "media_albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_folders"
    ADD CONSTRAINT "media_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."organization_media"
    ADD CONSTRAINT "organization_media_organization_id_media_file_id_key" UNIQUE ("organization_id", "media_file_id");



ALTER TABLE ONLY "public"."organization_media"
    ADD CONSTRAINT "organization_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_memberships"
    ADD CONSTRAINT "organization_memberships_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_memberships"
    ADD CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."person_media"
    ADD CONSTRAINT "person_media_person_id_media_file_id_key" UNIQUE ("person_id", "media_file_id");



ALTER TABLE ONLY "public"."person_media"
    ADD CONSTRAINT "person_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."persons"
    ADD CONSTRAINT "persons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sharing_links"
    ADD CONSTRAINT "sharing_links_link_token_key" UNIQUE ("link_token");



ALTER TABLE ONLY "public"."sharing_links"
    ADD CONSTRAINT "sharing_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_tree_folders"
    ADD CONSTRAINT "unique_folder_name_in_parent" UNIQUE ("family_tree_id", "parent_folder_id", "name");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_album_media_album_id" ON "public"."album_media" USING "btree" ("album_id");



CREATE INDEX "idx_album_media_media_file_id" ON "public"."album_media" USING "btree" ("media_file_id");



CREATE INDEX "idx_connections_from_person" ON "public"."connections" USING "btree" ("from_person_id");



CREATE INDEX "idx_connections_from_person_id" ON "public"."connections" USING "btree" ("from_person_id");



CREATE INDEX "idx_connections_group_id" ON "public"."connections" USING "btree" ("group_id");



CREATE INDEX "idx_connections_group_persons" ON "public"."connections" USING "btree" ("group_id", "from_person_id", "to_person_id");



CREATE INDEX "idx_connections_metadata_gin" ON "public"."connections" USING "gin" ("metadata");



CREATE INDEX "idx_connections_organization_id" ON "public"."connections" USING "btree" ("organization_id");



CREATE INDEX "idx_connections_person_ids" ON "public"."connections" USING "btree" ("from_person_id", "to_person_id");



CREATE INDEX "idx_connections_person_lookup" ON "public"."connections" USING "gin" ((ARRAY["from_person_id", "to_person_id"]));



CREATE INDEX "idx_connections_relationship_type" ON "public"."connections" USING "btree" ("relationship_type");



CREATE INDEX "idx_connections_to_person" ON "public"."connections" USING "btree" ("to_person_id");



CREATE INDEX "idx_connections_to_person_id" ON "public"."connections" USING "btree" ("to_person_id");



CREATE INDEX "idx_donor_activity_log_created_at" ON "public"."donor_activity_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_donor_activity_log_donor_profile_id" ON "public"."donor_activity_log" USING "btree" ("donor_profile_id");



CREATE INDEX "idx_donor_message_threads_donor_profile_id" ON "public"."donor_message_threads" USING "btree" ("donor_profile_id");



CREATE INDEX "idx_donor_messages_sender_id" ON "public"."donor_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_donor_messages_thread_id" ON "public"."donor_messages" USING "btree" ("thread_id");



CREATE INDEX "idx_donor_profiles_person_id" ON "public"."donor_profiles" USING "btree" ("person_id");



CREATE INDEX "idx_donor_profiles_user_id" ON "public"."donor_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_donor_recipient_connections_donor_id" ON "public"."donor_recipient_connections" USING "btree" ("donor_profile_id");



CREATE INDEX "idx_donor_recipient_connections_recipient_id" ON "public"."donor_recipient_connections" USING "btree" ("recipient_user_id");



CREATE INDEX "idx_donors_donor_type" ON "public"."donors" USING "btree" ("donor_type");



CREATE INDEX "idx_donors_is_anonymous" ON "public"."donors" USING "btree" ("is_anonymous");



CREATE INDEX "idx_donors_medical_history_gin" ON "public"."donors" USING "gin" ("medical_history");



CREATE INDEX "idx_donors_person_id" ON "public"."donors" USING "btree" ("person_id");



CREATE INDEX "idx_donors_sperm_bank" ON "public"."donors" USING "btree" ("sperm_bank");



CREATE INDEX "idx_family_invitations_group_id" ON "public"."family_invitations" USING "btree" ("group_id");



CREATE INDEX "idx_family_invitations_invitee_email" ON "public"."family_invitations" USING "btree" ("invitee_email");



CREATE INDEX "idx_family_invitations_status" ON "public"."family_invitations" USING "btree" ("status");



CREATE INDEX "idx_family_tree_folders_parent_id" ON "public"."family_tree_folders" USING "btree" ("parent_folder_id");



CREATE INDEX "idx_family_tree_folders_tree_id" ON "public"."family_tree_folders" USING "btree" ("family_tree_id");



CREATE INDEX "idx_family_tree_media_family_tree_id" ON "public"."family_tree_media" USING "btree" ("family_tree_id");



CREATE INDEX "idx_family_tree_media_file_id" ON "public"."family_tree_media" USING "btree" ("media_file_id");



CREATE INDEX "idx_family_tree_media_folder_id" ON "public"."family_tree_media" USING "btree" ("folder_id");



CREATE INDEX "idx_family_tree_media_tags" ON "public"."family_tree_media" USING "gin" ("tags");



CREATE INDEX "idx_family_tree_media_tree_id" ON "public"."family_tree_media" USING "btree" ("family_tree_id");



CREATE INDEX "idx_family_tree_members_family_tree_id" ON "public"."family_tree_members" USING "btree" ("family_tree_id");



CREATE INDEX "idx_family_tree_members_person_id" ON "public"."family_tree_members" USING "btree" ("person_id");



CREATE INDEX "idx_family_trees_group_id" ON "public"."family_trees" USING "btree" ("group_id");



CREATE INDEX "idx_family_trees_organization_id" ON "public"."family_trees" USING "btree" ("organization_id");



CREATE INDEX "idx_family_trees_user_id" ON "public"."family_trees" USING "btree" ("user_id");



CREATE INDEX "idx_family_trees_visibility" ON "public"."family_trees" USING "btree" ("visibility");



CREATE INDEX "idx_group_donor_database_donor_id" ON "public"."group_donor_database" USING "btree" ("donor_id");



CREATE INDEX "idx_group_donor_database_group_id" ON "public"."group_donor_database" USING "btree" ("group_id");



CREATE INDEX "idx_group_donor_database_verification" ON "public"."group_donor_database" USING "btree" ("verification_status");



CREATE INDEX "idx_group_invitations_group_id" ON "public"."group_invitations" USING "btree" ("group_id");



CREATE INDEX "idx_group_invitations_invitee_email" ON "public"."group_invitations" USING "btree" ("invitee_email");



CREATE INDEX "idx_group_invitations_status" ON "public"."group_invitations" USING "btree" ("status");



CREATE INDEX "idx_group_media_group_id" ON "public"."group_media" USING "btree" ("group_id");



CREATE INDEX "idx_group_media_media_file_id" ON "public"."group_media" USING "btree" ("media_file_id");



CREATE INDEX "idx_group_memberships_group_id" ON "public"."group_memberships" USING "btree" ("group_id");



CREATE INDEX "idx_group_memberships_group_user" ON "public"."group_memberships" USING "btree" ("group_id", "user_id");



CREATE INDEX "idx_group_memberships_person_group" ON "public"."group_memberships" USING "btree" ("person_id", "group_id");



CREATE INDEX "idx_group_memberships_person_id" ON "public"."group_memberships" USING "btree" ("person_id");



CREATE INDEX "idx_group_memberships_role" ON "public"."group_memberships" USING "btree" ("role");



CREATE INDEX "idx_group_memberships_user_id" ON "public"."group_memberships" USING "btree" ("user_id");



CREATE INDEX "idx_group_sibling_group_memberships_group_id" ON "public"."group_sibling_group_memberships" USING "btree" ("sibling_group_id");



CREATE INDEX "idx_group_sibling_group_memberships_person_id" ON "public"."group_sibling_group_memberships" USING "btree" ("person_id");



CREATE INDEX "idx_group_sibling_groups_donor_id" ON "public"."group_sibling_groups" USING "btree" ("donor_id");



CREATE INDEX "idx_group_sibling_groups_group_id" ON "public"."group_sibling_groups" USING "btree" ("group_id");



CREATE INDEX "idx_groups_organization_id" ON "public"."groups" USING "btree" ("organization_id");



CREATE INDEX "idx_groups_owner_id" ON "public"."groups" USING "btree" ("owner_id");



CREATE UNIQUE INDEX "idx_groups_slug" ON "public"."groups" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE UNIQUE INDEX "idx_groups_subdomain" ON "public"."groups" USING "btree" ("subdomain") WHERE ("subdomain" IS NOT NULL);



CREATE INDEX "idx_groups_type" ON "public"."groups" USING "btree" ("type");



CREATE INDEX "idx_groups_visibility" ON "public"."groups" USING "btree" ("visibility");



CREATE INDEX "idx_media_albums_user_id" ON "public"."media_albums" USING "btree" ("user_id");



CREATE INDEX "idx_media_files_user_id" ON "public"."media_files" USING "btree" ("user_id");



CREATE INDEX "idx_organization_memberships_org_id" ON "public"."organization_memberships" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_memberships_org_user" ON "public"."organization_memberships" USING "btree" ("organization_id", "user_id");



CREATE INDEX "idx_organization_memberships_user_id" ON "public"."organization_memberships" USING "btree" ("user_id");



CREATE INDEX "idx_organizations_domain" ON "public"."organizations" USING "btree" ("domain");



CREATE INDEX "idx_organizations_subdomain" ON "public"."organizations" USING "btree" ("subdomain");



CREATE INDEX "idx_organizations_visibility" ON "public"."organizations" USING "btree" ("visibility");



CREATE INDEX "idx_person_media_media_file_id" ON "public"."person_media" USING "btree" ("media_file_id");



CREATE INDEX "idx_person_media_person_id" ON "public"."person_media" USING "btree" ("person_id");



CREATE INDEX "idx_persons_donor" ON "public"."persons" USING "btree" ("donor");



CREATE INDEX "idx_persons_fertility_treatments_gin" ON "public"."persons" USING "gin" ("fertility_treatments");



CREATE INDEX "idx_persons_metadata_gin" ON "public"."persons" USING "gin" ("metadata");



CREATE INDEX "idx_persons_organization_id" ON "public"."persons" USING "btree" ("organization_id");



CREATE INDEX "idx_persons_social_media_gin" ON "public"."persons" USING "gin" ("social_media_links");



CREATE INDEX "idx_persons_status" ON "public"."persons" USING "btree" ("status");



CREATE INDEX "idx_persons_user_id" ON "public"."persons" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_persons_user_self" ON "public"."persons" USING "btree" ("user_id") WHERE ("is_self" = true);



CREATE INDEX "idx_sharing_links_active_expires" ON "public"."sharing_links" USING "btree" ("is_active", "expires_at") WHERE ("is_active" = true);



CREATE INDEX "idx_sharing_links_family_tree_id" ON "public"."sharing_links" USING "btree" ("family_tree_id");



CREATE INDEX "idx_sharing_links_token" ON "public"."sharing_links" USING "btree" ("link_token");



CREATE INDEX "idx_user_profiles_account_type" ON "public"."user_profiles" USING "btree" ("account_type");



CREATE INDEX "idx_user_profiles_organization_id" ON "public"."user_profiles" USING "btree" ("organization_id");



CREATE UNIQUE INDEX "unique_root_folder_name" ON "public"."family_tree_folders" USING "btree" ("family_tree_id", "name") WHERE ("parent_folder_id" IS NULL);



CREATE OR REPLACE VIEW "public"."persons_with_trees" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."name",
    "p"."date_of_birth",
    "p"."birth_place",
    "p"."gender",
    "p"."status",
    "p"."date_of_death",
    "p"."death_place",
    "p"."profile_photo_url",
    "p"."email",
    "p"."phone",
    "p"."address",
    "p"."preferred_contact_method",
    "p"."social_media_links",
    "p"."used_ivf",
    "p"."used_iui",
    "p"."fertility_treatments",
    "p"."donor",
    "p"."notes",
    "p"."metadata",
    "p"."user_id",
    "p"."created_at",
    "p"."updated_at",
    "p"."organization_id",
    "p"."is_self",
    COALESCE("json_agg"("json_build_object"('family_tree_id', "ftm"."family_tree_id", 'family_tree_name', "ft"."name", 'family_tree_visibility', "ft"."visibility", 'role', "ftm"."role", 'added_at', "ftm"."created_at")) FILTER (WHERE ("ftm"."family_tree_id" IS NOT NULL)), '[]'::json) AS "family_trees"
   FROM (("public"."persons" "p"
     LEFT JOIN "public"."family_tree_members" "ftm" ON (("p"."id" = "ftm"."person_id")))
     LEFT JOIN "public"."family_trees" "ft" ON (("ftm"."family_tree_id" = "ft"."id")))
  GROUP BY "p"."id";



CREATE OR REPLACE TRIGGER "create_user_settings_trigger" AFTER INSERT ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_settings"();



CREATE OR REPLACE TRIGGER "on_donor_user_created" AFTER INSERT ON "public"."user_profiles" FOR EACH ROW WHEN (("new"."account_type" = 'donor'::"text")) EXECUTE FUNCTION "public"."handle_donor_signup"();



CREATE OR REPLACE TRIGGER "update_donors_updated_at" BEFORE UPDATE ON "public"."donors" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_family_invitations_updated_at" BEFORE UPDATE ON "public"."family_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_family_tree_folders_updated_at" BEFORE UPDATE ON "public"."family_tree_folders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_family_tree_members_updated_at" BEFORE UPDATE ON "public"."family_tree_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_family_trees_updated_at" BEFORE UPDATE ON "public"."family_trees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_group_donor_database_updated_at" BEFORE UPDATE ON "public"."group_donor_database" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_group_memberships_updated_at" BEFORE UPDATE ON "public"."group_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_group_sibling_groups_updated_at" BEFORE UPDATE ON "public"."group_sibling_groups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_groups_updated_at" BEFORE UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_media_albums_updated_at" BEFORE UPDATE ON "public"."media_albums" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_media_files_updated_at" BEFORE UPDATE ON "public"."media_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_media_folders_updated_at" BEFORE UPDATE ON "public"."media_folders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_persons_updated_at" BEFORE UPDATE ON "public"."persons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sharing_links_updated_at" BEFORE UPDATE ON "public"."sharing_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."media_albums"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."album_media"
    ADD CONSTRAINT "album_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_from_person_id_fkey" FOREIGN KEY ("from_person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_to_person_id_fkey" FOREIGN KEY ("to_person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_activity_log"
    ADD CONSTRAINT "donor_activity_log_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "public"."donor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_message_threads"
    ADD CONSTRAINT "donor_message_threads_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "public"."donor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_message_threads"
    ADD CONSTRAINT "donor_message_threads_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."donor_messages"
    ADD CONSTRAINT "donor_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."donor_messages"
    ADD CONSTRAINT "donor_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."donor_message_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_profiles"
    ADD CONSTRAINT "donor_profiles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id");



ALTER TABLE ONLY "public"."donor_profiles"
    ADD CONSTRAINT "donor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_recipient_connections"
    ADD CONSTRAINT "donor_recipient_connections_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "public"."donor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donor_recipient_connections"
    ADD CONSTRAINT "donor_recipient_connections_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."donor_recipient_connections"
    ADD CONSTRAINT "donor_recipient_connections_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."donors"
    ADD CONSTRAINT "donors_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id");



ALTER TABLE ONLY "public"."family_invitations"
    ADD CONSTRAINT "family_invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_invitations"
    ADD CONSTRAINT "family_invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_invitations"
    ADD CONSTRAINT "family_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_tree_folders"
    ADD CONSTRAINT "family_tree_folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "public"."family_tree_folders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_tree_media"
    ADD CONSTRAINT "family_tree_media_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."family_tree_folders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."family_tree_media"
    ADD CONSTRAINT "family_tree_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_tree_members"
    ADD CONSTRAINT "family_tree_members_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."family_tree_members"
    ADD CONSTRAINT "family_tree_members_family_tree_id_fkey" FOREIGN KEY ("family_tree_id") REFERENCES "public"."family_trees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_tree_members"
    ADD CONSTRAINT "family_tree_members_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_trees"
    ADD CONSTRAINT "family_trees_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_trees"
    ADD CONSTRAINT "family_trees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_donor_database"
    ADD CONSTRAINT "group_donor_database_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_donor_database"
    ADD CONSTRAINT "group_donor_database_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_donor_database"
    ADD CONSTRAINT "group_donor_database_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."group_media"
    ADD CONSTRAINT "group_media_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."group_media"
    ADD CONSTRAINT "group_media_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_media"
    ADD CONSTRAINT "group_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_memberships"
    ADD CONSTRAINT "group_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_memberships"
    ADD CONSTRAINT "group_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_memberships"
    ADD CONSTRAINT "group_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."group_sibling_group_memberships"
    ADD CONSTRAINT "group_sibling_group_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_sibling_group_memberships"
    ADD CONSTRAINT "group_sibling_group_memberships_sibling_group_id_fkey" FOREIGN KEY ("sibling_group_id") REFERENCES "public"."group_sibling_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_sibling_groups"
    ADD CONSTRAINT "group_sibling_groups_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_sibling_groups"
    ADD CONSTRAINT "group_sibling_groups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_memberships"
    ADD CONSTRAINT "organization_memberships_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_memberships"
    ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_memberships"
    ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_media"
    ADD CONSTRAINT "person_media_media_file_id_fkey" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."person_media"
    ADD CONSTRAINT "person_media_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."persons"
    ADD CONSTRAINT "persons_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."persons"
    ADD CONSTRAINT "persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sharing_links"
    ADD CONSTRAINT "sharing_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sharing_links"
    ADD CONSTRAINT "sharing_links_family_tree_id_fkey" FOREIGN KEY ("family_tree_id") REFERENCES "public"."family_trees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow organization management" ON "public"."organization_invitations" TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_invitations"."organization_id") AND ("o"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."organization_memberships" "om"
  WHERE (("om"."organization_id" = "organization_invitations"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_invitations"."organization_id") AND ("o"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."organization_memberships" "om"
  WHERE (("om"."organization_id" = "organization_invitations"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))));



CREATE POLICY "Donors can view own activity" ON "public"."donor_activity_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."donor_profiles" "dp"
  WHERE (("dp"."id" = "donor_activity_log"."donor_profile_id") AND ("dp"."user_id" = "auth"."uid"())))));



CREATE POLICY "Group admins can manage donor database entries" ON "public"."group_donor_database" USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_donor_database"."group_id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_donor_database"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Group admins can manage invitations" ON "public"."group_invitations" USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_invitations"."group_id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_invitations"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Group admins can manage sibling groups" ON "public"."group_sibling_groups" USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_sibling_groups"."group_id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = 'admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_sibling_groups"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Group members can add media" ON "public"."group_media" FOR INSERT WITH CHECK ((("added_by" = "auth"."uid"()) AND ((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_media"."group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_media"."group_id") AND ("g"."owner_id" = "auth"."uid"())))))));



CREATE POLICY "Group members can view donor database entries" ON "public"."group_donor_database" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_donor_database"."group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_donor_database"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Group members can view invitations" ON "public"."group_invitations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_invitations"."group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR ("invitee_email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text")));



CREATE POLICY "Group members can view media" ON "public"."group_media" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_media"."group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_media"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Group members can view sibling groups" ON "public"."group_sibling_groups" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_memberships" "gm"
  WHERE (("gm"."group_id" = "group_sibling_groups"."group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_sibling_groups"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Organization owners can delete their organization" ON "public"."organizations" FOR DELETE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Organization owners can update their organization" ON "public"."organizations" FOR UPDATE USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Organization owners can view their organization" ON "public"."organizations" FOR SELECT USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Organization-scoped person access" ON "public"."persons" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."organizations" "o"
     JOIN "public"."organization_memberships" "om" ON (("o"."id" = "om"."organization_id")))
  WHERE (("o"."id" = "persons"."organization_id") AND (("o"."visibility" = 'public'::"text") OR ("o"."owner_id" = "auth"."uid"()) OR ("om"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Public access to connections in public family trees" ON "public"."connections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."family_tree_members" "ftm1"
     JOIN "public"."family_tree_members" "ftm2" ON (("ftm1"."family_tree_id" = "ftm2"."family_tree_id")))
     JOIN "public"."family_trees" "ft" ON (("ftm1"."family_tree_id" = "ft"."id")))
  WHERE (("ftm1"."person_id" = "connections"."from_person_id") AND ("ftm2"."person_id" = "connections"."to_person_id") AND ("ft"."visibility" = 'public'::"text")))));



CREATE POLICY "Public access to persons in public family trees" ON "public"."persons" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."family_tree_members" "ftm"
     JOIN "public"."family_trees" "ft" ON (("ftm"."family_tree_id" = "ft"."id")))
  WHERE (("ftm"."person_id" = "persons"."id") AND ("ft"."visibility" = 'public'::"text")))));



CREATE POLICY "Recipients can view connected donor profiles" ON "public"."donor_profiles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."donor_recipient_connections" "drc"
  WHERE (("drc"."donor_profile_id" = "donor_profiles"."id") AND ("drc"."recipient_user_id" = "auth"."uid"()) AND ("drc"."status" = 'active'::"text")))) AND ((NOT "is_anonymous") OR (("privacy_settings" ->> 'privacy_level'::"text") <> 'anonymous'::"text"))));



CREATE POLICY "Tenant-scoped connection access" ON "public"."connections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "connections"."group_id") AND (("g"."visibility" = 'public'::"text") OR ("g"."owner_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
           FROM "public"."group_memberships" "gm"
          WHERE (("gm"."group_id" = "g"."id") AND ("gm"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))))))));



CREATE POLICY "Tenant-scoped connection management" ON "public"."connections" USING ((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "connections"."group_id") AND (("g"."owner_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
           FROM "public"."group_memberships" "gm"
          WHERE (("gm"."group_id" = "g"."id") AND ("gm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("gm"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))))));



CREATE POLICY "Tenant-scoped person updates" ON "public"."persons" FOR UPDATE USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
   FROM ("public"."group_memberships" "gm"
     JOIN "public"."groups" "g" ON (("gm"."group_id" = "g"."id")))
  WHERE (("gm"."person_id" = "persons"."id") AND (("g"."owner_id" = ( SELECT "auth"."uid"() AS "uid")) OR (("gm"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("gm"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))))));



CREATE POLICY "Users can add media to organizations they belong to" ON "public"."organization_media" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_media"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))))) AND ("added_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."media_files" "mf"
  WHERE (("mf"."id" = "organization_media"."media_file_id") AND ("mf"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can add media to their family trees" ON "public"."family_tree_media" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_media"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))) AND ("added_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."media_files" "mf"
  WHERE (("mf"."id" = "family_tree_media"."media_file_id") AND ("mf"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can add members to their family trees" ON "public"."family_tree_members" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_members"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))) AND ("added_by" = "auth"."uid"())));



CREATE POLICY "Users can add memberships" ON "public"."organization_memberships" FOR INSERT WITH CHECK ("public"."check_organization_owner"("organization_id", "auth"."uid"()));



CREATE POLICY "Users can create album_media for their albums" ON "public"."album_media" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."media_albums" "a"
  WHERE (("a"."id" = "album_media"."album_id") AND ("a"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create folders in their family trees" ON "public"."family_tree_folders" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_folders"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))) AND ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can create invitations for families they own or admin" ON "public"."family_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."groups"
  WHERE (("groups"."id" = "family_invitations"."group_id") AND (("groups"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."group_memberships"
          WHERE (("group_memberships"."group_id" = "groups"."id") AND ("group_memberships"."user_id" = "auth"."uid"()) AND ("group_memberships"."role" = 'admin'::"text")))))))));



CREATE POLICY "Users can create person_media for their persons" ON "public"."person_media" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."persons" "p"
  WHERE (("p"."id" = "person_media"."person_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own albums" ON "public"."media_albums" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own family trees" ON "public"."family_trees" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can create their own folders" ON "public"."media_folders" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own media files" ON "public"."media_files" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete album_media for their albums" ON "public"."album_media" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."media_albums" "a"
  WHERE (("a"."id" = "album_media"."album_id") AND ("a"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete folders in their family trees" ON "public"."family_tree_folders" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_folders"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete memberships" ON "public"."organization_memberships" FOR DELETE USING ("public"."check_organization_owner"("organization_id", "auth"."uid"()));



CREATE POLICY "Users can delete person_media for their persons" ON "public"."person_media" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."persons" "p"
  WHERE (("p"."id" = "person_media"."person_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own albums" ON "public"."media_albums" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own family trees" ON "public"."family_trees" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own folders" ON "public"."media_folders" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own groups" ON "public"."groups" FOR DELETE USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can delete their own media" ON "public"."group_media" FOR DELETE USING ((("added_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "group_media"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can delete their own media files" ON "public"."media_files" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own persons" ON "public"."persons" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert groups" ON "public"."groups" FOR INSERT WITH CHECK (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can insert persons" ON "public"."persons" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own settings" ON "public"."user_settings" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage connections for their persons" ON "public"."connections" USING ((EXISTS ( SELECT 1
   FROM "public"."persons"
  WHERE (("persons"."id" = "connections"."from_person_id") AND ("persons"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can manage donors" ON "public"."donors" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can manage memberships for groups they own" ON "public"."group_memberships" USING ((EXISTS ( SELECT 1
   FROM "public"."groups"
  WHERE (("groups"."id" = "group_memberships"."group_id") AND ("groups"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own donor profile" ON "public"."donor_profiles" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage sharing links for family trees they own or hav" ON "public"."sharing_links" USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "sharing_links"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR (("ft"."organization_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "ft"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))) OR (("ft"."group_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM ("public"."groups" "g"
             JOIN "public"."organization_memberships" "om" ON (("om"."organization_id" = "g"."organization_id")))
          WHERE (("g"."id" = "ft"."group_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))))))));



CREATE POLICY "Users can manage sharing links they created or have admin acces" ON "public"."sharing_links" USING ((("created_by" = "auth"."uid"()) OR (("family_tree_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "sharing_links"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"()))))) OR (("group_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "sharing_links"."group_id") AND (("g"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."group_memberships" "gm"
          WHERE (("gm"."group_id" = "g"."id") AND ("gm"."user_id" = "auth"."uid"()) AND ("gm"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))))))) OR (("organization_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "sharing_links"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))))))));



CREATE POLICY "Users can manage their own sibling group memberships" ON "public"."group_sibling_group_memberships" USING (((EXISTS ( SELECT 1
   FROM "public"."persons" "p"
  WHERE (("p"."id" = "group_sibling_group_memberships"."person_id") AND ("p"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."group_sibling_groups" "gsg"
     JOIN "public"."groups" "g" ON (("g"."id" = "gsg"."group_id")))
  WHERE (("gsg"."id" = "group_sibling_group_memberships"."sibling_group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can remove media from organizations they have edit access" ON "public"."organization_media" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_media"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))))));



CREATE POLICY "Users can remove media from their family trees" ON "public"."family_tree_media" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_media"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can remove members from their family trees" ON "public"."family_tree_members" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_members"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can send messages" ON "public"."donor_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can update album_media for their albums" ON "public"."album_media" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."media_albums" "a"
  WHERE (("a"."id" = "album_media"."album_id") AND ("a"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update folders in their family trees" ON "public"."family_tree_folders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_folders"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update invitations they sent or received" ON "public"."family_invitations" FOR UPDATE USING ((("inviter_id" = "auth"."uid"()) OR ("invitee_id" = "auth"."uid"()) OR ("invitee_email" = "auth"."email"())));



CREATE POLICY "Users can update media in organizations they have edit access t" ON "public"."organization_media" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_media"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"]))))))))));



CREATE POLICY "Users can update media in their family trees" ON "public"."family_tree_media" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_media"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update members in their family trees" ON "public"."family_tree_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_members"."family_tree_id") AND ("ft"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update memberships" ON "public"."organization_memberships" FOR UPDATE USING ("public"."check_organization_owner"("organization_id", "auth"."uid"())) WITH CHECK ("public"."check_organization_owner"("organization_id", "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can update person_media for their persons" ON "public"."person_media" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."persons" "p"
  WHERE (("p"."id" = "person_media"."person_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own albums" ON "public"."media_albums" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own family trees" ON "public"."family_trees" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own folders" ON "public"."media_folders" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own groups" ON "public"."groups" FOR UPDATE USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own media" ON "public"."group_media" FOR UPDATE USING (("added_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own media files" ON "public"."media_files" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own persons" ON "public"."persons" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own settings" ON "public"."user_settings" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view album_media for their albums" ON "public"."album_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."media_albums" "a"
  WHERE (("a"."id" = "album_media"."album_id") AND ("a"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view all donors" ON "public"."donors" FOR SELECT USING (true);



CREATE POLICY "Users can view connections for their persons" ON "public"."connections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."persons"
  WHERE (("persons"."id" = "connections"."from_person_id") AND ("persons"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can view family tree members they have access to" ON "public"."family_tree_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_members"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR ("ft"."visibility" = 'public'::"text"))))));



CREATE POLICY "Users can view folders in family trees they have access to" ON "public"."family_tree_folders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_folders"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR ("ft"."visibility" = 'public'::"text"))))));



CREATE POLICY "Users can view invitations they sent or received" ON "public"."family_invitations" FOR SELECT USING ((("inviter_id" = "auth"."uid"()) OR ("invitee_id" = "auth"."uid"()) OR ("invitee_email" = "auth"."email"())));



CREATE POLICY "Users can view media in family trees they have access to" ON "public"."family_tree_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "family_tree_media"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR ("ft"."visibility" = 'public'::"text"))))));



CREATE POLICY "Users can view media in organizations they have access to" ON "public"."organization_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_media"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR ("o"."visibility" = 'public'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can view memberships" ON "public"."organization_memberships" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."check_organization_owner"("organization_id", "auth"."uid"())));



CREATE POLICY "Users can view memberships for groups they own" ON "public"."group_memberships" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."groups"
  WHERE (("groups"."id" = "group_memberships"."group_id") AND ("groups"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own profile" ON "public"."user_profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view person_media for their persons" ON "public"."person_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."persons" "p"
  WHERE (("p"."id" = "person_media"."person_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view public albums" ON "public"."media_albums" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Users can view public family trees" ON "public"."family_trees" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Users can view public groups" ON "public"."groups" FOR SELECT USING (("visibility" = 'public'::"text"));



CREATE POLICY "Users can view public persons" ON "public"."persons" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE ("g"."visibility" = 'public'::"text"))));



CREATE POLICY "Users can view sharing links for family trees they have access " ON "public"."sharing_links" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "sharing_links"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR ("ft"."visibility" = 'public'::"text") OR (("ft"."organization_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "ft"."organization_id") AND ("om"."user_id" = "auth"."uid"()))))) OR (("ft"."group_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM ("public"."groups" "g"
             JOIN "public"."organization_memberships" "om" ON (("om"."organization_id" = "g"."organization_id")))
          WHERE (("g"."id" = "ft"."group_id") AND ("om"."user_id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view sharing links they have access to" ON "public"."sharing_links" FOR SELECT USING (((("family_tree_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."family_trees" "ft"
  WHERE (("ft"."id" = "sharing_links"."family_tree_id") AND (("ft"."user_id" = "auth"."uid"()) OR ("ft"."visibility" = 'public'::"text")))))) OR (("group_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."id" = "sharing_links"."group_id") AND (("g"."owner_id" = "auth"."uid"()) OR ("g"."visibility" = 'public'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."group_memberships" "gm"
          WHERE (("gm"."group_id" = "g"."id") AND ("gm"."user_id" = "auth"."uid"()))))))))) OR (("organization_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "sharing_links"."organization_id") AND (("o"."owner_id" = "auth"."uid"()) OR ("o"."visibility" = 'public'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."organization_memberships" "om"
          WHERE (("om"."organization_id" = "o"."id") AND ("om"."user_id" = "auth"."uid"())))))))))));



CREATE POLICY "Users can view sibling group memberships for accessible groups" ON "public"."group_sibling_group_memberships" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."group_sibling_groups" "gsg"
     JOIN "public"."group_memberships" "gm" ON (("gm"."group_id" = "gsg"."group_id")))
  WHERE (("gsg"."id" = "group_sibling_group_memberships"."sibling_group_id") AND ("gm"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."group_sibling_groups" "gsg"
     JOIN "public"."groups" "g" ON (("g"."id" = "gsg"."group_id")))
  WHERE (("gsg"."id" = "group_sibling_group_memberships"."sibling_group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their connections" ON "public"."donor_recipient_connections" FOR SELECT USING ((("auth"."uid"() = "recipient_user_id") OR (EXISTS ( SELECT 1
   FROM "public"."donor_profiles" "dp"
  WHERE (("dp"."id" = "donor_recipient_connections"."donor_profile_id") AND ("dp"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their messages" ON "public"."donor_messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() IN ( SELECT "dmt"."recipient_user_id"
   FROM "public"."donor_message_threads" "dmt"
  WHERE ("dmt"."id" = "donor_messages"."thread_id"))) OR ("auth"."uid"() IN ( SELECT "dp"."user_id"
   FROM ("public"."donor_profiles" "dp"
     JOIN "public"."donor_message_threads" "dmt" ON (("dmt"."donor_profile_id" = "dp"."id")))
  WHERE ("dmt"."id" = "donor_messages"."thread_id")))));



CREATE POLICY "Users can view their own albums" ON "public"."media_albums" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own family trees" ON "public"."family_trees" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own folders" ON "public"."media_folders" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own groups" ON "public"."groups" FOR SELECT USING (("owner_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own media files" ON "public"."media_files" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own memberships" ON "public"."group_memberships" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own persons" ON "public"."persons" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own settings" ON "public"."user_settings" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their threads" ON "public"."donor_message_threads" FOR SELECT USING ((("auth"."uid"() = "recipient_user_id") OR (EXISTS ( SELECT 1
   FROM "public"."donor_profiles" "dp"
  WHERE (("dp"."id" = "donor_message_threads"."donor_profile_id") AND ("dp"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."album_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donor_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donor_message_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donor_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donor_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donor_recipient_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_tree_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_tree_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_tree_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_trees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_donor_database" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_sibling_group_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_sibling_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."person_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."persons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sharing_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."check_organization_owner"("org_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_organization_owner"("org_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_organization_owner"("org_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."column_exists"("table_name" "text", "column_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."column_exists"("table_name" "text", "column_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."column_exists"("table_name" "text", "column_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_organization_for_user"("org_name" "text", "org_type" "text", "org_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_organization_for_user"("org_name" "text", "org_type" "text", "org_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_organization_for_user"("org_name" "text", "org_type" "text", "org_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_settings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_data"("p_user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_data"("p_user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."export_user_data_json"("p_user_uuid" "uuid", "p_include" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_donor_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_donor_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_donor_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_family_members"("group_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_family_members"("group_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_family_members"("group_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_donor_count"("grp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_donor_count"("grp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_donor_count"("grp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_sibling_groups_count"("grp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_sibling_groups_count"("grp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_sibling_groups_count"("grp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_policies_for_table"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_policies_for_table"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_policies_for_table"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_postgres_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_postgres_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_postgres_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_columns"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_columns"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_columns"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_constraints"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_constraints"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_constraints"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_triggers"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_triggers"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_triggers"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_tenant_groups"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_tenant_groups"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_tenant_groups"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_donor_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_donor_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_donor_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_donor"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_donor"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_donor"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_tenant_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_tenant_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_tenant_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_family_connection"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_family_connection"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_family_connection"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_tenant_isolation"() TO "anon";
GRANT ALL ON FUNCTION "public"."verify_tenant_isolation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_tenant_isolation"() TO "service_role";


















GRANT ALL ON TABLE "public"."album_media" TO "anon";
GRANT ALL ON TABLE "public"."album_media" TO "authenticated";
GRANT ALL ON TABLE "public"."album_media" TO "service_role";



GRANT ALL ON TABLE "public"."audit_events" TO "anon";
GRANT ALL ON TABLE "public"."audit_events" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_events" TO "service_role";



GRANT ALL ON TABLE "public"."connections" TO "anon";
GRANT ALL ON TABLE "public"."connections" TO "authenticated";
GRANT ALL ON TABLE "public"."connections" TO "service_role";



GRANT ALL ON TABLE "public"."deletion_backups" TO "anon";
GRANT ALL ON TABLE "public"."deletion_backups" TO "authenticated";
GRANT ALL ON TABLE "public"."deletion_backups" TO "service_role";



GRANT ALL ON TABLE "public"."donor_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."donor_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."donor_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."donor_message_threads" TO "anon";
GRANT ALL ON TABLE "public"."donor_message_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."donor_message_threads" TO "service_role";



GRANT ALL ON TABLE "public"."donor_messages" TO "anon";
GRANT ALL ON TABLE "public"."donor_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."donor_messages" TO "service_role";



GRANT ALL ON TABLE "public"."donor_profiles" TO "anon";
GRANT ALL ON TABLE "public"."donor_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."donor_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."donor_recipient_connections" TO "anon";
GRANT ALL ON TABLE "public"."donor_recipient_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."donor_recipient_connections" TO "service_role";



GRANT ALL ON TABLE "public"."donors" TO "anon";
GRANT ALL ON TABLE "public"."donors" TO "authenticated";
GRANT ALL ON TABLE "public"."donors" TO "service_role";



GRANT ALL ON TABLE "public"."family_invitations" TO "anon";
GRANT ALL ON TABLE "public"."family_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."family_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."family_tree_folders" TO "anon";
GRANT ALL ON TABLE "public"."family_tree_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."family_tree_folders" TO "service_role";



GRANT ALL ON TABLE "public"."family_tree_media" TO "anon";
GRANT ALL ON TABLE "public"."family_tree_media" TO "authenticated";
GRANT ALL ON TABLE "public"."family_tree_media" TO "service_role";



GRANT ALL ON TABLE "public"."family_tree_members" TO "anon";
GRANT ALL ON TABLE "public"."family_tree_members" TO "authenticated";
GRANT ALL ON TABLE "public"."family_tree_members" TO "service_role";



GRANT ALL ON TABLE "public"."family_trees" TO "anon";
GRANT ALL ON TABLE "public"."family_trees" TO "authenticated";
GRANT ALL ON TABLE "public"."family_trees" TO "service_role";



GRANT ALL ON TABLE "public"."function_deployments" TO "anon";
GRANT ALL ON TABLE "public"."function_deployments" TO "authenticated";
GRANT ALL ON TABLE "public"."function_deployments" TO "service_role";



GRANT ALL ON TABLE "public"."group_donor_database" TO "anon";
GRANT ALL ON TABLE "public"."group_donor_database" TO "authenticated";
GRANT ALL ON TABLE "public"."group_donor_database" TO "service_role";



GRANT ALL ON TABLE "public"."group_invitations" TO "anon";
GRANT ALL ON TABLE "public"."group_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."group_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."group_media" TO "anon";
GRANT ALL ON TABLE "public"."group_media" TO "authenticated";
GRANT ALL ON TABLE "public"."group_media" TO "service_role";



GRANT ALL ON TABLE "public"."group_memberships" TO "anon";
GRANT ALL ON TABLE "public"."group_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."group_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."group_sibling_group_memberships" TO "anon";
GRANT ALL ON TABLE "public"."group_sibling_group_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."group_sibling_group_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."group_sibling_groups" TO "anon";
GRANT ALL ON TABLE "public"."group_sibling_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."group_sibling_groups" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."media_albums" TO "anon";
GRANT ALL ON TABLE "public"."media_albums" TO "authenticated";
GRANT ALL ON TABLE "public"."media_albums" TO "service_role";



GRANT ALL ON TABLE "public"."media_files" TO "anon";
GRANT ALL ON TABLE "public"."media_files" TO "authenticated";
GRANT ALL ON TABLE "public"."media_files" TO "service_role";



GRANT ALL ON TABLE "public"."media_folders" TO "anon";
GRANT ALL ON TABLE "public"."media_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."media_folders" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invitations" TO "anon";
GRANT ALL ON TABLE "public"."organization_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_media" TO "anon";
GRANT ALL ON TABLE "public"."organization_media" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_media" TO "service_role";



GRANT ALL ON TABLE "public"."organization_memberships" TO "anon";
GRANT ALL ON TABLE "public"."organization_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."person_media" TO "anon";
GRANT ALL ON TABLE "public"."person_media" TO "authenticated";
GRANT ALL ON TABLE "public"."person_media" TO "service_role";



GRANT ALL ON TABLE "public"."persons" TO "anon";
GRANT ALL ON TABLE "public"."persons" TO "authenticated";
GRANT ALL ON TABLE "public"."persons" TO "service_role";



GRANT ALL ON TABLE "public"."persons_with_groups" TO "anon";
GRANT ALL ON TABLE "public"."persons_with_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."persons_with_groups" TO "service_role";



GRANT ALL ON TABLE "public"."persons_with_trees" TO "anon";
GRANT ALL ON TABLE "public"."persons_with_trees" TO "authenticated";
GRANT ALL ON TABLE "public"."persons_with_trees" TO "service_role";



GRANT ALL ON TABLE "public"."sharing_links" TO "anon";
GRANT ALL ON TABLE "public"."sharing_links" TO "authenticated";
GRANT ALL ON TABLE "public"."sharing_links" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
