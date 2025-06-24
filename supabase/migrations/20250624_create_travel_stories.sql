-- Create travel_stories table for user-generated travel content
CREATE TABLE IF NOT EXISTS travel_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  travel_date DATE NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}', -- Store image URLs/paths
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  safety_tips TEXT[] DEFAULT '{}',
  budget_range TEXT,
  duration TEXT,
  travel_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_travel_stories_user_id ON travel_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_stories_location ON travel_stories(location);
CREATE INDEX IF NOT EXISTS idx_travel_stories_tags ON travel_stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_travel_stories_created_at ON travel_stories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to read all published stories
CREATE POLICY "Users can read all travel stories" ON travel_stories
FOR SELECT USING (true);

-- Allow users to create their own stories
CREATE POLICY "Users can create their own travel stories" ON travel_stories
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stories
CREATE POLICY "Users can update their own travel stories" ON travel_stories
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own travel stories" ON travel_stories
FOR DELETE USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_travel_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_travel_stories_updated_at_trigger
  BEFORE UPDATE ON travel_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_stories_updated_at();

-- Sample data will be added when users create stories through the app
-- No initial data inserted to avoid foreign key constraint issues 