create table "public"."album_media" (
    "id" uuid not null default gen_random_uuid(),
    "album_id" uuid not null,
    "media_file_id" uuid not null,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."album_media" enable row level security;

create table "public"."audit_events" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "event_type" text not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."connections" (
    "id" uuid not null default uuid_generate_v4(),
    "from_person_id" uuid,
    "to_person_id" uuid,
    "relationship_type" text not null,
    "group_id" uuid,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "organization_id" uuid,
    "notes" text
);


alter table "public"."connections" enable row level security;

create table "public"."deletion_backups" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "payload" jsonb not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."donor_activity_log" (
    "id" uuid not null default uuid_generate_v4(),
    "donor_profile_id" uuid,
    "activity_type" text not null,
    "description" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."donor_activity_log" enable row level security;

create table "public"."donor_message_threads" (
    "id" uuid not null default uuid_generate_v4(),
    "donor_profile_id" uuid,
    "recipient_user_id" uuid,
    "subject" text,
    "status" text default 'active'::text,
    "last_message_at" timestamp with time zone,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."donor_message_threads" enable row level security;

create table "public"."donor_messages" (
    "id" uuid not null default uuid_generate_v4(),
    "thread_id" uuid,
    "sender_id" uuid,
    "content" text,
    "status" text default 'sent'::text,
    "is_read" boolean default false,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."donor_messages" enable row level security;

create table "public"."donor_profiles" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "person_id" uuid,
    "donor_number" text,
    "cryobank_name" text,
    "donor_type" text,
    "height" text,
    "weight" text,
    "eye_color" text,
    "hair_color" text,
    "ethnicity" text,
    "blood_type" text,
    "education_level" text,
    "occupation" text,
    "interests" text,
    "personal_statement" text,
    "medical_history" jsonb,
    "last_health_update" timestamp with time zone,
    "is_anonymous" boolean default true,
    "privacy_settings" jsonb default '{"show_photos": false, "privacy_level": "anonymous", "show_education": false, "show_interests": false, "show_basic_info": true, "show_occupation": false, "show_contact_info": false, "show_health_history": true, "allow_clinic_messages": true, "allow_family_messages": true, "message_notifications": true, "show_personal_statement": false, "require_message_approval": true, "show_physical_characteristics": true}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."donor_profiles" enable row level security;

create table "public"."donor_recipient_connections" (
    "id" uuid not null default uuid_generate_v4(),
    "donor_profile_id" uuid,
    "recipient_user_id" uuid,
    "organization_id" uuid,
    "connection_type" text,
    "status" text default 'pending'::text,
    "initiated_by" text,
    "connected_at" timestamp with time zone,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."donor_recipient_connections" enable row level security;

create table "public"."donors" (
    "id" uuid not null default uuid_generate_v4(),
    "donor_number" text,
    "sperm_bank" text,
    "donor_type" text default 'sperm'::text,
    "is_anonymous" boolean default true,
    "height" text,
    "weight" text,
    "eye_color" text,
    "hair_color" text,
    "ethnicity" text,
    "blood_type" text,
    "education_level" text,
    "medical_history" jsonb,
    "person_id" uuid,
    "notes" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."donors" enable row level security;

create table "public"."family_invitations" (
    "id" uuid not null default uuid_generate_v4(),
    "group_id" uuid not null,
    "inviter_id" uuid not null,
    "invitee_email" text not null,
    "invitee_id" uuid,
    "role" text default 'viewer'::text,
    "status" text default 'pending'::text,
    "message" text,
    "expires_at" timestamp with time zone default (now() + '7 days'::interval),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."family_invitations" enable row level security;

create table "public"."family_tree_folders" (
    "id" uuid not null default gen_random_uuid(),
    "family_tree_id" uuid not null,
    "parent_folder_id" uuid,
    "name" text not null,
    "description" text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."family_tree_folders" enable row level security;

create table "public"."family_tree_media" (
    "id" uuid not null default gen_random_uuid(),
    "family_tree_id" uuid not null,
    "media_file_id" uuid not null,
    "folder_id" uuid,
    "added_by" uuid not null,
    "tags" text[],
    "description" text,
    "sort_order" integer default 0,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."family_tree_media" enable row level security;

create table "public"."family_tree_members" (
    "id" uuid not null default gen_random_uuid(),
    "family_tree_id" uuid not null,
    "person_id" uuid not null,
    "added_by" uuid not null,
    "role" text default 'member'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."family_tree_members" enable row level security;

create table "public"."family_trees" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "description" text,
    "visibility" text not null default 'private'::text,
    "tree_data" jsonb default '{}'::jsonb,
    "settings" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "organization_id" uuid,
    "group_id" uuid
);


alter table "public"."family_trees" enable row level security;

create table "public"."function_deployments" (
    "id" uuid not null default gen_random_uuid(),
    "function_name" text not null,
    "version" text not null,
    "deployed_at" timestamp with time zone default now(),
    "changes_description" text,
    "status" text default 'pending'::text
);


create table "public"."group_donor_database" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "donor_id" uuid not null,
    "visibility" text not null default 'members_only'::text,
    "verification_status" text not null default 'unverified'::text,
    "verified_by" uuid,
    "verified_at" timestamp with time zone,
    "notes" text,
    "custom_fields" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."group_donor_database" enable row level security;

create table "public"."group_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid,
    "inviter_id" uuid,
    "invitee_email" text not null,
    "role" text default 'member'::text,
    "status" text default 'pending'::text,
    "token" text default (gen_random_uuid())::text,
    "expires_at" timestamp with time zone default (now() + '7 days'::interval),
    "created_at" timestamp with time zone default now()
);


alter table "public"."group_invitations" enable row level security;

create table "public"."group_media" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "media_file_id" uuid not null,
    "added_by" uuid not null,
    "description" text,
    "folder_id" uuid,
    "sort_order" integer,
    "tags" text[],
    "created_at" timestamp with time zone default now()
);


alter table "public"."group_media" enable row level security;

create table "public"."group_memberships" (
    "id" uuid not null default uuid_generate_v4(),
    "person_id" uuid,
    "group_id" uuid,
    "user_id" uuid,
    "role" text default 'viewer'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."group_memberships" enable row level security;

create table "public"."group_sibling_group_memberships" (
    "id" uuid not null default gen_random_uuid(),
    "sibling_group_id" uuid not null,
    "person_id" uuid not null,
    "status" text not null default 'active'::text,
    "notification_preferences" jsonb default '{"new_members": true, "group_updates": true, "direct_messages": true}'::jsonb,
    "joined_at" timestamp with time zone default now()
);


alter table "public"."group_sibling_group_memberships" enable row level security;

create table "public"."group_sibling_groups" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "donor_id" uuid not null,
    "name" text not null,
    "description" text,
    "privacy_level" text not null default 'members_only'::text,
    "auto_add_new_siblings" boolean default true,
    "allow_contact_sharing" boolean default true,
    "allow_photo_sharing" boolean default true,
    "allow_medical_sharing" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."group_sibling_groups" enable row level security;

create table "public"."groups" (
    "id" uuid not null default uuid_generate_v4(),
    "label" text not null,
    "type" text not null,
    "description" text,
    "visibility" text default 'private'::text,
    "owner_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "organization_id" uuid not null,
    "settings" jsonb default '{}'::jsonb,
    "slug" text,
    "subdomain" text,
    "domain" text,
    "plan" text default 'free'::text
);


alter table "public"."groups" enable row level security;

create table "public"."media_albums" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "description" text,
    "visibility" text not null default 'private'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."media_albums" enable row level security;

create table "public"."media_files" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "file_path" text not null,
    "file_name" text not null,
    "file_size" bigint not null,
    "mime_type" text not null,
    "bucket_name" text not null default 'family-photos'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "folder_id" uuid
);


alter table "public"."media_files" enable row level security;

create table "public"."media_folders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "parent_folder_id" uuid,
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."media_folders" enable row level security;

create table "public"."organization_invitations" (
    "id" uuid not null default uuid_generate_v4(),
    "organization_id" uuid,
    "inviter_id" uuid,
    "invitee_email" text not null,
    "role" text default 'viewer'::text,
    "token" text not null default encode(gen_random_bytes(32), 'base64'::text),
    "expires_at" timestamp with time zone default (now() + '7 days'::interval),
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."organization_invitations" enable row level security;

create table "public"."organization_media" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "media_file_id" uuid not null,
    "added_by" uuid not null,
    "folder_id" uuid,
    "sort_order" integer default 0,
    "tags" text[],
    "description" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."organization_media" enable row level security;

create table "public"."organization_memberships" (
    "id" uuid not null default uuid_generate_v4(),
    "organization_id" uuid,
    "user_id" uuid,
    "role" text default 'viewer'::text,
    "invited_by" uuid,
    "joined_at" timestamp with time zone default now()
);


alter table "public"."organization_memberships" enable row level security;

create table "public"."organizations" (
    "id" uuid not null default uuid_generate_v4(),
    "slug" text not null,
    "name" text not null,
    "domain" text,
    "subdomain" text not null,
    "owner_id" uuid not null,
    "type" text not null,
    "description" text,
    "plan" text default 'free'::text,
    "settings" jsonb default '{}'::jsonb,
    "visibility" text default 'private'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."organizations" enable row level security;

create table "public"."person_media" (
    "id" uuid not null default gen_random_uuid(),
    "person_id" uuid not null,
    "media_file_id" uuid not null,
    "is_profile_photo" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."person_media" enable row level security;

create table "public"."persons" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "date_of_birth" date,
    "birth_place" text,
    "gender" text,
    "status" text default 'living'::text,
    "date_of_death" date,
    "death_place" text,
    "profile_photo_url" text,
    "email" text,
    "phone" text,
    "address" text,
    "preferred_contact_method" text,
    "social_media_links" jsonb,
    "used_ivf" boolean default false,
    "used_iui" boolean default false,
    "fertility_treatments" jsonb,
    "donor" boolean default false,
    "notes" text,
    "metadata" jsonb,
    "user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "organization_id" uuid,
    "is_self" boolean default false
);


alter table "public"."persons" enable row level security;

create table "public"."sharing_links" (
    "id" uuid not null default uuid_generate_v4(),
    "family_tree_id" uuid,
    "created_by" uuid not null,
    "link_token" text not null default encode(gen_random_bytes(32), 'hex'::text),
    "access_level" text default 'view'::text,
    "password_hash" text,
    "max_uses" integer,
    "current_uses" integer default 0,
    "expires_at" timestamp with time zone,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "invited_emails" text[],
    "group_id" uuid,
    "organization_id" uuid
);


alter table "public"."sharing_links" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "settings" jsonb default '{}'::jsonb,
    "bio" text,
    "location" text,
    "phone" text,
    "website" text,
    "birth_date" date,
    "preferred_contact" text default 'email'::text,
    "account_type" text default 'individual'::text,
    "organization_id" uuid
);


alter table "public"."user_profiles" enable row level security;

create table "public"."user_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "email_notifications" boolean default true,
    "marketing_emails" boolean default false,
    "privacy_mode" boolean default false,
    "data_sharing" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."user_settings" enable row level security;

CREATE UNIQUE INDEX album_media_album_id_media_file_id_key ON public.album_media USING btree (album_id, media_file_id);

CREATE UNIQUE INDEX album_media_pkey ON public.album_media USING btree (id);

CREATE UNIQUE INDEX audit_events_pkey ON public.audit_events USING btree (id);

CREATE UNIQUE INDEX connections_from_person_id_to_person_id_relationship_type_key ON public.connections USING btree (from_person_id, to_person_id, relationship_type);

CREATE UNIQUE INDEX connections_pkey ON public.connections USING btree (id);

CREATE UNIQUE INDEX deletion_backups_pkey ON public.deletion_backups USING btree (id);

CREATE UNIQUE INDEX donor_activity_log_pkey ON public.donor_activity_log USING btree (id);

CREATE UNIQUE INDEX donor_message_threads_pkey ON public.donor_message_threads USING btree (id);

CREATE UNIQUE INDEX donor_messages_pkey ON public.donor_messages USING btree (id);

CREATE UNIQUE INDEX donor_profiles_pkey ON public.donor_profiles USING btree (id);

CREATE UNIQUE INDEX donor_profiles_user_id_key ON public.donor_profiles USING btree (user_id);

CREATE UNIQUE INDEX donor_recipient_connections_pkey ON public.donor_recipient_connections USING btree (id);

CREATE UNIQUE INDEX donors_donor_number_sperm_bank_key ON public.donors USING btree (donor_number, sperm_bank);

CREATE UNIQUE INDEX donors_pkey ON public.donors USING btree (id);

CREATE UNIQUE INDEX family_invitations_pkey ON public.family_invitations USING btree (id);

CREATE UNIQUE INDEX family_tree_folders_pkey ON public.family_tree_folders USING btree (id);

CREATE UNIQUE INDEX family_tree_media_family_tree_id_media_file_id_key ON public.family_tree_media USING btree (family_tree_id, media_file_id);

CREATE UNIQUE INDEX family_tree_media_pkey ON public.family_tree_media USING btree (id);

CREATE UNIQUE INDEX family_tree_members_family_tree_id_person_id_key ON public.family_tree_members USING btree (family_tree_id, person_id);

CREATE UNIQUE INDEX family_tree_members_pkey ON public.family_tree_members USING btree (id);

CREATE UNIQUE INDEX family_trees_pkey ON public.family_trees USING btree (id);

CREATE UNIQUE INDEX function_deployments_function_name_key ON public.function_deployments USING btree (function_name);

CREATE UNIQUE INDEX function_deployments_pkey ON public.function_deployments USING btree (id);

CREATE UNIQUE INDEX group_donor_database_group_id_donor_id_key ON public.group_donor_database USING btree (group_id, donor_id);

CREATE UNIQUE INDEX group_donor_database_pkey ON public.group_donor_database USING btree (id);

CREATE UNIQUE INDEX group_invitations_pkey ON public.group_invitations USING btree (id);

CREATE UNIQUE INDEX group_invitations_token_key ON public.group_invitations USING btree (token);

CREATE UNIQUE INDEX group_media_pkey ON public.group_media USING btree (id);

CREATE UNIQUE INDEX group_memberships_person_id_group_id_role_key ON public.group_memberships USING btree (person_id, group_id, role);

CREATE UNIQUE INDEX group_memberships_pkey ON public.group_memberships USING btree (id);

CREATE UNIQUE INDEX group_sibling_group_memberships_pkey ON public.group_sibling_group_memberships USING btree (id);

CREATE UNIQUE INDEX group_sibling_group_memberships_sibling_group_id_person_id_key ON public.group_sibling_group_memberships USING btree (sibling_group_id, person_id);

CREATE UNIQUE INDEX group_sibling_groups_group_id_donor_id_key ON public.group_sibling_groups USING btree (group_id, donor_id);

CREATE UNIQUE INDEX group_sibling_groups_pkey ON public.group_sibling_groups USING btree (id);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE INDEX idx_album_media_album_id ON public.album_media USING btree (album_id);

CREATE INDEX idx_album_media_media_file_id ON public.album_media USING btree (media_file_id);

CREATE INDEX idx_connections_from_person ON public.connections USING btree (from_person_id);

CREATE INDEX idx_connections_from_person_id ON public.connections USING btree (from_person_id);

CREATE INDEX idx_connections_group_id ON public.connections USING btree (group_id);

CREATE INDEX idx_connections_group_persons ON public.connections USING btree (group_id, from_person_id, to_person_id);

CREATE INDEX idx_connections_metadata_gin ON public.connections USING gin (metadata);

CREATE INDEX idx_connections_organization_id ON public.connections USING btree (organization_id);

CREATE INDEX idx_connections_person_ids ON public.connections USING btree (from_person_id, to_person_id);

CREATE INDEX idx_connections_person_lookup ON public.connections USING gin ((ARRAY[from_person_id, to_person_id]));

CREATE INDEX idx_connections_relationship_type ON public.connections USING btree (relationship_type);

CREATE INDEX idx_connections_to_person ON public.connections USING btree (to_person_id);

CREATE INDEX idx_connections_to_person_id ON public.connections USING btree (to_person_id);

CREATE INDEX idx_donor_activity_log_created_at ON public.donor_activity_log USING btree (created_at DESC);

CREATE INDEX idx_donor_activity_log_donor_profile_id ON public.donor_activity_log USING btree (donor_profile_id);

CREATE INDEX idx_donor_message_threads_donor_profile_id ON public.donor_message_threads USING btree (donor_profile_id);

CREATE INDEX idx_donor_messages_sender_id ON public.donor_messages USING btree (sender_id);

CREATE INDEX idx_donor_messages_thread_id ON public.donor_messages USING btree (thread_id);

CREATE INDEX idx_donor_profiles_person_id ON public.donor_profiles USING btree (person_id);

CREATE INDEX idx_donor_profiles_user_id ON public.donor_profiles USING btree (user_id);

CREATE INDEX idx_donor_recipient_connections_donor_id ON public.donor_recipient_connections USING btree (donor_profile_id);

CREATE INDEX idx_donor_recipient_connections_recipient_id ON public.donor_recipient_connections USING btree (recipient_user_id);

CREATE INDEX idx_donors_donor_type ON public.donors USING btree (donor_type);

CREATE INDEX idx_donors_is_anonymous ON public.donors USING btree (is_anonymous);

CREATE INDEX idx_donors_medical_history_gin ON public.donors USING gin (medical_history);

CREATE INDEX idx_donors_person_id ON public.donors USING btree (person_id);

CREATE INDEX idx_donors_sperm_bank ON public.donors USING btree (sperm_bank);

CREATE INDEX idx_family_invitations_group_id ON public.family_invitations USING btree (group_id);

CREATE INDEX idx_family_invitations_invitee_email ON public.family_invitations USING btree (invitee_email);

CREATE INDEX idx_family_invitations_status ON public.family_invitations USING btree (status);

CREATE INDEX idx_family_tree_folders_parent_id ON public.family_tree_folders USING btree (parent_folder_id);

CREATE INDEX idx_family_tree_folders_tree_id ON public.family_tree_folders USING btree (family_tree_id);

CREATE INDEX idx_family_tree_media_family_tree_id ON public.family_tree_media USING btree (family_tree_id);

CREATE INDEX idx_family_tree_media_file_id ON public.family_tree_media USING btree (media_file_id);

CREATE INDEX idx_family_tree_media_folder_id ON public.family_tree_media USING btree (folder_id);

CREATE INDEX idx_family_tree_media_tags ON public.family_tree_media USING gin (tags);

CREATE INDEX idx_family_tree_media_tree_id ON public.family_tree_media USING btree (family_tree_id);

CREATE INDEX idx_family_tree_members_family_tree_id ON public.family_tree_members USING btree (family_tree_id);

CREATE INDEX idx_family_tree_members_person_id ON public.family_tree_members USING btree (person_id);

CREATE INDEX idx_family_trees_group_id ON public.family_trees USING btree (group_id);

CREATE INDEX idx_family_trees_organization_id ON public.family_trees USING btree (organization_id);

CREATE INDEX idx_family_trees_user_id ON public.family_trees USING btree (user_id);

CREATE INDEX idx_family_trees_visibility ON public.family_trees USING btree (visibility);

CREATE INDEX idx_group_donor_database_donor_id ON public.group_donor_database USING btree (donor_id);

CREATE INDEX idx_group_donor_database_group_id ON public.group_donor_database USING btree (group_id);

CREATE INDEX idx_group_donor_database_verification ON public.group_donor_database USING btree (verification_status);

CREATE INDEX idx_group_invitations_group_id ON public.group_invitations USING btree (group_id);

CREATE INDEX idx_group_invitations_invitee_email ON public.group_invitations USING btree (invitee_email);

CREATE INDEX idx_group_invitations_status ON public.group_invitations USING btree (status);

CREATE INDEX idx_group_media_group_id ON public.group_media USING btree (group_id);

CREATE INDEX idx_group_media_media_file_id ON public.group_media USING btree (media_file_id);

CREATE INDEX idx_group_memberships_group_id ON public.group_memberships USING btree (group_id);

CREATE INDEX idx_group_memberships_group_user ON public.group_memberships USING btree (group_id, user_id);

CREATE INDEX idx_group_memberships_person_group ON public.group_memberships USING btree (person_id, group_id);

CREATE INDEX idx_group_memberships_person_id ON public.group_memberships USING btree (person_id);

CREATE INDEX idx_group_memberships_role ON public.group_memberships USING btree (role);

CREATE INDEX idx_group_memberships_user_id ON public.group_memberships USING btree (user_id);

CREATE INDEX idx_group_sibling_group_memberships_group_id ON public.group_sibling_group_memberships USING btree (sibling_group_id);

CREATE INDEX idx_group_sibling_group_memberships_person_id ON public.group_sibling_group_memberships USING btree (person_id);

CREATE INDEX idx_group_sibling_groups_donor_id ON public.group_sibling_groups USING btree (donor_id);

CREATE INDEX idx_group_sibling_groups_group_id ON public.group_sibling_groups USING btree (group_id);

CREATE INDEX idx_groups_organization_id ON public.groups USING btree (organization_id);

CREATE INDEX idx_groups_owner_id ON public.groups USING btree (owner_id);

CREATE UNIQUE INDEX idx_groups_slug ON public.groups USING btree (slug) WHERE (slug IS NOT NULL);

CREATE UNIQUE INDEX idx_groups_subdomain ON public.groups USING btree (subdomain) WHERE (subdomain IS NOT NULL);

CREATE INDEX idx_groups_type ON public.groups USING btree (type);

CREATE INDEX idx_groups_visibility ON public.groups USING btree (visibility);

CREATE INDEX idx_media_albums_user_id ON public.media_albums USING btree (user_id);

CREATE INDEX idx_media_files_user_id ON public.media_files USING btree (user_id);

CREATE INDEX idx_organization_memberships_org_id ON public.organization_memberships USING btree (organization_id);

CREATE INDEX idx_organization_memberships_org_user ON public.organization_memberships USING btree (organization_id, user_id);

CREATE INDEX idx_organization_memberships_user_id ON public.organization_memberships USING btree (user_id);

CREATE INDEX idx_organizations_domain ON public.organizations USING btree (domain);

CREATE INDEX idx_organizations_subdomain ON public.organizations USING btree (subdomain);

CREATE INDEX idx_organizations_visibility ON public.organizations USING btree (visibility);

CREATE INDEX idx_person_media_media_file_id ON public.person_media USING btree (media_file_id);

CREATE INDEX idx_person_media_person_id ON public.person_media USING btree (person_id);

CREATE INDEX idx_persons_donor ON public.persons USING btree (donor);

CREATE INDEX idx_persons_fertility_treatments_gin ON public.persons USING gin (fertility_treatments);

CREATE INDEX idx_persons_metadata_gin ON public.persons USING gin (metadata);

CREATE INDEX idx_persons_organization_id ON public.persons USING btree (organization_id);

CREATE INDEX idx_persons_social_media_gin ON public.persons USING gin (social_media_links);

CREATE INDEX idx_persons_status ON public.persons USING btree (status);

CREATE INDEX idx_persons_user_id ON public.persons USING btree (user_id);

CREATE UNIQUE INDEX idx_persons_user_self ON public.persons USING btree (user_id) WHERE (is_self = true);

CREATE INDEX idx_sharing_links_active_expires ON public.sharing_links USING btree (is_active, expires_at) WHERE (is_active = true);

CREATE INDEX idx_sharing_links_family_tree_id ON public.sharing_links USING btree (family_tree_id);

CREATE INDEX idx_sharing_links_token ON public.sharing_links USING btree (link_token);

CREATE INDEX idx_user_profiles_account_type ON public.user_profiles USING btree (account_type);

CREATE INDEX idx_user_profiles_organization_id ON public.user_profiles USING btree (organization_id);

CREATE UNIQUE INDEX media_albums_pkey ON public.media_albums USING btree (id);

CREATE UNIQUE INDEX media_files_pkey ON public.media_files USING btree (id);

CREATE UNIQUE INDEX media_folders_pkey ON public.media_folders USING btree (id);

CREATE UNIQUE INDEX organization_invitations_pkey ON public.organization_invitations USING btree (id);

CREATE UNIQUE INDEX organization_invitations_token_key ON public.organization_invitations USING btree (token);

CREATE UNIQUE INDEX organization_media_organization_id_media_file_id_key ON public.organization_media USING btree (organization_id, media_file_id);

CREATE UNIQUE INDEX organization_media_pkey ON public.organization_media USING btree (id);

CREATE UNIQUE INDEX organization_memberships_organization_id_user_id_key ON public.organization_memberships USING btree (organization_id, user_id);

CREATE UNIQUE INDEX organization_memberships_pkey ON public.organization_memberships USING btree (id);

CREATE UNIQUE INDEX organizations_domain_key ON public.organizations USING btree (domain);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug);

CREATE UNIQUE INDEX organizations_subdomain_key ON public.organizations USING btree (subdomain);

CREATE UNIQUE INDEX person_media_person_id_media_file_id_key ON public.person_media USING btree (person_id, media_file_id);

CREATE UNIQUE INDEX person_media_pkey ON public.person_media USING btree (id);

CREATE UNIQUE INDEX persons_pkey ON public.persons USING btree (id);

CREATE UNIQUE INDEX sharing_links_link_token_key ON public.sharing_links USING btree (link_token);

CREATE UNIQUE INDEX sharing_links_pkey ON public.sharing_links USING btree (id);

CREATE UNIQUE INDEX unique_folder_name_in_parent ON public.family_tree_folders USING btree (family_tree_id, parent_folder_id, name);

CREATE UNIQUE INDEX unique_root_folder_name ON public.family_tree_folders USING btree (family_tree_id, name) WHERE (parent_folder_id IS NULL);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);

CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id);

alter table "public"."album_media" add constraint "album_media_pkey" PRIMARY KEY using index "album_media_pkey";

alter table "public"."audit_events" add constraint "audit_events_pkey" PRIMARY KEY using index "audit_events_pkey";

alter table "public"."connections" add constraint "connections_pkey" PRIMARY KEY using index "connections_pkey";

alter table "public"."deletion_backups" add constraint "deletion_backups_pkey" PRIMARY KEY using index "deletion_backups_pkey";

alter table "public"."donor_activity_log" add constraint "donor_activity_log_pkey" PRIMARY KEY using index "donor_activity_log_pkey";

alter table "public"."donor_message_threads" add constraint "donor_message_threads_pkey" PRIMARY KEY using index "donor_message_threads_pkey";

alter table "public"."donor_messages" add constraint "donor_messages_pkey" PRIMARY KEY using index "donor_messages_pkey";

alter table "public"."donor_profiles" add constraint "donor_profiles_pkey" PRIMARY KEY using index "donor_profiles_pkey";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_pkey" PRIMARY KEY using index "donor_recipient_connections_pkey";

alter table "public"."donors" add constraint "donors_pkey" PRIMARY KEY using index "donors_pkey";

alter table "public"."family_invitations" add constraint "family_invitations_pkey" PRIMARY KEY using index "family_invitations_pkey";

alter table "public"."family_tree_folders" add constraint "family_tree_folders_pkey" PRIMARY KEY using index "family_tree_folders_pkey";

alter table "public"."family_tree_media" add constraint "family_tree_media_pkey" PRIMARY KEY using index "family_tree_media_pkey";

alter table "public"."family_tree_members" add constraint "family_tree_members_pkey" PRIMARY KEY using index "family_tree_members_pkey";

alter table "public"."family_trees" add constraint "family_trees_pkey" PRIMARY KEY using index "family_trees_pkey";

alter table "public"."function_deployments" add constraint "function_deployments_pkey" PRIMARY KEY using index "function_deployments_pkey";

alter table "public"."group_donor_database" add constraint "group_donor_database_pkey" PRIMARY KEY using index "group_donor_database_pkey";

alter table "public"."group_invitations" add constraint "group_invitations_pkey" PRIMARY KEY using index "group_invitations_pkey";

alter table "public"."group_media" add constraint "group_media_pkey" PRIMARY KEY using index "group_media_pkey";

alter table "public"."group_memberships" add constraint "group_memberships_pkey" PRIMARY KEY using index "group_memberships_pkey";

alter table "public"."group_sibling_group_memberships" add constraint "group_sibling_group_memberships_pkey" PRIMARY KEY using index "group_sibling_group_memberships_pkey";

alter table "public"."group_sibling_groups" add constraint "group_sibling_groups_pkey" PRIMARY KEY using index "group_sibling_groups_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."media_albums" add constraint "media_albums_pkey" PRIMARY KEY using index "media_albums_pkey";

alter table "public"."media_files" add constraint "media_files_pkey" PRIMARY KEY using index "media_files_pkey";

alter table "public"."media_folders" add constraint "media_folders_pkey" PRIMARY KEY using index "media_folders_pkey";

alter table "public"."organization_invitations" add constraint "organization_invitations_pkey" PRIMARY KEY using index "organization_invitations_pkey";

alter table "public"."organization_media" add constraint "organization_media_pkey" PRIMARY KEY using index "organization_media_pkey";

alter table "public"."organization_memberships" add constraint "organization_memberships_pkey" PRIMARY KEY using index "organization_memberships_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."person_media" add constraint "person_media_pkey" PRIMARY KEY using index "person_media_pkey";

alter table "public"."persons" add constraint "persons_pkey" PRIMARY KEY using index "persons_pkey";

alter table "public"."sharing_links" add constraint "sharing_links_pkey" PRIMARY KEY using index "sharing_links_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."album_media" add constraint "album_media_album_id_fkey" FOREIGN KEY (album_id) REFERENCES media_albums(id) ON DELETE CASCADE not valid;

alter table "public"."album_media" validate constraint "album_media_album_id_fkey";

alter table "public"."album_media" add constraint "album_media_album_id_media_file_id_key" UNIQUE using index "album_media_album_id_media_file_id_key";

alter table "public"."album_media" add constraint "album_media_media_file_id_fkey" FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE not valid;

alter table "public"."album_media" validate constraint "album_media_media_file_id_fkey";

alter table "public"."connections" add constraint "connections_check" CHECK ((from_person_id <> to_person_id)) not valid;

alter table "public"."connections" validate constraint "connections_check";

alter table "public"."connections" add constraint "connections_from_person_id_fkey" FOREIGN KEY (from_person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."connections" validate constraint "connections_from_person_id_fkey";

alter table "public"."connections" add constraint "connections_from_person_id_to_person_id_relationship_type_key" UNIQUE using index "connections_from_person_id_to_person_id_relationship_type_key";

alter table "public"."connections" add constraint "connections_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) not valid;

alter table "public"."connections" validate constraint "connections_group_id_fkey";

alter table "public"."connections" add constraint "connections_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."connections" validate constraint "connections_organization_id_fkey";

alter table "public"."connections" add constraint "connections_relationship_type_check" CHECK ((relationship_type = ANY (ARRAY['parent'::text, 'child'::text, 'partner'::text, 'sibling'::text, 'half_sibling'::text, 'donor'::text, 'biological_parent'::text, 'social_parent'::text, 'step_sibling'::text, 'spouse'::text, 'other'::text]))) not valid;

alter table "public"."connections" validate constraint "connections_relationship_type_check";

alter table "public"."connections" add constraint "connections_to_person_id_fkey" FOREIGN KEY (to_person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."connections" validate constraint "connections_to_person_id_fkey";

alter table "public"."donor_activity_log" add constraint "donor_activity_log_donor_profile_id_fkey" FOREIGN KEY (donor_profile_id) REFERENCES donor_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."donor_activity_log" validate constraint "donor_activity_log_donor_profile_id_fkey";

alter table "public"."donor_message_threads" add constraint "donor_message_threads_donor_profile_id_fkey" FOREIGN KEY (donor_profile_id) REFERENCES donor_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."donor_message_threads" validate constraint "donor_message_threads_donor_profile_id_fkey";

alter table "public"."donor_message_threads" add constraint "donor_message_threads_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."donor_message_threads" validate constraint "donor_message_threads_recipient_user_id_fkey";

alter table "public"."donor_message_threads" add constraint "donor_message_threads_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text]))) not valid;

alter table "public"."donor_message_threads" validate constraint "donor_message_threads_status_check";

alter table "public"."donor_messages" add constraint "donor_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) not valid;

alter table "public"."donor_messages" validate constraint "donor_messages_sender_id_fkey";

alter table "public"."donor_messages" add constraint "donor_messages_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'sent'::text]))) not valid;

alter table "public"."donor_messages" validate constraint "donor_messages_status_check";

alter table "public"."donor_messages" add constraint "donor_messages_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES donor_message_threads(id) ON DELETE CASCADE not valid;

alter table "public"."donor_messages" validate constraint "donor_messages_thread_id_fkey";

alter table "public"."donor_profiles" add constraint "donor_profiles_donor_type_check" CHECK ((donor_type = ANY (ARRAY['sperm'::text, 'egg'::text, 'embryo'::text, 'other'::text]))) not valid;

alter table "public"."donor_profiles" validate constraint "donor_profiles_donor_type_check";

alter table "public"."donor_profiles" add constraint "donor_profiles_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) not valid;

alter table "public"."donor_profiles" validate constraint "donor_profiles_person_id_fkey";

alter table "public"."donor_profiles" add constraint "donor_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."donor_profiles" validate constraint "donor_profiles_user_id_fkey";

alter table "public"."donor_profiles" add constraint "donor_profiles_user_id_key" UNIQUE using index "donor_profiles_user_id_key";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_connection_type_check" CHECK ((connection_type = ANY (ARRAY['family'::text, 'clinic'::text]))) not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_connection_type_check";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_donor_profile_id_fkey" FOREIGN KEY (donor_profile_id) REFERENCES donor_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_donor_profile_id_fkey";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_initiated_by_check" CHECK ((initiated_by = ANY (ARRAY['donor'::text, 'recipient'::text, 'organization'::text]))) not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_initiated_by_check";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_organization_id_fkey";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_recipient_user_id_fkey";

alter table "public"."donor_recipient_connections" add constraint "donor_recipient_connections_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'blocked'::text, 'archived'::text]))) not valid;

alter table "public"."donor_recipient_connections" validate constraint "donor_recipient_connections_status_check";

alter table "public"."donors" add constraint "donors_donor_number_sperm_bank_key" UNIQUE using index "donors_donor_number_sperm_bank_key";

alter table "public"."donors" add constraint "donors_donor_type_check" CHECK ((donor_type = ANY (ARRAY['sperm'::text, 'egg'::text, 'embryo'::text, 'other'::text]))) not valid;

alter table "public"."donors" validate constraint "donors_donor_type_check";

alter table "public"."donors" add constraint "donors_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) not valid;

alter table "public"."donors" validate constraint "donors_person_id_fkey";

alter table "public"."family_invitations" add constraint "family_invitations_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."family_invitations" validate constraint "family_invitations_group_id_fkey";

alter table "public"."family_invitations" add constraint "family_invitations_invitee_id_fkey" FOREIGN KEY (invitee_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."family_invitations" validate constraint "family_invitations_invitee_id_fkey";

alter table "public"."family_invitations" add constraint "family_invitations_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."family_invitations" validate constraint "family_invitations_inviter_id_fkey";

alter table "public"."family_invitations" add constraint "family_invitations_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text]))) not valid;

alter table "public"."family_invitations" validate constraint "family_invitations_role_check";

alter table "public"."family_invitations" add constraint "family_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text]))) not valid;

alter table "public"."family_invitations" validate constraint "family_invitations_status_check";

alter table "public"."family_tree_folders" add constraint "family_tree_folders_parent_folder_id_fkey" FOREIGN KEY (parent_folder_id) REFERENCES family_tree_folders(id) ON DELETE CASCADE not valid;

alter table "public"."family_tree_folders" validate constraint "family_tree_folders_parent_folder_id_fkey";

alter table "public"."family_tree_folders" add constraint "unique_folder_name_in_parent" UNIQUE using index "unique_folder_name_in_parent";

alter table "public"."family_tree_media" add constraint "family_tree_media_family_tree_id_media_file_id_key" UNIQUE using index "family_tree_media_family_tree_id_media_file_id_key";

alter table "public"."family_tree_media" add constraint "family_tree_media_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES family_tree_folders(id) ON DELETE SET NULL not valid;

alter table "public"."family_tree_media" validate constraint "family_tree_media_folder_id_fkey";

alter table "public"."family_tree_media" add constraint "family_tree_media_media_file_id_fkey" FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE not valid;

alter table "public"."family_tree_media" validate constraint "family_tree_media_media_file_id_fkey";

alter table "public"."family_tree_members" add constraint "family_tree_members_added_by_fkey" FOREIGN KEY (added_by) REFERENCES auth.users(id) not valid;

alter table "public"."family_tree_members" validate constraint "family_tree_members_added_by_fkey";

alter table "public"."family_tree_members" add constraint "family_tree_members_family_tree_id_fkey" FOREIGN KEY (family_tree_id) REFERENCES family_trees(id) ON DELETE CASCADE not valid;

alter table "public"."family_tree_members" validate constraint "family_tree_members_family_tree_id_fkey";

alter table "public"."family_tree_members" add constraint "family_tree_members_family_tree_id_person_id_key" UNIQUE using index "family_tree_members_family_tree_id_person_id_key";

alter table "public"."family_tree_members" add constraint "family_tree_members_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."family_tree_members" validate constraint "family_tree_members_person_id_fkey";

alter table "public"."family_trees" add constraint "family_trees_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."family_trees" validate constraint "family_trees_group_id_fkey";

alter table "public"."family_trees" add constraint "family_trees_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."family_trees" validate constraint "family_trees_organization_id_fkey";

alter table "public"."family_trees" add constraint "family_trees_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'shared'::text, 'public'::text]))) not valid;

alter table "public"."family_trees" validate constraint "family_trees_visibility_check";

alter table "public"."function_deployments" add constraint "function_deployments_function_name_key" UNIQUE using index "function_deployments_function_name_key";

alter table "public"."group_donor_database" add constraint "group_donor_database_donor_id_fkey" FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE not valid;

alter table "public"."group_donor_database" validate constraint "group_donor_database_donor_id_fkey";

alter table "public"."group_donor_database" add constraint "group_donor_database_group_id_donor_id_key" UNIQUE using index "group_donor_database_group_id_donor_id_key";

alter table "public"."group_donor_database" add constraint "group_donor_database_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_donor_database" validate constraint "group_donor_database_group_id_fkey";

alter table "public"."group_donor_database" add constraint "group_donor_database_verification_status_check" CHECK ((verification_status = ANY (ARRAY['unverified'::text, 'pending'::text, 'verified'::text, 'rejected'::text]))) not valid;

alter table "public"."group_donor_database" validate constraint "group_donor_database_verification_status_check";

alter table "public"."group_donor_database" add constraint "group_donor_database_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES auth.users(id) not valid;

alter table "public"."group_donor_database" validate constraint "group_donor_database_verified_by_fkey";

alter table "public"."group_donor_database" add constraint "group_donor_database_visibility_check" CHECK ((visibility = ANY (ARRAY['public'::text, 'members_only'::text, 'admin_only'::text]))) not valid;

alter table "public"."group_donor_database" validate constraint "group_donor_database_visibility_check";

alter table "public"."group_invitations" add constraint "group_invitations_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_invitations" validate constraint "group_invitations_group_id_fkey";

alter table "public"."group_invitations" add constraint "group_invitations_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) not valid;

alter table "public"."group_invitations" validate constraint "group_invitations_inviter_id_fkey";

alter table "public"."group_invitations" add constraint "group_invitations_role_check" CHECK ((role = ANY (ARRAY['viewer'::text, 'editor'::text, 'admin'::text]))) not valid;

alter table "public"."group_invitations" validate constraint "group_invitations_role_check";

alter table "public"."group_invitations" add constraint "group_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text, 'cancelled'::text]))) not valid;

alter table "public"."group_invitations" validate constraint "group_invitations_status_check";

alter table "public"."group_invitations" add constraint "group_invitations_token_key" UNIQUE using index "group_invitations_token_key";

alter table "public"."group_media" add constraint "group_media_added_by_fkey" FOREIGN KEY (added_by) REFERENCES auth.users(id) not valid;

alter table "public"."group_media" validate constraint "group_media_added_by_fkey";

alter table "public"."group_media" add constraint "group_media_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_media" validate constraint "group_media_group_id_fkey";

alter table "public"."group_media" add constraint "group_media_media_file_id_fkey" FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE not valid;

alter table "public"."group_media" validate constraint "group_media_media_file_id_fkey";

alter table "public"."group_memberships" add constraint "group_memberships_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_memberships" validate constraint "group_memberships_group_id_fkey";

alter table "public"."group_memberships" add constraint "group_memberships_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."group_memberships" validate constraint "group_memberships_person_id_fkey";

alter table "public"."group_memberships" add constraint "group_memberships_person_id_group_id_role_key" UNIQUE using index "group_memberships_person_id_group_id_role_key";

alter table "public"."group_memberships" add constraint "group_memberships_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text, 'parent'::text, 'child'::text, 'donor'::text, 'other'::text]))) not valid;

alter table "public"."group_memberships" validate constraint "group_memberships_role_check";

alter table "public"."group_memberships" add constraint "group_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."group_memberships" validate constraint "group_memberships_user_id_fkey";

alter table "public"."group_sibling_group_memberships" add constraint "group_sibling_group_memberships_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."group_sibling_group_memberships" validate constraint "group_sibling_group_memberships_person_id_fkey";

alter table "public"."group_sibling_group_memberships" add constraint "group_sibling_group_memberships_sibling_group_id_fkey" FOREIGN KEY (sibling_group_id) REFERENCES group_sibling_groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_sibling_group_memberships" validate constraint "group_sibling_group_memberships_sibling_group_id_fkey";

alter table "public"."group_sibling_group_memberships" add constraint "group_sibling_group_memberships_sibling_group_id_person_id_key" UNIQUE using index "group_sibling_group_memberships_sibling_group_id_person_id_key";

alter table "public"."group_sibling_group_memberships" add constraint "group_sibling_group_memberships_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'left'::text]))) not valid;

alter table "public"."group_sibling_group_memberships" validate constraint "group_sibling_group_memberships_status_check";

alter table "public"."group_sibling_groups" add constraint "group_sibling_groups_donor_id_fkey" FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE not valid;

alter table "public"."group_sibling_groups" validate constraint "group_sibling_groups_donor_id_fkey";

alter table "public"."group_sibling_groups" add constraint "group_sibling_groups_group_id_donor_id_key" UNIQUE using index "group_sibling_groups_group_id_donor_id_key";

alter table "public"."group_sibling_groups" add constraint "group_sibling_groups_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."group_sibling_groups" validate constraint "group_sibling_groups_group_id_fkey";

alter table "public"."group_sibling_groups" add constraint "group_sibling_groups_privacy_level_check" CHECK ((privacy_level = ANY (ARRAY['public'::text, 'members_only'::text, 'private'::text]))) not valid;

alter table "public"."group_sibling_groups" validate constraint "group_sibling_groups_privacy_level_check";

alter table "public"."groups" add constraint "groups_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."groups" validate constraint "groups_organization_id_fkey";

alter table "public"."groups" add constraint "groups_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."groups" validate constraint "groups_owner_id_fkey";

alter table "public"."groups" add constraint "groups_type_check" CHECK ((type = ANY (ARRAY['nuclear'::text, 'extended'::text, 'donor_network'::text, 'dibling_group'::text, 'fertility_clinic'::text, 'sperm_bank'::text]))) not valid;

alter table "public"."groups" validate constraint "groups_type_check";

alter table "public"."groups" add constraint "groups_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'public'::text, 'unlisted'::text, 'organization'::text]))) not valid;

alter table "public"."groups" validate constraint "groups_visibility_check";

alter table "public"."media_albums" add constraint "media_albums_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'shared'::text, 'public'::text]))) not valid;

alter table "public"."media_albums" validate constraint "media_albums_visibility_check";

alter table "public"."organization_invitations" add constraint "organization_invitations_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."organization_invitations" validate constraint "organization_invitations_inviter_id_fkey";

alter table "public"."organization_invitations" add constraint "organization_invitations_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_invitations" validate constraint "organization_invitations_organization_id_fkey";

alter table "public"."organization_invitations" add constraint "organization_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text]))) not valid;

alter table "public"."organization_invitations" validate constraint "organization_invitations_status_check";

alter table "public"."organization_invitations" add constraint "organization_invitations_token_key" UNIQUE using index "organization_invitations_token_key";

alter table "public"."organization_media" add constraint "organization_media_organization_id_media_file_id_key" UNIQUE using index "organization_media_organization_id_media_file_id_key";

alter table "public"."organization_memberships" add constraint "organization_memberships_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) not valid;

alter table "public"."organization_memberships" validate constraint "organization_memberships_invited_by_fkey";

alter table "public"."organization_memberships" add constraint "organization_memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_memberships" validate constraint "organization_memberships_organization_id_fkey";

alter table "public"."organization_memberships" add constraint "organization_memberships_organization_id_user_id_key" UNIQUE using index "organization_memberships_organization_id_user_id_key";

alter table "public"."organization_memberships" add constraint "organization_memberships_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'viewer'::text]))) not valid;

alter table "public"."organization_memberships" validate constraint "organization_memberships_role_check";

alter table "public"."organization_memberships" add constraint "organization_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."organization_memberships" validate constraint "organization_memberships_user_id_fkey";

alter table "public"."organizations" add constraint "organizations_domain_key" UNIQUE using index "organizations_domain_key";

alter table "public"."organizations" add constraint "organizations_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."organizations" validate constraint "organizations_owner_id_fkey";

alter table "public"."organizations" add constraint "organizations_plan_check" CHECK ((plan = ANY (ARRAY['free'::text, 'pro'::text, 'enterprise'::text]))) not valid;

alter table "public"."organizations" validate constraint "organizations_plan_check";

alter table "public"."organizations" add constraint "organizations_slug_key" UNIQUE using index "organizations_slug_key";

alter table "public"."organizations" add constraint "organizations_subdomain_key" UNIQUE using index "organizations_subdomain_key";

alter table "public"."organizations" add constraint "organizations_type_check" CHECK ((type = ANY (ARRAY['family_network'::text, 'fertility_clinic'::text, 'sperm_bank'::text, 'donor_network'::text, 'dibling_group'::text, 'community'::text]))) not valid;

alter table "public"."organizations" validate constraint "organizations_type_check";

alter table "public"."organizations" add constraint "organizations_visibility_check" CHECK ((visibility = ANY (ARRAY['public'::text, 'shared'::text, 'private'::text]))) not valid;

alter table "public"."organizations" validate constraint "organizations_visibility_check";

alter table "public"."person_media" add constraint "person_media_media_file_id_fkey" FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE not valid;

alter table "public"."person_media" validate constraint "person_media_media_file_id_fkey";

alter table "public"."person_media" add constraint "person_media_person_id_fkey" FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE not valid;

alter table "public"."person_media" validate constraint "person_media_person_id_fkey";

alter table "public"."person_media" add constraint "person_media_person_id_media_file_id_key" UNIQUE using index "person_media_person_id_media_file_id_key";

alter table "public"."persons" add constraint "persons_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."persons" validate constraint "persons_organization_id_fkey";

alter table "public"."persons" add constraint "persons_preferred_contact_method_check" CHECK ((preferred_contact_method = ANY (ARRAY['email'::text, 'phone'::text, 'mail'::text, 'none'::text]))) not valid;

alter table "public"."persons" validate constraint "persons_preferred_contact_method_check";

alter table "public"."persons" add constraint "persons_status_check" CHECK ((status = ANY (ARRAY['living'::text, 'deceased'::text]))) not valid;

alter table "public"."persons" validate constraint "persons_status_check";

alter table "public"."persons" add constraint "persons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."persons" validate constraint "persons_user_id_fkey";

alter table "public"."sharing_links" add constraint "sharing_links_access_level_check" CHECK ((access_level = ANY (ARRAY['view'::text, 'comment'::text, 'edit'::text]))) not valid;

alter table "public"."sharing_links" validate constraint "sharing_links_access_level_check";

alter table "public"."sharing_links" add constraint "sharing_links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sharing_links" validate constraint "sharing_links_created_by_fkey";

alter table "public"."sharing_links" add constraint "sharing_links_family_tree_id_fkey" FOREIGN KEY (family_tree_id) REFERENCES family_trees(id) ON DELETE CASCADE not valid;

alter table "public"."sharing_links" validate constraint "sharing_links_family_tree_id_fkey";

alter table "public"."sharing_links" add constraint "sharing_links_link_token_key" UNIQUE using index "sharing_links_link_token_key";

alter table "public"."sharing_links" add constraint "sharing_links_single_target_check" CHECK ((((family_tree_id IS NOT NULL) AND (group_id IS NULL) AND (organization_id IS NULL)) OR ((family_tree_id IS NULL) AND (group_id IS NOT NULL) AND (organization_id IS NULL)) OR ((family_tree_id IS NULL) AND (group_id IS NULL) AND (organization_id IS NOT NULL)))) not valid;

alter table "public"."sharing_links" validate constraint "sharing_links_single_target_check";

alter table "public"."user_profiles" add constraint "user_profiles_account_type_check" CHECK ((account_type = ANY (ARRAY['individual'::text, 'donor'::text, 'organization'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_account_type_check";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_organization_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_key" UNIQUE using index "user_settings_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_organization_owner(org_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organizations
    WHERE id = org_id AND owner_id = user_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
$function$
;

CREATE OR REPLACE FUNCTION public.create_organization_for_user(org_name text, org_type text DEFAULT 'fertility_clinic'::text, org_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_settings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.export_user_data_json(p_user_uuid uuid, p_include jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_donor_profile(user_id uuid)
 RETURNS TABLE(donor_profile_id uuid, person_id uuid, donor_number text, cryobank_name text, account_type text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT 
    dp.id as donor_profile_id,
    dp.person_id,
    dp.donor_number,
    dp.cryobank_name,
    up.account_type
  FROM public.donor_profiles dp
  JOIN public.user_profiles up ON up.id = dp.user_id
  WHERE dp.user_id = $1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_family_members(group_uuid uuid)
 RETURNS TABLE(id uuid, name text, date_of_birth date, birth_place text, gender text, status text, date_of_death date, death_place text, profile_photo_url text, email text, phone text, address text, preferred_contact_method text, social_media_links jsonb, used_ivf boolean, used_iui boolean, fertility_treatments jsonb, donor boolean, notes text, metadata jsonb, user_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, role text)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_group_donor_count(grp_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_donor_database
    WHERE group_id = grp_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_group_sibling_groups_count(grp_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.group_sibling_groups
    WHERE group_id = grp_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_policies_for_table(table_name text)
 RETURNS TABLE(policy_name text, policy_command text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 
        pol.polname as policy_name,
        pol.polcmd as policy_command
    FROM pg_policy pol
    JOIN pg_class cls ON pol.polrelid = cls.oid
    JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
    WHERE nsp.nspname = 'public' 
    AND cls.relname = $1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_postgres_version()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT version();
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
 RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = $1
    ORDER BY c.ordinal_position;
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_constraints(table_name text)
 RETURNS TABLE(constraint_name text, constraint_type text, column_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_triggers(table_name text)
 RETURNS TABLE(trigger_name text, event_manipulation text, action_timing text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 
        t.trigger_name,
        t.event_manipulation,
        t.action_timing
    FROM information_schema.triggers t
    WHERE t.event_object_schema = 'public' 
    AND t.event_object_table = $1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_tenant_groups(user_uuid uuid)
 RETURNS TABLE(group_id uuid, role text, is_owner boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_donor_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_donor(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = $1 AND account_type = 'donor'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.log_tenant_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

create or replace view "public"."persons_with_groups" as  SELECT p.id,
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
    p.organization_id,
    COALESCE(json_agg(json_build_object('group_id', gm.group_id, 'group_label', g.label, 'group_type', g.type, 'role', gm.role)) FILTER (WHERE (gm.group_id IS NOT NULL)), '[]'::json) AS group_memberships
   FROM ((persons p
     LEFT JOIN group_memberships gm ON ((p.id = gm.person_id)))
     LEFT JOIN groups g ON ((gm.group_id = g.id)))
  GROUP BY p.id, p.name, p.date_of_birth, p.birth_place, p.gender, p.status, p.date_of_death, p.death_place, p.profile_photo_url, p.email, p.phone, p.address, p.preferred_contact_method, p.social_media_links, p.used_ivf, p.used_iui, p.fertility_treatments, p.donor, p.notes, p.metadata, p.user_id, p.created_at, p.updated_at, p.organization_id;


create or replace view "public"."persons_with_trees" as  SELECT p.id,
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
    p.organization_id,
    p.is_self,
    COALESCE(json_agg(json_build_object('family_tree_id', ftm.family_tree_id, 'family_tree_name', ft.name, 'family_tree_visibility', ft.visibility, 'role', ftm.role, 'added_at', ftm.created_at)) FILTER (WHERE (ftm.family_tree_id IS NOT NULL)), '[]'::json) AS family_trees
   FROM ((persons p
     LEFT JOIN family_tree_members ftm ON ((p.id = ftm.person_id)))
     LEFT JOIN family_trees ft ON ((ftm.family_tree_id = ft.id)))
  GROUP BY p.id;


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_family_connection()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Prevent someone from being their own parent/child
    IF NEW.from_person_id = NEW.to_person_id THEN
        RAISE EXCEPTION 'A person cannot have a relationship with themselves';
    END IF;
    
    -- Add more validation logic as needed
    -- For example: prevent circular parent-child relationships
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.verify_tenant_isolation()
 RETURNS TABLE(table_name text, policy_name text, has_tenant_filter boolean, potential_leaks integer)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;

grant delete on table "public"."album_media" to "anon";

grant insert on table "public"."album_media" to "anon";

grant references on table "public"."album_media" to "anon";

grant select on table "public"."album_media" to "anon";

grant trigger on table "public"."album_media" to "anon";

grant truncate on table "public"."album_media" to "anon";

grant update on table "public"."album_media" to "anon";

grant delete on table "public"."album_media" to "authenticated";

grant insert on table "public"."album_media" to "authenticated";

grant references on table "public"."album_media" to "authenticated";

grant select on table "public"."album_media" to "authenticated";

grant trigger on table "public"."album_media" to "authenticated";

grant truncate on table "public"."album_media" to "authenticated";

grant update on table "public"."album_media" to "authenticated";

grant delete on table "public"."album_media" to "service_role";

grant insert on table "public"."album_media" to "service_role";

grant references on table "public"."album_media" to "service_role";

grant select on table "public"."album_media" to "service_role";

grant trigger on table "public"."album_media" to "service_role";

grant truncate on table "public"."album_media" to "service_role";

grant update on table "public"."album_media" to "service_role";

grant delete on table "public"."audit_events" to "anon";

grant insert on table "public"."audit_events" to "anon";

grant references on table "public"."audit_events" to "anon";

grant select on table "public"."audit_events" to "anon";

grant trigger on table "public"."audit_events" to "anon";

grant truncate on table "public"."audit_events" to "anon";

grant update on table "public"."audit_events" to "anon";

grant delete on table "public"."audit_events" to "authenticated";

grant insert on table "public"."audit_events" to "authenticated";

grant references on table "public"."audit_events" to "authenticated";

grant select on table "public"."audit_events" to "authenticated";

grant trigger on table "public"."audit_events" to "authenticated";

grant truncate on table "public"."audit_events" to "authenticated";

grant update on table "public"."audit_events" to "authenticated";

grant delete on table "public"."audit_events" to "service_role";

grant insert on table "public"."audit_events" to "service_role";

grant references on table "public"."audit_events" to "service_role";

grant select on table "public"."audit_events" to "service_role";

grant trigger on table "public"."audit_events" to "service_role";

grant truncate on table "public"."audit_events" to "service_role";

grant update on table "public"."audit_events" to "service_role";

grant delete on table "public"."connections" to "anon";

grant insert on table "public"."connections" to "anon";

grant references on table "public"."connections" to "anon";

grant select on table "public"."connections" to "anon";

grant trigger on table "public"."connections" to "anon";

grant truncate on table "public"."connections" to "anon";

grant update on table "public"."connections" to "anon";

grant delete on table "public"."connections" to "authenticated";

grant insert on table "public"."connections" to "authenticated";

grant references on table "public"."connections" to "authenticated";

grant select on table "public"."connections" to "authenticated";

grant trigger on table "public"."connections" to "authenticated";

grant truncate on table "public"."connections" to "authenticated";

grant update on table "public"."connections" to "authenticated";

grant delete on table "public"."connections" to "service_role";

grant insert on table "public"."connections" to "service_role";

grant references on table "public"."connections" to "service_role";

grant select on table "public"."connections" to "service_role";

grant trigger on table "public"."connections" to "service_role";

grant truncate on table "public"."connections" to "service_role";

grant update on table "public"."connections" to "service_role";

grant delete on table "public"."deletion_backups" to "anon";

grant insert on table "public"."deletion_backups" to "anon";

grant references on table "public"."deletion_backups" to "anon";

grant select on table "public"."deletion_backups" to "anon";

grant trigger on table "public"."deletion_backups" to "anon";

grant truncate on table "public"."deletion_backups" to "anon";

grant update on table "public"."deletion_backups" to "anon";

grant delete on table "public"."deletion_backups" to "authenticated";

grant insert on table "public"."deletion_backups" to "authenticated";

grant references on table "public"."deletion_backups" to "authenticated";

grant select on table "public"."deletion_backups" to "authenticated";

grant trigger on table "public"."deletion_backups" to "authenticated";

grant truncate on table "public"."deletion_backups" to "authenticated";

grant update on table "public"."deletion_backups" to "authenticated";

grant delete on table "public"."deletion_backups" to "service_role";

grant insert on table "public"."deletion_backups" to "service_role";

grant references on table "public"."deletion_backups" to "service_role";

grant select on table "public"."deletion_backups" to "service_role";

grant trigger on table "public"."deletion_backups" to "service_role";

grant truncate on table "public"."deletion_backups" to "service_role";

grant update on table "public"."deletion_backups" to "service_role";

grant delete on table "public"."donor_activity_log" to "anon";

grant insert on table "public"."donor_activity_log" to "anon";

grant references on table "public"."donor_activity_log" to "anon";

grant select on table "public"."donor_activity_log" to "anon";

grant trigger on table "public"."donor_activity_log" to "anon";

grant truncate on table "public"."donor_activity_log" to "anon";

grant update on table "public"."donor_activity_log" to "anon";

grant delete on table "public"."donor_activity_log" to "authenticated";

grant insert on table "public"."donor_activity_log" to "authenticated";

grant references on table "public"."donor_activity_log" to "authenticated";

grant select on table "public"."donor_activity_log" to "authenticated";

grant trigger on table "public"."donor_activity_log" to "authenticated";

grant truncate on table "public"."donor_activity_log" to "authenticated";

grant update on table "public"."donor_activity_log" to "authenticated";

grant delete on table "public"."donor_activity_log" to "service_role";

grant insert on table "public"."donor_activity_log" to "service_role";

grant references on table "public"."donor_activity_log" to "service_role";

grant select on table "public"."donor_activity_log" to "service_role";

grant trigger on table "public"."donor_activity_log" to "service_role";

grant truncate on table "public"."donor_activity_log" to "service_role";

grant update on table "public"."donor_activity_log" to "service_role";

grant delete on table "public"."donor_message_threads" to "anon";

grant insert on table "public"."donor_message_threads" to "anon";

grant references on table "public"."donor_message_threads" to "anon";

grant select on table "public"."donor_message_threads" to "anon";

grant trigger on table "public"."donor_message_threads" to "anon";

grant truncate on table "public"."donor_message_threads" to "anon";

grant update on table "public"."donor_message_threads" to "anon";

grant delete on table "public"."donor_message_threads" to "authenticated";

grant insert on table "public"."donor_message_threads" to "authenticated";

grant references on table "public"."donor_message_threads" to "authenticated";

grant select on table "public"."donor_message_threads" to "authenticated";

grant trigger on table "public"."donor_message_threads" to "authenticated";

grant truncate on table "public"."donor_message_threads" to "authenticated";

grant update on table "public"."donor_message_threads" to "authenticated";

grant delete on table "public"."donor_message_threads" to "service_role";

grant insert on table "public"."donor_message_threads" to "service_role";

grant references on table "public"."donor_message_threads" to "service_role";

grant select on table "public"."donor_message_threads" to "service_role";

grant trigger on table "public"."donor_message_threads" to "service_role";

grant truncate on table "public"."donor_message_threads" to "service_role";

grant update on table "public"."donor_message_threads" to "service_role";

grant delete on table "public"."donor_messages" to "anon";

grant insert on table "public"."donor_messages" to "anon";

grant references on table "public"."donor_messages" to "anon";

grant select on table "public"."donor_messages" to "anon";

grant trigger on table "public"."donor_messages" to "anon";

grant truncate on table "public"."donor_messages" to "anon";

grant update on table "public"."donor_messages" to "anon";

grant delete on table "public"."donor_messages" to "authenticated";

grant insert on table "public"."donor_messages" to "authenticated";

grant references on table "public"."donor_messages" to "authenticated";

grant select on table "public"."donor_messages" to "authenticated";

grant trigger on table "public"."donor_messages" to "authenticated";

grant truncate on table "public"."donor_messages" to "authenticated";

grant update on table "public"."donor_messages" to "authenticated";

grant delete on table "public"."donor_messages" to "service_role";

grant insert on table "public"."donor_messages" to "service_role";

grant references on table "public"."donor_messages" to "service_role";

grant select on table "public"."donor_messages" to "service_role";

grant trigger on table "public"."donor_messages" to "service_role";

grant truncate on table "public"."donor_messages" to "service_role";

grant update on table "public"."donor_messages" to "service_role";

grant delete on table "public"."donor_profiles" to "anon";

grant insert on table "public"."donor_profiles" to "anon";

grant references on table "public"."donor_profiles" to "anon";

grant select on table "public"."donor_profiles" to "anon";

grant trigger on table "public"."donor_profiles" to "anon";

grant truncate on table "public"."donor_profiles" to "anon";

grant update on table "public"."donor_profiles" to "anon";

grant delete on table "public"."donor_profiles" to "authenticated";

grant insert on table "public"."donor_profiles" to "authenticated";

grant references on table "public"."donor_profiles" to "authenticated";

grant select on table "public"."donor_profiles" to "authenticated";

grant trigger on table "public"."donor_profiles" to "authenticated";

grant truncate on table "public"."donor_profiles" to "authenticated";

grant update on table "public"."donor_profiles" to "authenticated";

grant delete on table "public"."donor_profiles" to "service_role";

grant insert on table "public"."donor_profiles" to "service_role";

grant references on table "public"."donor_profiles" to "service_role";

grant select on table "public"."donor_profiles" to "service_role";

grant trigger on table "public"."donor_profiles" to "service_role";

grant truncate on table "public"."donor_profiles" to "service_role";

grant update on table "public"."donor_profiles" to "service_role";

grant delete on table "public"."donor_recipient_connections" to "anon";

grant insert on table "public"."donor_recipient_connections" to "anon";

grant references on table "public"."donor_recipient_connections" to "anon";

grant select on table "public"."donor_recipient_connections" to "anon";

grant trigger on table "public"."donor_recipient_connections" to "anon";

grant truncate on table "public"."donor_recipient_connections" to "anon";

grant update on table "public"."donor_recipient_connections" to "anon";

grant delete on table "public"."donor_recipient_connections" to "authenticated";

grant insert on table "public"."donor_recipient_connections" to "authenticated";

grant references on table "public"."donor_recipient_connections" to "authenticated";

grant select on table "public"."donor_recipient_connections" to "authenticated";

grant trigger on table "public"."donor_recipient_connections" to "authenticated";

grant truncate on table "public"."donor_recipient_connections" to "authenticated";

grant update on table "public"."donor_recipient_connections" to "authenticated";

grant delete on table "public"."donor_recipient_connections" to "service_role";

grant insert on table "public"."donor_recipient_connections" to "service_role";

grant references on table "public"."donor_recipient_connections" to "service_role";

grant select on table "public"."donor_recipient_connections" to "service_role";

grant trigger on table "public"."donor_recipient_connections" to "service_role";

grant truncate on table "public"."donor_recipient_connections" to "service_role";

grant update on table "public"."donor_recipient_connections" to "service_role";

grant delete on table "public"."donors" to "anon";

grant insert on table "public"."donors" to "anon";

grant references on table "public"."donors" to "anon";

grant select on table "public"."donors" to "anon";

grant trigger on table "public"."donors" to "anon";

grant truncate on table "public"."donors" to "anon";

grant update on table "public"."donors" to "anon";

grant delete on table "public"."donors" to "authenticated";

grant insert on table "public"."donors" to "authenticated";

grant references on table "public"."donors" to "authenticated";

grant select on table "public"."donors" to "authenticated";

grant trigger on table "public"."donors" to "authenticated";

grant truncate on table "public"."donors" to "authenticated";

grant update on table "public"."donors" to "authenticated";

grant delete on table "public"."donors" to "service_role";

grant insert on table "public"."donors" to "service_role";

grant references on table "public"."donors" to "service_role";

grant select on table "public"."donors" to "service_role";

grant trigger on table "public"."donors" to "service_role";

grant truncate on table "public"."donors" to "service_role";

grant update on table "public"."donors" to "service_role";

grant delete on table "public"."family_invitations" to "anon";

grant insert on table "public"."family_invitations" to "anon";

grant references on table "public"."family_invitations" to "anon";

grant select on table "public"."family_invitations" to "anon";

grant trigger on table "public"."family_invitations" to "anon";

grant truncate on table "public"."family_invitations" to "anon";

grant update on table "public"."family_invitations" to "anon";

grant delete on table "public"."family_invitations" to "authenticated";

grant insert on table "public"."family_invitations" to "authenticated";

grant references on table "public"."family_invitations" to "authenticated";

grant select on table "public"."family_invitations" to "authenticated";

grant trigger on table "public"."family_invitations" to "authenticated";

grant truncate on table "public"."family_invitations" to "authenticated";

grant update on table "public"."family_invitations" to "authenticated";

grant delete on table "public"."family_invitations" to "service_role";

grant insert on table "public"."family_invitations" to "service_role";

grant references on table "public"."family_invitations" to "service_role";

grant select on table "public"."family_invitations" to "service_role";

grant trigger on table "public"."family_invitations" to "service_role";

grant truncate on table "public"."family_invitations" to "service_role";

grant update on table "public"."family_invitations" to "service_role";

grant delete on table "public"."family_tree_folders" to "anon";

grant insert on table "public"."family_tree_folders" to "anon";

grant references on table "public"."family_tree_folders" to "anon";

grant select on table "public"."family_tree_folders" to "anon";

grant trigger on table "public"."family_tree_folders" to "anon";

grant truncate on table "public"."family_tree_folders" to "anon";

grant update on table "public"."family_tree_folders" to "anon";

grant delete on table "public"."family_tree_folders" to "authenticated";

grant insert on table "public"."family_tree_folders" to "authenticated";

grant references on table "public"."family_tree_folders" to "authenticated";

grant select on table "public"."family_tree_folders" to "authenticated";

grant trigger on table "public"."family_tree_folders" to "authenticated";

grant truncate on table "public"."family_tree_folders" to "authenticated";

grant update on table "public"."family_tree_folders" to "authenticated";

grant delete on table "public"."family_tree_folders" to "service_role";

grant insert on table "public"."family_tree_folders" to "service_role";

grant references on table "public"."family_tree_folders" to "service_role";

grant select on table "public"."family_tree_folders" to "service_role";

grant trigger on table "public"."family_tree_folders" to "service_role";

grant truncate on table "public"."family_tree_folders" to "service_role";

grant update on table "public"."family_tree_folders" to "service_role";

grant delete on table "public"."family_tree_media" to "anon";

grant insert on table "public"."family_tree_media" to "anon";

grant references on table "public"."family_tree_media" to "anon";

grant select on table "public"."family_tree_media" to "anon";

grant trigger on table "public"."family_tree_media" to "anon";

grant truncate on table "public"."family_tree_media" to "anon";

grant update on table "public"."family_tree_media" to "anon";

grant delete on table "public"."family_tree_media" to "authenticated";

grant insert on table "public"."family_tree_media" to "authenticated";

grant references on table "public"."family_tree_media" to "authenticated";

grant select on table "public"."family_tree_media" to "authenticated";

grant trigger on table "public"."family_tree_media" to "authenticated";

grant truncate on table "public"."family_tree_media" to "authenticated";

grant update on table "public"."family_tree_media" to "authenticated";

grant delete on table "public"."family_tree_media" to "service_role";

grant insert on table "public"."family_tree_media" to "service_role";

grant references on table "public"."family_tree_media" to "service_role";

grant select on table "public"."family_tree_media" to "service_role";

grant trigger on table "public"."family_tree_media" to "service_role";

grant truncate on table "public"."family_tree_media" to "service_role";

grant update on table "public"."family_tree_media" to "service_role";

grant delete on table "public"."family_tree_members" to "anon";

grant insert on table "public"."family_tree_members" to "anon";

grant references on table "public"."family_tree_members" to "anon";

grant select on table "public"."family_tree_members" to "anon";

grant trigger on table "public"."family_tree_members" to "anon";

grant truncate on table "public"."family_tree_members" to "anon";

grant update on table "public"."family_tree_members" to "anon";

grant delete on table "public"."family_tree_members" to "authenticated";

grant insert on table "public"."family_tree_members" to "authenticated";

grant references on table "public"."family_tree_members" to "authenticated";

grant select on table "public"."family_tree_members" to "authenticated";

grant trigger on table "public"."family_tree_members" to "authenticated";

grant truncate on table "public"."family_tree_members" to "authenticated";

grant update on table "public"."family_tree_members" to "authenticated";

grant delete on table "public"."family_tree_members" to "service_role";

grant insert on table "public"."family_tree_members" to "service_role";

grant references on table "public"."family_tree_members" to "service_role";

grant select on table "public"."family_tree_members" to "service_role";

grant trigger on table "public"."family_tree_members" to "service_role";

grant truncate on table "public"."family_tree_members" to "service_role";

grant update on table "public"."family_tree_members" to "service_role";

grant delete on table "public"."family_trees" to "anon";

grant insert on table "public"."family_trees" to "anon";

grant references on table "public"."family_trees" to "anon";

grant select on table "public"."family_trees" to "anon";

grant trigger on table "public"."family_trees" to "anon";

grant truncate on table "public"."family_trees" to "anon";

grant update on table "public"."family_trees" to "anon";

grant delete on table "public"."family_trees" to "authenticated";

grant insert on table "public"."family_trees" to "authenticated";

grant references on table "public"."family_trees" to "authenticated";

grant select on table "public"."family_trees" to "authenticated";

grant trigger on table "public"."family_trees" to "authenticated";

grant truncate on table "public"."family_trees" to "authenticated";

grant update on table "public"."family_trees" to "authenticated";

grant delete on table "public"."family_trees" to "service_role";

grant insert on table "public"."family_trees" to "service_role";

grant references on table "public"."family_trees" to "service_role";

grant select on table "public"."family_trees" to "service_role";

grant trigger on table "public"."family_trees" to "service_role";

grant truncate on table "public"."family_trees" to "service_role";

grant update on table "public"."family_trees" to "service_role";

grant delete on table "public"."function_deployments" to "anon";

grant insert on table "public"."function_deployments" to "anon";

grant references on table "public"."function_deployments" to "anon";

grant select on table "public"."function_deployments" to "anon";

grant trigger on table "public"."function_deployments" to "anon";

grant truncate on table "public"."function_deployments" to "anon";

grant update on table "public"."function_deployments" to "anon";

grant delete on table "public"."function_deployments" to "authenticated";

grant insert on table "public"."function_deployments" to "authenticated";

grant references on table "public"."function_deployments" to "authenticated";

grant select on table "public"."function_deployments" to "authenticated";

grant trigger on table "public"."function_deployments" to "authenticated";

grant truncate on table "public"."function_deployments" to "authenticated";

grant update on table "public"."function_deployments" to "authenticated";

grant delete on table "public"."function_deployments" to "service_role";

grant insert on table "public"."function_deployments" to "service_role";

grant references on table "public"."function_deployments" to "service_role";

grant select on table "public"."function_deployments" to "service_role";

grant trigger on table "public"."function_deployments" to "service_role";

grant truncate on table "public"."function_deployments" to "service_role";

grant update on table "public"."function_deployments" to "service_role";

grant delete on table "public"."group_donor_database" to "anon";

grant insert on table "public"."group_donor_database" to "anon";

grant references on table "public"."group_donor_database" to "anon";

grant select on table "public"."group_donor_database" to "anon";

grant trigger on table "public"."group_donor_database" to "anon";

grant truncate on table "public"."group_donor_database" to "anon";

grant update on table "public"."group_donor_database" to "anon";

grant delete on table "public"."group_donor_database" to "authenticated";

grant insert on table "public"."group_donor_database" to "authenticated";

grant references on table "public"."group_donor_database" to "authenticated";

grant select on table "public"."group_donor_database" to "authenticated";

grant trigger on table "public"."group_donor_database" to "authenticated";

grant truncate on table "public"."group_donor_database" to "authenticated";

grant update on table "public"."group_donor_database" to "authenticated";

grant delete on table "public"."group_donor_database" to "service_role";

grant insert on table "public"."group_donor_database" to "service_role";

grant references on table "public"."group_donor_database" to "service_role";

grant select on table "public"."group_donor_database" to "service_role";

grant trigger on table "public"."group_donor_database" to "service_role";

grant truncate on table "public"."group_donor_database" to "service_role";

grant update on table "public"."group_donor_database" to "service_role";

grant delete on table "public"."group_invitations" to "anon";

grant insert on table "public"."group_invitations" to "anon";

grant references on table "public"."group_invitations" to "anon";

grant select on table "public"."group_invitations" to "anon";

grant trigger on table "public"."group_invitations" to "anon";

grant truncate on table "public"."group_invitations" to "anon";

grant update on table "public"."group_invitations" to "anon";

grant delete on table "public"."group_invitations" to "authenticated";

grant insert on table "public"."group_invitations" to "authenticated";

grant references on table "public"."group_invitations" to "authenticated";

grant select on table "public"."group_invitations" to "authenticated";

grant trigger on table "public"."group_invitations" to "authenticated";

grant truncate on table "public"."group_invitations" to "authenticated";

grant update on table "public"."group_invitations" to "authenticated";

grant delete on table "public"."group_invitations" to "service_role";

grant insert on table "public"."group_invitations" to "service_role";

grant references on table "public"."group_invitations" to "service_role";

grant select on table "public"."group_invitations" to "service_role";

grant trigger on table "public"."group_invitations" to "service_role";

grant truncate on table "public"."group_invitations" to "service_role";

grant update on table "public"."group_invitations" to "service_role";

grant delete on table "public"."group_media" to "anon";

grant insert on table "public"."group_media" to "anon";

grant references on table "public"."group_media" to "anon";

grant select on table "public"."group_media" to "anon";

grant trigger on table "public"."group_media" to "anon";

grant truncate on table "public"."group_media" to "anon";

grant update on table "public"."group_media" to "anon";

grant delete on table "public"."group_media" to "authenticated";

grant insert on table "public"."group_media" to "authenticated";

grant references on table "public"."group_media" to "authenticated";

grant select on table "public"."group_media" to "authenticated";

grant trigger on table "public"."group_media" to "authenticated";

grant truncate on table "public"."group_media" to "authenticated";

grant update on table "public"."group_media" to "authenticated";

grant delete on table "public"."group_media" to "service_role";

grant insert on table "public"."group_media" to "service_role";

grant references on table "public"."group_media" to "service_role";

grant select on table "public"."group_media" to "service_role";

grant trigger on table "public"."group_media" to "service_role";

grant truncate on table "public"."group_media" to "service_role";

grant update on table "public"."group_media" to "service_role";

grant delete on table "public"."group_memberships" to "anon";

grant insert on table "public"."group_memberships" to "anon";

grant references on table "public"."group_memberships" to "anon";

grant select on table "public"."group_memberships" to "anon";

grant trigger on table "public"."group_memberships" to "anon";

grant truncate on table "public"."group_memberships" to "anon";

grant update on table "public"."group_memberships" to "anon";

grant delete on table "public"."group_memberships" to "authenticated";

grant insert on table "public"."group_memberships" to "authenticated";

grant references on table "public"."group_memberships" to "authenticated";

grant select on table "public"."group_memberships" to "authenticated";

grant trigger on table "public"."group_memberships" to "authenticated";

grant truncate on table "public"."group_memberships" to "authenticated";

grant update on table "public"."group_memberships" to "authenticated";

grant delete on table "public"."group_memberships" to "service_role";

grant insert on table "public"."group_memberships" to "service_role";

grant references on table "public"."group_memberships" to "service_role";

grant select on table "public"."group_memberships" to "service_role";

grant trigger on table "public"."group_memberships" to "service_role";

grant truncate on table "public"."group_memberships" to "service_role";

grant update on table "public"."group_memberships" to "service_role";

grant delete on table "public"."group_sibling_group_memberships" to "anon";

grant insert on table "public"."group_sibling_group_memberships" to "anon";

grant references on table "public"."group_sibling_group_memberships" to "anon";

grant select on table "public"."group_sibling_group_memberships" to "anon";

grant trigger on table "public"."group_sibling_group_memberships" to "anon";

grant truncate on table "public"."group_sibling_group_memberships" to "anon";

grant update on table "public"."group_sibling_group_memberships" to "anon";

grant delete on table "public"."group_sibling_group_memberships" to "authenticated";

grant insert on table "public"."group_sibling_group_memberships" to "authenticated";

grant references on table "public"."group_sibling_group_memberships" to "authenticated";

grant select on table "public"."group_sibling_group_memberships" to "authenticated";

grant trigger on table "public"."group_sibling_group_memberships" to "authenticated";

grant truncate on table "public"."group_sibling_group_memberships" to "authenticated";

grant update on table "public"."group_sibling_group_memberships" to "authenticated";

grant delete on table "public"."group_sibling_group_memberships" to "service_role";

grant insert on table "public"."group_sibling_group_memberships" to "service_role";

grant references on table "public"."group_sibling_group_memberships" to "service_role";

grant select on table "public"."group_sibling_group_memberships" to "service_role";

grant trigger on table "public"."group_sibling_group_memberships" to "service_role";

grant truncate on table "public"."group_sibling_group_memberships" to "service_role";

grant update on table "public"."group_sibling_group_memberships" to "service_role";

grant delete on table "public"."group_sibling_groups" to "anon";

grant insert on table "public"."group_sibling_groups" to "anon";

grant references on table "public"."group_sibling_groups" to "anon";

grant select on table "public"."group_sibling_groups" to "anon";

grant trigger on table "public"."group_sibling_groups" to "anon";

grant truncate on table "public"."group_sibling_groups" to "anon";

grant update on table "public"."group_sibling_groups" to "anon";

grant delete on table "public"."group_sibling_groups" to "authenticated";

grant insert on table "public"."group_sibling_groups" to "authenticated";

grant references on table "public"."group_sibling_groups" to "authenticated";

grant select on table "public"."group_sibling_groups" to "authenticated";

grant trigger on table "public"."group_sibling_groups" to "authenticated";

grant truncate on table "public"."group_sibling_groups" to "authenticated";

grant update on table "public"."group_sibling_groups" to "authenticated";

grant delete on table "public"."group_sibling_groups" to "service_role";

grant insert on table "public"."group_sibling_groups" to "service_role";

grant references on table "public"."group_sibling_groups" to "service_role";

grant select on table "public"."group_sibling_groups" to "service_role";

grant trigger on table "public"."group_sibling_groups" to "service_role";

grant truncate on table "public"."group_sibling_groups" to "service_role";

grant update on table "public"."group_sibling_groups" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."media_albums" to "anon";

grant insert on table "public"."media_albums" to "anon";

grant references on table "public"."media_albums" to "anon";

grant select on table "public"."media_albums" to "anon";

grant trigger on table "public"."media_albums" to "anon";

grant truncate on table "public"."media_albums" to "anon";

grant update on table "public"."media_albums" to "anon";

grant delete on table "public"."media_albums" to "authenticated";

grant insert on table "public"."media_albums" to "authenticated";

grant references on table "public"."media_albums" to "authenticated";

grant select on table "public"."media_albums" to "authenticated";

grant trigger on table "public"."media_albums" to "authenticated";

grant truncate on table "public"."media_albums" to "authenticated";

grant update on table "public"."media_albums" to "authenticated";

grant delete on table "public"."media_albums" to "service_role";

grant insert on table "public"."media_albums" to "service_role";

grant references on table "public"."media_albums" to "service_role";

grant select on table "public"."media_albums" to "service_role";

grant trigger on table "public"."media_albums" to "service_role";

grant truncate on table "public"."media_albums" to "service_role";

grant update on table "public"."media_albums" to "service_role";

grant delete on table "public"."media_files" to "anon";

grant insert on table "public"."media_files" to "anon";

grant references on table "public"."media_files" to "anon";

grant select on table "public"."media_files" to "anon";

grant trigger on table "public"."media_files" to "anon";

grant truncate on table "public"."media_files" to "anon";

grant update on table "public"."media_files" to "anon";

grant delete on table "public"."media_files" to "authenticated";

grant insert on table "public"."media_files" to "authenticated";

grant references on table "public"."media_files" to "authenticated";

grant select on table "public"."media_files" to "authenticated";

grant trigger on table "public"."media_files" to "authenticated";

grant truncate on table "public"."media_files" to "authenticated";

grant update on table "public"."media_files" to "authenticated";

grant delete on table "public"."media_files" to "service_role";

grant insert on table "public"."media_files" to "service_role";

grant references on table "public"."media_files" to "service_role";

grant select on table "public"."media_files" to "service_role";

grant trigger on table "public"."media_files" to "service_role";

grant truncate on table "public"."media_files" to "service_role";

grant update on table "public"."media_files" to "service_role";

grant delete on table "public"."media_folders" to "anon";

grant insert on table "public"."media_folders" to "anon";

grant references on table "public"."media_folders" to "anon";

grant select on table "public"."media_folders" to "anon";

grant trigger on table "public"."media_folders" to "anon";

grant truncate on table "public"."media_folders" to "anon";

grant update on table "public"."media_folders" to "anon";

grant delete on table "public"."media_folders" to "authenticated";

grant insert on table "public"."media_folders" to "authenticated";

grant references on table "public"."media_folders" to "authenticated";

grant select on table "public"."media_folders" to "authenticated";

grant trigger on table "public"."media_folders" to "authenticated";

grant truncate on table "public"."media_folders" to "authenticated";

grant update on table "public"."media_folders" to "authenticated";

grant delete on table "public"."media_folders" to "service_role";

grant insert on table "public"."media_folders" to "service_role";

grant references on table "public"."media_folders" to "service_role";

grant select on table "public"."media_folders" to "service_role";

grant trigger on table "public"."media_folders" to "service_role";

grant truncate on table "public"."media_folders" to "service_role";

grant update on table "public"."media_folders" to "service_role";

grant delete on table "public"."organization_invitations" to "anon";

grant insert on table "public"."organization_invitations" to "anon";

grant references on table "public"."organization_invitations" to "anon";

grant select on table "public"."organization_invitations" to "anon";

grant trigger on table "public"."organization_invitations" to "anon";

grant truncate on table "public"."organization_invitations" to "anon";

grant update on table "public"."organization_invitations" to "anon";

grant delete on table "public"."organization_invitations" to "authenticated";

grant insert on table "public"."organization_invitations" to "authenticated";

grant references on table "public"."organization_invitations" to "authenticated";

grant select on table "public"."organization_invitations" to "authenticated";

grant trigger on table "public"."organization_invitations" to "authenticated";

grant truncate on table "public"."organization_invitations" to "authenticated";

grant update on table "public"."organization_invitations" to "authenticated";

grant delete on table "public"."organization_invitations" to "service_role";

grant insert on table "public"."organization_invitations" to "service_role";

grant references on table "public"."organization_invitations" to "service_role";

grant select on table "public"."organization_invitations" to "service_role";

grant trigger on table "public"."organization_invitations" to "service_role";

grant truncate on table "public"."organization_invitations" to "service_role";

grant update on table "public"."organization_invitations" to "service_role";

grant delete on table "public"."organization_media" to "anon";

grant insert on table "public"."organization_media" to "anon";

grant references on table "public"."organization_media" to "anon";

grant select on table "public"."organization_media" to "anon";

grant trigger on table "public"."organization_media" to "anon";

grant truncate on table "public"."organization_media" to "anon";

grant update on table "public"."organization_media" to "anon";

grant delete on table "public"."organization_media" to "authenticated";

grant insert on table "public"."organization_media" to "authenticated";

grant references on table "public"."organization_media" to "authenticated";

grant select on table "public"."organization_media" to "authenticated";

grant trigger on table "public"."organization_media" to "authenticated";

grant truncate on table "public"."organization_media" to "authenticated";

grant update on table "public"."organization_media" to "authenticated";

grant delete on table "public"."organization_media" to "service_role";

grant insert on table "public"."organization_media" to "service_role";

grant references on table "public"."organization_media" to "service_role";

grant select on table "public"."organization_media" to "service_role";

grant trigger on table "public"."organization_media" to "service_role";

grant truncate on table "public"."organization_media" to "service_role";

grant update on table "public"."organization_media" to "service_role";

grant delete on table "public"."organization_memberships" to "anon";

grant insert on table "public"."organization_memberships" to "anon";

grant references on table "public"."organization_memberships" to "anon";

grant select on table "public"."organization_memberships" to "anon";

grant trigger on table "public"."organization_memberships" to "anon";

grant truncate on table "public"."organization_memberships" to "anon";

grant update on table "public"."organization_memberships" to "anon";

grant delete on table "public"."organization_memberships" to "authenticated";

grant insert on table "public"."organization_memberships" to "authenticated";

grant references on table "public"."organization_memberships" to "authenticated";

grant select on table "public"."organization_memberships" to "authenticated";

grant trigger on table "public"."organization_memberships" to "authenticated";

grant truncate on table "public"."organization_memberships" to "authenticated";

grant update on table "public"."organization_memberships" to "authenticated";

grant delete on table "public"."organization_memberships" to "service_role";

grant insert on table "public"."organization_memberships" to "service_role";

grant references on table "public"."organization_memberships" to "service_role";

grant select on table "public"."organization_memberships" to "service_role";

grant trigger on table "public"."organization_memberships" to "service_role";

grant truncate on table "public"."organization_memberships" to "service_role";

grant update on table "public"."organization_memberships" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."person_media" to "anon";

grant insert on table "public"."person_media" to "anon";

grant references on table "public"."person_media" to "anon";

grant select on table "public"."person_media" to "anon";

grant trigger on table "public"."person_media" to "anon";

grant truncate on table "public"."person_media" to "anon";

grant update on table "public"."person_media" to "anon";

grant delete on table "public"."person_media" to "authenticated";

grant insert on table "public"."person_media" to "authenticated";

grant references on table "public"."person_media" to "authenticated";

grant select on table "public"."person_media" to "authenticated";

grant trigger on table "public"."person_media" to "authenticated";

grant truncate on table "public"."person_media" to "authenticated";

grant update on table "public"."person_media" to "authenticated";

grant delete on table "public"."person_media" to "service_role";

grant insert on table "public"."person_media" to "service_role";

grant references on table "public"."person_media" to "service_role";

grant select on table "public"."person_media" to "service_role";

grant trigger on table "public"."person_media" to "service_role";

grant truncate on table "public"."person_media" to "service_role";

grant update on table "public"."person_media" to "service_role";

grant delete on table "public"."persons" to "anon";

grant insert on table "public"."persons" to "anon";

grant references on table "public"."persons" to "anon";

grant select on table "public"."persons" to "anon";

grant trigger on table "public"."persons" to "anon";

grant truncate on table "public"."persons" to "anon";

grant update on table "public"."persons" to "anon";

grant delete on table "public"."persons" to "authenticated";

grant insert on table "public"."persons" to "authenticated";

grant references on table "public"."persons" to "authenticated";

grant select on table "public"."persons" to "authenticated";

grant trigger on table "public"."persons" to "authenticated";

grant truncate on table "public"."persons" to "authenticated";

grant update on table "public"."persons" to "authenticated";

grant delete on table "public"."persons" to "service_role";

grant insert on table "public"."persons" to "service_role";

grant references on table "public"."persons" to "service_role";

grant select on table "public"."persons" to "service_role";

grant trigger on table "public"."persons" to "service_role";

grant truncate on table "public"."persons" to "service_role";

grant update on table "public"."persons" to "service_role";

grant delete on table "public"."sharing_links" to "anon";

grant insert on table "public"."sharing_links" to "anon";

grant references on table "public"."sharing_links" to "anon";

grant select on table "public"."sharing_links" to "anon";

grant trigger on table "public"."sharing_links" to "anon";

grant truncate on table "public"."sharing_links" to "anon";

grant update on table "public"."sharing_links" to "anon";

grant delete on table "public"."sharing_links" to "authenticated";

grant insert on table "public"."sharing_links" to "authenticated";

grant references on table "public"."sharing_links" to "authenticated";

grant select on table "public"."sharing_links" to "authenticated";

grant trigger on table "public"."sharing_links" to "authenticated";

grant truncate on table "public"."sharing_links" to "authenticated";

grant update on table "public"."sharing_links" to "authenticated";

grant delete on table "public"."sharing_links" to "service_role";

grant insert on table "public"."sharing_links" to "service_role";

grant references on table "public"."sharing_links" to "service_role";

grant select on table "public"."sharing_links" to "service_role";

grant trigger on table "public"."sharing_links" to "service_role";

grant truncate on table "public"."sharing_links" to "service_role";

grant update on table "public"."sharing_links" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

create policy "Users can create album_media for their albums"
on "public"."album_media"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM media_albums a
  WHERE ((a.id = album_media.album_id) AND (a.user_id = auth.uid())))));


create policy "Users can delete album_media for their albums"
on "public"."album_media"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM media_albums a
  WHERE ((a.id = album_media.album_id) AND (a.user_id = auth.uid())))));


create policy "Users can update album_media for their albums"
on "public"."album_media"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM media_albums a
  WHERE ((a.id = album_media.album_id) AND (a.user_id = auth.uid())))));


create policy "Users can view album_media for their albums"
on "public"."album_media"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM media_albums a
  WHERE ((a.id = album_media.album_id) AND (a.user_id = auth.uid())))));


create policy "Public access to connections in public family trees"
on "public"."connections"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM ((family_tree_members ftm1
     JOIN family_tree_members ftm2 ON ((ftm1.family_tree_id = ftm2.family_tree_id)))
     JOIN family_trees ft ON ((ftm1.family_tree_id = ft.id)))
  WHERE ((ftm1.person_id = connections.from_person_id) AND (ftm2.person_id = connections.to_person_id) AND (ft.visibility = 'public'::text)))));


create policy "Tenant-scoped connection access"
on "public"."connections"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = connections.group_id) AND ((g.visibility = 'public'::text) OR (g.owner_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
           FROM group_memberships gm
          WHERE ((gm.group_id = g.id) AND (gm.user_id = ( SELECT auth.uid() AS uid))))))))));


create policy "Tenant-scoped connection management"
on "public"."connections"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = connections.group_id) AND ((g.owner_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
           FROM group_memberships gm
          WHERE ((gm.group_id = g.id) AND (gm.user_id = ( SELECT auth.uid() AS uid)) AND (gm.role = ANY (ARRAY['admin'::text, 'editor'::text]))))))))));


