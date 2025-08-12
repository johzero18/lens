'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Select, MultiSelect, FileUpload } from '@/components/ui'
import PortfolioManager from './PortfolioManager'
import { ProfileApi } from '@/lib/api/profileApi'
import { ValidationService } from '@/lib/services'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Profile, 
  ExperienceLevel, 
  ModelType, 
  PhotographySpecialty, 
  MakeupSpecialty, 
  StylistSpecialty, 
  ProducerSpecialty,
  StudioAccess,
  HairColor,
  EyeColor,
  BudgetRange,
  ModelData,
  PhotographerData,
  MakeupArtistData,
  StylistData,
  ProducerData
} from '@/types'

interface ProfileEditFormProps {
  profile: Profile
  onSubmit: (data: Partial<Profile>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface FormData {
  full_name: string
  bio: string
  location: string
  role_specific_data: ModelData | PhotographerData | MakeupArtistData | StylistData | ProducerData
}

interface FormErrors {
  [key: string]: string
}

export default function ProfileEditForm({ 
  profile, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ProfileEditFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    full_name: profile.full_name,
    bio: profile.bio,
    location: profile.location,
    role_specific_data: profile.role_specific_data
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [portfolioImages, setPortfolioImages] = useState(profile.portfolio_images)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track changes
  useEffect(() => {
    const hasFormChanges = 
      formData.full_name !== profile.full_name ||
      formData.bio !== profile.bio ||
      formData.location !== profile.location ||
      JSON.stringify(formData.role_specific_data) !== JSON.stringify(profile.role_specific_data) ||
      avatarFile !== null ||
      coverFile !== null ||
      JSON.stringify(portfolioImages) !== JSON.stringify(profile.portfolio_images)

    setHasChanges(hasFormChanges)
  }, [formData, profile, avatarFile, coverFile, portfolioImages])

  const validateField = (field: string, value: string | number) => {
    const newErrors = { ...errors }
    const stringValue = String(value)

    let validation
    switch (field) {
      case 'full_name':
        validation = ValidationService.validateFullName(stringValue)
        if (!validation.isValid) {
          newErrors.full_name = validation.errors[0].message
        } else {
          delete newErrors.full_name
        }
        break

      case 'bio':
        validation = ValidationService.validateBio(stringValue)
        if (!validation.isValid) {
          newErrors.bio = validation.errors[0].message
        } else {
          delete newErrors.bio
        }
        break

      case 'location':
        validation = ValidationService.validateLocation(stringValue)
        if (!validation.isValid) {
          newErrors.location = validation.errors[0].message
        } else {
          delete newErrors.location
        }
        break
    }

    setErrors(newErrors)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleRoleDataChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      role_specific_data: {
        ...prev.role_specific_data,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setErrors(prev => ({ ...prev, general: 'Usuario no autenticado' }))
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate all fields
      const profileValidation = ValidationService.validateProfileUpdate({
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        role_specific_data: formData.role_specific_data
      }, profile.role)

      if (!profileValidation.isValid) {
        const fieldErrors: FormErrors = {}
        profileValidation.errors.forEach(error => {
          fieldErrors[error.field] = error.message
        })
        setErrors(fieldErrors)
        return
      }

      // Prepare update data
      const updateData: any = {
        full_name: ValidationService.sanitizeText(formData.full_name),
        bio: ValidationService.sanitizeText(formData.bio),
        location: ValidationService.sanitizeText(formData.location),
        role_specific_data: formData.role_specific_data
      }

      // Handle avatar upload
      if (avatarFile) {
        const avatarValidation = ValidationService.validateFileUpload(avatarFile, 'avatar')
        if (!avatarValidation.isValid) {
          setErrors(prev => ({ ...prev, avatar: avatarValidation.errors[0].message }))
          return
        }

        const avatarUpload = await ProfileApi.uploadImage(avatarFile, 'avatar')

        if (avatarUpload.error) {
          setErrors(prev => ({ ...prev, avatar: avatarUpload.error!.message }))
          return
        }

        updateData.avatar_url = avatarUpload.data!.url
      }

      // Handle cover image upload
      if (coverFile) {
        const coverValidation = ValidationService.validateFileUpload(coverFile, 'cover')
        if (!coverValidation.isValid) {
          setErrors(prev => ({ ...prev, cover: coverValidation.errors[0].message }))
          return
        }

        const coverUpload = await ProfileApi.uploadImage(coverFile, 'cover')

        if (coverUpload.error) {
          setErrors(prev => ({ ...prev, cover: coverUpload.error!.message }))
          return
        }

        updateData.cover_image_url = coverUpload.data!.url
      }

      // Update profile
      const result = await ProfileApi.updateProfile(updateData)

      if (result.error) {
        setErrors(prev => ({ ...prev, general: result.error!.message }))
        return
      }

      // Call the parent onSubmit with the updated profile
      await onSubmit(result.data!)
      
    } catch (error) {
      console.error('Profile update error:', error)
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Error inesperado al actualizar el perfil'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRoleSpecificFields = () => {
    switch (profile.role) {
      case 'model':
        return <ModelFields data={formData.role_specific_data as ModelData} onChange={handleRoleDataChange} />
      case 'photographer':
        return <PhotographerFields data={formData.role_specific_data as PhotographerData} onChange={handleRoleDataChange} />
      case 'makeup_artist':
        return <MakeupArtistFields data={formData.role_specific_data as MakeupArtistData} onChange={handleRoleDataChange} />
      case 'stylist':
        return <StylistFields data={formData.role_specific_data as StylistData} onChange={handleRoleDataChange} />
      case 'producer':
        return <ProducerFields data={formData.role_specific_data as ProducerData} onChange={handleRoleDataChange} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            Editar Perfil
          </h2>
          <p className="text-sm text-secondary-600 mt-1">
            Actualiza tu información profesional y portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {errors.general && (
            <div className="rounded-lg bg-error-50 border border-error-200 p-4">
              <p className="text-sm text-error-600">{errors.general}</p>
            </div>
          )}

          {/* Image Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Imágenes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Foto de perfil"
                accept="image/*"
                maxSize={5}
                preview
                currentImage={profile.avatar_url}
                onFileSelect={(files) => setAvatarFile(files[0] || null)}
                helperText="JPG o PNG, máximo 5MB. Recomendado: 400x400px"
                error={errors.avatar}
              />

              <FileUpload
                label="Imagen de portada"
                accept="image/*"
                maxSize={5}
                preview
                currentImage={profile.cover_image_url}
                onFileSelect={(files) => setCoverFile(files[0] || null)}
                helperText="JPG o PNG, máximo 5MB. Recomendado: 1200x300px"
                error={errors.cover}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre completo"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={errors.full_name}
                placeholder="Tu nombre completo"
                required
              />

              <Input
                label="Ubicación"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={errors.location}
                placeholder="Ciudad, País"
                required
              />
            </div>

            <Textarea
              label="Biografía"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              error={errors.bio}
              placeholder="Cuéntanos sobre tu experiencia y especialidades..."
              rows={4}
              maxLength={500}
              helperText={`${formData.bio.length}/500 caracteres`}
              required
            />
          </div>

          {/* Role-specific fields */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">
              Información Profesional
            </h3>
            {renderRoleSpecificFields()}
          </div>

          {/* Portfolio Management */}
          <div className="space-y-6">
            <PortfolioManager
              images={portfolioImages}
              onImagesChange={setPortfolioImages}
              maxImages={20}
              loading={loading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>

            <div className="flex items-center space-x-4">
              {hasChanges && (
                <span className="text-sm text-secondary-600">
                  Tienes cambios sin guardar
                </span>
              )}
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !hasChanges || Object.keys(errors).length > 0}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Role-specific field components
interface ModelFieldsProps {
  data: ModelData
  onChange: (field: string, value: unknown) => void
}

interface PhotographerFieldsProps {
  data: PhotographerData
  onChange: (field: string, value: unknown) => void
}

interface MakeupArtistFieldsProps {
  data: MakeupArtistData
  onChange: (field: string, value: unknown) => void
}

interface StylistFieldsProps {
  data: StylistData
  onChange: (field: string, value: unknown) => void
}

interface ProducerFieldsProps {
  data: ProducerData
  onChange: (field: string, value: unknown) => void
}

function ModelFields({ data, onChange }: ModelFieldsProps) {
  const modelTypeOptions = Object.values(ModelType).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }))

  const experienceLevelOptions = Object.values(ExperienceLevel).map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }))

  const hairColorOptions = Object.values(HairColor).map(color => ({
    value: color,
    label: color.charAt(0).toUpperCase() + color.slice(1)
  }))

  const eyeColorOptions = Object.values(EyeColor).map(color => ({
    value: color,
    label: color.charAt(0).toUpperCase() + color.slice(1)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Tipo de modelo"
          options={modelTypeOptions}
          value={data.model_type || []}
          onChange={(values) => onChange('model_type', values)}
          placeholder="Selecciona tipos de modelaje..."
          helperText="Puedes seleccionar múltiples opciones"
        />

        <Select
          label="Nivel de experiencia"
          options={experienceLevelOptions}
          value={data.experience_level || ''}
          onChange={(value) => onChange('experience_level', value)}
          placeholder="Selecciona tu nivel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Altura (cm)"
          type="number"
          value={data.height_cm || ''}
          onChange={(e) => onChange('height_cm', parseInt(e.target.value) || 0)}
          placeholder="175"
          min="140"
          max="220"
        />

        <Select
          label="Color de cabello"
          options={hairColorOptions}
          value={data.hair_color || ''}
          onChange={(value) => onChange('hair_color', value)}
          placeholder="Selecciona color"
        />

        <Select
          label="Color de ojos"
          options={eyeColorOptions}
          value={data.eye_color || ''}
          onChange={(value) => onChange('eye_color', value)}
          placeholder="Selecciona color"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-secondary-900">Medidas</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Busto (cm)"
            type="number"
            value={data.measurements?.bust_cm || ''}
            onChange={(e) => onChange('measurements', { 
              ...data.measurements, 
              bust_cm: parseInt(e.target.value) || 0 
            })}
            placeholder="86"
          />

          <Input
            label="Cintura (cm)"
            type="number"
            value={data.measurements?.waist_cm || ''}
            onChange={(e) => onChange('measurements', { 
              ...data.measurements, 
              waist_cm: parseInt(e.target.value) || 0 
            })}
            placeholder="61"
          />

          <Input
            label="Cadera (cm)"
            type="number"
            value={data.measurements?.hips_cm || ''}
            onChange={(e) => onChange('measurements', { 
              ...data.measurements, 
              hips_cm: parseInt(e.target.value) || 0 
            })}
            placeholder="89"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Talla de calzado (EU)"
          type="number"
          value={data.shoe_size_eu || ''}
          onChange={(e) => onChange('shoe_size_eu', parseInt(e.target.value) || 0)}
          placeholder="38"
          min="35"
          max="50"
        />

        <Input
          label="Talla de vestido (EU)"
          type="number"
          value={data.dress_size_eu || ''}
          onChange={(e) => onChange('dress_size_eu', parseInt(e.target.value) || 0)}
          placeholder="36"
          min="32"
          max="50"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-secondary-900">Características especiales</h4>
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.special_attributes?.tattoos || false}
              onChange={(e) => onChange('special_attributes', {
                ...data.special_attributes,
                tattoos: e.target.checked
              })}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-secondary-700">Tatuajes</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.special_attributes?.piercings || false}
              onChange={(e) => onChange('special_attributes', {
                ...data.special_attributes,
                piercings: e.target.checked
              })}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-secondary-700">Piercings</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea
          label="Idiomas"
          value={data.languages?.join(', ') || ''}
          onChange={(e) => onChange('languages', e.target.value.split(',').map(lang => lang.trim()).filter(Boolean))}
          placeholder="Español, Inglés, Francés..."
          rows={2}
          helperText="Separa los idiomas con comas"
        />

        <Textarea
          label="Disponibilidad"
          value={data.availability || ''}
          onChange={(e) => onChange('availability', e.target.value)}
          placeholder="Lunes a viernes, fines de semana..."
          rows={2}
        />
      </div>
    </div>
  )
}

function PhotographerFields({ data, onChange }: PhotographerFieldsProps) {
  const specialtyOptions = Object.values(PhotographySpecialty).map(specialty => ({
    value: specialty,
    label: specialty.charAt(0).toUpperCase() + specialty.slice(1)
  }))

  const experienceLevelOptions = Object.values(ExperienceLevel).map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }))

