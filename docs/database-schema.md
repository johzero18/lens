# Database Schema Documentation

## Overview

Project Lens utilizes PostgreSQL through Supabase as its primary database. The schema is designed to support a professional network for visual industry professionals including photographers, models, makeup artists, stylists, and producers.

## Database Architecture

### Core Tables

#### 1. Profiles Table

The `profiles` table extends Supabase's built-in `auth.users` table and stores all user profile information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  bio TEXT CHECK (char_length(bio) <= 500),
  location TEXT NOT NULL,
  avatar_url TEXT,
  cover_image_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  role_specific_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Links to Supabase auth system via foreign key
- Flexible `role_specific_data` JSONB field for role-specific information
- Automatic timestamp management
- Comprehensive constraints for data validation

#### 2. Portfolio Images Table

Stores portfolio images for each user profile.

```sql
CREATE TABLE portfolio_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Cascading delete when profile is removed
- Sort order for custom image arrangement
- Alt text for accessibility

#### 3. Contacts Table

Manages contact messages between users.

```sql
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Prevents self-messaging via constraint
- Read status tracking
- Message length validation

## Custom Types

### User Roles
```sql
CREATE TYPE user_role AS ENUM (
  'photographer',
  'model', 
  'makeup_artist',
  'stylist',
  'producer'
);
```

### Subscription Tiers
```sql
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'pro'
);
```

## Role-Specific Data Structures

The `role_specific_data` JSONB field contains different structures based on user role:

### Photographer Data
```json
{
  "specialties": ["retratos", "moda", "eventos"],
  "experience_level": "profesional",
  "studio_access": "propio",
  "equipment_highlights": "Canon EOS R5, lentes profesionales",
  "post_production_skills": ["lightroom", "photoshop"]
}
```

### Model Data
```json
{
  "model_type": ["moda", "comercial"],
  "experience_level": "profesional",
  "height_cm": 175,
  "measurements": {
    "bust_cm": 86,
    "waist_cm": 61,
    "hips_cm": 89
  },
  "shoe_size_eu": 38,
  "dress_size_eu": 36,
  "hair_color": "castaño",
  "eye_color": "marrones",
  "special_attributes": {
    "tattoos": false,
    "piercings": true
  }
}
```

### Makeup Artist Data
```json
{
  "specialties": ["moda", "belleza", "editorial"],
  "experience_level": "profesional",
  "kit_highlights": ["MAC", "Urban Decay"],
  "services_offered": ["maquillaje_dia", "maquillaje_noche"],
  "travel_availability": true
}
```

### Stylist Data
```json
{
  "specialties": ["moda", "editorial"],
  "experience_level": "profesional",
  "industry_focus": ["moda", "publicidad"],
  "wardrobe_access": "showroom_propio",
  "portfolio_url": "https://example.com/portfolio"
}
```

### Producer Data
```json
{
  "specialties": ["publicidad", "fashion_films"],
  "services": ["produccion_ejecutiva", "casting"],
  "typical_budget_range": "50000-200000",
  "portfolio_url": "https://example.com/portfolio"
}
```

## Indexes and Performance

### Primary Indexes
- `idx_profiles_username` - Fast username lookups
- `idx_profiles_role` - Filter by user role
- `idx_profiles_location` - Location-based searches
- `idx_profiles_role_specific_data` - GIN index for JSONB queries

### Composite Indexes
- `idx_profiles_role_location` - Combined role and location filtering
- `idx_profiles_role_created_at` - Role-based sorting by creation date

### Portfolio Indexes
- `idx_portfolio_images_profile_id` - Fast portfolio retrieval
- `idx_portfolio_images_sort_order` - Ordered portfolio display

### Contact Indexes
- `idx_contacts_receiver_id` - Inbox queries
- `idx_contacts_unread` - Partial index for unread messages

## Row Level Security (RLS)

### Profiles Security
- **SELECT**: Public access to all profiles
- **INSERT/UPDATE/DELETE**: Users can only modify their own profiles

### Portfolio Images Security
- **SELECT**: Public access to all portfolio images
- **INSERT/UPDATE/DELETE**: Users can only modify their own portfolio

### Contacts Security
- **SELECT**: Users can only view messages they sent or received
- **INSERT**: Authenticated users can send messages
- **UPDATE**: Users can mark received messages as read
- **DELETE**: Users can delete their own messages

## Functions and Triggers

### Automatic Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'photographer'),
    COALESCE(NEW.raw_user_meta_data->>'location', 'Argentina')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Timestamp Management
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

## Security Features

### Data Validation
- Username format validation (alphanumeric, underscore, hyphen only)
- Length constraints on all text fields
- Email format validation through Supabase Auth
- Password strength requirements

### Rate Limiting
- Daily message limit function for spam prevention
- User contact validation function

### Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints prevent invalid data
- Unique constraints prevent duplicates

## Migration Strategy

Migrations are organized in sequential files:

1. `001_initial_schema.sql` - Core tables and types
2. `002_indexes.sql` - Performance indexes
3. `003_rls_policies.sql` - Security policies
4. `004_sample_data.sql` - Development sample data

## Backup and Recovery

- Supabase provides automated daily backups
- Point-in-time recovery available
- Export capabilities for data migration

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking through Supabase dashboard
- Index usage monitoring
- Connection pool monitoring

### Maintenance Tasks
- Regular VACUUM and ANALYZE operations (automated by Supabase)
- Index maintenance and optimization
- RLS policy auditing

## Development vs Production

### Development Environment
- Includes sample data for testing
- Relaxed constraints for development ease
- Additional logging and debugging features

### Production Environment
- Strict security policies
- Optimized indexes for production workloads
- Monitoring and alerting configured

This schema provides a solid foundation for the Project Lens platform while maintaining flexibility for future enhancements and scalability requirements.