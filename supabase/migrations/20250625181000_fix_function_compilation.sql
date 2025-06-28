/*
  # Fix Function Compilation Issues

  This migration fixes the "relation 'travel_stories' does not exist" error
  by ensuring proper order of table creation and function compilation.
*/

-- =============================================
-- 1. ENSURE TRAVEL_STORIES TABLE EXISTS FIRST
-- =============================================

-- Create travel_stories table if it doesn't exist
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments column if it doesn't exist
ALTER TABLE travel_stories 
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- 2. CREATE STORY_LIKES TABLE
-- =============================================

-- Create story_likes table to track which users liked which stories
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES travel_stories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id) -- Ensure one like per user per story
);

-- =============================================
-- 3. CREATE INDEXES AND POLICIES
-- =============================================

-- Create indexes for travel_stories
CREATE INDEX IF NOT EXISTS idx_travel_stories_user_id ON travel_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_stories_location ON travel_stories(location);
CREATE INDEX IF NOT EXISTS idx_travel_stories_tags ON travel_stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_travel_stories_created_at ON travel_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_stories_comments ON travel_stories USING GIN(comments);

-- Create indexes for story_likes
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_likes_unique ON story_likes(user_id, story_id);

-- Enable Row Level Security
ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can create their own travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can update their own travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can delete their own travel stories" ON travel_stories;
DROP POLICY IF EXISTS "Users can read all story likes" ON story_likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON story_likes;

-- Create RLS policies for travel_stories
CREATE POLICY "Users can read all travel stories" ON travel_stories
FOR SELECT USING (true);

CREATE POLICY "Users can create their own travel stories" ON travel_stories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel stories" ON travel_stories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel stories" ON travel_stories
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for story_likes
CREATE POLICY "Users can read all story likes" ON story_likes
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON story_likes
FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 4. COMMENT FUNCTIONS (FIXED - NO ROWTYPE)
-- =============================================

-- Function to add comment to travel story (WITHOUT %ROWTYPE to avoid compilation issues)
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
  -- Check if story exists first
  SELECT EXISTS(SELECT 1 FROM travel_stories WHERE id = story_id_param) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Story not found'
    );
  END IF;

  -- Create new comment object
  new_comment := jsonb_build_object(
    'id', gen_random_uuid(),
    'user_id', user_id_param,
    'content', content_param,
    'created_at', NOW(),
    'author_name', COALESCE(author_name_param, 'Traveler ' || LEFT(user_id_param::text, 8))
  );
  
  -- Update travel story with new comment and increment count
  UPDATE travel_stories 
  SET 
    comments = comments || jsonb_build_array(new_comment),
    comments_count = comments_count + 1,
    updated_at = NOW()
  WHERE id = story_id_param;
  
  -- Return the new comment
  RETURN new_comment;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Function to get comments for a story (with pagination)
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
  -- Check if story exists first
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
-- 5. LIKE FUNCTIONS
-- =============================================

-- Function to like a story (with unique user tracking)
CREATE OR REPLACE FUNCTION like_story(
  story_id_param UUID,
  user_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  existing_like UUID;
  updated_likes_count INTEGER;
  story_exists BOOLEAN;
BEGIN
  -- Check if story exists first
  SELECT EXISTS(SELECT 1 FROM travel_stories WHERE id = story_id_param) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Story not found',
      'action', 'error'
    );
  END IF;

  -- Check if user already liked this story
  SELECT id INTO existing_like
  FROM story_likes 
  WHERE user_id = user_id_param AND story_id = story_id_param;
  
  IF existing_like IS NOT NULL THEN
    -- User already liked this story
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User already liked this story',
      'action', 'already_liked'
    );
  END IF;
  
  -- Add like record
  INSERT INTO story_likes (user_id, story_id)
  VALUES (user_id_param, story_id_param);
  
  -- Update likes count in travel_stories
  UPDATE travel_stories 
  SET 
    likes_count = likes_count + 1,
    updated_at = NOW()
  WHERE id = story_id_param
  RETURNING likes_count INTO updated_likes_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Story liked successfully',
    'action', 'liked',
    'new_likes_count', updated_likes_count
  );
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- Function to unlike a story
CREATE OR REPLACE FUNCTION unlike_story(
  story_id_param UUID,
  user_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  existing_like UUID;
  updated_likes_count INTEGER;
  story_exists BOOLEAN;
BEGIN
  -- Check if story exists first
  SELECT EXISTS(SELECT 1 FROM travel_stories WHERE id = story_id_param) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Story not found',
      'action', 'error'
    );
  END IF;

  -- Check if user has liked this story
  SELECT id INTO existing_like
  FROM story_likes 
  WHERE user_id = user_id_param AND story_id = story_id_param;
  
  IF existing_like IS NULL THEN
    -- User hasn't liked this story
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User has not liked this story',
      'action', 'not_liked'
    );
  END IF;
  
  -- Remove like record
  DELETE FROM story_likes 
  WHERE user_id = user_id_param AND story_id = story_id_param;
  
  -- Update likes count in travel_stories (prevent negative)
  UPDATE travel_stories 
  SET 
    likes_count = GREATEST(0, likes_count - 1),
    updated_at = NOW()
  WHERE id = story_id_param
  RETURNING likes_count INTO updated_likes_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Story unliked successfully',
    'action', 'unliked',
    'new_likes_count', updated_likes_count
  );
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
  like_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM story_likes 
    WHERE user_id = user_id_param AND story_id = story_id_param
  ) INTO like_exists;
  
  RETURN like_exists;
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
  SELECT ARRAY_AGG(story_id) INTO liked_stories
  FROM story_likes 
  WHERE user_id = user_id_param;
  
  RETURN COALESCE(liked_stories, '{}');
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =============================================
-- 6. UPDATE TRIGGERS
-- =============================================

-- Function to update the updated_at timestamp for travel_stories
CREATE OR REPLACE FUNCTION update_travel_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_travel_stories_updated_at_trigger ON travel_stories;
CREATE TRIGGER update_travel_stories_updated_at_trigger
  BEFORE UPDATE ON travel_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_stories_updated_at();

-- =============================================
-- 7. DATA INTEGRITY FIXES
-- =============================================

-- Ensure all travel_stories have proper comments structure
UPDATE travel_stories 
SET comments = '[]'::jsonb 
WHERE comments IS NULL;

-- Sync likes_count with actual likes in story_likes table
UPDATE travel_stories 
SET likes_count = (
  SELECT COUNT(*) 
  FROM story_likes 
  WHERE story_likes.story_id = travel_stories.id
);

-- Ensure comments_count matches actual comments array length
UPDATE travel_stories 
SET comments_count = jsonb_array_length(COALESCE(comments, '[]'::jsonb))
WHERE comments_count != jsonb_array_length(COALESCE(comments, '[]'::jsonb)); 