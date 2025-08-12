'use client'

import { useState } from 'react'
import { Button, FileUpload, OptimizedImage } from '@/components/ui'
import { ProfileApi } from '@/lib/api/profileApi'
import { ValidationService } from '@/lib/services'
import { useAuth } from '@/contexts/AuthContext'
import { PortfolioImage } from '@/types'
import { cn } from '@/lib/utils'

interface PortfolioManagerProps {
  images: PortfolioImage[]
  onImagesChange: (images: PortfolioImage[]) => void
  maxImages?: number
  loading?: boolean
}

interface ImageWithPreview extends PortfolioImage {
  isNew?: boolean
  file?: File
  preview?: string
}

export default function PortfolioManager({ 
  images, 
  onImagesChange, 
  maxImages = 20,
  loading = false 
}: PortfolioManagerProps) {
  const { user } = useAuth()
  const [portfolioImages, setPortfolioImages] = useState<ImageWithPreview[]>(
    images.map(img => ({ ...img, isNew: false }))
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)


  const handleFileSelect = async (files: File[]) => {
    if (!user) {
      setUploadError('Usuario no autenticado')
      return
    }

    if (portfolioImages.length + files.length > maxImages) {
      setUploadError(`Solo puedes tener máximo ${maxImages} imágenes en tu portfolio`)
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate files
      for (const file of files) {
        const validation = ValidationService.validateFileUpload(file, 'portfolio')
        if (!validation.isValid) {
          setUploadError(validation.errors[0].message)
          return
        }
      }

      // Upload files and add to database
      const uploadResults = await ProfileApi.uploadMultipleImages(files, 'portfolio')

      if (uploadResults.error) {
        setUploadError(uploadResults.error.message)
        return
      }

      // Add images to database
      const portfolioData = uploadResults.data!.map((result, index) => ({
        image_url: result.url,
        alt_text: '',
        sort_order: portfolioImages.length + index + 1
      }))

      const addResult = await ProfileApi.addPortfolioImages(portfolioData)

      if (addResult.error) {
        // Clean up uploaded files if database insertion fails
        await Promise.all(
          uploadResults.data!.map(result => 
            ProfileApi.deleteImage(result.url)
          )
        )
        setUploadError(addResult.error.message)
        return
      }

      // Update local state
      const newImages = addResult.data!.map(img => ({ ...img, isNew: false }))
      const updatedImages = [...portfolioImages, ...newImages]
      setPortfolioImages(updatedImages)
      onImagesChange(updatedImages)

    } catch (error) {
      console.error('Error uploading files:', error)
      setUploadError('Error inesperado al subir las imágenes')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex || !user) {
      return
    }

    const newImages = [...portfolioImages]
    const draggedImage = newImages[draggedIndex]
    
    if (!draggedImage) return
    
    // Remove dragged image
    newImages.splice(draggedIndex, 1)
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newImages.splice(insertIndex, 0, draggedImage)
    
    // Update sort orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index + 1
    }))

    // Update local state immediately for better UX
    setPortfolioImages(updatedImages)
    onImagesChange(updatedImages)
    setDraggedIndex(null)
    setDragOverIndex(null)

    // Update sort orders in database
    try {
      const imageOrders = updatedImages.map(img => ({
        id: img.id,
        sort_order: img.sort_order
      }))

      const result = await ProfileApi.reorderPortfolioImages(imageOrders)
      
      if (result.error) {
        setUploadError(result.error.message)
        // Revert local state on error
        setPortfolioImages(portfolioImages)
        onImagesChange(portfolioImages)
      }
    } catch (error) {
      console.error('Error reordering images:', error)
      setUploadError('Error al reordenar las imágenes')
      // Revert local state on error
      setPortfolioImages(portfolioImages)
      onImagesChange(portfolioImages)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return
    }

    try {
      const result = await ProfileApi.deletePortfolioImage(imageId)
      
      if (result.error) {
        setUploadError(result.error.message)
        return
      }

      // Update local state
      const updatedImages = portfolioImages
        .filter(img => img.id !== imageId)
        .map((img, index) => ({
          ...img,
          sort_order: index + 1
        }))

      setPortfolioImages(updatedImages)
      onImagesChange(updatedImages)
      setSelectedImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })

    } catch (error) {
      console.error('Error deleting image:', error)
      setUploadError('Error al eliminar la imagen')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return

    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedImages.size} imagen(es)?`)) {
      return
    }

    try {
      // Delete all selected images
      const deletePromises = Array.from(selectedImages).map(imageId =>
        ProfileApi.deletePortfolioImage(imageId)
      )

      const results = await Promise.all(deletePromises)
      
      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        setUploadError(`Error al eliminar ${errors.length} imagen(es)`)
        return
      }

      // Update local state
      const updatedImages = portfolioImages
        .filter(img => !selectedImages.has(img.id))
        .map((img, index) => ({
          ...img,
          sort_order: index + 1
        }))

      setPortfolioImages(updatedImages)
      onImagesChange(updatedImages)
      setSelectedImages(new Set())

    } catch (error) {
      console.error('Error deleting selected images:', error)
      setUploadError('Error al eliminar las imágenes seleccionadas')
    }
  }

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(imageId)) {
        newSet.delete(imageId)
      } else {
        newSet.add(imageId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedImages.size === portfolioImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(portfolioImages.map(img => img.id)))
    }
  }

  const handleAltTextChange = async (imageId: string, altText: string) => {
    // Validate alt text
    const validation = ValidationService.validatePortfolioImageData({ alt_text: altText, sort_order: 1 })
    if (!validation.isValid) {
      setUploadError(validation.errors[0].message)
      return
    }

    // Update local state immediately
    const updatedImages = portfolioImages.map(img =>
      img.id === imageId ? { ...img, alt_text: altText } : img
    )
    setPortfolioImages(updatedImages)
    onImagesChange(updatedImages)

    // Update in database (debounced)
    try {
      const result = await ProfileApi.updatePortfolioImage(imageId, { alt_text: altText })
      
      if (result.error) {
        setUploadError(result.error.message)
      }
    } catch (error) {
      console.error('Error updating alt text:', error)
      setUploadError('Error al actualizar la descripción')
    }
  }

  const getImageUrl = (image: ImageWithPreview) => {
    return image.preview || image.image_url
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {uploadError && (
        <div className="rounded-lg bg-error-50 border border-error-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-error-600">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="text-error-400 hover:text-error-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-secondary-900">
            Portfolio ({portfolioImages.length}/{maxImages})
          </h3>
          <p className="text-sm text-secondary-600">
            Arrastra las imágenes para reordenarlas
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedImages.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedImages.size === portfolioImages.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="text-error-600 border-error-300 hover:bg-error-50"
              >
                Eliminar seleccionadas ({selectedImages.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload Area */}
      {portfolioImages.length < maxImages && (
        <FileUpload
          label="Agregar imágenes al portfolio"
          accept="image/*"
          multiple
          maxSize={5}
          onFileSelect={handleFileSelect}
          disabled={loading || isUploading}
          helperText={`Puedes subir hasta ${maxImages - portfolioImages.length} imágenes más. JPG o PNG, máximo 5MB cada una.`}
        />
      )}

      {/* Portfolio Grid */}
      {portfolioImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolioImages.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                'relative group bg-white rounded-lg border-2 transition-all duration-200 cursor-move',
                draggedIndex === index && 'opacity-50 scale-95',
                dragOverIndex === index && draggedIndex !== index && 'border-primary-400 bg-primary-50',
                selectedImages.has(image.id) && 'border-primary-500 bg-primary-50',
                'border-secondary-200 hover:border-secondary-300'
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.has(image.id)}
                  onChange={() => handleImageSelect(image.id)}
                  className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Sort order indicator */}
              <div className="absolute top-2 right-2 z-10 bg-secondary-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {image.sort_order}
              </div>

              {/* Image */}
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <OptimizedImage
                  src={getImageUrl(image)}
                  alt={image.alt_text || `Portfolio image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={85}
                  priority={index < 4} // Prioritize first 4 images
                  placeholder="blur"
                />
              </div>

              {/* Image controls */}
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                  placeholder="Descripción de la imagen..."
                  className="w-full text-xs border border-secondary-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary-500">
                    {image.isNew ? 'Nueva' : 'Guardada'}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(image.id)
                    }}
                    className="text-error-500 hover:text-error-700 p-1"
                    title="Eliminar imagen"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v1H4V5zM3 8a1 1 0 011-1h12a1 1 0 110 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Loading overlay for new images */}
              {image.isNew && isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <svg className="animate-spin h-6 w-6 text-primary-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-secondary-600">Subiendo...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-secondary-300 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-secondary-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-sm font-medium text-secondary-900 mb-1">
            No hay imágenes en tu portfolio
          </h3>
          <p className="text-sm text-secondary-500">
            Sube tus mejores trabajos para mostrar tu talento
          </p>
        </div>
      )}

      {/* Instructions */}
      {portfolioImages.length > 0 && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-secondary-900 mb-2">
            Instrucciones:
          </h4>
          <ul className="text-sm text-secondary-600 space-y-1">
            <li>• Arrastra las imágenes para cambiar el orden</li>
            <li>• Haz clic en el checkbox para seleccionar múltiples imágenes</li>
            <li>• Agrega descripciones para mejorar la accesibilidad</li>
            <li>• Las imágenes se muestran en el orden que definas</li>
          </ul>
        </div>
      )}
    </div>
  )
}