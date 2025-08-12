'use client'

import React from 'react'
import { Profile, UserRole } from '@/types'
import { cn } from '@/lib/utils'
import { memoizedUtils } from '@/lib/memoization'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import OptimizedImage from '@/components/ui/OptimizedImage'

export interface ProfileCardProps {
  profile: Profile
  variant?: 'grid' | 'list'
  showContact?: boolean
  onClick?: () => void
  className?: string
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
    photographer: 'bg-blue-100 text-blue-800',
    model: 'bg-pink-100 text-pink-800',
    makeup_artist: 'bg-purple-100 text-purple-800',
    stylist: 'bg-green-100 text-green-800',
    producer: 'bg-orange-100 text-orange-800',
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}

// Memoized helper function to get specialties from role-specific data
const getSpecialties = memoizedUtils.extractSpecialties

const ProfileCard: React.FC<ProfileCardProps> = React.memo(function ProfileCard({
  profile,
  variant = 'grid',
  showContact = true,
  onClick,
  className,
}) {
  const specialties = getSpecialties(profile)
  const roleColor = getRoleColor(profile.role)
  const roleDisplayName = getRoleDisplayName(profile.role)

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Open contact modal
    console.log('Contact clicked for:', profile.username)
  }

  if (variant === 'list') {
    return (
      <Card
        variant="elevated"
        padding="md"
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
          'flex flex-col sm:flex-row gap-4',
          className
        )}
        onClick={handleCardClick}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200">
            {profile.avatar_url ? (
              <OptimizedImage
                src={profile.avatar_url}
                alt={`${profile.full_name} - ${roleDisplayName}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
                quality={85}
                placeholder="blur"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-lg">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-secondary-900 truncate">
                {profile.full_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', roleColor)}>
                  {roleDisplayName}
                </span>
                {profile.subscription_tier === 'pro' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-secondary-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </p>
            </div>
            
            {showContact && (
              <div className="flex-shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleContactClick}
                  className="w-full sm:w-auto"
                >
                  Contactar
                </Button>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-secondary-700 mt-2 line-clamp-2">
            {profile.bio}
          </p>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {specialties.map((specialty: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    )
  }

  // Grid variant (default)
  return (
    <Card
      variant="elevated"
      padding="none"
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        'overflow-hidden group',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Cover Image or Gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary-400 to-primary-600">
        {profile.cover_image_url ? (
          <OptimizedImage
            src={profile.cover_image_url}
            alt={`${profile.full_name} - Portada`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            placeholder="blur"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
        )}
        
        {/* Pro Badge */}
        {profile.subscription_tier === 'pro' && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shadow-sm">
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Avatar */}
        <div className="relative -mt-8 mb-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
            {profile.avatar_url ? (
              <OptimizedImage
                src={profile.avatar_url}
                alt={`${profile.full_name} - ${roleDisplayName}`}
                fill
                className="object-cover"
                sizes="64px"
                quality={85}
                placeholder="blur"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name and Role */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-secondary-900 truncate">
            {profile.full_name}
          </h3>
          <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1', roleColor)}>
            {roleDisplayName}
          </span>
        </div>

        {/* Location */}
        <p className="text-sm text-secondary-600 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {profile.location}
        </p>

        {/* Bio */}
        <p className="text-sm text-secondary-700 mb-3 line-clamp-2">
          {profile.bio}
        </p>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {specialties.map((specialty: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-700"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* Contact Button */}
        {showContact && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleContactClick}
            className="w-full group-hover:bg-primary-700"
          >
            Contactar
          </Button>
        )}
      </div>
    </Card>
  )
})

export default ProfileCard