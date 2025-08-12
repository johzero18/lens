# Profile Management API Documentation

This document describes the backend APIs for profile management in Project Lens, including CRUD operations for profiles, portfolio management, and image uploads.

## Overview

The profile management system consists of:
- **Profile Service**: Handles profile CRUD operations and validation
- **Storage Service**: Manages image uploads to Supabase Storage
- **Validation Service**: Provides server-side validation
- **API Routes**: RESTful endpoints for client-server communication
- **Client API**: Frontend service for API interactions

## API Endpoints

### Profile Management

#### GET /api/profile
Get a profile by username or user ID.

**Query Parameters:**
- `username` (string, optional): Profile username
- `userId` (string, optional): User ID

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "username": "string",
    "full_name": "string",
    "role": "photographer|model|makeup_artist|stylist|producer",
    "bio": "string",
    "location": "string",
    "avatar_url": "string",
    "cover_image_url": "string",
    "subscription_tier": "free|pro",
    "role_specific_data": {},
    "portfolio_images": [],
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

#### PUT /api/profile
Update user profile (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "full_name": "string",
  "bio": "string", 
  "location": "string",
  "role_specific_data": {},
  "avatar_url": "string",
  "cover_image_url": "string"
}
```

**Response:**
```json
{
  "data": {
    // Updated profile object
  }
}
```

### Portfolio Management

#### GET /api/profile/portfolio
Get portfolio images for a user.

**Query Parameters:**
- `userId` (string, required): User ID

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "image_url": "string",
      "alt_text": "string",
      "sort_order": "number",
      "created_at": "datetime"
    }
  ]
}
```

#### POST /api/profile/portfolio
Add images to portfolio (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "images": [
    {
      "image_url": "string",
      "alt_text": "string",
      "sort_order": "number"
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    // Array of created portfolio images
  ]
}
```

#### PUT /api/profile/portfolio
Reorder portfolio images (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "imageOrders": [
    {
      "id": "uuid",
      "sort_order": "number"
    }
  ]
}
```

#### PUT /api/profile/portfolio/[imageId]
Update portfolio image (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "alt_text": "string",
  "sort_order": "number"
}
```

#### DELETE /api/profile/portfolio/[imageId]
Delete portfolio image (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

### Image Upload

#### POST /api/upload
Upload image file (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` (File): Image file (JPG, PNG, WebP, max 5MB)
- `type` (string): Image type ('avatar', 'cover', 'portfolio')

**Response:**
```json
{
  "data": {
    "url": "string",
    "path": "string",
    "width": "number",
    "height": "number", 
    "size": "number"
  }
}
```

#### DELETE /api/upload
Delete image by URL (requires authentication).

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `url` (string, required): Image URL to delete

## Services

### ProfileService

Located in `src/lib/services/profileService.ts`

**Key Methods:**
- `getProfileByUsername(username)`: Get profile by username
- `getProfileById(userId)`: Get profile by user ID
- `updateProfile(userId, data)`: Update profile data
- `addPortfolioImages(userId, images)`: Add portfolio images
- `updatePortfolioImage(imageId, data)`: Update portfolio image
- `deletePortfolioImage(imageId)`: Delete portfolio image
- `reorderPortfolioImages(userId, orders)`: Reorder portfolio images

### StorageService

Located in `src/lib/services/storageService.ts`

**Key Methods:**
- `uploadImage(file, path, options)`: Upload single image
- `uploadMultipleImages(files, basePath, options)`: Upload multiple images
- `deleteImage(path)`: Delete image by path
- `deleteImageByUrl(url)`: Delete image by URL

### ValidationService

Located in `src/lib/services/validationService.ts`

**Key Methods:**
- `validateProfileUpdate(data, role)`: Validate profile update data
- `validateFileUpload(file, type)`: Validate file upload
- `validatePortfolioImageData(data)`: Validate portfolio image data
- `sanitizeText(text)`: Sanitize text input

### ProfileApi (Client)

Located in `src/lib/api/profileApi.ts`

**Key Methods:**
- `getProfileByUsername(username)`: Get profile by username
- `updateProfile(data)`: Update profile
- `uploadImage(file, type)`: Upload image
- `addPortfolioImages(images)`: Add portfolio images
- `deletePortfolioImage(imageId)`: Delete portfolio image

## Data Models

### Profile
```typescript
interface Profile {
  id: string
  username: string
  full_name: string
  role: UserRole
  bio: string
  location: string
  avatar_url?: string
  cover_image_url?: string
  subscription_tier: SubscriptionTier
  role_specific_data: RoleSpecificData
  portfolio_images: PortfolioImage[]
  created_at: Date
  updated_at: Date
}
```

### PortfolioImage
```typescript
interface PortfolioImage {
  id: string
  profile_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: Date
}
```

### Role-Specific Data Types

#### ModelData
```typescript
interface ModelData {
  model_type: ModelType[]
  experience_level: ExperienceLevel
  height_cm: number
  measurements: {
    bust_cm: number
    waist_cm: number
    hips_cm: number
  }
  shoe_size_eu: number
  dress_size_eu: number
  hair_color: HairColor
  eye_color: EyeColor
  special_attributes: {
    tattoos: boolean
    piercings: boolean
  }
  languages?: string[]
  availability?: string
}
```

#### PhotographerData
```typescript
interface PhotographerData {
  specialties: PhotographySpecialty[]
  experience_level: ExperienceLevel
  studio_access: StudioAccess
  equipment_highlights: string
  post_production_skills: string[]
  years_experience?: number
  portfolio_url?: string
}
```

## Validation Rules

### Profile Fields
- **full_name**: 2-100 characters, required
- **bio**: 10-500 characters, required
- **location**: 2-100 characters, required
- **username**: 3-30 characters, alphanumeric + underscore/hyphen

### File Upload
- **Supported formats**: JPG, PNG, WebP
- **Maximum size**: 5MB
- **Avatar**: Recommended 400x400px
- **Cover**: Recommended 1200x300px
- **Portfolio**: Maximum 1200px width

### Portfolio Images
- **Maximum images**: 20 per profile
- **Alt text**: Maximum 200 characters
- **Sort order**: Positive integer

## Error Handling

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid authentication token
- `VALIDATION_ERROR`: Invalid input data
- `PROFILE_NOT_FOUND`: Profile does not exist
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format
- `UPLOAD_ERROR`: File upload failed
- `INTERNAL_ERROR`: Server error

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  }
}
```

## Security

### Authentication
- All write operations require JWT authentication
- Tokens are validated with Supabase Auth
- Users can only modify their own profiles

### Authorization
- Row-Level Security (RLS) policies enforce data access
- Users can only access their own profile data for editing
- Public profiles are readable by all users

### File Upload Security
- File type validation on both client and server
- File size limits enforced
- Unique file paths prevent conflicts
- Automatic cleanup on failed operations

## Storage Structure

### Supabase Storage Bucket: `profile-images`
```
profile-images/
├── {user_id}/
│   ├── avatar/
│   │   └── {timestamp}_{random}.{ext}
│   ├── cover/
│   │   └── {timestamp}_{random}.{ext}
│   └── portfolio/
│       ├── {timestamp}_{random}.{ext}
│       └── {timestamp}_{random}.{ext}
```

## Usage Examples

### Update Profile
```typescript
import { ProfileApi } from '@/lib/api/profileApi'

