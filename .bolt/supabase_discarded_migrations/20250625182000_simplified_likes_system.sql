/*
  # Simplified Likes System - As Originally Requested
  
  This version stores likes/comments directly in travel_stories table only.
  No separate story_likes table needed.
*/

-- =============================================
-- 1. CREATE TRAVEL_STORIES TABLE (SIMPLIFIED)
-- =============================================

CREATE TABLE IF NOT EXISTS travel_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  travel_date DATE NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  safety_tips TEXT[] DEFAULT '{}',
  budget_range TEXT,
  duration TEXT,
  travel_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Store comments directly as JSONB
  comments JSONB DEFAULT '[]'::jsonb,
  -- Store who liked this story (array of user IDs) - YOUR ORIGINAL REQUEST
  liked_by_users UUID[] DEFAULT '{}'
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE travel_stories ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE travel_stories ADD COLUMN IF NOT EXISTS liked_by_users UUID[] DEFAULT '{}';

-- =============================================
-- 2. INDEXES AND POLICIES  
-- =============================================

CREATE INDEX IF NOT EXISTS idx_travel_stories_user_id ON travel_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_stories_location ON travel_stories(location);
CREATE INDEX IF NOT EXISTS idx_travel_stories_tags ON travel_stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_travel_stories_created_at ON travel_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_stories_comments ON travel_stories USING GIN(comments);
CREATE INDEX IF NOT EXISTS idx_travel_stories_liked_by_users ON travel_stories USING GIN(liked_by_users);

-- Enable Row Level Security
ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can create their own travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can update their own travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can delete their own travel stories" ON travel_stories;

-- Create RLS policies
CREATE POLICY "Users can read all travel stories" ON travel_stories
FOR SELECT USING (true);

CREATE POLICY "Users can create their own travel stories" ON travel_stories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel stories" ON travel_stories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel stories" ON travel_stories
FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. SIMPLIFIED LIKE FUNCTIONS
-- =============================================

-- Single function to toggle like (much simpler!)
CREATE OR REPLACE FUNCTION toggle_story_like(
  story_id_param UUID,
  user_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  story_row RECORD;
  user_already_liked BOOLEAN;
  new_likes_count INTEGER;
  new_liked_by_users UUID[];
BEGIN
  -- Get current story data
  SELECT * INTO story_row FROM travel_stories WHERE id = story_id_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Story not found',
      'action', 'error'
    );
  END IF;

  -- Check if user already liked this story
  user_already_liked := user_id_param = ANY(story_row.liked_by_users);
  
  IF user_already_liked THEN
    -- Unlike: Remove user from array
    new_liked_by_users := array_remove(story_row.liked_by_users, user_id_param);
    new_likes_count := GREATEST(0, story_row.likes_count - 1);
    
    UPDATE travel_stories 
    SET 
      liked_by_users = new_liked_by_users,
      likes_count = new_likes_count,
      updated_at = NOW()
    WHERE id = story_id_param;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Story unliked',
      'action', 'unliked',
      'is_liked', false,
      'new_likes_count', new_likes_count
    );
  ELSE
    -- Like: Add user to array
    new_liked_by_users := story_row.liked_by_users || user_id_param;
    new_likes_count := story_row.likes_count + 1;
    
    UPDATE travel_stories 
    SET 
      liked_by_users = new_liked_by_users,
      likes_count = new_likes_count,
      updated_at = NOW()
    WHERE id = story_id_param;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Story liked',
      'action', 'liked',
      'is_liked', true,
      'new_likes_count', new_likes_count
    );
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Function to check if user liked a story
CREATE OR REPLACE FUNCTION user_liked_story(
  story_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_in_array BOOLEAN;
BEGIN
  SELECT user_id_param = ANY(liked_by_users) INTO user_in_array
  FROM travel_stories 
  WHERE id = story_id_param;
  
  RETURN COALESCE(user_in_array, false);
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Function to get user's liked stories
CREATE OR REPLACE FUNCTION get_user_liked_stories(
  user_id_param UUID
)
RETURNS UUID[] AS $$
DECLARE
  liked_stories UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO liked_stories
  FROM travel_stories 
  WHERE user_id_param = ANY(liked_by_users);
  
  RETURN COALESCE(liked_stories, '{}');
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =============================================
-- 4. COMMENT FUNCTIONS (SAME AS BEFORE)
-- =============================================

CREATE OR REPLACE FUNCTION add_story_comment(
  story_id_param UUID,
  user_id_param UUID, 
  content_param TEXT,
  author_name_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_comment JSONB;
  story_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM travel_stories WHERE id = story_id_param) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Story not found'
    );
  END IF;

  new_comment := jsonb_build_object(
    'id', gen_random_uuid(),
    'user_id', user_id_param,
    'content', content_param,
    'created_at', NOW(),
    'author_name', COALESCE(author_name_param, 'Traveler ' || LEFT(user_id_param::text, 8))
  );
  
  UPDATE travel_stories 
  SET 
    comments = comments || jsonb_build_array(new_comment),
    comments_count = comments_count + 1,
    updated_at = NOW()
  WHERE id = story_id_param;
  
  RETURN new_comment;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION get_story_comments(
  story_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  story_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM travel_stories WHERE id = story_id_param) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      comment_elem 
      ORDER BY (comment_elem->>'created_at')::timestamptz ASC
    ) FILTER (WHERE comment_elem IS NOT NULL),
    '[]'::jsonb
  )
  INTO result
  FROM (
    SELECT jsonb_array_elements(comments) as comment_elem
    FROM travel_stories 
    WHERE id = story_id_param
    LIMIT limit_param 
    OFFSET offset_param
  ) comments_expanded;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =============================================
-- 5. UPDATE TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_travel_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_travel_stories_updated_at_trigger ON travel_stories;
CREATE TRIGGER update_travel_stories_updated_at_trigger
  BEFORE UPDATE ON travel_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_stories_updated_at();

-- =============================================
-- 6. DATA INTEGRITY FIXES
-- =============================================

-- Ensure all travel_stories have proper structure
UPDATE travel_stories 
SET 
  comments = COALESCE(comments, '[]'::jsonb),
  liked_by_users = COALESCE(liked_by_users, '{}'),
  likes_count = COALESCE(likes_count, 0),
  comments_count = COALESCE(comments_count, 0)
WHERE comments IS NULL OR liked_by_users IS NULL;

-- Sync comments_count with actual comments array length
UPDATE travel_stories 
SET comments_count = jsonb_array_length(COALESCE(comments, '[]'::jsonb))
WHERE comments_count != jsonb_array_length(COALESCE(comments, '[]'::jsonb));

-- Sync likes_count with actual liked_by_users array length
UPDATE travel_stories 
SET likes_count = array_length(COALESCE(liked_by_users, '{}'), 1)
WHERE likes_count != COALESCE(array_length(liked_by_users, 1), 0); 