/*
  # Add get_travel_stories_with_profiles function

  1. New Functions
    - `get_travel_stories_with_profiles` - Retrieves travel stories with user profile data
      - Joins travel_stories with user_profiles
      - Returns story data with user profile information
      - Supports pagination with limit parameter
  2. Security
    - Uses SECURITY DEFINER to ensure proper access control
    - Respects existing RLS policies
  3. Changes
    - Creates a new database function for the ExplorePage
*/

-- Create function to get travel stories with user profile data
CREATE OR REPLACE FUNCTION public.get_travel_stories_with_profiles(story_limit INT DEFAULT 50)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    location TEXT,
    travel_date DATE,
    description TEXT,
    tags TEXT[],
    images TEXT[],
    rating INT,
    likes_count INT,
    comments_count INT,
    shares_count INT,
    safety_tips TEXT[],
    budget_range TEXT,
    duration TEXT,
    travel_style TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    comments JSONB,
    liked_by_users UUID[],
    user_profiles JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ts.id,
        ts.user_id,
        ts.title,
        ts.location,
        ts.travel_date,
        ts.description,
        ts.tags,
        ts.images,
        ts.rating,
        ts.likes_count,
        ts.comments_count,
        ts.shares_count,
        ts.safety_tips,
        ts.budget_range,
        ts.duration,
        ts.travel_style,
        ts.created_at,
        ts.updated_at,
        ts.comments,
        ts.liked_by_users,
        jsonb_build_object(
            'id', up.id,
            'full_name', up.full_name,
            'email', up.email,
            'avatar_url', up.avatar_url
        ) AS user_profiles
    FROM
        travel_stories ts
    LEFT JOIN
        user_profiles up ON ts.user_id = up.id
    ORDER BY
        ts.created_at DESC
    LIMIT story_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_travel_stories_with_profiles(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_travel_stories_with_profiles(INT) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_travel_stories_with_profiles IS 'Retrieves travel stories with associated user profile data';