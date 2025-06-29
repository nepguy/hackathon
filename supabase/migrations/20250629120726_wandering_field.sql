-- Create table for caching Exa.ai API responses
CREATE TABLE IF NOT EXISTS exa_api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  query_type TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 1
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exa_api_cache_cache_key ON exa_api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_exa_api_cache_expires_at ON exa_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_exa_api_cache_query_type_location ON exa_api_cache(query_type, location);

-- Create table for tracking search history
CREATE TABLE IF NOT EXISTS exa_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_type TEXT NOT NULL,
  search_term TEXT,
  location TEXT,
  successful BOOLEAN DEFAULT true,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_exa_search_history_user_id ON exa_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exa_search_history_query_type ON exa_search_history(query_type);
CREATE INDEX IF NOT EXISTS idx_exa_search_history_created_at ON exa_search_history(created_at);

-- Enable Row Level Security
ALTER TABLE exa_api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE exa_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exa_api_cache
CREATE POLICY "Public read access to exa_api_cache" ON exa_api_cache
FOR SELECT USING (true);

CREATE POLICY "Service role can insert to exa_api_cache" ON exa_api_cache
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update exa_api_cache" ON exa_api_cache
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete from exa_api_cache" ON exa_api_cache
FOR DELETE USING (auth.role() = 'service_role');

-- RLS Policies for exa_search_history
CREATE POLICY "Users can view their own search history" ON exa_search_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert search history" ON exa_search_history
FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Function to get cached response if available
CREATE OR REPLACE FUNCTION get_exa_cached_response(
  p_cache_key TEXT,
  p_query_type TEXT,
  p_location TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSONB;
BEGIN
  -- Try to get from cache
  SELECT response_data INTO v_response
  FROM exa_api_cache
  WHERE cache_key = p_cache_key
  AND expires_at > NOW();
  
  -- If found, update hit count
  IF v_response IS NOT NULL THEN
    UPDATE exa_api_cache
    SET hit_count = hit_count + 1
    WHERE cache_key = p_cache_key;
    
    RETURN v_response;
  END IF;
  
  -- Return null if not found
  RETURN NULL;
END;
$$;

-- Function to store response in cache
CREATE OR REPLACE FUNCTION store_exa_cache(
  p_cache_key TEXT,
  p_response_data JSONB,
  p_query_type TEXT,
  p_location TEXT DEFAULT NULL,
  p_ttl_minutes INTEGER DEFAULT 15
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing cache entry if any
  DELETE FROM exa_api_cache WHERE cache_key = p_cache_key;
  
  -- Insert new cache entry
  INSERT INTO exa_api_cache (
    cache_key,
    response_data,
    query_type,
    location,
    expires_at
  ) VALUES (
    p_cache_key,
    p_response_data,
    p_query_type,
    p_location,
    NOW() + (p_ttl_minutes * INTERVAL '1 minute')
  );
END;
$$;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_exa_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM exa_api_cache
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$;

-- Function to log search history
CREATE OR REPLACE FUNCTION log_exa_search(
  p_user_id UUID,
  p_query_type TEXT,
  p_search_term TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_successful BOOLEAN DEFAULT true,
  p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO exa_search_history (
    user_id,
    query_type,
    search_term,
    location,
    successful,
    response_time_ms
  ) VALUES (
    p_user_id,
    p_query_type,
    p_search_term,
    p_location,
    p_successful,
    p_response_time_ms
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_exa_cached_response(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_exa_cached_response(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION store_exa_cache(TEXT, JSONB, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION store_exa_cache(TEXT, JSONB, TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION clean_expired_exa_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_exa_cache() TO anon;
GRANT EXECUTE ON FUNCTION log_exa_search(UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_exa_search(UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO anon;

-- Add comments for documentation
COMMENT ON TABLE exa_api_cache IS 'Caches Exa.ai API responses to reduce API calls and improve performance';
COMMENT ON TABLE exa_search_history IS 'Tracks search history for analytics and personalization';
COMMENT ON FUNCTION get_exa_cached_response IS 'Retrieves cached Exa.ai API response if available';
COMMENT ON FUNCTION store_exa_cache IS 'Stores Exa.ai API response in cache with expiration';
COMMENT ON FUNCTION clean_expired_exa_cache IS 'Removes expired cache entries to maintain database performance';
COMMENT ON FUNCTION log_exa_search IS 'Logs search history for analytics and personalization';