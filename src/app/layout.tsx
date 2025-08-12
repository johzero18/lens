import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from '@/lib/seo'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Project Lens - Red Profesional Visual',
    template: '%s | Project Lens'
  },
  description:
    'Conecta con fotógrafos, modelos, maquilladores, estilistas y productores en la industria de producción visual argentina.',
  keywords:
    'fotografía, modelaje, maquillador, estilista, productor, producción visual, red profesional, argentina',
  authors: [{ name: 'Project Lens Team' }],
  creator: 'Project Lens',
  publisher: 'Project Lens',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://projectlens.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Project Lens - Red Profesional Visual',
    description: 'Conecta con profesionales de la industria visual en Argentina',
    type: 'website',
    locale: 'es_AR',
    url: 'https://projectlens.com',
    siteName: 'Project Lens',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Project Lens - Red Profesional Visual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Lens - Red Profesional Visual',
    description: 'Conecta con profesionales de la industria visual en Argentina',
    site: '@projectlens',
    images: ['/og-image.jpg'],
  },
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Generate global structured data
  const organizationSchema = generateOrganizationStructuredData()
  const websiteSchema = generateWebsiteStructuredData()

  return (
    <html lang="es" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        
        {/* Global Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        
        {/* Critical CSS inlined */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .loading-skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased bg-white text-secondary-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
