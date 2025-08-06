-- Fix invitation token encoding issues
-- This migration documents the updates needed for invitation functions
-- to properly handle URL encoding/decoding of tokens

-- Create a table to track function deployment status
CREATE TABLE IF NOT EXISTS public.function_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  version TEXT NOT NULL,
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changes_description TEXT,
  status TEXT DEFAULT 'pending'
);

-- Insert deployment records for the functions that need updating
INSERT INTO public.function_deployments (function_name, version, changes_description, status)
VALUES 
  ('send-invitation', '2.0.0', 'Added encodeURIComponent for proper token encoding in invitation URLs', 'pending'),
  ('process-invitation', '2.0.0', 'Added decodeURIComponent for proper token decoding from invitation URLs', 'pending')
ON CONFLICT (function_name) DO UPDATE SET
  version = EXCLUDED.version,
  changes_description = EXCLUDED.changes_description,
  deployed_at = NOW(),
  status = 'pending';

-- Create a function to check deployment status
CREATE OR REPLACE FUNCTION public.get_function_deployment_status()
RETURNS TABLE (
  function_name TEXT,
  version TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  changes_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.function_name,
    fd.version,
    fd.deployed_at,
    fd.status,
    fd.changes_description
  FROM public.function_deployments fd
  WHERE fd.function_name IN ('send-invitation', 'process-invitation')
  ORDER BY fd.deployed_at DESC;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_function_deployment_status() TO authenticated;

-- Add RLS policies for the function_deployments table
ALTER TABLE public.function_deployments ENABLE ROW LEVEL SECURITY;

-- Allow admins to view deployment status
CREATE POLICY "Allow admins to view function deployments" ON public.function_deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_settings 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create a function to mark functions as deployed
CREATE OR REPLACE FUNCTION public.mark_function_deployed(function_name_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.function_deployments 
  SET status = 'deployed'
  WHERE function_name = function_name_param;
END;
$$;

-- Grant access to the mark function
GRANT EXECUTE ON FUNCTION public.mark_function_deployed(TEXT) TO authenticated;

-- Add comments to document the changes
COMMENT ON TABLE public.function_deployments IS 'Tracks deployment status of Supabase Edge Functions';
COMMENT ON FUNCTION public.get_function_deployment_status() IS 'Returns deployment status of invitation-related functions';
COMMENT ON FUNCTION public.mark_function_deployed(TEXT) IS 'Marks a function as deployed after successful deployment';