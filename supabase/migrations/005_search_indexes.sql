-- Additional search optimization indexes for Project Lens

-- Full-text search indexes for better text search performance
CREATE INDEX idx_profiles_full_name_gin ON profiles USING GIN(to_tsvector('spanish', full_name));
CREATE INDEX idx_profiles_bio_gin ON profiles USING GIN(to_tsvector('spanish', bio));
CREATE INDEX idx_profiles_location_gin ON profiles USING GIN(to_tsvector('spanish', location));

-- Case-insensitive text search indexes
CREATE INDEX idx_profiles_full_name_lower ON profiles(lower(full_name));
CREATE INDEX idx_profiles_username_lower ON profiles(lower(username));
CREATE INDEX idx_profiles_location_lower ON profiles(lower(location));

-- Composite indexes for common search patterns
CREATE INDEX idx_profiles_role_location_name ON profiles(role, location, full_name);
CREATE INDEX idx_profiles_role_experience ON profiles(role, (role_specific_data->>'experience_level'));

-- JSONB indexes for role-specific data queries
CREATE INDEX idx_profiles_specialties ON profiles USING GIN((role_specific_data->'specialties'));
CREATE INDEX idx_profiles_model_type ON profiles USING GIN((role_specific_data->'model_type'));
CREATE INDEX idx_profiles_travel_availability ON profiles((role_specific_data->>'travel_availability'));
CREATE INDEX idx_profiles_studio_access ON profiles((role_specific_data->>'studio_access'));
CREATE INDEX idx_profiles_budget_range ON profiles((role_specific_data->>'typical_budget_range'));

-- Partial indexes for active profiles (future use)
CREATE INDEX idx_profiles_active_created ON profiles(created_at DESC) 
WHERE subscription_tier = 'pro' OR updated_at > NOW() - INTERVAL '30 days';

-- Index for portfolio image counts (for sorting by portfolio size)
CREATE INDEX idx_portfolio_count ON portfolio_images(profile_id);

-- Trigram indexes for fuzzy text search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN(full_name gin_trgm_ops);
CREATE INDEX idx_profiles_username_trgm ON profiles USING GIN(username gin_trgm_ops);
CREATE INDEX idx_profiles_location_trgm ON profiles USING GIN(location gin_trgm_ops);

-- Function to calculate profile completeness score (for ranking)
CREATE OR REPLACE FUNCTION calculate_profile_score(profile_data profiles)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score for having a profile
  score := score + 10;
  
  -- Avatar and cover image
  IF profile_data.avatar_url IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  IF profile_data.cover_image_url IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Bio completeness
  IF profile_data.bio IS NOT NULL AND length(profile_data.bio) > 50 THEN
    score := score + 20;
  END IF;
  
  -- Role-specific data completeness
  IF profile_data.role_specific_data IS NOT NULL AND 
     jsonb_array_length(profile_data.role_specific_data->'specialties') > 0 THEN
    score := score + 15;
  END IF;
  
  -- Portfolio images (check if user has portfolio)
  IF EXISTS (SELECT 1 FROM portfolio_images WHERE profile_id = profile_data.id) THEN
    score := score + 20;
  END IF;
  
  -- Recent activity bonus
  IF profile_data.updated_at > NOW() - INTERVAL '7 days' THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Index on profile score for ranking
CREATE INDEX idx_profiles_score ON profiles((calculate_profile_score(profiles.*)));

-- View for search results with calculated scores
CREATE OR REPLACE VIEW search_profiles AS
SELECT 
  p.*,
  calculate_profile_score(p.*) as profile_score,
  (SELECT COUNT(*) FROM portfolio_images pi WHERE pi.profile_id = p.id) as portfolio_count
FROM profiles p;

-- Function for advanced search with ranking
CREATE OR REPLACE FUNCTION search_profiles_advanced(
  search_query TEXT DEFAULT NULL,
  filter_role user_role DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  filter_specialties TEXT[] DEFAULT NULL,
  filter_experience_level TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  role user_role,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  subscription_tier subscription_tier,
  role_specific_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  profile_score INTEGER,
  portfolio_count BIGINT,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.username,
    sp.full_name,
    sp.role,
    sp.bio,
    sp.location,
    sp.avatar_url,
    sp.cover_image_url,
    sp.subscription_tier,
    sp.role_specific_data,
    sp.created_at,
    sp.updated_at,
    sp.profile_score,
    sp.portfolio_count,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('spanish', sp.full_name || ' ' || COALESCE(sp.bio, '') || ' ' || sp.location),
          plainto_tsquery('spanish', search_query)
        )
      ELSE 0
    END as search_rank
  FROM search_profiles sp
  WHERE 
    (filter_role IS NULL OR sp.role = filter_role)
    AND (filter_location IS NULL OR sp.location ILIKE '%' || filter_location || '%')
    AND (filter_experience_level IS NULL OR sp.role_specific_data->>'experience_level' = filter_experience_level)
    AND (filter_specialties IS NULL OR sp.role_specific_data->'specialties' ?| filter_specialties)
    AND (search_query IS NULL OR 
         to_tsvector('spanish', sp.full_name || ' ' || COALESCE(sp.bio, '') || ' ' || sp.location) @@ 
         plainto_tsquery('spanish', search_query))
  ORDER BY 
    CASE 
      WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN search_rank
      WHEN sort_by = 'score' THEN sp.profile_score
      WHEN sort_by = 'recent' THEN EXTRACT(EPOCH FROM sp.updated_at)
      WHEN sort_by = 'name' THEN 0
      ELSE sp.profile_score
    END DESC,
    CASE WHEN sort_by = 'name' THEN sp.full_name END ASC,
    sp.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for popular searches (for analytics)
CREATE MATERIALIZED VIEW popular_search_terms AS
SELECT 
  unnest(string_to_array(lower(bio), ' ')) as term,
  COUNT(*) as frequency
FROM profiles 
WHERE bio IS NOT NULL
GROUP BY term
HAVING LENGTH(unnest(string_to_array(lower(bio), ' '))) > 3
ORDER BY frequency DESC
LIMIT 1000;

-- Index on popular search terms
CREATE INDEX idx_popular_search_terms ON popular_search_terms(term, frequency DESC);

-- Function to refresh popular search terms
CREATE OR REPLACE FUNCTION refresh_popular_search_terms()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW popular_search_terms;
END;
$$ LANGUAGE plpgsql;