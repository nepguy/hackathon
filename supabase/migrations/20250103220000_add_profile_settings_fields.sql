-- Migration: Add profile and settings fields
-- This migration adds the missing fields for PersonalInfoPage and ProfileSettingsPage

-- Add new fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Add new fields to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS notifications_events BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_messages BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS compact_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS animations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_detect_location BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offline_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_sharing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS travel_reminders BOOLEAN DEFAULT true;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON user_preferences(language);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.phone IS 'User phone number for contact and emergency purposes';
COMMENT ON COLUMN user_profiles.address IS 'User home address for emergency contact information';
COMMENT ON COLUMN user_profiles.date_of_birth IS 'User date of birth for age verification and emergency info';
COMMENT ON COLUMN user_profiles.emergency_contact_name IS 'Primary emergency contact name';
COMMENT ON COLUMN user_profiles.emergency_contact_phone IS 'Primary emergency contact phone number';
COMMENT ON COLUMN user_profiles.passport_number IS 'User passport number (encrypted) for travel documentation';
COMMENT ON COLUMN user_profiles.nationality IS 'User nationality for travel documentation and alerts';

COMMENT ON COLUMN user_preferences.notifications_events IS 'Enable notifications for local events';
COMMENT ON COLUMN user_preferences.push_notifications IS 'Enable push notifications on device';
COMMENT ON COLUMN user_preferences.email_notifications IS 'Enable email notifications (daily digest)';
COMMENT ON COLUMN user_preferences.sms_notifications IS 'Enable SMS notifications (emergency only)';
COMMENT ON COLUMN user_preferences.share_location IS 'Allow sharing general location with other users';
COMMENT ON COLUMN user_preferences.public_profile IS 'Make travel experiences visible to other users';
COMMENT ON COLUMN user_preferences.show_online_status IS 'Show online status to other users';
COMMENT ON COLUMN user_preferences.allow_messages IS 'Allow other travelers to send messages';
COMMENT ON COLUMN user_preferences.theme IS 'App theme preference (light/dark)';
COMMENT ON COLUMN user_preferences.language IS 'App language preference';
COMMENT ON COLUMN user_preferences.compact_mode IS 'Use compact interface mode';
COMMENT ON COLUMN user_preferences.animations IS 'Enable app animations and transitions';
COMMENT ON COLUMN user_preferences.auto_detect_location IS 'Automatically detect location for alerts';
COMMENT ON COLUMN user_preferences.offline_mode IS 'Download content for offline access';
COMMENT ON COLUMN user_preferences.emergency_sharing IS 'Share location with emergency contacts when traveling';
COMMENT ON COLUMN user_preferences.travel_reminders IS 'Get reminders about upcoming trips and preparations'; 