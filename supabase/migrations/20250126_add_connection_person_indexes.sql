-- Add indexes for connections table person_id columns to improve query performance
-- This addresses the slow loading issue on the /people page

-- Index for from_person_id in connections table
CREATE INDEX IF NOT EXISTS idx_connections_from_person_id ON public.connections(from_person_id);

-- Index for to_person_id in connections table  
CREATE INDEX IF NOT EXISTS idx_connections_to_person_id ON public.connections(to_person_id);

-- Composite index for queries that check both person_id columns
CREATE INDEX IF NOT EXISTS idx_connections_person_ids ON public.connections(from_person_id, to_person_id);

-- Index for the OR condition used in the people page query
-- This helps with queries like: WHERE from_person_id IN (...) OR to_person_id IN (...)
CREATE INDEX IF NOT EXISTS idx_connections_person_lookup ON public.connections USING GIN (
  ARRAY[from_person_id, to_person_id]
);