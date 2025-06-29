/*
  # Create notifications table and related functions

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `actor_id` (uuid, foreign key to auth.users)
      - `actor_name` (text)
      - `actor_avatar` (text)
      - `type` (text)
      - `content` (text)
      - `story_id` (uuid, optional)
      - `story_title` (text, optional)
      - `is_read` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to manage their own notifications
  3. Changes
    - Add indexes for better performance
*/

-- Create notifications table
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
CREATE POLICY "Users can read their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
FOR DELETE USING (auth.uid() = user_id);

-- Allow system to create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
FOR INSERT WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'User notifications for likes, comments, follows, and other interactions';