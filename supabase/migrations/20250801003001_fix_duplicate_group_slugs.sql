-- Migration to fix duplicate slugs in groups table
-- This handles cases where the previous migration created duplicate slugs

-- First, drop the unique constraints temporarily
DROP INDEX IF EXISTS idx_groups_slug;
DROP INDEX IF EXISTS idx_groups_subdomain;

-- Fix duplicate slugs by appending first 8 chars of UUID to duplicates
DO $$
DECLARE
  group_record RECORD;
  new_slug text;
  new_subdomain text;
BEGIN
  -- Identify and fix duplicate slugs
  FOR group_record IN 
    WITH duplicates AS (
      SELECT id, label, slug, subdomain,
             COUNT(*) OVER (PARTITION BY slug) as slug_count,
             COUNT(*) OVER (PARTITION BY subdomain) as subdomain_count,
             ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at, id) as slug_row_num,
             ROW_NUMBER() OVER (PARTITION BY subdomain ORDER BY created_at, id) as subdomain_row_num
      FROM public.groups
      WHERE slug IS NOT NULL OR subdomain IS NOT NULL
    )
    SELECT * FROM duplicates
    WHERE (slug_count > 1 AND slug_row_num > 1) OR 
          (subdomain_count > 1 AND subdomain_row_num > 1)
  LOOP
    -- For duplicates (not the first occurrence), append UUID suffix
    IF group_record.slug_count > 1 AND group_record.slug_row_num > 1 THEN
      new_slug := group_record.slug || '-' || LEFT(group_record.id::text, 8);
    ELSE
      new_slug := group_record.slug;
    END IF;
    
    IF group_record.subdomain_count > 1 AND group_record.subdomain_row_num > 1 THEN
      new_subdomain := group_record.subdomain || '-' || LEFT(group_record.id::text, 8);
    ELSE
      new_subdomain := group_record.subdomain;
    END IF;
    
    -- Update the group
    UPDATE public.groups 
    SET 
      slug = new_slug,
      subdomain = new_subdomain
    WHERE id = group_record.id;
    
    RAISE NOTICE 'Fixed duplicate for group %: slug % -> %, subdomain % -> %', 
      group_record.id, group_record.slug, new_slug, group_record.subdomain, new_subdomain;
  END LOOP;
  
  -- Handle any remaining NULL slugs/subdomains
  UPDATE public.groups
  SET 
    slug = COALESCE(
      slug, 
      LOWER(REGEXP_REPLACE(COALESCE(label, ''), '[^a-zA-Z0-9]+', '-', 'g')) || 
      CASE 
        WHEN LOWER(REGEXP_REPLACE(COALESCE(label, ''), '[^a-zA-Z0-9]+', '-', 'g')) = '' 
        THEN 'group-' || LEFT(id::text, 8)
        ELSE '-' || LEFT(id::text, 8)
      END
    ),
    subdomain = COALESCE(
      subdomain, 
      LOWER(REGEXP_REPLACE(COALESCE(label, ''), '[^a-zA-Z0-9]+', '-', 'g')) || 
      CASE 
        WHEN LOWER(REGEXP_REPLACE(COALESCE(label, ''), '[^a-zA-Z0-9]+', '-', 'g')) = '' 
        THEN 'group-' || LEFT(id::text, 8)
        ELSE '-' || LEFT(id::text, 8)
      END
    )
  WHERE slug IS NULL OR subdomain IS NULL;
END $$;

-- Recreate unique constraints
CREATE UNIQUE INDEX idx_groups_slug ON public.groups(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX idx_groups_subdomain ON public.groups(subdomain) WHERE subdomain IS NOT NULL;

-- Add comments to document this approach
COMMENT ON COLUMN public.groups.slug IS 'Unique URL-friendly identifier for the group, auto-generated from label with UUID suffix for uniqueness';
COMMENT ON COLUMN public.groups.subdomain IS 'Unique subdomain for the group, auto-generated from label with UUID suffix for uniqueness';