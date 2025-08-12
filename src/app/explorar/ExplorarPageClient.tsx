'use client'

import React, { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout'
import { ProfileCard } from '@/components/features'
import { Button, LoadingSpinner } from '@/components/ui'
import { mockFeaturedProfiles, platformStats, roleInfo } from '@/lib/mockData'
import { Profile, UserRole } from '@/types'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const ExplorarPageClient: React.FC = () => {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [loading, setLoading] = useState(false)

  // Filter profiles by selected role
  const filteredProfiles = useMemo(() => {
    if (selectedRole === 'all') {
      return mockFeaturedProfiles
    }
    return mockFeaturedProfiles.filter(profile => profile.role === selectedRole)
  }, [selectedRole])

  // Get recent profiles (last 3 profiles)
  const recentProfiles = useMemo(() => {
    return mockFeaturedProfiles.slice(-3)
  }, [])

  // Get featured profiles by category (2 per role)
  const featuredByCategory = useMemo(() => {
    const categories: Record<UserRole, Profile[]> = {
      photographer: [],
      model: [],
      makeup_artist: [],
      stylist: [],
      producer: []
    }

    mockFeaturedProfiles.forEach(profile => {
      if (categories[profile.role].length < 2) {
        categories[profile.role].push(profile)
      }
    })

    return categories
  }, [])

  const handleRoleFilter = (role: UserRole | 'all') => {
    setLoading(true)
    setSelectedRole(role)
    // Simulate loading
    setTimeout(() => setLoading(false), 300)
  }

  const handleProfileClick = (profile: Profile) => {
    router.push(`/${profile.username}`)
  }

  const handleSearchByRole = (role: UserRole) => {
    router.push(`/buscar?role=${role}`)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Descubre Talento Creativo
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8">
                Explora perfiles de fotógrafos, modelos, maquilladores, estilistas y productores
              </p>
              
              {/* Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {platformStats.totalProfiles.toLocaleString()}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    Profesionales
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {platformStats.projectsCompleted.toLocaleString()}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    Proyectos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {platformStats.citiesCovered}
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    Ciudades
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    5★
                  </div>
                  <div className="text-primary-200 text-sm md:text-base">
                    Calificación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Role Filters */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 text-center mb-8">
              Buscar por Especialidad
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {roleInfo.map((role) => (
                <button
                  key={role.role}
                  onClick={() => handleSearchByRole(role.role as UserRole)}
                  className="group p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all duration-200 text-center"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {role.icon}
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-secondary-600 line-clamp-2">
                    {role.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700">
                    Ver todos →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Profiles by Category */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 text-center mb-12">
              Perfiles Destacados por Categoría
            </h2>
            
            <div className="space-y-12">
              {Object.entries(featuredByCategory).map(([role, profiles]) => {
                if (profiles.length === 0) return null
                
                const roleData = roleInfo.find(r => r.role === role)
                if (!roleData) return null

                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{roleData.icon}</span>
                        <h3 className="text-xl font-semibold text-secondary-900">
                          {roleData.title}
                        </h3>
                        <span className="text-sm text-secondary-500">
                          ({platformStats[role as keyof typeof platformStats]} profesionales)
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchByRole(role as UserRole)}
                      >
                        Ver todos
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profiles.map((profile) => (
                        <ProfileCard
                          key={profile.id}
                          profile={profile}
                          variant="list"
                          onClick={() => handleProfileClick(profile)}
                          className="hover:shadow-md transition-shadow duration-200"
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Recent Profiles */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">
                Perfiles Recientes
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push('/buscar')}
              >
                Ver todos los perfiles
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  variant="grid"
                  onClick={() => handleProfileClick(profile)}
                  className="hover:shadow-lg transition-shadow duration-200"
                />
              ))}
            </div>
          </div>
        </section>

        {/* All Profiles with Filters */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 text-center mb-8">
              Todos los Perfiles
            </h2>
            
            {/* Role Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => handleRoleFilter('all')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                  selectedRole === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
                )}
              >
                Todos ({mockFeaturedProfiles.length})
              </button>
              {roleInfo.map((role) => {
                const count = mockFeaturedProfiles.filter(p => p.role === role.role).length
                return (
                  <button
                    key={role.role}
                    onClick={() => handleRoleFilter(role.role as UserRole)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                      selectedRole === role.role
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
                    )}
                  >
                    {role.title} ({count})
                  </button>
                )
              })}
            </div>
            
            {/* Profiles Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    variant="grid"
                    onClick={() => handleProfileClick(profile)}
                    className="hover:shadow-lg transition-shadow duration-200"
                  />
                ))}
              </div>
            )}
            
            {filteredProfiles.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  No hay perfiles en esta categoría
                </h3>
                <p className="text-secondary-600 mb-6">
                  Intenta con otra especialidad o explora todos los perfiles
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleRoleFilter('all')}
                >
                  Ver todos los perfiles
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Eres un profesional creativo?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Únete a nuestra comunidad y conecta con otros talentos de la industria visual
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/registro')}
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Crear Perfil Gratis
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/buscar')}
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Buscar Talento
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default ExplorarPageClient