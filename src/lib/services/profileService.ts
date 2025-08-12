import { supabase } from '@/lib/supabase'
import { 
  Profile, 
  PortfolioImage, 
  RoleSpecificData,
  DatabaseProfile,
  DatabasePortfolioImage,
  ApiResponse 
} from '@/types'

export interface ProfileUpdateData {
  full_name?: string
  bio?: string
  location?: string
  avatar_url?: string
  cover_image_url?: string
  role_specific_data?: RoleSpecificData
}

export interface PortfolioImageData {
  image_url: string
  alt_text?: string
  sort_order: number
}

export class ProfileService {
  /**
   * Get a profile by username
   */
  static async getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return {
          error: {
            code: error.code || 'PROFILE_FETCH_ERROR',
            message: error.message || 'Error al obtener el perfil'
          }
        }
      }

      if (!data) {
        return {
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'Perfil no encontrado'
          }
        }
      }

      // Transform database data to Profile type
      const profile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        portfolio_images: (data.portfolio_images || [])
          .map((img: DatabasePortfolioImage) => ({
            ...img,
            created_at: new Date(img.created_at)
          }))
          .sort((a: PortfolioImage, b: PortfolioImage) => a.sort_order - b.sort_order)
      }

      return { data: profile }
    } catch (error) {
      console.error('Profile fetch error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al obtener el perfil'
        }
      }
    }
  }

  /**
   * Get a profile by user ID
   */
  static async getProfileById(userId: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return {
          error: {
            code: error.code || 'PROFILE_FETCH_ERROR',
            message: error.message || 'Error al obtener el perfil'
          }
        }
      }

      if (!data) {
        return {
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'Perfil no encontrado'
          }
        }
      }

      // Transform database data to Profile type
      const profile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        portfolio_images: (data.portfolio_images || [])
          .map((img: DatabasePortfolioImage) => ({
            ...img,
            created_at: new Date(img.created_at)
          }))
          .sort((a: PortfolioImage, b: PortfolioImage) => a.sort_order - b.sort_order)
      }

      return { data: profile }
    } catch (error) {
      console.error('Profile fetch error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al obtener el perfil'
        }
      }
    }
  }

  /**
   * Update a user's profile
   */
  static async updateProfile(
    userId: string, 
    updateData: ProfileUpdateData
  ): Promise<ApiResponse<Profile>> {
    try {
      // Validate required fields
      if (updateData.full_name && updateData.full_name.trim().length < 2) {
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El nombre debe tener al menos 2 caracteres',
            field: 'full_name'
          }
        }
      }

      if (updateData.bio && updateData.bio.trim().length < 10) {
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La biografía debe tener al menos 10 caracteres',
            field: 'bio'
          }
        }
      }

      if (updateData.location && updateData.location.trim().length < 2) {
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La ubicación es requerida',
            field: 'location'
          }
        }
      }

      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select(`
          *,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return {
          error: {
            code: error.code || 'PROFILE_UPDATE_ERROR',
            message: error.message || 'Error al actualizar el perfil'
          }
        }
      }

      // Transform database data to Profile type
      const profile: Profile = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        portfolio_images: (data.portfolio_images || [])
          .map((img: DatabasePortfolioImage) => ({
            ...img,
            created_at: new Date(img.created_at)
          }))
          .sort((a: PortfolioImage, b: PortfolioImage) => a.sort_order - b.sort_order)
      }

      return { data: profile }
    } catch (error) {
      console.error('Profile update error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al actualizar el perfil'
        }
      }
    }
  }

  /**
   * Upload an image to Supabase Storage
   */
  static async uploadImage(
    file: File,
    type: 'avatar' | 'cover' | 'portfolio',
    userId: string
  ): Promise<ApiResponse<string>> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Solo se permiten archivos de imagen'
          }
        }
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        return {
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'El archivo no puede exceder 5MB'
          }
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        return {
          error: {
            code: error.message.includes('already exists') ? 'FILE_EXISTS' : 'UPLOAD_ERROR',
            message: error.message || 'Error al subir la imagen'
          }
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path)

      return { data: publicUrl }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al subir la imagen'
        }
      }
    }
  }

  /**
   * Delete an image from Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<ApiResponse<boolean>> {
    try {
      // Extract path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'profile-images')
      
      if (bucketIndex === -1) {
        return {
          error: {
            code: 'INVALID_URL',
            message: 'URL de imagen inválida'
          }
        }
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase.storage
        .from('profile-images')
        .remove([filePath])

      if (error) {
        console.error('Error deleting image:', error)
        return {
          error: {
            code: 'DELETE_ERROR',
            message: 'Error al eliminar la imagen'
          }
        }
      }

      return { data: true }
    } catch (error) {
      console.error('Image deletion error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al eliminar la imagen'
        }
      }
    }
  }

  /**
   * Add images to portfolio
   */
  static async addPortfolioImages(
    userId: string,
    images: PortfolioImageData[]
  ): Promise<ApiResponse<PortfolioImage[]>> {
    try {
      const imagesToInsert = images.map(img => ({
        profile_id: userId,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order
      }))

      const { data, error } = await supabase
        .from('portfolio_images')
        .insert(imagesToInsert)
        .select()

      if (error) {
        console.error('Error adding portfolio images:', error)
        return {
          error: {
            code: error.code || 'PORTFOLIO_ADD_ERROR',
            message: error.message || 'Error al agregar imágenes al portfolio'
          }
        }
      }

      const portfolioImages: PortfolioImage[] = data.map((img: DatabasePortfolioImage) => ({
        ...img,
        created_at: new Date(img.created_at)
      }))

      return { data: portfolioImages }
    } catch (error) {
      console.error('Portfolio images add error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al agregar imágenes'
        }
      }
    }
  }

  /**
   * Update portfolio image
   */
  static async updatePortfolioImage(
    imageId: string,
    updateData: Partial<PortfolioImageData>
  ): Promise<ApiResponse<PortfolioImage>> {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .update(updateData)
        .eq('id', imageId)
        .select()
        .single()

      if (error) {
        console.error('Error updating portfolio image:', error)
        return {
          error: {
            code: error.code || 'PORTFOLIO_UPDATE_ERROR',
            message: error.message || 'Error al actualizar imagen del portfolio'
          }
        }
      }

      const portfolioImage: PortfolioImage = {
        ...data,
        created_at: new Date(data.created_at)
      }

      return { data: portfolioImage }
    } catch (error) {
      console.error('Portfolio image update error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al actualizar imagen'
        }
      }
    }
  }

  /**
   * Delete portfolio image
   */
  static async deletePortfolioImage(imageId: string): Promise<ApiResponse<boolean>> {
    try {
      // First get the image to delete from storage
      const { data: imageData, error: fetchError } = await supabase
        .from('portfolio_images')
        .select('image_url')
        .eq('id', imageId)
        .single()

      if (fetchError) {
        console.error('Error fetching image for deletion:', fetchError)
        return {
          error: {
            code: 'IMAGE_NOT_FOUND',
            message: 'Imagen no encontrada'
          }
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId)

      if (dbError) {
        console.error('Error deleting portfolio image from DB:', dbError)
        return {
          error: {
            code: dbError.code || 'PORTFOLIO_DELETE_ERROR',
            message: dbError.message || 'Error al eliminar imagen del portfolio'
          }
        }
      }

      // Delete from storage
      if (imageData.image_url) {
        await this.deleteImage(imageData.image_url)
      }

      return { data: true }
    } catch (error) {
      console.error('Portfolio image deletion error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al eliminar imagen'
        }
      }
    }
  }

  /**
   * Reorder portfolio images
   */
  static async reorderPortfolioImages(
    userId: string,
    imageOrders: { id: string; sort_order: number }[]
  ): Promise<ApiResponse<boolean>> {
    try {
      // Update all images in a transaction-like manner
      const updates = imageOrders.map(({ id, sort_order }) =>
        supabase
          .from('portfolio_images')
          .update({ sort_order })
          .eq('id', id)
          .eq('profile_id', userId) // Ensure user owns the image
      )

      const results = await Promise.all(updates)
      
      // Check if any updates failed
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        console.error('Error reordering portfolio images:', errors)
        return {
          error: {
            code: 'PORTFOLIO_REORDER_ERROR',
            message: 'Error al reordenar imágenes del portfolio'
          }
        }
      }

      return { data: true }
    } catch (error) {
      console.error('Portfolio reorder error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al reordenar imágenes'
        }
      }
    }
  }

  /**
   * Get portfolio images for a user
   */
  static async getPortfolioImages(userId: string): Promise<ApiResponse<PortfolioImage[]>> {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('profile_id', userId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching portfolio images:', error)
        return {
          error: {
            code: error.code || 'PORTFOLIO_FETCH_ERROR',
            message: error.message || 'Error al obtener imágenes del portfolio'
          }
        }
      }

      const portfolioImages: PortfolioImage[] = (data || []).map((img: DatabasePortfolioImage) => ({
        ...img,
        created_at: new Date(img.created_at)
      }))

      return { data: portfolioImages }
    } catch (error) {
      console.error('Portfolio images fetch error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al obtener imágenes'
        }
      }
    }
  }

  /**
   * Check if username is available (excluding current user)
   */
  static async checkUsernameAvailability(
    username: string, 
    excludeUserId?: string
  ): Promise<ApiResponse<boolean>> {
    try {
      let query = supabase
        .from('profiles')
        .select('id')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query.single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking username availability:', error)
        return {
          error: {
            code: 'USERNAME_CHECK_ERROR',
            message: 'Error al verificar disponibilidad del username'
          }
        }
      }

      // If we found a user with this username, it's not available
      const available = !data

      return { data: available }
    } catch (error) {
      console.error('Username availability check error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al verificar username'
        }
      }
    }
  }
}