create policy "Users can manage connections for their persons"
on "public"."connections"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM persons
  WHERE ((persons.id = connections.from_person_id) AND (persons.user_id = ( SELECT auth.uid() AS uid))))));


create policy "Users can view connections for their persons"
on "public"."connections"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM persons
  WHERE ((persons.id = connections.from_person_id) AND (persons.user_id = ( SELECT auth.uid() AS uid))))));


create policy "Donors can view own activity"
on "public"."donor_activity_log"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM donor_profiles dp
  WHERE ((dp.id = donor_activity_log.donor_profile_id) AND (dp.user_id = auth.uid())))));


create policy "Users can view their threads"
on "public"."donor_message_threads"
as permissive
for select
to public
using (((auth.uid() = recipient_user_id) OR (EXISTS ( SELECT 1
   FROM donor_profiles dp
  WHERE ((dp.id = donor_message_threads.donor_profile_id) AND (dp.user_id = auth.uid()))))));


create policy "Users can send messages"
on "public"."donor_messages"
as permissive
for insert
to public
with check ((auth.uid() = sender_id));


create policy "Users can view their messages"
on "public"."donor_messages"
as permissive
for select
to public
using (((auth.uid() = sender_id) OR (auth.uid() IN ( SELECT dmt.recipient_user_id
   FROM donor_message_threads dmt
  WHERE (dmt.id = donor_messages.thread_id))) OR (auth.uid() IN ( SELECT dp.user_id
   FROM (donor_profiles dp
     JOIN donor_message_threads dmt ON ((dmt.donor_profile_id = dp.id)))
  WHERE (dmt.id = donor_messages.thread_id)))));


