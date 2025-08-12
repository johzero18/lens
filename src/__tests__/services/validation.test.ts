/**
 * Validation Service Tests
 * 
 * Tests for validation logic without external dependencies
 */

import { ValidationService } from '@/lib/services'
import { UserRole, ExperienceLevel, ModelType, HairColor, EyeColor } from '@/types'

describe('ValidationService', () => {
  describe('validateProfileUpdate', () => {
    it('should validate correct profile data', () => {
      const data = {
        full_name: 'Juan Pérez',
        bio: 'Fotógrafo profesional con más de 10 años de experiencia en retratos y moda',
        location: 'Buenos Aires, Argentina'
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short full name', () => {
      const data = {
        full_name: 'A',
        bio: 'Valid bio with enough characters',
        location: 'Valid location'
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'full_name')).toBe(true)
    })

    it('should reject short bio', () => {
      const data = {
        full_name: 'Valid Name',
        bio: 'Short',
        location: 'Valid location'
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'bio')).toBe(true)
    })

    it('should reject empty location', () => {
      const data = {
        full_name: 'Valid Name',
        bio: 'Valid bio with enough characters',
        location: ''
      }

      const result = ValidationService.validateProfileUpdate(data, 'photographer' as UserRole)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'location')).toBe(true)
    })
  })

  describe('validateFileUpload', () => {
    it('should validate correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      const result = ValidationService.validateFileUpload(file, 'avatar')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept PNG files', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      
      const result = ValidationService.validateFileUpload(file, 'portfolio')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept WebP files', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' })
      
      const result = ValidationService.validateFileUpload(file, 'cover')
      
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
    const validModelData = {
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
      hair_color: HairColor.BROWN,
      eye_color: EyeColor.BROWN,
      special_attributes: {
        tattoos: false,
        piercings: false
      }
    }

    it('should validate correct model data', () => {
      const result = ValidationService.validateModelData(validModelData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid height', () => {
      const invalidData = {
        ...validModelData,
        height_cm: 300 // Too tall
      }

      const result = ValidationService.validateModelData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'height_cm')).toBe(true)
    })

    it('should reject invalid measurements', () => {
      const invalidData = {
        ...validModelData,
        measurements: {
          bust_cm: 200, // Too large
          waist_cm: 30, // Too small
          hips_cm: 89
        }
      }

      const result = ValidationService.validateModelData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject invalid shoe size', () => {
      const invalidData = {
        ...validModelData,
        shoe_size_eu: 60 // Too large
      }

      const result = ValidationService.validateModelData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'shoe_size_eu')).toBe(true)
    })

    it('should reject invalid dress size', () => {
      const invalidData = {
        ...validModelData,
        dress_size_eu: 20 // Too small
      }

      const result = ValidationService.validateModelData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'dress_size_eu')).toBe(true)
    })
  })

  describe('validatePhotographerData', () => {
    const validPhotographerData = {
      specialties: ['portrait', 'fashion'],
      experience_level: ExperienceLevel.ADVANCED,
      studio_access: 'own_studio',
      equipment_highlights: 'Canon R5, Sony A7R IV, Profoto lighting',
      post_production_skills: ['Lightroom', 'Photoshop'],
      years_experience: 8,
      portfolio_url: 'https://example.com/portfolio'
    }

    it('should validate correct photographer data', () => {
      const result = ValidationService.validatePhotographerData(validPhotographerData)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid years of experience', () => {
      const invalidData = {
        ...validPhotographerData,
        years_experience: -5 // Negative
      }

      const result = ValidationService.validatePhotographerData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'years_experience')).toBe(true)
    })

    it('should reject invalid portfolio URL', () => {
      const invalidData = {
        ...validPhotographerData,
        portfolio_url: 'not-a-url'
      }

      const result = ValidationService.validatePhotographerData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'portfolio_url')).toBe(true)
    })

    it('should reject too long equipment description', () => {
      const invalidData = {
        ...validPhotographerData,
        equipment_highlights: 'x'.repeat(501) // Too long
      }

      const result = ValidationService.validatePhotographerData(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'equipment_highlights')).toBe(true)
    })
  })

  describe('validatePortfolioImageData', () => {
    it('should validate correct portfolio image data', () => {
      const data = {
        alt_text: 'Beautiful portrait session',
        sort_order: 1
      }

      const result = ValidationService.validatePortfolioImageData(data)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject too long alt text', () => {
      const data = {
        alt_text: 'x'.repeat(201), // Too long
        sort_order: 1
      }

      const result = ValidationService.validatePortfolioImageData(data)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'alt_text')).toBe(true)
    })

    it('should reject negative sort order', () => {
      const data = {
        alt_text: 'Valid alt text',
        sort_order: -1 // Negative
      }

      const result = ValidationService.validatePortfolioImageData(data)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'sort_order')).toBe(true)
    })
  })

  describe('sanitizeText', () => {
    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = ValidationService.sanitizeText(input)
      
      expect(result).toBe('Hello World')
    })

    it('should replace multiple spaces with single space', () => {
      const input = 'Hello    World'
      const result = ValidationService.sanitizeText(input)
      
      expect(result).toBe('Hello World')
    })

    it('should remove potential HTML tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = ValidationService.sanitizeText(input)
      
      expect(result).toBe('Hello scriptalert("xss")/script World')
    })

    it('should handle empty input', () => {
      const result = ValidationService.sanitizeText('')
      
      expect(result).toBe('')
    })

    it('should handle whitespace-only input', () => {
      const result = ValidationService.sanitizeText('   ')
      
      expect(result).toBe('')
    })
  })

  describe('sanitizeStringArray', () => {
    it('should sanitize array of strings', () => {
      const input = ['  Hello  ', '  World  ', '', '   ']
      const result = ValidationService.sanitizeStringArray(input)
      
      expect(result).toEqual(['Hello', 'World'])
    })

    it('should limit array size', () => {
      const input = Array(60).fill('item') // More than 50
      const result = ValidationService.sanitizeStringArray(input)
      
      expect(result.length).toBe(50)
    })

    it('should handle empty array', () => {
      const result = ValidationService.sanitizeStringArray([])
      
      expect(result).toEqual([])
    })
  })
})

