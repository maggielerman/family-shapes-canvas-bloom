-- Fix the link_token encoding issue in sharing_links table
ALTER TABLE public.sharing_links 
ALTER COLUMN link_token SET DEFAULT encode(gen_random_bytes(32), 'hex');

-- Update any existing records that might have issues
UPDATE public.sharing_links 
SET link_token = encode(gen_random_bytes(32), 'hex')
WHERE link_token IS NULL OR link_token = '';

-- Ensure the table has proper structure for email invitations
DO $$ 
BEGIN
    -- Add invited_emails column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sharing_links' 
        AND column_name = 'invited_emails'
    ) THEN
        ALTER TABLE public.sharing_links 
        ADD COLUMN invited_emails text[];
    END IF;
END $$;