create policy "Recipients can view connected donor profiles"
on "public"."donor_profiles"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM donor_recipient_connections drc
  WHERE ((drc.donor_profile_id = donor_profiles.id) AND (drc.recipient_user_id = auth.uid()) AND (drc.status = 'active'::text)))) AND ((NOT is_anonymous) OR ((privacy_settings ->> 'privacy_level'::text) <> 'anonymous'::text))));


create policy "Users can manage own donor profile"
on "public"."donor_profiles"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view their connections"
on "public"."donor_recipient_connections"
as permissive
for select
to public
using (((auth.uid() = recipient_user_id) OR (EXISTS ( SELECT 1
   FROM donor_profiles dp
  WHERE ((dp.id = donor_recipient_connections.donor_profile_id) AND (dp.user_id = auth.uid()))))));


create policy "Users can manage donors"
on "public"."donors"
as permissive
for all
to public
using ((auth.uid() IS NOT NULL));


create policy "Users can view all donors"
on "public"."donors"
as permissive
for select
to public
using (true);


create policy "Users can create invitations for families they own or admin"
on "public"."family_invitations"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM groups
  WHERE ((groups.id = family_invitations.group_id) AND ((groups.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM group_memberships
          WHERE ((group_memberships.group_id = groups.id) AND (group_memberships.user_id = auth.uid()) AND (group_memberships.role = 'admin'::text)))))))));


