-- Performance indexes for Project Lens database

-- Profiles table indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at DESC);

-- GIN index for role_specific_data JSONB column for efficient querying
CREATE INDEX idx_profiles_role_specific_data ON profiles USING GIN(role_specific_data);

-- Composite indexes for common query patterns
CREATE INDEX idx_profiles_role_location ON profiles(role, location);
CREATE INDEX idx_profiles_role_created_at ON profiles(role, created_at DESC);

-- Portfolio images table indexes
CREATE INDEX idx_portfolio_images_profile_id ON portfolio_images(profile_id);
CREATE INDEX idx_portfolio_images_sort_order ON portfolio_images(profile_id, sort_order);
CREATE INDEX idx_portfolio_images_created_at ON portfolio_images(created_at DESC);

-- Contact messages table indexes
CREATE INDEX idx_contacts_receiver_id ON contacts(receiver_id);
CREATE INDEX idx_contacts_sender_id ON contacts(sender_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_read_at ON contacts(read_at);

-- Composite indexes for contacts
CREATE INDEX idx_contacts_receiver_created ON contacts(receiver_id, created_at DESC);
CREATE INDEX idx_contacts_sender_created ON contacts(sender_id, created_at DESC);
CREATE INDEX idx_contacts_receiver_read ON contacts(receiver_id, read_at);

-- Partial indexes for unread messages (more efficient)
CREATE INDEX idx_contacts_unread ON contacts(receiver_id, created_at DESC) 
WHERE read_at IS NULL;