  const studioAccessOptions = Object.values(StudioAccess).map(access => ({
    value: access,
    label: access.replace('_', ' ').charAt(0).toUpperCase() + access.replace('_', ' ').slice(1)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Especialidades"
          options={specialtyOptions}
          value={data.specialties || []}
          onChange={(values) => onChange('specialties', values)}
          placeholder="Selecciona especialidades..."
          helperText="Puedes seleccionar múltiples opciones"
        />

        <Select
          label="Nivel de experiencia"
          options={experienceLevelOptions}
          value={data.experience_level || ''}
          onChange={(value) => onChange('experience_level', value)}
          placeholder="Selecciona tu nivel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Acceso a estudio"
          options={studioAccessOptions}
          value={data.studio_access || ''}
          onChange={(value) => onChange('studio_access', value)}
          placeholder="Selecciona tipo de acceso"
        />

        <Input
          label="Años de experiencia"
          type="number"
          value={data.years_experience || ''}
          onChange={(e) => onChange('years_experience', parseInt(e.target.value) || 0)}
          placeholder="5"
          min="0"
          max="50"
        />
      </div>

      <Textarea
        label="Equipo destacado"
        value={data.equipment_highlights || ''}
        onChange={(e) => onChange('equipment_highlights', e.target.value)}
        placeholder="Canon R5, Sony A7R IV, iluminación Profoto..."
        rows={3}
        helperText="Describe tu equipo principal de fotografía"
      />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Habilidades de postproducción
        </label>
        <Textarea
          value={data.post_production_skills?.join(', ') || ''}
          onChange={(e) => onChange('post_production_skills', e.target.value.split(',').map(skill => skill.trim()).filter(Boolean))}
          placeholder="Adobe Lightroom, Photoshop, Capture One..."
          rows={2}
          helperText="Separa las habilidades con comas"
        />
      </div>

      <Input
        label="URL del portfolio"
        type="url"
        value={data.portfolio_url || ''}
        onChange={(e) => onChange('portfolio_url', e.target.value)}
        placeholder="https://tu-portfolio.com"
        helperText="Enlace a tu portfolio externo (opcional)"
      />
    </div>
  )
}

function MakeupArtistFields({ data, onChange }: MakeupArtistFieldsProps) {
  const specialtyOptions = Object.values(MakeupSpecialty).map(specialty => ({
    value: specialty,
    label: specialty.charAt(0).toUpperCase() + specialty.slice(1)
  }))

  const experienceLevelOptions = Object.values(ExperienceLevel).map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Especialidades"
          options={specialtyOptions}
          value={data.specialties || []}
          onChange={(values) => onChange('specialties', values)}
          placeholder="Selecciona especialidades..."
          helperText="Puedes seleccionar múltiples opciones"
        />

        <Select
          label="Nivel de experiencia"
          options={experienceLevelOptions}
          value={data.experience_level || ''}
          onChange={(value) => onChange('experience_level', value)}
          placeholder="Selecciona tu nivel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Años de experiencia"
          type="number"
          value={data.years_experience || ''}
          onChange={(e) => onChange('years_experience', parseInt(e.target.value) || 0)}
          placeholder="5"
          min="0"
          max="50"
        />

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.travel_availability || false}
              onChange={(e) => onChange('travel_availability', e.target.checked)}
              className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-secondary-700">Disponible para viajar</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Marcas destacadas del kit
        </label>
        <Textarea
          value={data.kit_highlights?.join(', ') || ''}
          onChange={(e) => onChange('kit_highlights', e.target.value.split(',').map(brand => brand.trim()).filter(Boolean))}
          placeholder="MAC, NARS, Charlotte Tilbury, Fenty Beauty..."
          rows={2}
          helperText="Separa las marcas con comas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Servicios ofrecidos
        </label>
        <Textarea
          value={data.services_offered?.join(', ') || ''}
          onChange={(e) => onChange('services_offered', e.target.value.split(',').map(service => service.trim()).filter(Boolean))}
          placeholder="Maquillaje de día, noche, editorial, asesoramiento..."
          rows={2}
          helperText="Separa los servicios con comas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Certificaciones
        </label>
        <Textarea
          value={data.certifications?.join(', ') || ''}
          onChange={(e) => onChange('certifications', e.target.value.split(',').map(cert => cert.trim()).filter(Boolean))}
          placeholder="Certificación MAC, Curso de maquillaje editorial..."
          rows={2}
          helperText="Separa las certificaciones con comas (opcional)"
        />
      </div>
    </div>
  )
}