create policy "Users can update invitations they sent or received"
on "public"."family_invitations"
as permissive
for update
to public
using (((inviter_id = auth.uid()) OR (invitee_id = auth.uid()) OR (invitee_email = auth.email())));


create policy "Users can view invitations they sent or received"
on "public"."family_invitations"
as permissive
for select
to public
using (((inviter_id = auth.uid()) OR (invitee_id = auth.uid()) OR (invitee_email = auth.email())));


create policy "Users can create folders in their family trees"
on "public"."family_tree_folders"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_folders.family_tree_id) AND (ft.user_id = auth.uid())))) AND (created_by = auth.uid())));


create policy "Users can delete folders in their family trees"
on "public"."family_tree_folders"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_folders.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can update folders in their family trees"
on "public"."family_tree_folders"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_folders.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can view folders in family trees they have access to"
on "public"."family_tree_folders"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_folders.family_tree_id) AND ((ft.user_id = auth.uid()) OR (ft.visibility = 'public'::text))))));


create policy "Users can add media to their family trees"
on "public"."family_tree_media"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_media.family_tree_id) AND (ft.user_id = auth.uid())))) AND (added_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM media_files mf
  WHERE ((mf.id = family_tree_media.media_file_id) AND (mf.user_id = auth.uid()))))));


