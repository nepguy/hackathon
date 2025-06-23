/*
  # Add premium subscription fields

  1. New Columns
    - `user_profiles.premium_subscription_active` (boolean) - Whether user has an active premium subscription
    - `user_profiles.premium_subscription_started_at` (timestamptz) - When the premium subscription started
  
  2. Indexes
    - Added index on premium_subscription_active for faster queries
    - Added index on trial status fields for better performance
  
  3. Comments
    - Added descriptive comments to all new columns
*/

-- Add premium subscription columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'premium_subscription_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN premium_subscription_active boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'premium_subscription_started_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN premium_subscription_started_at timestamptz;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium_subscription 
ON user_profiles (premium_subscription_active);

CREATE INDEX IF NOT EXISTS idx_user_preferences_trial_status 
ON user_preferences (premium_trial_active, premium_trial_expires_at);

-- Add helpful comments
COMMENT ON COLUMN user_profiles.premium_subscription_active IS 'Whether user has an active premium subscription';
COMMENT ON COLUMN user_profiles.premium_subscription_started_at IS 'When the premium subscription started';
COMMENT ON COLUMN user_preferences.premium_trial_active IS 'Whether user has an active trial';
COMMENT ON COLUMN user_preferences.premium_trial_expires_at IS 'When the trial expires';