/**
 * Profile Service Tests
 * 
 * Tests for the ProfileService class to verify CRUD operations
 * and validation work correctly.
 */

import { ProfileService, ValidationService } from '@/lib/services'
import { UserRole, ExperienceLevel, ModelType } from '@/types'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-user-id',
              username: 'testuser',
              full_name: 'Test User',
              role: 'photographer',
              bio: 'Test photographer bio',
              location: 'Buenos Aires, Argentina',
              avatar_url: null,
              cover_image_url: null,
              subscription_tier: 'free',
              role_specific_data: {
                specialties: ['portrait'],
                experience_level: 'intermediate',
                studio_access: 'own_studio',
                equipment_highlights: 'Canon R5',
                post_production_skills: ['Lightroom']
              },
              portfolio_images: [],
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-user-id',
                username: 'testuser',
                full_name: 'Updated Name',
                role: 'photographer',
                bio: 'Updated bio',
                location: 'Updated location',
                updated_at: '2024-01-01T01:00:00Z'
              },
              error: null
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({
          data: [{
            id: 'new-image-id',
            profile_id: 'test-user-id',
            image_url: 'https://example.com/image.jpg',
            alt_text: 'Test image',
            sort_order: 1,
            created_at: '2024-01-01T00:00:00Z'
          }],
          error: null
        }))
      })),
      delete: jest.fn(() => Promise.resolve({ error: null }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({
          data: { path: 'test/path/image.jpg' },
          error: null
        })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/image.jpg' }
        })),
        remove: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }
  }
}))

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfileByUsername', () => {
    it('should return profile data for valid username', async () => {
      const result = await ProfileService.getProfileByUsername('testuser')
      
      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.username).toBe('testuser')
      expect(result.data?.role).toBe('photographer')
    })

    it('should handle profile not found', async () => {
      // Mock not found response
      const mockSupabase = require('@/lib/supabase').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' }
            }))
          }))
        }))
      })

      const result = await ProfileService.getProfileByUsername('nonexistent')
      
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('PGRST116')
      expect(result.data).toBeUndefined()
    })
  })

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      const updateData = {
        full_name: 'Updated Name',
        bio: 'This is an updated bio with more than 10 characters',
        location: 'Updated Location'
      }

      const result = await ProfileService.updateProfile('test-user-id', updateData)
      
      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.full_name).toBe('Updated Name')
    })

    it('should validate required fields', async () => {
      const updateData = {
        full_name: 'A', // Too short
        bio: 'Short', // Too short
        location: '' // Empty
      }

      const result = await ProfileService.updateProfile('test-user-id', updateData)
      
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('addPortfolioImages', () => {
    it('should add portfolio images successfully', async () => {
      const images = [{
        image_url: 'https://example.com/image.jpg',
        alt_text: 'Test image',
        sort_order: 1
      }]

      const result = await ProfileService.addPortfolioImages('test-user-id', images)
      
      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(1)
      expect(result.data?.[0].image_url).toBe('https://example.com/image.jpg')
    })
  })
})

describe('ValidationService', () => {
  describe('validateProfileUpdate', () => {
    it('should validate correct profile data', () => {
      const data = {
        full_name: 'John Doe',
        bio: 'This is a valid bio with enough characters',
        location: 'Buenos Aires, Argentina'
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid profile data', () => {
      const data = {
        full_name: 'A', // Too short
        bio: 'Short', // Too short
        location: '' // Empty
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateFileUpload', () => {
    it('should validate correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      const result = ValidationService.validateFileUpload(file, 'avatar')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      const result = ValidationService.validateFileUpload(file, 'avatar')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('file_type')
    })

    it('should reject oversized file', () => {
      // Create a mock file that's too large (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      
      const result = ValidationService.validateFileUpload(largeFile, 'avatar')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('file_size')
    })
  })

  describe('validateModelData', () => {
    it('should validate correct model data', () => {
      const modelData = {
        model_type: [ModelType.FASHION],
        experience_level: ExperienceLevel.INTERMEDIATE,
        height_cm: 175,
        measurements: {
          bust_cm: 86,
          waist_cm: 61,
          hips_cm: 89
        },
        shoe_size_eu: 38,
        dress_size_eu: 36,
        hair_color: 'brown' as any,
        eye_color: 'brown' as any,
        special_attributes: {
          tattoos: false,
          piercings: false
        }
      }

      const result = ValidationService.validateModelData(modelData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid measurements', () => {
      const modelData = {
        model_type: [ModelType.FASHION],
        experience_level: ExperienceLevel.INTERMEDIATE,
        height_cm: 300, // Too tall
        measurements: {
          bust_cm: 200, // Too large
          waist_cm: 30, // Too small
          hips_cm: 89
        },
        shoe_size_eu: 60, // Too large
        dress_size_eu: 20, // Too small
        hair_color: 'brown' as any,
        eye_color: 'brown' as any,
        special_attributes: {
          tattoos: false,
          piercings: false
        }
      }

      const result = ValidationService.validateModelData(modelData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('sanitizeText', () => {
    it('should sanitize text input', () => {
      const input = '  Hello   World  <script>  '
      const result = ValidationService.sanitizeText(input)
      
      expect(result).toBe('Hello World script')
    })

    it('should handle empty input', () => {
      const result = ValidationService.sanitizeText('')
      
      expect(result).toBe('')
    })
  })
})

// Integration test for the complete flow
describe('Profile Management Integration', () => {
  it('should handle complete profile update flow', async () => {
    // 1. Validate data
    const updateData = {
      full_name: 'Juan Pérez',
      bio: 'Fotógrafo profesional con más de 5 años de experiencia',
      location: 'Buenos Aires, Argentina',
      role_specific_data: {
        specialties: ['portrait', 'fashion'],
        experience_level: 'advanced',
        studio_access: 'own_studio',
        equipment_highlights: 'Canon R5, Sony A7R IV',
        post_production_skills: ['Lightroom', 'Photoshop']
      }
    }

    const validation = ValidationService.validateProfileUpdate(updateData, 'photographer' as UserRole)
    expect(validation.isValid).toBe(true)

    // 2. Update profile
    const result = await ProfileService.updateProfile('test-user-id', updateData)
    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()

    // 3. Add portfolio images
    const portfolioImages = [{
      image_url: 'https://example.com/portfolio1.jpg',
      alt_text: 'Portrait session',
      sort_order: 1
    }]

    const portfolioResult = await ProfileService.addPortfolioImages('test-user-id', portfolioImages)
    expect(portfolioResult.error).toBeNull()
    expect(portfolioResult.data).toBeDefined()
  })
})