// Test the complete validation flow
describe('Profile Validation Integration', () => {
  it('should validate complete model profile', () => {
    const profileData = {
      full_name: 'María González',
      bio: 'Modelo profesional con experiencia en moda y publicidad. Especializada en fotografía editorial y comercial.',
      location: 'Buenos Aires, Argentina',
      role_specific_data: {
        model_type: [ModelType.FASHION, ModelType.COMMERCIAL],
        experience_level: ExperienceLevel.ADVANCED,
        height_cm: 175,
        measurements: {
          bust_cm: 86,
          waist_cm: 61,
          hips_cm: 89
        },
        shoe_size_eu: 38,
        dress_size_eu: 36,
        hair_color: HairColor.BROWN,
        eye_color: EyeColor.BROWN,
        special_attributes: {
          tattoos: false,
          piercings: true
        },
        languages: ['Español', 'Inglés'],
        availability: 'Lunes a viernes, fines de semana con aviso previo'
      }
    }

    const result = ValidationService.validateProfileUpdate(profileData, 'model' as UserRole)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate complete photographer profile', () => {
    const profileData = {
      full_name: 'Carlos Rodríguez',
      bio: 'Fotógrafo especializado en retratos y moda con más de 10 años de experiencia. Trabajo con luz natural y estudio.',
      location: 'Córdoba, Argentina',
      role_specific_data: {
        specialties: ['portrait', 'fashion', 'editorial'],
        experience_level: ExperienceLevel.EXPERT,
        studio_access: 'own_studio',
        equipment_highlights: 'Canon R5, Sony A7R IV, Profoto B1X, lentes Carl Zeiss',
        post_production_skills: ['Lightroom', 'Photoshop', 'Capture One'],
        years_experience: 12,
        portfolio_url: 'https://carlosrodriguez.photography'
      }
    }

    const result = ValidationService.validateProfileUpdate(profileData, 'photographer' as UserRole)
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid profile with multiple errors', () => {
    const profileData = {
      full_name: 'A', // Too short
      bio: 'Short', // Too short
      location: '', // Empty
      role_specific_data: {
        height_cm: 300, // Invalid for model
        measurements: {
          bust_cm: 200, // Too large
          waist_cm: 30, // Too small
          hips_cm: 89
        }
      }
    }

    const result = ValidationService.validateProfileUpdate(profileData, 'model' as UserRole)
    
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(3) // Multiple validation errors
  })
})