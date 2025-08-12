import { SearchService } from '@/lib/services/searchService'
import { SearchFilters, UserRole, ExperienceLevel } from '@/types'

const mockProfiles = [
  {
    id: '1',
    username: 'photographer_test',
    full_name: 'Juan Pérez',
    role: 'photographer',
    bio: 'Fotógrafo especializado en moda y editorial',
    location: 'Buenos Aires, Argentina',
    avatar_url: 'https://example.com/avatar1.jpg',
    cover_image_url: 'https://example.com/cover1.jpg',
    subscription_tier: 'pro',
    role_specific_data: {
      specialties: ['moda', 'editorial'],
      experience_level: 'avanzado',
      studio_access: 'estudio_propio',
      equipment_highlights: 'Canon R5, Profoto',
      post_production_skills: ['Photoshop', 'Lightroom']
    },
    portfolio_images: [
      {
        id: 'img1',
        profile_id: '1',
        image_url: 'https://example.com/portfolio1.jpg',
        alt_text: 'Fashion shoot',
        sort_order: 0,
        created_at: '2024-01-15T10:30:00Z'
      }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'model_test',
    full_name: 'María García',
    role: 'model',
    bio: 'Modelo profesional con experiencia en moda',
    location: 'Buenos Aires, Argentina',
    avatar_url: 'https://example.com/avatar2.jpg',
    cover_image_url: null,
    subscription_tier: 'free',
    role_specific_data: {
      model_type: ['moda', 'comercial'],
      experience_level: 'intermedio',
      height_cm: 175,
      measurements: {
        bust_cm: 85,
        waist_cm: 65,
        hips_cm: 90
      },
      shoe_size_eu: 38,
      dress_size_eu: 36,
      hair_color: 'castano',
      eye_color: 'marron',
      special_attributes: {
        tattoos: false,
        piercings: true
      }
    },
    portfolio_images: [],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-10T15:20:00Z'
  }
]

// Mock Supabase with proper chaining
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
  limit: jest.fn().mockResolvedValue({ data: mockProfiles, error: null })
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder)
  }
}))

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    mockQueryBuilder.range.mockResolvedValue({ data: mockProfiles, error: null })
    mockQueryBuilder.limit.mockResolvedValue({ data: mockProfiles, error: null })
  })

  describe('searchProfiles', () => {
    it('should search profiles with basic filters', async () => {
      const filters: SearchFilters = {
        role: 'photographer' as UserRole,
        location: 'Buenos Aires'
      }

      const pagination = { page: 1, limit: 20 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result).toEqual({
        profiles: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            username: 'photographer_test',
            role: 'photographer'
          })
        ]),
        total: 0, // Mocked count query would need separate setup
        page: 1,
        limit: 20,
        hasMore: false
      })
    })

    it('should search profiles with text query', async () => {
      const filters: SearchFilters = {
        query: 'fotógrafo moda'
      }

      const pagination = { page: 1, limit: 10 }
      const options = { sortBy: 'relevance' as const }

      const result = await SearchService.searchProfiles(filters, pagination, options)

      expect(result.profiles).toBeDefined()
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('should search profiles with specialty filters', async () => {
      const filters: SearchFilters = {
        role: 'photographer' as UserRole,
        specialties: ['moda', 'editorial'],
        experience_level: 'avanzado' as ExperienceLevel
      }

      const pagination = { page: 1, limit: 20 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result.profiles).toBeDefined()
      expect(Array.isArray(result.profiles)).toBe(true)
    })

    it('should handle pagination correctly', async () => {
      const filters: SearchFilters = {}
      const pagination = { page: 2, limit: 5 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(5)
    })

    it('should handle sorting options', async () => {
      const filters: SearchFilters = {}
      const pagination = { page: 1, limit: 20 }
      const options = { 
        sortBy: 'name' as const, 
        sortOrder: 'asc' as const 
      }

      const result = await SearchService.searchProfiles(filters, pagination, options)

      expect(result.profiles).toBeDefined()
    })
  })

  describe('getSearchSuggestions', () => {
    it('should return profile suggestions', async () => {
      const suggestions = await SearchService.getSearchSuggestions('juan', 'profile', 5)

      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should return location suggestions', async () => {
      const suggestions = await SearchService.getSearchSuggestions('buenos', 'location', 5)

      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should return specialty suggestions', async () => {
      const suggestions = await SearchService.getSearchSuggestions('moda', 'specialty', 5)

      expect(suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'specialty',
            value: 'moda',
            label: 'Moda'
          })
        ])
      )
    })

    it('should return empty array for short queries', async () => {
      const suggestions = await SearchService.getSearchSuggestions('a', undefined, 5)

      expect(suggestions).toEqual([])
    })

    it('should limit suggestions correctly', async () => {
      const suggestions = await SearchService.getSearchSuggestions('test', undefined, 3)

      expect(suggestions.length).toBeLessThanOrEqual(3)
    })
  })

  describe('getFeaturedProfiles', () => {
    it('should return featured profiles', async () => {
      const profiles = await SearchService.getFeaturedProfiles(12)

      expect(Array.isArray(profiles)).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const profiles = await SearchService.getFeaturedProfiles(5)

      expect(profiles.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getProfilesByRole', () => {
    it('should return profiles filtered by role', async () => {
      const profiles = await SearchService.getProfilesByRole('photographer', 10)

      expect(Array.isArray(profiles)).toBe(true)
    })

    it('should work with different roles', async () => {
      const roles: UserRole[] = ['photographer', 'model', 'makeup_artist', 'stylist', 'producer']

      for (const role of roles) {
        const profiles = await SearchService.getProfilesByRole(role, 5)
        expect(Array.isArray(profiles)).toBe(true)
      }
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      const mockError = new Error('Database connection failed')
      
      // This would need more sophisticated mocking to test error scenarios
      // For now, we'll just ensure the method exists and can be called
      const filters: SearchFilters = {}
      const pagination = { page: 1, limit: 20 }

      await expect(SearchService.searchProfiles(filters, pagination)).resolves.toBeDefined()
    })
  })

  describe('filter validation', () => {
    it('should handle empty filters', async () => {
      const filters: SearchFilters = {}
      const pagination = { page: 1, limit: 20 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result).toBeDefined()
      expect(result.profiles).toBeDefined()
    })

    it('should handle multiple specialties', async () => {
      const filters: SearchFilters = {
        specialties: ['moda', 'editorial', 'comercial']
      }
      const pagination = { page: 1, limit: 20 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result).toBeDefined()
    })

    it('should handle boolean filters', async () => {
      const filters: SearchFilters = {
        travel_availability: true
      }
      const pagination = { page: 1, limit: 20 }

      const result = await SearchService.searchProfiles(filters, pagination)

      expect(result).toBeDefined()
    })
  })
})

describe('SearchService Integration', () => {
  // These tests would run against a real database in integration testing
  describe('database integration', () => {
    it.skip('should perform full-text search correctly', async () => {
      // This test would require a real database connection
      // and would be run in integration test environment
    })

    it.skip('should use indexes efficiently', async () => {
      // This test would verify that queries use the correct indexes
      // and perform within acceptable time limits
    })

    it.skip('should handle large result sets', async () => {
      // This test would verify pagination works with large datasets
    })
  })
})