# Search API Documentation

## Overview

The Search API provides comprehensive search functionality for the Project Lens platform, allowing users to discover professionals in the visual production industry through various filters and search criteria.

## Endpoints

### 1. Search Profiles

**Endpoint:** `GET /api/search`

Search for profiles with advanced filtering, pagination, and sorting capabilities.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | string | Text search across name, bio, location, username | `"fotógrafo moda"` |
| `role` | string | Filter by user role | `"photographer"` |
| `location` | string | Filter by location (partial match) | `"Buenos Aires"` |
| `experience_level` | string | Filter by experience level | `"avanzado"` |
| `specialties` | string | Comma-separated specialties | `"moda,editorial"` |
| `travel_availability` | boolean | Filter by travel availability | `true` |
| `studio_access` | string | Filter by studio access type | `"estudio_propio"` |
| `budget_range` | string | Filter by budget range | `"100k_500k"` |
| `page` | number | Page number (default: 1) | `2` |
| `limit` | number | Results per page (max: 50, default: 20) | `10` |
| `sortBy` | string | Sort criteria | `"relevance"` |
| `sortOrder` | string | Sort order | `"desc"` |

#### Supported Roles
- `photographer` - Fotógrafo
- `model` - Modelo
- `makeup_artist` - Maquillador/a
- `stylist` - Estilista
- `producer` - Productor/a

#### Supported Experience Levels
- `principiante` - Beginner
- `intermedio` - Intermediate
- `avanzado` - Advanced
- `experto` - Expert

#### Supported Specialties

**Photographer:**
- `retrato`, `moda`, `comercial`, `editorial`, `belleza`, `lifestyle`, `producto`, `evento`, `artistico`

**Model:**
- `moda`, `comercial`, `fitness`, `artistico`, `editorial`, `glamour`, `alternativo`

**Makeup Artist:**
- `belleza`, `moda`, `editorial`, `novias`, `efectos_especiales`, `teatral`, `comercial`

**Stylist:**
- `moda`, `comercial`, `editorial`, `personal`, `vestuario`, `utileria`

**Producer:**
- `moda`, `comercial`, `editorial`, `video_musical`, `publicidad`, `eventos`

#### Sorting Options
- `relevance` - By search relevance (default for text queries)
- `recent` - By last update date
- `name` - Alphabetical by full name
- `score` - By profile completeness score

#### Example Request

```bash
GET /api/search?query=fotógrafo&role=photographer&location=Buenos%20Aires&specialties=moda,editorial&page=1&limit=20&sortBy=relevance
```

#### Response Format

```json
{
  "data": {
    "profiles": [
      {
        "id": "uuid",
        "username": "photographer_username",
        "full_name": "Juan Pérez",
        "role": "photographer",
        "bio": "Fotógrafo especializado en moda y editorial...",
        "location": "Buenos Aires, Argentina",
        "avatar_url": "https://...",
        "cover_image_url": "https://...",
        "subscription_tier": "pro",
        "role_specific_data": {
          "specialties": ["moda", "editorial"],
          "experience_level": "avanzado",
          "studio_access": "estudio_propio",
          "equipment_highlights": "Canon R5, Profoto...",
          "post_production_skills": ["Photoshop", "Lightroom"]
        },
        "portfolio_images": [
          {
            "id": "uuid",
            "image_url": "https://...",
            "alt_text": "Fashion shoot",
            "sort_order": 0,
            "created_at": "2024-01-15T10:30:00Z"
          }
        ],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### 2. Search Suggestions

**Endpoint:** `GET /api/search/suggestions`

Get autocomplete suggestions for search queries.

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query (min 2 characters) | `"foto"` |
| `type` | string | Suggestion type filter | `"profile"` |
| `limit` | number | Max suggestions (max: 20, default: 10) | `5` |

#### Suggestion Types
- `profile` - Profile names and usernames
- `location` - Location names
- `specialty` - Professional specialties

#### Example Request

```bash
GET /api/search/suggestions?q=foto&limit=5
```

#### Response Format

```json
{
  "data": [
    {
      "type": "profile",
      "value": "fotografo_juan",
      "label": "@fotografo_juan (Juan Pérez)"
    },
    {
      "type": "specialty",
      "value": "fotografia",
      "label": "Fotografía"
    },
    {
      "type": "location",
      "value": "Buenos Aires",
      "label": "Buenos Aires"
    }
  ]
}
```

## Search Features

### 1. Text Search
- Full-text search across profile names, bios, locations, and usernames
- Spanish language support with stemming
- Fuzzy matching for typos and partial matches
- Relevance ranking based on match quality

### 2. Advanced Filtering
- Role-based filtering with specific professional categories
- Location-based search with partial matching
- Experience level filtering
- Specialty-based filtering using JSONB queries
- Boolean filters for travel availability and other attributes

### 3. Performance Optimizations
- Database indexes on commonly searched fields
- GIN indexes for JSONB specialty searches
- Trigram indexes for fuzzy text matching
- Composite indexes for common filter combinations
- Query result caching (planned)

### 4. Pagination
- Cursor-based pagination for consistent results
- Configurable page sizes (max 50 items)
- Total count and "has more" indicators
- Efficient offset-based queries with proper indexing

## Database Indexes

The following indexes are created to optimize search performance:

### Text Search Indexes
```sql
-- Full-text search
CREATE INDEX idx_profiles_full_name_gin ON profiles USING GIN(to_tsvector('spanish', full_name));
CREATE INDEX idx_profiles_bio_gin ON profiles USING GIN(to_tsvector('spanish', bio));

