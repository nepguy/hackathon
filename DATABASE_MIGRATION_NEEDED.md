# 🔧 Database Migration Required

## ❌ **Current Issue**
You're getting this error:
```
PGRST204: Could not find the 'address' column of 'user_profiles' in the schema cache
```

## 🎯 **Root Cause**
The migration file `supabase/migrations/20250103220000_add_profile_settings_fields.sql` exists in your local project but hasn't been applied to your live Supabase database yet.

## ✅ **Solution: Apply the Migration**

### **Option 1: Using Supabase CLI (Recommended)**
```bash
# Navigate to your project directory
cd /d/Hackathon/frontend-repo

# Apply the pending migration
supabase db push

# Or apply specific migration
supabase migration up
```

### **Option 2: Manual SQL Execution**
Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Add missing fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Add missing fields to user_preferences table
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

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality ON user_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON user_preferences(language);
```

### **Option 3: Using Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your GuardNomad project
3. Navigate to **Database** → **SQL Editor**
4. Paste the SQL from Option 2 above
5. Click **Run** to execute

## 🧪 **Verification**
After applying the migration, verify it worked:

1. **Check Tables**:
   ```sql
   -- Verify user_profiles columns
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_profiles';
   
   -- Verify user_preferences columns
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_preferences';
   ```

2. **Test the Personal Info Page**:
   - Go to `/personal-info` in your app
   - Try to save profile information
   - Should work without the `address` column error

## 📋 **Fields Added**

### **user_profiles table:**
- `phone` (TEXT) - User phone number
- `address` (TEXT) - User home address ← **This fixes your error**
- `date_of_birth` (DATE) - User date of birth
- `emergency_contact_name` (TEXT) - Emergency contact name
- `emergency_contact_phone` (TEXT) - Emergency contact phone
- `passport_number` (TEXT) - Passport number
- `nationality` (TEXT) - User nationality

### **user_preferences table:**
- `notifications_events` (BOOLEAN) - Event notifications
- `push_notifications` (BOOLEAN) - Push notifications
- `email_notifications` (BOOLEAN) - Email notifications
- `sms_notifications` (BOOLEAN) - SMS notifications
- `share_location` (BOOLEAN) - Location sharing
- `public_profile` (BOOLEAN) - Public profile visibility
- `show_online_status` (BOOLEAN) - Online status visibility
- `allow_messages` (BOOLEAN) - Allow messages from other users
- `theme` (TEXT) - App theme (light/dark)
- `language` (TEXT) - App language
- `compact_mode` (BOOLEAN) - Compact interface mode
- `animations` (BOOLEAN) - Enable animations
- `auto_detect_location` (BOOLEAN) - Auto location detection
- `offline_mode` (BOOLEAN) - Offline content download
- `emergency_sharing` (BOOLEAN) - Emergency location sharing
- `travel_reminders` (BOOLEAN) - Travel reminders

## ⚠️ **Important Notes**
1. The migration uses `IF NOT EXISTS` so it's safe to run multiple times
2. All new columns have appropriate defaults
3. Indexes are created for better performance
4. This will enable the full functionality of PersonalInfoPage and ProfileSettingsPage

Once you apply this migration, the "address column not found" error will be resolved! 