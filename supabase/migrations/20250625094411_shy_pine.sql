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
    - `travel_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `destination` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text with check constraint)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
    - Fix function search_path security vulnerability
  3. Performance
    - Optimize RLS policies with (select auth.uid())
  4. Changes
    - Create unique index on user_id for user_statistics
    - Create indexes for travel_plans
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

-- RLS Policies for user_statistics (OPTIMIZED FOR PERFORMANCE)
-- Allow users to read their own statistics
CREATE POLICY "Users can read their own statistics" ON user_statistics
FOR SELECT USING ((select auth.uid()) = user_id);

-- Allow users to update their own statistics
CREATE POLICY "Users can update their own statistics" ON user_statistics
FOR UPDATE USING ((select auth.uid()) = user_id);

-- Allow users to insert their own statistics
CREATE POLICY "Users can insert their own statistics" ON user_statistics
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Function to update the updated_at timestamp (SECURE)
CREATE OR REPLACE FUNCTION update_user_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_statistics_updated_at_trigger
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics_updated_at();

-- Create travel_plans table for user destinations (UPDATED STRUCTURE)
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for travel_plans
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);

-- Enable Row Level Security for travel_plans
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for travel_plans (OPTIMIZED FOR PERFORMANCE)
-- Allow users to manage their own travel plans (combined policy)
CREATE POLICY "Users can manage own travel plans" ON travel_plans
FOR ALL USING ((select auth.uid()) = user_id);

-- Function to update the updated_at timestamp for travel_plans (SECURE)
CREATE OR REPLACE FUNCTION update_travel_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Trigger to automatically update updated_at for travel_plans
CREATE TRIGGER update_travel_plans_updated_at_trigger
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_plans_updated_at();