function StylistFields({ data, onChange }: StylistFieldsProps) {
  const specialtyOptions = Object.values(StylistSpecialty).map(specialty => ({
    value: specialty,
    label: specialty.charAt(0).toUpperCase() + specialty.slice(1)
  }))

  const experienceLevelOptions = Object.values(ExperienceLevel).map(level => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Especialidades"
          options={specialtyOptions}
          value={data.specialties || []}
          onChange={(values) => onChange('specialties', values)}
          placeholder="Selecciona especialidades..."
          helperText="Puedes seleccionar múltiples opciones"
        />

        <Select
          label="Nivel de experiencia"
          options={experienceLevelOptions}
          value={data.experience_level || ''}
          onChange={(value) => onChange('experience_level', value)}
          placeholder="Selecciona tu nivel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Años de experiencia"
          type="number"
          value={data.years_experience || ''}
          onChange={(e) => onChange('years_experience', parseInt(e.target.value) || 0)}
          placeholder="5"
          min="0"
          max="50"
        />

        <Input
          label="URL del portfolio"
          type="url"
          value={data.portfolio_url || ''}
          onChange={(e) => onChange('portfolio_url', e.target.value)}
          placeholder="https://tu-portfolio.com"
          helperText="Enlace a tu portfolio externo (opcional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Enfoque de industria
        </label>
        <Textarea
          value={data.industry_focus?.join(', ') || ''}
          onChange={(e) => onChange('industry_focus', e.target.value.split(',').map(focus => focus.trim()).filter(Boolean))}
          placeholder="Moda, Publicidad, Editorial, Música..."
          rows={2}
          helperText="Separa los enfoques con comas"
        />
      </div>

      <Textarea
        label="Acceso a vestuario"
        value={data.wardrobe_access || ''}
        onChange={(e) => onChange('wardrobe_access', e.target.value)}
        placeholder="Showroom propio, marcas asociadas, alquiler..."
        rows={2}
        helperText="Describe tu acceso a vestuario y marcas"
      />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Colaboraciones con marcas
        </label>
        <Textarea
          value={data.brand_partnerships?.join(', ') || ''}
          onChange={(e) => onChange('brand_partnerships', e.target.value.split(',').map(brand => brand.trim()).filter(Boolean))}
          placeholder="Zara, H&M, Nike, Adidas..."
          rows={2}
          helperText="Separa las marcas con comas (opcional)"
        />
      </div>
    </div>
  )
}