create policy "Users can remove media from their family trees"
on "public"."family_tree_media"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_media.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can update media in their family trees"
on "public"."family_tree_media"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_media.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can view media in family trees they have access to"
on "public"."family_tree_media"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_media.family_tree_id) AND ((ft.user_id = auth.uid()) OR (ft.visibility = 'public'::text))))));


create policy "Users can add members to their family trees"
on "public"."family_tree_members"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_members.family_tree_id) AND (ft.user_id = auth.uid())))) AND (added_by = auth.uid())));


create policy "Users can remove members from their family trees"
on "public"."family_tree_members"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_members.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can update members in their family trees"
on "public"."family_tree_members"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_members.family_tree_id) AND (ft.user_id = auth.uid())))));


create policy "Users can view family tree members they have access to"
on "public"."family_tree_members"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = family_tree_members.family_tree_id) AND ((ft.user_id = auth.uid()) OR (ft.visibility = 'public'::text))))));


create policy "Users can create their own family trees"
on "public"."family_trees"
as permissive
for insert
to public
with check ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can delete their own family trees"
on "public"."family_trees"
as permissive
for delete
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can update their own family trees"
on "public"."family_trees"
as permissive
for update
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can view public family trees"
on "public"."family_trees"
as permissive
for select
to public
using ((visibility = 'public'::text));


