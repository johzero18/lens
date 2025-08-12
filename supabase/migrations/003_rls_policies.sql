-- Row Level Security (RLS) policies for Project Lens

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- Portfolio Images RLS Policies
-- Anyone can view portfolio images
CREATE POLICY "Portfolio images are viewable by everyone" 
ON portfolio_images FOR SELECT 
USING (true);

-- Users can insert images to their own portfolio
CREATE POLICY "Users can insert their own portfolio images" 
ON portfolio_images FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = portfolio_images.profile_id 
    AND profiles.id = auth.uid()
  )
);

-- Users can update their own portfolio images
CREATE POLICY "Users can update their own portfolio images" 
ON portfolio_images FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = portfolio_images.profile_id 
    AND profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = portfolio_images.profile_id 
    AND profiles.id = auth.uid()
  )
);

-- Users can delete their own portfolio images
CREATE POLICY "Users can delete their own portfolio images" 
ON portfolio_images FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = portfolio_images.profile_id 
    AND profiles.id = auth.uid()
  )
);

-- Contacts RLS Policies
-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages" 
ON contacts FOR SELECT 
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages" 
ON contacts FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM profiles WHERE id = receiver_id) AND
  EXISTS (SELECT 1 FROM profiles WHERE id = sender_id)
);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update messages they received" 
ON contacts FOR UPDATE 
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Users can delete messages they sent or received
CREATE POLICY "Users can delete their messages" 
ON contacts FOR DELETE 
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Additional security functions
-- Function to check if user can contact another user (rate limiting will be handled in application)
CREATE OR REPLACE FUNCTION can_contact_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if target user exists and is not the same as current user
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_user_id 
    AND id != auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily message count (for rate limiting)
CREATE OR REPLACE FUNCTION get_daily_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM contacts
    WHERE sender_id = user_id
    AND created_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;