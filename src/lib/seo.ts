import { Profile, UserRole } from '@/types'
import { Metadata } from 'next'

// Role translations for Spanish
const roleTranslations: Record<UserRole, string> = {
  photographer: 'Fotógrafo/a',
  model: 'Modelo',
  makeup_artist: 'Maquillador/a',
  stylist: 'Estilista',
  producer: 'Productor/a'
}

// Role descriptions for meta tags
const roleDescriptions: Record<UserRole, string> = {
  photographer: 'Fotógrafo profesional especializado en capturar momentos únicos',
  model: 'Modelo profesional disponible para sesiones de moda y comerciales',
  makeup_artist: 'Maquillador profesional especializado en belleza y moda',
  stylist: 'Estilista profesional con experiencia en moda y styling',
  producer: 'Productor audiovisual especializado en proyectos creativos'
}

/**
 * Generates dynamic meta tags for profile pages
 */
export function generateProfileMetadata(profile: Profile): Metadata {
  const roleTitle = roleTranslations[profile.role]
  const roleDescription = roleDescriptions[profile.role]
  
  // Create title with role and location
  const title = `${profile.full_name} - ${roleTitle} en ${profile.location} | Project Lens`
  
  // Create description from bio or default role description
  const description = profile.bio 
    ? `${profile.bio.substring(0, 150)}${profile.bio.length > 150 ? '...' : ''}`
    : `${roleDescription} en ${profile.location}. Conecta con ${profile.full_name} en Project Lens.`

  // Profile URL
  const profileUrl = generateCanonicalUrl(profile.username)
  
  // Use avatar or default image
  const imageUrl = profile.avatar_url || 'https://projectlens.com/default-avatar.jpg'
  
  // Get specialties for keywords
  const specialties = getProfileSpecialties(profile)
  const keywords = [
    profile.full_name,
    roleTitle.toLowerCase(),
    profile.location,
    ...specialties,
    'project lens',
    'red profesional',
    'industria visual',
    'argentina'
  ].join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: profile.full_name }],
    creator: profile.full_name,
    publisher: 'Project Lens',
    
    // Open Graph tags for social media sharing
    openGraph: {
      type: 'profile',
      title,
      description,
      url: profileUrl,
      siteName: 'Project Lens',
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: `Foto de perfil de ${profile.full_name}`,
        },
        // Add cover image if available
        ...(profile.cover_image_url ? [{
          url: profile.cover_image_url,
          width: 1200,
          height: 300,
          alt: `Imagen de portada de ${profile.full_name}`,
        }] : [])
      ],
      locale: 'es_AR',
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: `@${profile.username}`,
      site: '@projectlens',
    },

    // Additional meta tags
    other: {
      'profile:first_name': profile.full_name.split(' ')[0] || '',
      'profile:last_name': profile.full_name.split(' ').slice(1).join(' ') || '',
      'profile:username': profile.username,
      'profile:role': roleTitle,
      'profile:location': profile.location,
      'og:profile:role': roleTitle,
      'og:profile:location': profile.location,
    },

    // Canonical URL
    alternates: {
      canonical: profileUrl,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Extracts specialties from profile role-specific data
 */
function getProfileSpecialties(profile: Profile): string[] {
  const roleData = profile.role_specific_data
  
  switch (profile.role) {
    case 'photographer':
      return (roleData as any).specialties || []
    case 'model':
      return (roleData as any).model_type || []
    case 'makeup_artist':
      return (roleData as any).specialties || []
    case 'stylist':
      return (roleData as any).specialties || []
    case 'producer':
      return (roleData as any).specialties || []
    default:
      return []
  }
}

/**
 * Generates structured data (JSON-LD) for profiles
 */
export function generateProfileStructuredData(profile: Profile) {
  const roleTitle = roleTranslations[profile.role]
  const profileUrl = `https://projectlens.com/${profile.username}`
  const specialties = getProfileSpecialties(profile)
  const roleData = profile.role_specific_data as any

  // Base Person schema with enhanced data
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': profileUrl,
    name: profile.full_name,
    alternateName: profile.username,
    description: profile.bio,
    url: profileUrl,
    image: {
      '@type': 'ImageObject',
      url: profile.avatar_url,
      caption: `Foto de perfil de ${profile.full_name}`,
    },
    jobTitle: roleTitle,
    worksFor: {
      '@type': 'Organization',
      name: 'Project Lens',
      url: 'https://projectlens.com',
      logo: 'https://projectlens.com/logo.png'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location?.split(',')[0]?.trim() || '',
      addressRegion: profile.location?.split(',')[1]?.trim() || 'Argentina',
      addressCountry: 'AR'
    },
    knowsAbout: specialties,
    sameAs: [profileUrl],
    mainEntityOfPage: profileUrl,
    // Add experience level if available
    ...(roleData?.experience_level && {
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Nivel de experiencia',
        educationalLevel: roleData.experience_level
      }
    }),
    // Add years of experience if available
    ...(roleData?.years_experience && {
      hasOccupation: {
        '@type': 'Occupation',
        name: roleTitle,
        experienceRequirements: `${roleData.years_experience} años de experiencia`
      }
    })
  }

  const schemas = [personSchema]

  // Add role-specific LocalBusiness schema for service providers
  if (profile.role === 'photographer' || profile.role === 'makeup_artist' || 
      profile.role === 'stylist' || profile.role === 'producer') {
    
    const businessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${profileUrl}#business`,
      name: `${profile.full_name} - ${roleTitle}`,
      description: profile.bio,
      url: profileUrl,
      image: profile.avatar_url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.location?.split(',')[0]?.trim() || '',
        addressRegion: profile.location?.split(',')[1]?.trim() || 'Argentina',
        addressCountry: 'AR'
      },
      serviceType: roleTitle,
      areaServed: {
        '@type': 'Place',
        name: profile.location
      },
      knowsAbout: specialties,
      founder: {
        '@id': profileUrl
      },
      // Add specific services based on role
      ...(getBusinessServices(profile.role, roleData) && {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Servicios de ${roleTitle}`,
          itemListElement: getBusinessServices(profile.role, roleData)
        }
      })
    }

    schemas.push(businessSchema)
  }

  // Add CreativeWork schema for portfolio if images exist
  if (profile.portfolio_images && profile.portfolio_images.length > 0) {
    const portfolioSchema = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${profileUrl}#portfolio`,
      name: `Portfolio de ${profile.full_name}`,
      description: `Trabajos y proyectos realizados por ${profile.full_name}`,
      creator: {
        '@id': profileUrl
      },
      image: profile.portfolio_images.map(img => ({
        '@type': 'ImageObject',
        url: img.image_url,
        caption: img.alt_text || `Trabajo de ${profile.full_name}`,
        creator: {
          '@id': profileUrl
        }
      })),
      genre: specialties,
      inLanguage: 'es-AR'
    }

    schemas.push(portfolioSchema)
  }

  return schemas
}