create policy "Users can view their own family trees"
on "public"."family_trees"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Group admins can manage donor database entries"
on "public"."group_donor_database"
as permissive
for all
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_donor_database.group_id) AND (gm.user_id = auth.uid()) AND (gm.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_donor_database.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Group members can view donor database entries"
on "public"."group_donor_database"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_donor_database.group_id) AND (gm.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_donor_database.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Group admins can manage invitations"
on "public"."group_invitations"
as permissive
for all
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_invitations.group_id) AND (gm.user_id = auth.uid()) AND (gm.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_invitations.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Group members can view invitations"
on "public"."group_invitations"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_invitations.group_id) AND (gm.user_id = auth.uid())))) OR (invitee_email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text)));


create policy "Group members can add media"
on "public"."group_media"
as permissive
for insert
to public
with check (((added_by = auth.uid()) AND ((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_media.group_id) AND (gm.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_media.group_id) AND (g.owner_id = auth.uid())))))));


create policy "Group members can view media"
on "public"."group_media"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_media.group_id) AND (gm.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_media.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Users can delete their own media"
on "public"."group_media"
as permissive
for delete
to public
using (((added_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_media.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Users can update their own media"
on "public"."group_media"
as permissive
for update
to public
using ((added_by = auth.uid()));


create policy "Users can manage memberships for groups they own"
on "public"."group_memberships"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM groups
  WHERE ((groups.id = group_memberships.group_id) AND (groups.owner_id = auth.uid())))));


create policy "Users can view memberships for groups they own"
on "public"."group_memberships"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM groups
  WHERE ((groups.id = group_memberships.group_id) AND (groups.owner_id = auth.uid())))));


