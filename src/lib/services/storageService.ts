import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'

export interface ImageUploadOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ImageUploadResult {
  url: string
  path: string
  width?: number
  height?: number
  size: number
}

export class StorageService {
  private static readonly BUCKET_NAME = 'profile-images'
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  /**
   * Upload an image file to Supabase Storage
   */
  static async uploadImage(
    file: File,
    path: string,
    options: ImageUploadOptions = {}
  ): Promise<ApiResponse<ImageUploadResult>> {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return {
          error: {
            code: validation.error!.code,
            message: validation.error!.message
          }
        }
      }

      // Process image if needed
      const processedFile = await this.processImage(file, options)

      // Generate unique filename
      const fileName = this.generateFileName(path, processedFile.name)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        return {
          error: {
            code: error.message.includes('already exists') ? 'FILE_EXISTS' : 'UPLOAD_ERROR',
            message: this.getStorageErrorMessage(error.message)
          }
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path)

      // Get image dimensions if possible
      const dimensions = await this.getImageDimensions(processedFile)

      return {
        data: {
          url: publicUrl,
          path: data.path,
          width: dimensions?.width,
          height: dimensions?.height,
          size: processedFile.size
        }
      }
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
  static async deleteImage(path: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path])

      if (error) {
        console.error('Storage delete error:', error)
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
   * Delete an image by URL
   */
  static async deleteImageByUrl(imageUrl: string): Promise<ApiResponse<boolean>> {
    try {
      const path = this.extractPathFromUrl(imageUrl)
      if (!path) {
        return {
          error: {
            code: 'INVALID_URL',
            message: 'URL de imagen inválida'
          }
        }
      }

      return await this.deleteImage(path)
    } catch (error) {
      console.error('Image deletion by URL error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al eliminar la imagen'
        }
      }
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: File[],
    basePath: string,
    options: ImageUploadOptions = {}
  ): Promise<ApiResponse<ImageUploadResult[]>> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, `${basePath}/${index}`, options)
      )

      const results = await Promise.all(uploadPromises)
      
      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        // If some uploads failed, clean up successful ones
        const successfulUploads = results.filter(result => result.data)
        await Promise.all(
          successfulUploads.map(result => 
            this.deleteImageByUrl(result.data!.url)
          )
        )

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
      console.error('Multiple images upload error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al subir las imágenes'
        }
      }
    }
  }

  /**
   * Get signed URL for private images (if needed in the future)
   */
  static async getSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Signed URL error:', error)
        return {
          error: {
            code: 'SIGNED_URL_ERROR',
            message: 'Error al generar URL firmada'
          }
        }
      }

      return { data: data.signedUrl }
    } catch (error) {
      console.error('Signed URL generation error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al generar URL'
        }
      }
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { isValid: boolean; error?: { code: string; message: string } } {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Solo se permiten archivos JPG, PNG y WebP'
        }
      }
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo no puede exceder 5MB'
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Process image (resize, compress, convert format)
   */
  private static async processImage(
    file: File,
    options: ImageUploadOptions
  ): Promise<File> {
    // For now, return the original file
    // In the future, we could add image processing here using canvas or a library
    return file
  }

  /**
   * Generate unique filename
   */
  private static generateFileName(basePath: string, originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    
    return `${basePath}/${timestamp}_${random}.${extension}`
  }

  /**
   * Extract storage path from public URL
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME)
      
      if (bucketIndex === -1) {
        return null
      }

      return pathParts.slice(bucketIndex + 1).join('/')
    } catch {
      return null
    }
  }

  /**
   * Get image dimensions
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      
      img.src = url
    })
  }

  /**
   * Convert storage error messages to user-friendly Spanish
   */
  private static getStorageErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'The resource already exists': 'El archivo ya existe',
      'Invalid file type': 'Tipo de archivo inválido',
      'File too large': 'Archivo demasiado grande',
      'Bucket not found': 'Almacenamiento no encontrado',
      'Access denied': 'Acceso denegado',
      'Network error': 'Error de conexión'
    }

    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return value
      }
    }

    return 'Error al procesar la imagen'
  }

  /**
   * Get storage usage for a user (useful for quota management)
   */
  static async getStorageUsage(userId: string): Promise<ApiResponse<{ totalSize: number; fileCount: number }>> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('Storage usage error:', error)
        return {
          error: {
            code: 'STORAGE_USAGE_ERROR',
            message: 'Error al obtener uso de almacenamiento'
          }
        }
      }

      const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
      const fileCount = data.length

      return {
        data: {
          totalSize,
          fileCount
        }
      }
    } catch (error) {
      console.error('Storage usage calculation error:', error)
      return {
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Error inesperado al calcular uso de almacenamiento'
        }
      }
    }
  }
}