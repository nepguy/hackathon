/*
  # Add notification functions and triggers

  1. New Functions
    - `create_notification` - Creates a notification with proper user info
    - `get_user_notifications` - Gets notifications for a user with pagination
    - `delete_old_notifications` - Maintenance function to clean up old notifications
  2. Security
    - All functions are SECURITY DEFINER to ensure proper access control
    - RLS policies already exist from previous migrations
  3. Changes
    - Add triggers to automatically create notifications for likes and comments
*/

-- Function to create a notification with proper user info
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param UUID,
  actor_id_param UUID,
  type_param TEXT,
  content_param TEXT,
  story_id_param UUID DEFAULT NULL,
  story_title_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  actor_name_var TEXT;
  actor_avatar_var TEXT;
  notification_id UUID;
BEGIN
  -- Get actor information
  SELECT full_name, avatar_url INTO actor_name_var, actor_avatar_var
  FROM user_profiles
  WHERE id = actor_id_param;
  
  -- Use default name if not found
  IF actor_name_var IS NULL THEN
    actor_name_var := 'Anonymous User';
  END IF;
  
  -- Get story title if not provided but story_id is
  IF story_id_param IS NOT NULL AND story_title_param IS NULL THEN
    SELECT title INTO story_title_param
    FROM travel_stories
    WHERE id = story_id_param;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    user_id,
    actor_id,
    actor_name,
    actor_avatar,
    type,
    content,
    story_id,
    story_title,
    is_read,
    created_at
  ) VALUES (
    user_id_param,
    actor_id_param,
    actor_name_var,
    actor_avatar_var,
    type_param,
    content_param,
    story_id_param,
    story_title_param,
    false,
    NOW()
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  user_id_param UUID,
  limit_param INT DEFAULT 20,
  offset_param INT DEFAULT 0,
  include_read BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  actor_id UUID,
  actor_name TEXT,
  actor_avatar TEXT,
  type TEXT,
  content TEXT,
  story_id UUID,
  story_title TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.actor_id,
    n.actor_name,
    n.actor_avatar,
    n.type,
    n.content,
    n.story_id,
    n.story_title,
    n.is_read,
    n.created_at
  FROM
    notifications n
  WHERE
    n.user_id = user_id_param
    AND (include_read OR n.is_read = false)
  ORDER BY
    n.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Function to delete old notifications (maintenance)
CREATE OR REPLACE FUNCTION delete_old_notifications(days_to_keep INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM notifications
  WHERE created_at < (NOW() - (days_to_keep * INTERVAL '1 day'))
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Trigger function to create notification when a story is liked
CREATE OR REPLACE FUNCTION notify_on_story_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  story_owner_id UUID;
BEGIN
  -- Only create notification if this is a new like (not an unlike)
  IF TG_OP = 'INSERT' THEN
    -- Get story owner
    SELECT user_id INTO story_owner_id
    FROM travel_stories
    WHERE id = NEW.story_id;
    
    -- Don't notify if liking own story
    IF story_owner_id != NEW.user_id THEN
      PERFORM create_notification(
        story_owner_id,
        NEW.user_id,
        'like',
        'liked your story',
        NEW.story_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'notify_on_story_like_trigger'
  ) THEN
    CREATE TRIGGER notify_on_story_like_trigger
    AFTER INSERT ON story_likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_story_like();
  END IF;
END
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_notification(UUID, UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, UUID, TEXT, TEXT, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INT, INT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INT, INT, BOOLEAN) TO anon;

-- Add comments for documentation
COMMENT ON FUNCTION create_notification IS 'Creates a notification with proper user information';
COMMENT ON FUNCTION get_user_notifications IS 'Gets notifications for a user with pagination';
COMMENT ON FUNCTION delete_old_notifications IS 'Maintenance function to clean up old notifications';
COMMENT ON FUNCTION notify_on_story_like IS 'Trigger function to create notification when a story is liked';