create policy "Users can view their own memberships"
on "public"."group_memberships"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can manage their own sibling group memberships"
on "public"."group_sibling_group_memberships"
as permissive
for all
to public
using (((EXISTS ( SELECT 1
   FROM persons p
  WHERE ((p.id = group_sibling_group_memberships.person_id) AND (p.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (group_sibling_groups gsg
     JOIN groups g ON ((g.id = gsg.group_id)))
  WHERE ((gsg.id = group_sibling_group_memberships.sibling_group_id) AND (g.owner_id = auth.uid()))))));


create policy "Users can view sibling group memberships for accessible groups"
on "public"."group_sibling_group_memberships"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (group_sibling_groups gsg
     JOIN group_memberships gm ON ((gm.group_id = gsg.group_id)))
  WHERE ((gsg.id = group_sibling_group_memberships.sibling_group_id) AND (gm.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (group_sibling_groups gsg
     JOIN groups g ON ((g.id = gsg.group_id)))
  WHERE ((gsg.id = group_sibling_group_memberships.sibling_group_id) AND (g.owner_id = auth.uid()))))));


create policy "Group admins can manage sibling groups"
on "public"."group_sibling_groups"
as permissive
for all
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_sibling_groups.group_id) AND (gm.user_id = auth.uid()) AND (gm.role = 'admin'::text)))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_sibling_groups.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Group members can view sibling groups"
on "public"."group_sibling_groups"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_memberships gm
  WHERE ((gm.group_id = group_sibling_groups.group_id) AND (gm.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = group_sibling_groups.group_id) AND (g.owner_id = auth.uid()))))));