-- Trigram indexes for fuzzy search
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN(full_name gin_trgm_ops);
CREATE INDEX idx_profiles_username_trgm ON profiles USING GIN(username gin_trgm_ops);
```

### Filter Indexes
```sql
-- Basic filters
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_location ON profiles(location);

-- JSONB specialty searches
CREATE INDEX idx_profiles_specialties ON profiles USING GIN((role_specific_data->'specialties'));
CREATE INDEX idx_profiles_experience ON profiles(role, (role_specific_data->>'experience_level'));
```

### Composite Indexes
```sql
-- Common search patterns
CREATE INDEX idx_profiles_role_location_name ON profiles(role, location, full_name);
CREATE INDEX idx_profiles_role_created_at ON profiles(role, created_at DESC);
```

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `SEARCH_ERROR` | General search query error | 500 |
| `INVALID_FILTERS` | Invalid filter parameters | 400 |
| `PAGINATION_ERROR` | Invalid pagination parameters | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many search requests | 429 |

### Example Error Response

```json
{
  "error": {
    "code": "INVALID_FILTERS",
    "message": "El rol especificado no es válido",
    "details": {
      "field": "role",
      "validValues": ["photographer", "model", "makeup_artist", "stylist", "producer"]
    }
  }
}
```

## Usage Examples

### 1. Basic Text Search

```javascript
import { ProfileApi } from '@/lib/api/profileApi'

const searchResults = await ProfileApi.searchProfiles(
  { query: 'fotógrafo moda' },
  { page: 1, limit: 20 }
)
```

### 2. Advanced Filtering

```javascript
const searchResults = await ProfileApi.searchProfiles(
  {
    role: 'photographer',
    location: 'Buenos Aires',
    specialties: ['moda', 'editorial'],
    experience_level: 'avanzado'
  },
  { page: 1, limit: 20 },
  { sortBy: 'relevance', sortOrder: 'desc' }
)
```

### 3. Autocomplete Suggestions

```javascript
const suggestions = await ProfileApi.getSearchSuggestions('foto', 'profile', 5)
```

### 4. Role-based Discovery

```javascript
const photographers = await ProfileApi.getProfilesByRole('photographer', 20)
```

## Performance Considerations

### 1. Query Optimization
- Use specific filters to reduce result sets
- Limit page sizes to reasonable numbers (≤ 50)
- Use appropriate sorting for your use case
- Consider caching frequently accessed results

### 2. Index Usage
- Text searches automatically use GIN indexes
- Filter combinations use composite indexes when available
- JSONB specialty searches use specialized GIN indexes

### 3. Rate Limiting
- Search requests are rate-limited per user
- Implement client-side debouncing for autocomplete
- Cache results when possible to reduce API calls

## Future Enhancements

### Planned Features
- Geolocation-based search with distance filtering
- Saved search functionality
- Search result personalization
- Advanced analytics and search insights
- Real-time search suggestions
- Machine learning-based relevance scoring

### Performance Improvements
- Redis caching for popular searches
- Elasticsearch integration for advanced text search
- CDN caching for static search results
- Database query optimization based on usage patterns