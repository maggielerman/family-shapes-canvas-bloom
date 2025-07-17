-- Fix the organization_invitations token field encoding
-- PostgreSQL doesn't support 'base64url' encoding, so we'll use 'base64' instead
ALTER TABLE organization_invitations 
ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(32), 'base64');