-- Drop the existing check constraint
ALTER TABLE connections DROP CONSTRAINT connections_relationship_type_check;

-- Add a new check constraint with the relationship types used in our application
ALTER TABLE connections ADD CONSTRAINT connections_relationship_type_check 
CHECK (relationship_type = ANY (ARRAY[
  'parent'::text, 
  'child'::text, 
  'partner'::text, 
  'sibling'::text, 
  'half_sibling'::text, 
  'donor'::text,
  'biological_parent'::text, 
  'social_parent'::text, 
  'step_sibling'::text, 
  'spouse'::text, 
  'other'::text
]));