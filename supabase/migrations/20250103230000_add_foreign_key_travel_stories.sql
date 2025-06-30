-- Add foreign key relationship between travel_stories and user_profiles
-- This will allow efficient Supabase joins in the future

-- Add foreign key constraint
ALTER TABLE travel_stories 
ADD CONSTRAINT fk_travel_stories_user_profiles 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_travel_stories_user_id ON travel_stories(user_id);

-- Verify the relationship
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'travel_stories'; 