/**
 * Gets business services based on role and role-specific data
 */
function getBusinessServices(role: UserRole, roleData: any) {
  const services: any[] = []

  switch (role) {
    case 'photographer':
      if (roleData?.specialties) {
        roleData.specialties.forEach((specialty: string, index: number) => {
          services.push({
            '@type': 'Offer',
            '@id': `#service-${index}`,
            name: `Fotografía ${specialty}`,
            description: `Servicios profesionales de fotografía ${specialty}`,
            category: 'Fotografía'
          })
        })
      }
      break
    
    case 'makeup_artist':
      if (roleData?.services_offered) {
        roleData.services_offered.forEach((service: string, index: number) => {
          services.push({
            '@type': 'Offer',
            '@id': `#service-${index}`,
            name: service,
            description: `Servicios profesionales de ${service}`,
            category: 'Maquillaje'
          })
        })
      }
      break
    
    case 'stylist':
      if (roleData?.specialties) {
        roleData.specialties.forEach((specialty: string, index: number) => {
          services.push({
            '@type': 'Offer',
            '@id': `#service-${index}`,
            name: `Styling ${specialty}`,
            description: `Servicios profesionales de styling ${specialty}`,
            category: 'Styling'
          })
        })
      }
      break
    
    case 'producer':
      if (roleData?.services) {
        roleData.services.forEach((service: string, index: number) => {
          services.push({
            '@type': 'Offer',
            '@id': `#service-${index}`,
            name: service,
            description: `Servicios de producción: ${service}`,
            category: 'Producción'
          })
        })
      }
      break
  }

  return services.length > 0 ? services : null
}

/**
 * Generates breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://projectlens.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Perfiles',
        item: 'https://projectlens.com/buscar'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.full_name,
        item: `https://projectlens.com/${profile.username}`
      }
    ]
  }
}

/**
 * Generates organization structured data for the main site
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://projectlens.com#organization',
    name: 'Project Lens',
    alternateName: 'Project Lens Argentina',
    description: 'Red profesional para la industria de producción visual en Argentina',
    url: 'https://projectlens.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://projectlens.com/logo.png',
      width: 200,
      height: 60
    },
    image: 'https://projectlens.com/og-image.jpg',
    sameAs: [
      'https://www.instagram.com/projectlens',
      'https://www.linkedin.com/company/projectlens',
      'https://twitter.com/projectlens'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contacto@projectlens.com',
      availableLanguage: 'Spanish'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      addressRegion: 'Buenos Aires'
    },
    foundingDate: '2024',
    knowsAbout: [
      'Fotografía',
      'Modelaje',
      'Maquillaje',
      'Styling',
      'Producción audiovisual',
      'Red profesional',
      'Industria visual'
    ],
    serviceType: 'Professional Network',
    areaServed: {
      '@type': 'Country',
      name: 'Argentina'
    }
  }
}

/**
 * Generates website structured data
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://projectlens.com#website',
    name: 'Project Lens',
    description: 'Red profesional para la industria de producción visual en Argentina',
    url: 'https://projectlens.com',
    publisher: {
      '@id': 'https://projectlens.com#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://projectlens.com/buscar?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'es-AR'
  }
}

/**
 * Generates canonical URL for a given path
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://projectlens.com'
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Handle empty path (home page)
  if (!cleanPath) {
    return baseUrl
  }
  
  return `${baseUrl}/${cleanPath}`
}

/**
 * Generates hreflang tags for international SEO (if needed in the future)
 */
export function generateHreflangTags(path: string) {
  const baseUrl = 'https://projectlens.com'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const fullUrl = cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl
  
  return [
    {
      hreflang: 'es-AR',
      href: fullUrl,
    },
    {
      hreflang: 'es',
      href: fullUrl,
    },
    {
      hreflang: 'x-default',
      href: fullUrl,
    },
  ]
}