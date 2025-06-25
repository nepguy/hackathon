/*
  # Create user_statistics table

  1. New Tables
    - `user_statistics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `travel_plans_count` (integer)
      - `safety_score` (integer)
      - `days_tracked` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `user_statistics` table
    - Add policies for users to manage their own statistics
  3. Changes
    - Create unique index on user_id
*/

-- Create user_statistics table for tracking user metrics
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  travel_plans_count INTEGER DEFAULT 0,
  safety_score INTEGER DEFAULT 95,
  days_tracked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on user_id to ensure one record per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Enable Row Level Security
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read their own statistics
CREATE POLICY "Users can read their own statistics" ON user_statistics
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own statistics
CREATE POLICY "Users can update their own statistics" ON user_statistics
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own statistics
CREATE POLICY "Users can insert their own statistics" ON user_statistics
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_statistics_updated_at_trigger
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics_updated_at();