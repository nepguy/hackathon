/*
  # Fix notifications table and add missing functions

  1. New Tables
    - Ensure notifications table exists with proper structure
  2. Security
    - Add proper RLS policies for notifications
  3. Changes
    - Add functions for notification management
*/

-- Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  story_id UUID REFERENCES travel_stories(id) ON DELETE CASCADE,
  story_title TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can read their own notifications'
  ) THEN
    CREATE POLICY "Users can read their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Allow users to update their own notifications (mark as read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Allow users to delete their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Allow system to create notifications for any user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'User notifications for likes, comments, follows, and other interactions';

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = user_id_param
  AND is_read = false;
END;
$$;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO count_result
  FROM notifications
  WHERE user_id = user_id_param
  AND is_read = false;
  
  RETURN count_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO anon;

-- Add comments for documentation
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all notifications as read for a specific user';
COMMENT ON FUNCTION get_unread_notification_count IS 'Gets the count of unread notifications for a specific user';