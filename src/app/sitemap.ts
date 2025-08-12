import { MetadataRoute } from 'next'
import { mockFeaturedProfiles } from '@/lib/mockData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://projectlens.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explorar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/recuperar-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic profile pages
  const profilePages: MetadataRoute.Sitemap = mockFeaturedProfiles.map((profile) => ({
    url: `${baseUrl}/${profile.username}`,
    lastModified: profile.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Role-specific search pages
  const rolePages: MetadataRoute.Sitemap = [
    'photographer',
    'model', 
    'makeup_artist',
    'stylist',
    'producer'
  ].map((role) => ({
    url: `${baseUrl}/buscar?role=${role}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Location-based search pages (major Argentine cities)
  const locationPages: MetadataRoute.Sitemap = [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Mar del Plata',
    'Salta',
    'Santa Fe',
    'San Juan',
    'Resistencia'
  ].map((location) => ({
    url: `${baseUrl}/buscar?location=${encodeURIComponent(location)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...profilePages,
    ...rolePages,
    ...locationPages,
  ]
}

// Generate sitemap dynamically in production
export const dynamic = 'force-dynamic'