create policy "Users can delete their own groups"
on "public"."groups"
as permissive
for delete
to public
using ((owner_id = ( SELECT auth.uid() AS uid)));


create policy "Users can insert groups"
on "public"."groups"
as permissive
for insert
to public
with check ((owner_id = ( SELECT auth.uid() AS uid)));


create policy "Users can update their own groups"
on "public"."groups"
as permissive
for update
to public
using ((owner_id = ( SELECT auth.uid() AS uid)));


create policy "Users can view public groups"
on "public"."groups"
as permissive
for select
to public
using ((visibility = 'public'::text));


create policy "Users can view their own groups"
on "public"."groups"
as permissive
for select
to public
using ((owner_id = ( SELECT auth.uid() AS uid)));


create policy "Users can create their own albums"
on "public"."media_albums"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own albums"
on "public"."media_albums"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can update their own albums"
on "public"."media_albums"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view public albums"
on "public"."media_albums"
as permissive
for select
to public
using ((visibility = 'public'::text));


create policy "Users can view their own albums"
on "public"."media_albums"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can create their own media files"
on "public"."media_files"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own media files"
on "public"."media_files"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can update their own media files"
on "public"."media_files"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view their own media files"
on "public"."media_files"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can create their own folders"
on "public"."media_folders"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own folders"
on "public"."media_folders"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can update their own folders"
on "public"."media_folders"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view their own folders"
on "public"."media_folders"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow organization management"
on "public"."organization_invitations"
as permissive
for all
to authenticated
using (((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_invitations.organization_id) AND (o.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM organization_memberships om
  WHERE ((om.organization_id = organization_invitations.organization_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))
with check (((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_invitations.organization_id) AND (o.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM organization_memberships om
  WHERE ((om.organization_id = organization_invitations.organization_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))));


create policy "Users can add media to organizations they belong to"
on "public"."organization_media"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_media.organization_id) AND ((o.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text]))))))))) AND (added_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM media_files mf
  WHERE ((mf.id = organization_media.media_file_id) AND (mf.user_id = auth.uid()))))));


create policy "Users can remove media from organizations they have edit access"
on "public"."organization_media"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_media.organization_id) AND ((o.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text]))))))))));


create policy "Users can update media in organizations they have edit access t"
on "public"."organization_media"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_media.organization_id) AND ((o.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text]))))))))));


create policy "Users can view media in organizations they have access to"
on "public"."organization_media"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = organization_media.organization_id) AND ((o.owner_id = auth.uid()) OR (o.visibility = 'public'::text) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid())))))))));


create policy "Users can add memberships"
on "public"."organization_memberships"
as permissive
for insert
to public
with check (check_organization_owner(organization_id, auth.uid()));


create policy "Users can delete memberships"
on "public"."organization_memberships"
as permissive
for delete
to public
using (check_organization_owner(organization_id, auth.uid()));


create policy "Users can update memberships"
on "public"."organization_memberships"
as permissive
for update
to public
using (check_organization_owner(organization_id, auth.uid()))
with check (check_organization_owner(organization_id, auth.uid()));


create policy "Users can view memberships"
on "public"."organization_memberships"
as permissive
for select
to public
using (((user_id = auth.uid()) OR check_organization_owner(organization_id, auth.uid())));


create policy "Organization owners can delete their organization"
on "public"."organizations"
as permissive
for delete
to public
using ((owner_id = auth.uid()));


create policy "Organization owners can update their organization"
on "public"."organizations"
as permissive
for update
to public
using ((owner_id = auth.uid()));


create policy "Organization owners can view their organization"
on "public"."organizations"
as permissive
for select
to public
using ((owner_id = auth.uid()));


create policy "Users can create person_media for their persons"
on "public"."person_media"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM persons p
  WHERE ((p.id = person_media.person_id) AND (p.user_id = auth.uid())))));


create policy "Users can delete person_media for their persons"
on "public"."person_media"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM persons p
  WHERE ((p.id = person_media.person_id) AND (p.user_id = auth.uid())))));


create policy "Users can update person_media for their persons"
on "public"."person_media"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM persons p
  WHERE ((p.id = person_media.person_id) AND (p.user_id = auth.uid())))));


create policy "Users can view person_media for their persons"
on "public"."person_media"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM persons p
  WHERE ((p.id = person_media.person_id) AND (p.user_id = auth.uid())))));


create policy "Organization-scoped person access"
on "public"."persons"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (organizations o
     JOIN organization_memberships om ON ((o.id = om.organization_id)))
  WHERE ((o.id = persons.organization_id) AND ((o.visibility = 'public'::text) OR (o.owner_id = auth.uid()) OR (om.user_id = auth.uid())))))));


create policy "Public access to persons in public family trees"
on "public"."persons"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (family_tree_members ftm
     JOIN family_trees ft ON ((ftm.family_tree_id = ft.id)))
  WHERE ((ftm.person_id = persons.id) AND (ft.visibility = 'public'::text)))));


create policy "Tenant-scoped person updates"
on "public"."persons"
as permissive
for update
to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM (group_memberships gm
     JOIN groups g ON ((gm.group_id = g.id)))
  WHERE ((gm.person_id = persons.id) AND ((g.owner_id = ( SELECT auth.uid() AS uid)) OR ((gm.user_id = ( SELECT auth.uid() AS uid)) AND (gm.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))));


create policy "Users can delete their own persons"
on "public"."persons"
as permissive
for delete
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can insert persons"
on "public"."persons"
as permissive
for insert
to public
with check ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can update their own persons"
on "public"."persons"
as permissive
for update
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can view public persons"
on "public"."persons"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM groups g
  WHERE (g.visibility = 'public'::text))));


create policy "Users can view their own persons"
on "public"."persons"
as permissive
for select
to public
using ((user_id = ( SELECT auth.uid() AS uid)));


create policy "Users can manage sharing links for family trees they own or hav"
on "public"."sharing_links"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = sharing_links.family_tree_id) AND ((ft.user_id = auth.uid()) OR ((ft.organization_id IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = ft.organization_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))) OR ((ft.group_id IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM (groups g
             JOIN organization_memberships om ON ((om.organization_id = g.organization_id)))
          WHERE ((g.id = ft.group_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))))));


create policy "Users can manage sharing links they created or have admin acces"
on "public"."sharing_links"
as permissive
for all
to public
using (((created_by = auth.uid()) OR ((family_tree_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = sharing_links.family_tree_id) AND (ft.user_id = auth.uid()))))) OR ((group_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = sharing_links.group_id) AND ((g.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM group_memberships gm
          WHERE ((gm.group_id = g.id) AND (gm.user_id = auth.uid()) AND (gm.role = ANY (ARRAY['admin'::text, 'editor'::text])))))))))) OR ((organization_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = sharing_links.organization_id) AND ((o.owner_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['admin'::text, 'editor'::text]))))))))))));


create policy "Users can view sharing links for family trees they have access "
on "public"."sharing_links"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = sharing_links.family_tree_id) AND ((ft.user_id = auth.uid()) OR (ft.visibility = 'public'::text) OR ((ft.organization_id IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = ft.organization_id) AND (om.user_id = auth.uid()))))) OR ((ft.group_id IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM (groups g
             JOIN organization_memberships om ON ((om.organization_id = g.organization_id)))
          WHERE ((g.id = ft.group_id) AND (om.user_id = auth.uid()))))))))));


create policy "Users can view sharing links they have access to"
on "public"."sharing_links"
as permissive
for select
to public
using ((((family_tree_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM family_trees ft
  WHERE ((ft.id = sharing_links.family_tree_id) AND ((ft.user_id = auth.uid()) OR (ft.visibility = 'public'::text)))))) OR ((group_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM groups g
  WHERE ((g.id = sharing_links.group_id) AND ((g.owner_id = auth.uid()) OR (g.visibility = 'public'::text) OR (EXISTS ( SELECT 1
           FROM group_memberships gm
          WHERE ((gm.group_id = g.id) AND (gm.user_id = auth.uid()))))))))) OR ((organization_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM organizations o
  WHERE ((o.id = sharing_links.organization_id) AND ((o.owner_id = auth.uid()) OR (o.visibility = 'public'::text) OR (EXISTS ( SELECT 1
           FROM organization_memberships om
          WHERE ((om.organization_id = o.id) AND (om.user_id = auth.uid())))))))))));


create policy "Users can insert own profile"
on "public"."user_profiles"
as permissive
for insert
to public
with check ((id = auth.uid()));


create policy "Users can update own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((id = auth.uid()));


create policy "Users can view own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((id = auth.uid()));


create policy "Users can insert their own settings"
on "public"."user_settings"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update their own settings"
on "public"."user_settings"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can view their own settings"
on "public"."user_settings"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_invitations_updated_at BEFORE UPDATE ON public.family_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_tree_folders_updated_at BEFORE UPDATE ON public.family_tree_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_tree_members_updated_at BEFORE UPDATE ON public.family_tree_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_trees_updated_at BEFORE UPDATE ON public.family_trees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_donor_database_updated_at BEFORE UPDATE ON public.group_donor_database FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at BEFORE UPDATE ON public.group_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_sibling_groups_updated_at BEFORE UPDATE ON public.group_sibling_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_albums_updated_at BEFORE UPDATE ON public.media_albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at BEFORE UPDATE ON public.media_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON public.persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sharing_links_updated_at BEFORE UPDATE ON public.sharing_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_user_settings_trigger AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION create_user_settings();

CREATE TRIGGER on_donor_user_created AFTER INSERT ON public.user_profiles FOR EACH ROW WHEN ((new.account_type = 'donor'::text)) EXECUTE FUNCTION handle_donor_signup();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


