-- Make organization_id nullable to support personal groups
ALTER TABLE public.groups 
ALTER COLUMN organization_id DROP NOT NULL;
