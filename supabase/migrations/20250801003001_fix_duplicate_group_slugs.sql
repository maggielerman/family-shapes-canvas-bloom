-- Migration to fix duplicate slugs in groups table
-- This handles cases where the previous migration created duplicate slugs

-- First, drop the unique constraints temporarily
DROP INDEX IF EXISTS idx_groups_slug;
DROP INDEX IF EXISTS idx_groups_subdomain;

-- Create a function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug text, table_name text, column_name text, exclude_id uuid DEFAULT NULL) 
RETURNS text AS $$
DECLARE
  final_slug text;
  counter integer := 0;
  exists_check boolean;
BEGIN
  -- Clean the base slug
  final_slug := LOWER(REGEXP_REPLACE(base_slug, '[^a-zA-Z0-9]+', '-', 'g'));
  final_slug := TRIM(BOTH '-' FROM final_slug);
  
  -- If empty, use a default
  IF final_slug = '' OR final_slug IS NULL THEN
    final_slug := 'group';
  END IF;
  
  -- Check if slug exists
  LOOP
    IF counter > 0 THEN
      -- Add numeric suffix for subsequent attempts
      final_slug := REGEXP_REPLACE(final_slug, '-[0-9]+$', '') || '-' || counter;
    END IF;
    
    -- Check existence with dynamic SQL
    IF exclude_id IS NOT NULL THEN
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1 AND id != $2)', table_name, column_name)
      INTO exists_check
      USING final_slug, exclude_id;
    ELSE
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)', table_name, column_name)
      INTO exists_check
      USING final_slug;
    END IF;
    
    -- If doesn't exist, we found our unique slug
    IF NOT exists_check THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    
    -- Safety check to prevent infinite loop
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Could not generate unique slug after 1000 attempts';
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Fix duplicate slugs
DO $$
DECLARE
  group_record RECORD;
  unique_slug text;
  unique_subdomain text;
  slug_count integer;
  subdomain_count integer;
BEGIN
  -- First, identify and fix duplicate slugs
  FOR group_record IN 
    SELECT g.id, g.label, g.slug, g.subdomain,
           COUNT(*) OVER (PARTITION BY g.slug) as slug_count,
           COUNT(*) OVER (PARTITION BY g.subdomain) as subdomain_count,
           ROW_NUMBER() OVER (PARTITION BY g.slug ORDER BY g.created_at, g.id) as slug_row_num,
           ROW_NUMBER() OVER (PARTITION BY g.subdomain ORDER BY g.created_at, g.id) as subdomain_row_num
    FROM public.groups g
    WHERE g.slug IS NOT NULL OR g.subdomain IS NOT NULL
  LOOP
    -- Only regenerate if there are duplicates and this isn't the first occurrence
    IF (group_record.slug_count > 1 AND group_record.slug_row_num > 1) OR 
       (group_record.subdomain_count > 1 AND group_record.subdomain_row_num > 1) THEN
      
      -- Generate unique slug if needed
      IF group_record.slug_count > 1 AND group_record.slug_row_num > 1 THEN
        IF group_record.label IS NOT NULL THEN
          unique_slug := generate_unique_slug(group_record.label, 'groups', 'slug', group_record.id);
        ELSE
          unique_slug := generate_unique_slug('group-' || group_record.id::text, 'groups', 'slug', group_record.id);
        END IF;
      ELSE
        unique_slug := group_record.slug;
      END IF;
      
      -- Generate unique subdomain if needed
      IF group_record.subdomain_count > 1 AND group_record.subdomain_row_num > 1 THEN
        IF group_record.label IS NOT NULL THEN
          unique_subdomain := generate_unique_slug(group_record.label, 'groups', 'subdomain', group_record.id);
        ELSE
          unique_subdomain := generate_unique_slug('group-' || group_record.id::text, 'groups', 'subdomain', group_record.id);
        END IF;
      ELSE
        unique_subdomain := group_record.subdomain;
      END IF;
      
      -- Update the group
      UPDATE public.groups 
      SET 
        slug = unique_slug,
        subdomain = unique_subdomain
      WHERE id = group_record.id;
      
      RAISE NOTICE 'Fixed duplicate for group %: slug % -> %, subdomain % -> %', 
        group_record.id, group_record.slug, unique_slug, group_record.subdomain, unique_subdomain;
    END IF;
  END LOOP;
  
  -- Also ensure any NULL slugs/subdomains are populated
  FOR group_record IN SELECT id, label FROM public.groups WHERE slug IS NULL OR subdomain IS NULL
  LOOP
    -- Generate unique slug
    IF group_record.label IS NOT NULL THEN
      unique_slug := generate_unique_slug(group_record.label, 'groups', 'slug', group_record.id);
      unique_subdomain := generate_unique_slug(group_record.label, 'groups', 'subdomain', group_record.id);
    ELSE
      -- Handle null labels
      unique_slug := generate_unique_slug('group-' || group_record.id::text, 'groups', 'slug', group_record.id);
      unique_subdomain := generate_unique_slug('group-' || group_record.id::text, 'groups', 'subdomain', group_record.id);
    END IF;
    
    -- Update the group
    UPDATE public.groups 
    SET 
      slug = CASE WHEN slug IS NULL THEN unique_slug ELSE slug END,
      subdomain = CASE WHEN subdomain IS NULL THEN unique_subdomain ELSE subdomain END
    WHERE id = group_record.id;
  END LOOP;
END $$;

-- Recreate unique constraints
CREATE UNIQUE INDEX idx_groups_slug ON public.groups(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX idx_groups_subdomain ON public.groups(subdomain) WHERE subdomain IS NOT NULL;

-- Drop the temporary function
DROP FUNCTION IF EXISTS generate_unique_slug(text, text, text, uuid);

-- Add a comment to document this fix
COMMENT ON COLUMN public.groups.slug IS 'Unique URL-friendly identifier for the group, auto-generated from label';
COMMENT ON COLUMN public.groups.subdomain IS 'Unique subdomain for the group, auto-generated from label';