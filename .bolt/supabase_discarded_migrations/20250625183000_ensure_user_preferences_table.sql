/*
  # Ensure User Preferences Table Exists

  This migration ensures the user_preferences table exists with proper structure,
  RLS policies, and default values for all users.
*/

-- =============================================
-- 1. CREATE USER_PREFERENCES TABLE IF NOT EXISTS
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  destination TEXT,
  notifications_safety BOOLEAN DEFAULT true,
  notifications_weather BOOLEAN DEFAULT true,
  notifications_local_news BOOLEAN DEFAULT true,
  premium_trial_active BOOLEAN DEFAULT false,
  premium_trial_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_destination ON user_preferences(destination);
CREATE INDEX IF NOT EXISTS idx_user_preferences_trial ON user_preferences(premium_trial_active, premium_trial_expires_at);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Create RLS policies
CREATE POLICY "Users can read their own preferences" ON user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. CREATE UPDATE TRIGGER
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at_trigger ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at_trigger
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- =============================================
-- 5. CREATE DEFAULT PREFERENCES FOR EXISTING USERS
-- =============================================

-- Insert default preferences for any existing users who don't have them
INSERT INTO user_preferences (user_id, notifications_safety, notifications_weather, notifications_local_news)
SELECT 
  id as user_id,
  true as notifications_safety,
  true as notifications_weather,
  true as notifications_local_news
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 6. VERIFICATION FUNCTION
-- =============================================

-- Function to verify table structure
CREATE OR REPLACE FUNCTION verify_user_preferences_table()
RETURNS TEXT AS $$
DECLARE
  table_exists BOOLEAN;
  column_count INTEGER;
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RETURN '❌ user_preferences table does not exist';
  END IF;
  
  -- Count columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'user_preferences';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'user_preferences';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename = 'user_preferences';
  
  RETURN format('✅ user_preferences table verified: %s columns, %s policies, %s indexes', 
    column_count, policy_count, index_count);
END;
$$ LANGUAGE plpgsql; 