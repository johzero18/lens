import { 
  UserRole, 
  ProfileUpdateData, 
  ModelData, 
  PhotographerData, 
  MakeupArtistData, 
  StylistData, 
  ProducerData,
  RoleSpecificData,
  ValidationError,
  ValidationErrorType
} from '@/types'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export class ValidationService {
  /**
   * Validate profile update data
   */
  static validateProfileUpdate(data: ProfileUpdateData, role: UserRole): ValidationResult {
    const errors: ValidationError[] = []

    // Validate full_name
    if (data.full_name !== undefined) {
      const nameValidation = this.validateFullName(data.full_name)
      if (!nameValidation.isValid) {
        errors.push(...nameValidation.errors)
      }
    }

    // Validate bio
    if (data.bio !== undefined) {
      const bioValidation = this.validateBio(data.bio)
      if (!bioValidation.isValid) {
        errors.push(...bioValidation.errors)
      }
    }

    // Validate location
    if (data.location !== undefined) {
      const locationValidation = this.validateLocation(data.location)
      if (!locationValidation.isValid) {
        errors.push(...locationValidation.errors)
      }
    }

    // Validate role-specific data
    if (data.role_specific_data !== undefined) {
      const roleDataValidation = this.validateRoleSpecificData(data.role_specific_data, role)
      if (!roleDataValidation.isValid) {
        errors.push(...roleDataValidation.errors)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate full name
   */
  static validateFullName(fullName: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!fullName || fullName.trim().length === 0) {
      errors.push({
        field: 'full_name',
        type: ValidationErrorType.REQUIRED,
        message: 'El nombre completo es requerido'
      })
    } else if (fullName.trim().length < 2) {
      errors.push({
        field: 'full_name',
        type: ValidationErrorType.MIN_LENGTH,
        message: 'El nombre debe tener al menos 2 caracteres'
      })
    } else if (fullName.length > 100) {
      errors.push({
        field: 'full_name',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'El nombre no puede exceder 100 caracteres'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate bio
   */
  static validateBio(bio: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!bio || bio.trim().length === 0) {
      errors.push({
        field: 'bio',
        type: ValidationErrorType.REQUIRED,
        message: 'La biografía es requerida'
      })
    } else if (bio.trim().length < 10) {
      errors.push({
        field: 'bio',
        type: ValidationErrorType.MIN_LENGTH,
        message: 'La biografía debe tener al menos 10 caracteres'
      })
    } else if (bio.length > 500) {
      errors.push({
        field: 'bio',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La biografía no puede exceder 500 caracteres'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate location
   */
  static validateLocation(location: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!location || location.trim().length === 0) {
      errors.push({
        field: 'location',
        type: ValidationErrorType.REQUIRED,
        message: 'La ubicación es requerida'
      })
    } else if (location.trim().length < 2) {
      errors.push({
        field: 'location',
        type: ValidationErrorType.MIN_LENGTH,
        message: 'La ubicación debe tener al menos 2 caracteres'
      })
    } else if (location.length > 100) {
      errors.push({
        field: 'location',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La ubicación no puede exceder 100 caracteres'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate username
   */
  static validateUsername(username: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!username || username.trim().length === 0) {
      errors.push({
        field: 'username',
        type: ValidationErrorType.REQUIRED,
        message: 'El nombre de usuario es requerido'
      })
    } else if (username.length < 3) {
      errors.push({
        field: 'username',
        type: ValidationErrorType.MIN_LENGTH,
        message: 'El nombre de usuario debe tener al menos 3 caracteres'
      })
    } else if (username.length > 30) {
      errors.push({
        field: 'username',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'El nombre de usuario no puede exceder 30 caracteres'
      })
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push({
        field: 'username',
        type: ValidationErrorType.USERNAME,
        message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate role-specific data
   */
  static validateRoleSpecificData(data: RoleSpecificData, role: UserRole): ValidationResult {
    switch (role) {
      case 'model':
        return this.validateModelData(data as ModelData)
      case 'photographer':
        return this.validatePhotographerData(data as PhotographerData)
      case 'makeup_artist':
        return this.validateMakeupArtistData(data as MakeupArtistData)
      case 'stylist':
        return this.validateStylistData(data as StylistData)
      case 'producer':
        return this.validateProducerData(data as ProducerData)
      default:
        return { isValid: true, errors: [] }
    }
  }

  /**
   * Validate model data
   */
  static validateModelData(data: ModelData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate height
    if (data.height_cm && (data.height_cm < 140 || data.height_cm > 220)) {
      errors.push({
        field: 'height_cm',
        type: ValidationErrorType.REQUIRED,
        message: 'La altura debe estar entre 140 y 220 cm'
      })
    }

    // Validate measurements
    if (data.measurements) {
      if (data.measurements.bust_cm && (data.measurements.bust_cm < 60 || data.measurements.bust_cm > 150)) {
        errors.push({
          field: 'measurements.bust_cm',
          type: ValidationErrorType.REQUIRED,
          message: 'La medida de busto debe estar entre 60 y 150 cm'
        })
      }

      if (data.measurements.waist_cm && (data.measurements.waist_cm < 50 || data.measurements.waist_cm > 120)) {
        errors.push({
          field: 'measurements.waist_cm',
          type: ValidationErrorType.REQUIRED,
          message: 'La medida de cintura debe estar entre 50 y 120 cm'
        })
      }

      if (data.measurements.hips_cm && (data.measurements.hips_cm < 60 || data.measurements.hips_cm > 150)) {
        errors.push({
          field: 'measurements.hips_cm',
          type: ValidationErrorType.REQUIRED,
          message: 'La medida de cadera debe estar entre 60 y 150 cm'
        })
      }
    }

    // Validate shoe size
    if (data.shoe_size_eu && (data.shoe_size_eu < 35 || data.shoe_size_eu > 50)) {
      errors.push({
        field: 'shoe_size_eu',
        type: ValidationErrorType.REQUIRED,
        message: 'La talla de calzado debe estar entre 35 y 50'
      })
    }

    // Validate dress size
    if (data.dress_size_eu && (data.dress_size_eu < 32 || data.dress_size_eu > 50)) {
      errors.push({
        field: 'dress_size_eu',
        type: ValidationErrorType.REQUIRED,
        message: 'La talla de vestido debe estar entre 32 y 50'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate photographer data
   */
  static validatePhotographerData(data: PhotographerData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate equipment highlights
    if (data.equipment_highlights && data.equipment_highlights.length > 500) {
      errors.push({
        field: 'equipment_highlights',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La descripción del equipo no puede exceder 500 caracteres'
      })
    }

    // Validate years of experience
    if (data.years_experience && (data.years_experience < 0 || data.years_experience > 50)) {
      errors.push({
        field: 'years_experience',
        type: ValidationErrorType.REQUIRED,
        message: 'Los años de experiencia deben estar entre 0 y 50'
      })
    }

    // Validate portfolio URL
    if (data.portfolio_url && !this.isValidUrl(data.portfolio_url)) {
      errors.push({
        field: 'portfolio_url',
        type: ValidationErrorType.REQUIRED,
        message: 'La URL del portfolio no es válida'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate makeup artist data
   */
  static validateMakeupArtistData(data: MakeupArtistData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate years of experience
    if (data.years_experience && (data.years_experience < 0 || data.years_experience > 50)) {
      errors.push({
        field: 'years_experience',
        type: ValidationErrorType.REQUIRED,
        message: 'Los años de experiencia deben estar entre 0 y 50'
      })
    }

    // Validate kit highlights (array length)
    if (data.kit_highlights && data.kit_highlights.length > 20) {
      errors.push({
        field: 'kit_highlights',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'No puedes tener más de 20 marcas destacadas'
      })
    }

    // Validate services offered (array length)
    if (data.services_offered && data.services_offered.length > 20) {
      errors.push({
        field: 'services_offered',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'No puedes tener más de 20 servicios ofrecidos'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate stylist data
   */
  static validateStylistData(data: StylistData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate years of experience
    if (data.years_experience && (data.years_experience < 0 || data.years_experience > 50)) {
      errors.push({
        field: 'years_experience',
        type: ValidationErrorType.REQUIRED,
        message: 'Los años de experiencia deben estar entre 0 y 50'
      })
    }

    // Validate portfolio URL
    if (data.portfolio_url && !this.isValidUrl(data.portfolio_url)) {
      errors.push({
        field: 'portfolio_url',
        type: ValidationErrorType.REQUIRED,
        message: 'La URL del portfolio no es válida'
      })
    }

    // Validate wardrobe access
    if (data.wardrobe_access && data.wardrobe_access.length > 500) {
      errors.push({
        field: 'wardrobe_access',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La descripción de acceso a vestuario no puede exceder 500 caracteres'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate producer data
   */
  static validateProducerData(data: ProducerData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate years of experience
    if (data.years_experience && (data.years_experience < 0 || data.years_experience > 50)) {
      errors.push({
        field: 'years_experience',
        type: ValidationErrorType.REQUIRED,
        message: 'Los años de experiencia deben estar entre 0 y 50'
      })
    }

    // Validate portfolio URL
    if (data.portfolio_url && !this.isValidUrl(data.portfolio_url)) {
      errors.push({
        field: 'portfolio_url',
        type: ValidationErrorType.REQUIRED,
        message: 'La URL del portfolio no es válida'
      })
    }

    // Validate team size
    if (data.team_size && data.team_size.length > 100) {
      errors.push({
        field: 'team_size',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La descripción del tamaño del equipo no puede exceder 100 caracteres'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, type: 'avatar' | 'cover' | 'portfolio'): ValidationResult {
    const errors: ValidationError[] = []

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        type: ValidationErrorType.FILE_TYPE,
        message: 'Solo se permiten archivos JPG, PNG y WebP'
      })
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        type: ValidationErrorType.FILE_SIZE,
        message: 'El archivo no puede exceder 5MB'
      })
    }

    // Type-specific validations
    if (type === 'avatar') {
      // Avatar should ideally be square, but we'll just check minimum dimensions
      // This would require loading the image to check dimensions
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate portfolio image data
   */
  static validatePortfolioImageData(data: { alt_text?: string; sort_order: number }): ValidationResult {
    const errors: ValidationError[] = []

    // Validate alt text
    if (data.alt_text && data.alt_text.length > 200) {
      errors.push({
        field: 'alt_text',
        type: ValidationErrorType.MAX_LENGTH,
        message: 'La descripción de la imagen no puede exceder 200 caracteres'
      })
    }

    // Validate sort order
    if (data.sort_order < 0) {
      errors.push({
        field: 'sort_order',
        type: ValidationErrorType.REQUIRED,
        message: 'El orden debe ser un número positivo'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if URL is valid
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, '') // Remove potential HTML tags
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeStringArray(arr: string[]): string[] {
    return arr
      .map(item => this.sanitizeText(item))
      .filter(item => item.length > 0)
      .slice(0, 50) // Limit array size
  }
}