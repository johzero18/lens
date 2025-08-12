import { 
  Profile, 
  PortfolioImage, 
  ApiResponse, 
  SearchFilters, 
  SearchResults, 
  SearchSuggestion,
  Pagination,
  UserRole 
} from '@/types'
import { supabase } from '@/lib/supabase'

export interface ProfileUpdateData {
  full_name?: string
  bio?: string
  location?: string
  role_specific_data?: any
  avatar_url?: string
  cover_image_url?: string
}

export interface SearchOptions {
  sortBy?: 'relevance' | 'recent' | 'name' | 'score'
  sortOrder?: 'asc' | 'desc'
}

export interface PortfolioImageData {
  image_url: string
  alt_text?: string
  sort_order: number
}

export interface ImageUploadResult {
  url: string
  path: string
  width?: number
  height?: number
  size: number
}

export class ProfileApi {
  private static async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private static async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken()
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error }
      }

      return { data: data.data }
    } catch (error) {
      console.error('API request error:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión'
        }
      }
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
    return this.makeRequest<Profile>(`/api/profile?username=${encodeURIComponent(username)}`)
  }

  /**
   * Get profile by user ID
   */
  static async getProfileById(userId: string): Promise<ApiResponse<Profile>> {
    return this.makeRequest<Profile>(`/api/profile?userId=${encodeURIComponent(userId)}`)
  }

  /**
   * Update profile
   */
  static async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<Profile>> {
    return this.makeRequest<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get portfolio images
   */
  static async getPortfolioImages(userId: string): Promise<ApiResponse<PortfolioImage[]>> {
    return this.makeRequest<PortfolioImage[]>(`/api/profile/portfolio?userId=${encodeURIComponent(userId)}`)
  }

  /**
   * Add portfolio images
   */
  static async addPortfolioImages(images: PortfolioImageData[]): Promise<ApiResponse<PortfolioImage[]>> {
    return this.makeRequest<PortfolioImage[]>('/api/profile/portfolio', {
      method: 'POST',
      body: JSON.stringify({ images }),
    })
  }

  /**
   * Update portfolio image
   */
  static async updatePortfolioImage(
    imageId: string,
    data: Partial<PortfolioImageData>
  ): Promise<ApiResponse<PortfolioImage>> {
    return this.makeRequest<PortfolioImage>(`/api/profile/portfolio/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete portfolio image
   */
  static async deletePortfolioImage(imageId: string): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>(`/api/profile/portfolio/${imageId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Reorder portfolio images
   */
  static async reorderPortfolioImages(
    imageOrders: { id: string; sort_order: number }[]
  ): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>('/api/profile/portfolio', {
      method: 'PUT',
      body: JSON.stringify({ imageOrders }),
    })
  }

  /**
   * Upload image file
   */
  static async uploadImage(
    file: File,
    type: 'avatar' | 'cover' | 'portfolio'
  ): Promise<ApiResponse<ImageUploadResult>> {
    try {
      const token = await this.getAuthToken()
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error }
      }

      return { data: data.data }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error al subir la imagen'
        }
      }
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: File[],
    type: 'portfolio' = 'portfolio'
  ): Promise<ApiResponse<ImageUploadResult[]>> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, type))
      const results = await Promise.all(uploadPromises)

      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        return {
          error: {
            code: 'MULTIPLE_UPLOAD_ERROR',
            message: `Error al subir ${errors.length} de ${files.length} imágenes`
          }
        }
      }

      const uploadResults = results.map(result => result.data!)
      return { data: uploadResults }
    } catch (error) {
      console.error('Multiple upload error:', error)
      return {
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error al subir las imágenes'
        }
      }
    }
  }

  /**
   * Delete image by URL
   */
  static async deleteImage(imageUrl: string): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
    })
  }

  /**
   * Search profiles with filters and pagination
   */
  static async searchProfiles(
    filters: SearchFilters,
    pagination: Pagination,
    options: SearchOptions = {}
  ): Promise<ApiResponse<SearchResults>> {
    const params = new URLSearchParams()
    
    // Add filters to params
    if (filters.query) params.append('query', filters.query)
    if (filters.role) params.append('role', filters.role)
    if (filters.location) params.append('location', filters.location)
    if (filters.experience_level) params.append('experience_level', filters.experience_level)
    if (filters.specialties?.length) params.append('specialties', filters.specialties.join(','))
    if (filters.travel_availability !== undefined) params.append('travel_availability', filters.travel_availability.toString())
    if (filters.studio_access) params.append('studio_access', filters.studio_access)
    if (filters.budget_range) params.append('budget_range', filters.budget_range)

    // Add pagination
    params.append('page', pagination.page.toString())
    params.append('limit', pagination.limit.toString())

    // Add sorting options
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortOrder) params.append('sortOrder', options.sortOrder)

    return this.makeRequest<SearchResults>(`/api/search?${params.toString()}`)
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(
    query: string,
    type?: 'profile' | 'location' | 'specialty',
    limit: number = 10
  ): Promise<ApiResponse<SearchSuggestion[]>> {
    const params = new URLSearchParams()
    params.append('q', query)
    if (type) params.append('type', type)
    params.append('limit', limit.toString())

    return this.makeRequest<SearchSuggestion[]>(`/api/search/suggestions?${params.toString()}`)
  }

  /**
   * Get featured profiles for homepage
   */
  static async getFeaturedProfiles(limit: number = 12): Promise<ApiResponse<Profile[]>> {
    return this.makeRequest<Profile[]>(`/api/search?sortBy=score&limit=${limit}`)
  }

  /**
   * Get profiles by role
   */
  static async getProfilesByRole(role: UserRole, limit: number = 20): Promise<ApiResponse<Profile[]>> {
    return this.makeRequest<Profile[]>(`/api/search?role=${role}&limit=${limit}&sortBy=recent`)
  }
}