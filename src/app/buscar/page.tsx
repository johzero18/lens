import React, { Suspense } from 'react'
import { Metadata } from 'next'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BuscarPageClient from './BuscarPageClient'

// Generate metadata for search page
export const metadata: Metadata = {
  title: 'Buscar Profesionales - Fotógrafos, Modelos, Maquilladores | Project Lens',
  description: 'Encuentra y conecta con fotógrafos, modelos, maquilladores, estilistas y productores profesionales en Argentina. Filtra por especialidad, ubicación y experiencia.',
  keywords: 'buscar fotógrafos, encontrar modelos, maquilladores profesionales, estilistas argentina, productores audiovisuales, red profesional visual',
  openGraph: {
    title: 'Buscar Profesionales en Project Lens',
    description: 'Encuentra y conecta con profesionales de la industria visual en Argentina',
    type: 'website',
    url: 'https://projectlens.com/buscar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buscar Profesionales en Project Lens',
    description: 'Encuentra y conecta con profesionales de la industria visual en Argentina',
  },
  alternates: {
    canonical: '/buscar',
  },
}



export default function BuscarPage() {
  // Generate structured data for search page
  const searchPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: 'Buscar Profesionales - Project Lens',
    description: 'Encuentra y conecta con fotógrafos, modelos, maquilladores, estilistas y productores profesionales en Argentina',
    url: 'https://projectlens.com/buscar',
    mainEntity: {
      '@type': 'WebSite',
      '@id': 'https://projectlens.com#website'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://projectlens.com/buscar?q={search_term_string}&role={role}&location={location}'
      },
      'query-input': [
        {
          '@type': 'PropertyValueSpecification',
          valueName: 'search_term_string',
          description: 'Término de búsqueda'
        },
        {
          '@type': 'PropertyValueSpecification',
          valueName: 'role',
          description: 'Rol profesional'
        },
        {
          '@type': 'PropertyValueSpecification',
          valueName: 'location',
          description: 'Ubicación'
        }
      ]
    }
  }

  const breadcrumbSchema = {
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
        name: 'Buscar Profesionales',
        item: 'https://projectlens.com/buscar'
      }
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchPageSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <BuscarPageClient />
      </Suspense>
    </>
  )
}