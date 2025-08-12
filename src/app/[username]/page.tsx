import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { mockFeaturedProfiles } from '@/lib/mockData'
import { generateProfileMetadata, generateProfileStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import ProfilePageClient from './ProfilePageClient'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

// Generate dynamic metadata for the profile page
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  
  // Find profile by username (in real app, this would be an API call)
  const profile = mockFeaturedProfiles.find(p => p.username === username)

  if (!profile) {
    return {
      title: 'Perfil no encontrado | Project Lens',
      description: 'El perfil que buscas no existe o ha sido eliminado.',
    }
  }

  return generateProfileMetadata(profile)
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  // Find profile by username (in real app, this would be an API call)
  const profile = mockFeaturedProfiles.find(p => p.username === username)

  if (!profile) {
    notFound()
  }

  // Generate structured data
  const profileStructuredData = generateProfileStructuredData(profile)
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(profile)

  return (
    <>
      {/* Structured Data */}
      {profileStructuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      <ProfilePageClient profile={profile} />
    </>
  )
}