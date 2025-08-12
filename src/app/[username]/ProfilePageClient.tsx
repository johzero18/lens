'use client'

import React, { useState } from 'react'
import { Profile, UserRole, PortfolioImage, ModelData, PhotographerData, MakeupArtistData, StylistData, ProducerData } from '@/types'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { OptimizedImage, LazyContactModal, LazyRender, PortfolioGridSkeleton } from '@/components/ui'
import { usePerformance } from '@/hooks/usePerformance'


interface ProfilePageClientProps {
  profile: Profile
}

// Helper function to get role display name in Spanish
const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    photographer: 'Fotógrafo/a',
    model: 'Modelo',
    makeup_artist: 'Maquillador/a',
    stylist: 'Estilista',
    producer: 'Productor/a',
  }
  return roleNames[role] || role
}

// Helper function to get role color
const getRoleColor = (role: UserRole): string => {
  const roleColors = {
    photographer: 'bg-blue-100 text-blue-800 border-blue-200',
    model: 'bg-pink-100 text-pink-800 border-pink-200',
    makeup_artist: 'bg-purple-100 text-purple-800 border-purple-200',
    stylist: 'bg-green-100 text-green-800 border-green-200',
    producer: 'bg-orange-100 text-orange-800 border-orange-200',
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// Helper function to render role-specific information
const renderRoleSpecificInfo = (profile: Profile) => {
  const { role_specific_data, role } = profile
  
  if (!role_specific_data) return null

  switch (role) {
    case 'model':
      const modelData = role_specific_data as ModelData
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-secondary-600">Altura</dt>
            <dd className="text-sm text-secondary-900">{modelData.height_cm} cm</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Medidas</dt>
            <dd className="text-sm text-secondary-900">
              {modelData.measurements.bust_cm}-{modelData.measurements.waist_cm}-{modelData.measurements.hips_cm}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Talle</dt>
            <dd className="text-sm text-secondary-900">{modelData.dress_size_eu}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Calzado</dt>
            <dd className="text-sm text-secondary-900">{modelData.shoe_size_eu}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Cabello</dt>
            <dd className="text-sm text-secondary-900">{modelData.hair_color}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Ojos</dt>
            <dd className="text-sm text-secondary-900">{modelData.eye_color}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Tipo</dt>
            <dd className="text-sm text-secondary-900">
              {Array.isArray(modelData.model_type) 
                ? modelData.model_type.join(', ') 
                : modelData.model_type}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600">Experiencia</dt>
            <dd className="text-sm text-secondary-900">{modelData.experience_level}</dd>
          </div>
        </div>
      )

    case 'photographer':
      const photographerData = role_specific_data as PhotographerData
      return (
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Especialidades</dt>
            <dd className="flex flex-wrap gap-2">
              {photographerData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {specialty}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-secondary-600">Experiencia</dt>
              <dd className="text-sm text-secondary-900">{photographerData.experience_level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-600">Acceso a estudio</dt>
              <dd className="text-sm text-secondary-900">{photographerData.studio_access}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Equipo destacado</dt>
            <dd className="text-sm text-secondary-900">{photographerData.equipment_highlights}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Habilidades de postproducción</dt>
            <dd className="flex flex-wrap gap-2">
              {photographerData.post_production_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {skill}
                </span>
              ))}
            </dd>
          </div>
        </div>
      )

    case 'makeup_artist':
      const makeupData = role_specific_data as MakeupArtistData
      return (
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Especialidades</dt>
            <dd className="flex flex-wrap gap-2">
              {makeupData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {specialty}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-secondary-600">Experiencia</dt>
              <dd className="text-sm text-secondary-900">{makeupData.experience_level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-600">Disponibilidad de viaje</dt>
              <dd className="text-sm text-secondary-900">
                {makeupData.travel_availability ? 'Disponible' : 'No disponible'}
              </dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Kit destacado</dt>
            <dd className="flex flex-wrap gap-2">
              {makeupData.kit_highlights.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Servicios ofrecidos</dt>
            <dd className="flex flex-wrap gap-2">
              {makeupData.services_offered.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {service}
                </span>
              ))}
            </dd>
          </div>
        </div>
      )

    case 'stylist':
      const stylistData = role_specific_data as StylistData
      return (
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Especialidades</dt>
            <dd className="flex flex-wrap gap-2">
              {stylistData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {specialty}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-secondary-600">Experiencia</dt>
              <dd className="text-sm text-secondary-900">{stylistData.experience_level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-secondary-600">Acceso a vestuario</dt>
              <dd className="text-sm text-secondary-900">{stylistData.wardrobe_access}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Enfoque de industria</dt>
            <dd className="flex flex-wrap gap-2">
              {stylistData.industry_focus.map((focus, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {focus}
                </span>
              ))}
            </dd>
          </div>
        </div>
      )

    case 'producer':
      const producerData = role_specific_data as ProducerData
      return (
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Especialidades</dt>
            <dd className="flex flex-wrap gap-2">
              {producerData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                >
                  {specialty}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-secondary-600">Rango de presupuesto típico</dt>
              <dd className="text-sm text-secondary-900">{producerData.typical_budget_range}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-secondary-600 mb-2">Servicios</dt>
            <dd className="flex flex-wrap gap-2">
              {producerData.services.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {service}
                </span>
              ))}
            </dd>
          </div>
        </div>
      )

    default:
      return null
  }

  return null
}

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
  const { markStart, markEnd } = usePerformance()

  const roleColor = getRoleColor(profile.role)
  const roleDisplayName = getRoleDisplayName(profile.role)

  const handleContactClick = () => {
    markStart('contact-modal-open')
    setIsContactModalOpen(true)
    markEnd('contact-modal-open')
  }

  const handleImageClick = (image: PortfolioImage) => {
    setSelectedImage(image)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Header */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary-400 to-primary-600">
        {profile.cover_image_url ? (
          <OptimizedImage
            src={profile.cover_image_url}
            alt={`${profile.full_name} - Portada`}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
            placeholder="blur"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Pro Badge */}
        {profile.subscription_tier === 'pro' && (
          <div className="absolute top-6 right-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-lg">
              ✨ PRO
            </span>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-20 md:-mt-24 pb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                  {profile.avatar_url ? (
                    <OptimizedImage
                      src={profile.avatar_url}
                      alt={`${profile.full_name} - ${roleDisplayName}`}
                      fill
                      className="object-cover"
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 128px, 160px"
                      placeholder="blur"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-4xl">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                      {profile.full_name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border', roleColor)}>
                        {roleDisplayName}
                      </span>
                      <span className="text-secondary-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location}
                      </span>
                    </div>
                    <p className="text-secondary-700 text-lg leading-relaxed max-w-2xl">
                      {profile.bio}
                    </p>
                  </div>
                  
                  {/* Contact Button */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleContactClick}
                      className="w-full md:w-auto"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contactar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Section */}
            {profile.portfolio_images && profile.portfolio_images.length > 0 && (
              <LazyRender
                fallback={
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-secondary-900 mb-6">Portfolio</h2>
                    <PortfolioGridSkeleton count={6} />
                  </div>
                }
                rootMargin="100px"
              >
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-secondary-900 mb-6">Portfolio</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.portfolio_images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
                        onClick={() => handleImageClick(image)}
                      >
                        <OptimizedImage
                          src={image.image_url}
                          alt={image.alt_text || 'Portfolio image'}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          quality={85}
                          priority={index < 3} // Prioritize first 3 images
                          placeholder="blur"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LazyRender>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role-Specific Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Información profesional
              </h3>
              <dl className="space-y-4">
                {renderRoleSpecificInfo(profile)}
              </dl>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Contacto
              </h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleContactClick}
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar mensaje
                </Button>
                <p className="text-xs text-secondary-500 text-center">
                  Los mensajes se envían directamente al profesional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <LazyContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        recipientName={profile.full_name}
        recipientRole={roleDisplayName}
      />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full h-full flex items-center justify-center">
            <OptimizedImage
              src={selectedImage.image_url}
              alt={selectedImage.alt_text || 'Portfolio image'}
              fill
              className="object-contain"
              sizes="100vw"
              quality={95}
              priority
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-black hover:bg-opacity-50"
              aria-label="Cerrar imagen"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}