const result = await ProfileApi.updateProfile({
  full_name: 'Juan Pérez',
  bio: 'Fotógrafo profesional especializado en retratos...',
  location: 'Buenos Aires, Argentina',
  role_specific_data: {
    specialties: ['portrait', 'fashion'],
    experience_level: 'advanced',
    studio_access: 'own_studio',
    equipment_highlights: 'Canon R5, Sony A7R IV...'
  }
})

if (result.error) {
  console.error('Error:', result.error.message)
} else {
  console.log('Profile updated:', result.data)
}
```

### Upload and Add Portfolio Images
```typescript
import { ProfileApi } from '@/lib/api/profileApi'

// Upload files
const uploadResult = await ProfileApi.uploadMultipleImages(files, 'portfolio')

if (uploadResult.error) {
  console.error('Upload error:', uploadResult.error.message)
  return
}

// Add to portfolio
const portfolioData = uploadResult.data.map((result, index) => ({
  image_url: result.url,
  alt_text: '',
  sort_order: index + 1
}))

const addResult = await ProfileApi.addPortfolioImages(portfolioData)

if (addResult.error) {
  console.error('Add error:', addResult.error.message)
} else {
  console.log('Images added:', addResult.data)
}
```

## Testing

### Setup Database
```bash
npm run setup:database
```

### Test Profile Operations
```bash
npm run test:profile
```

### Verify Storage Bucket
The setup script automatically creates and configures the `profile-images` storage bucket with appropriate policies.

## Deployment Considerations

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

### Database Migrations
Ensure all migrations in `supabase/migrations/` are applied:
1. `001_initial_schema.sql` - Tables and types
2. `002_indexes.sql` - Performance indexes
3. `003_rls_policies.sql` - Security policies
4. `004_sample_data.sql` - Sample data (optional)

### Storage Configuration
- Bucket policies for public read access
- File size and type restrictions
- Automatic cleanup policies (optional)

This API provides a complete backend solution for profile management with proper validation, security, and error handling.