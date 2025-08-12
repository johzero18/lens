import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface FileUploadProps {
  label?: string
  error?: string
  helperText?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect: (files: File[]) => void
  disabled?: boolean
  className?: string
  preview?: boolean
  currentImage?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  className,
  label,
  error,
  helperText,
  accept = 'image/*',
  multiple = false,
  maxSize = 5,
  onFileSelect,
  disabled = false,
  preview = false,
  currentImage,
}) => {
    const [dragActive, setDragActive] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFiles = (files: FileList | null) => {
      if (!files) return

      const fileArray = Array.from(files)
      const validFiles: File[] = []

      fileArray.forEach(file => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          return
        }

        // Check file type
        if (accept && !file.type.match(accept.replace('*', '.*'))) {
          return
        }

        validFiles.push(file)
      })

      if (validFiles.length > 0) {
        onFileSelect(validFiles)

        // Create preview for single image
        if (preview && validFiles.length === 1 && validFiles[0]?.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string)
          }
          reader.readAsDataURL(validFiles[0])
        }
      }
    }

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (disabled) return

      handleFiles(e.dataTransfer.files)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    }

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    const removePreview = () => {
      setPreviewUrl(null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <div className="space-y-4">
        {preview && previewUrl && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-secondary-300"
            />
            <button
              type="button"
              onClick={removePreview}
              className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : error
              ? 'border-error-300 bg-error-50'
              : 'border-secondary-300 hover:border-secondary-400 hover:bg-secondary-50',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          
          <div className="text-center">
            <svg
              className={cn(
                'mx-auto h-12 w-12 mb-4',
                error ? 'text-error-400' : 'text-secondary-400'
              )}
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
            
            <div className="text-sm text-secondary-600">
              <span className="font-medium text-primary-600 hover:text-primary-500">
                Haz clic para subir
              </span>{' '}
              o arrastra y suelta
            </div>
            
            <p className="text-xs text-secondary-500 mt-1">
              {accept.includes('image') ? 'PNG, JPG, GIF' : 'Archivos permitidos'} hasta {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {(error || helperText) && (
        <p
          className={cn(
            'mt-2 text-sm',
            error ? 'text-error-600' : 'text-secondary-500'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

FileUpload.displayName = 'FileUpload'

export default FileUpload