function ProducerFields({ data, onChange }: ProducerFieldsProps) {
  const specialtyOptions = Object.values(ProducerSpecialty).map(specialty => ({
    value: specialty,
    label: specialty.charAt(0).toUpperCase() + specialty.slice(1)
  }))

  const budgetRangeOptions = Object.values(BudgetRange).map(range => ({
    value: range,
    label: range.replace('_', ' ').charAt(0).toUpperCase() + range.replace('_', ' ').slice(1)
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MultiSelect
          label="Especialidades"
          options={specialtyOptions}
          value={data.specialties || []}
          onChange={(values) => onChange('specialties', values)}
          placeholder="Selecciona especialidades..."
          helperText="Puedes seleccionar múltiples opciones"
        />

        <Select
          label="Rango de presupuesto típico"
          options={budgetRangeOptions}
          value={data.typical_budget_range || ''}
          onChange={(value) => onChange('typical_budget_range', value)}
          placeholder="Selecciona rango"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Años de experiencia"
          type="number"
          value={data.years_experience || ''}
          onChange={(e) => onChange('years_experience', parseInt(e.target.value) || 0)}
          placeholder="5"
          min="0"
          max="50"
        />

        <Input
          label="URL del portfolio"
          type="url"
          value={data.portfolio_url || ''}
          onChange={(e) => onChange('portfolio_url', e.target.value)}
          placeholder="https://tu-portfolio.com"
          helperText="Enlace a tu portfolio externo (opcional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Servicios ofrecidos
        </label>
        <Textarea
          value={data.services?.join(', ') || ''}
          onChange={(e) => onChange('services', e.target.value.split(',').map(service => service.trim()).filter(Boolean))}
          placeholder="Producción integral, Casting, Locaciones, Coordinación..."
          rows={2}
          helperText="Separa los servicios con comas"
        />
      </div>

      <Input
        label="Tamaño del equipo"
        value={data.team_size || ''}
        onChange={(e) => onChange('team_size', e.target.value)}
        placeholder="5-10 personas, Equipo flexible..."
        helperText="Describe el tamaño típico de tu equipo"
      />

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Clientes destacados
        </label>
        <Textarea
          value={data.notable_clients?.join(', ') || ''}
          onChange={(e) => onChange('notable_clients', e.target.value.split(',').map(client => client.trim()).filter(Boolean))}
          placeholder="Nike, Coca-Cola, Revista Vogue..."
          rows={2}
          helperText="Separa los clientes con comas (opcional)"
        />
      </div>
    </div>
  )
}