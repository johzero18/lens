'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout'
import { SearchFilters, UserRole, SearchResults, ExperienceLevel } from '@/types'
import { mockFeaturedProfiles } from '@/lib/mockData'
import { usePerformance } from '@/hooks/usePerformance'
import SearchBar from '@/components/features/SearchBar'
import { LazySearchFilters, LazyRender } from '@/components/ui'
import ProfileCard from '@/components/features/ProfileCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Mock search function - simulates API call with advanced filtering
const mockSearchProfiles = async (
  filters: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<SearchResults> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  let filteredProfiles = [...mockFeaturedProfiles]
  
  // Apply text search
  if (filters.query) {
    const query = filters.query.toLowerCase()
    filteredProfiles = filteredProfiles.filter(profile =>
      profile.full_name.toLowerCase().includes(query) ||
      profile.bio.toLowerCase().includes(query) ||
      profile.username.toLowerCase().includes(query)
    )
  }
  
  // Apply role filter
  if (filters.role) {
    filteredProfiles = filteredProfiles.filter(profile => profile.role === filters.role)
  }
  
  // Apply location filter
  if (filters.location) {
    const location = filters.location.toLowerCase()
    filteredProfiles = filteredProfiles.filter(profile =>
      profile.location.toLowerCase().includes(location)
    )
  }
  
  // Apply experience level filter
  if (filters.experience_level) {
    filteredProfiles = filteredProfiles.filter(profile => {
      const roleData = profile.role_specific_data as any
      return roleData.experience_level === filters.experience_level
    })
  }
  
  // Apply specialties filter
  if (filters.specialties && filters.specialties.length > 0) {
    filteredProfiles = filteredProfiles.filter(profile => {
      const roleData = profile.role_specific_data as any
      if (!roleData.specialties && !roleData.model_type) return false
      
      const profileSpecialties = roleData.specialties || roleData.model_type || []
      return filters.specialties!.some(specialty => 
        profileSpecialties.includes(specialty)
      )
    })
  }
  
  // Apply studio access filter for photographers
  if (filters.studio_access && filters.role === 'photographer') {
    filteredProfiles = filteredProfiles.filter(profile => {
      const roleData = profile.role_specific_data as any
      return roleData.studio_access === filters.studio_access
    })
  }
  
  // Apply travel availability filter for makeup artists
  if (filters.travel_availability !== undefined && filters.role === 'makeup_artist') {
    filteredProfiles = filteredProfiles.filter(profile => {
      const roleData = profile.role_specific_data as any
      return roleData.travel_availability === filters.travel_availability
    })
  }
  
  // Apply budget range filter for producers
  if (filters.budget_range && filters.role === 'producer') {
    filteredProfiles = filteredProfiles.filter(profile => {
      const roleData = profile.role_specific_data as any
      return roleData.typical_budget_range === filters.budget_range
    })
  }
  
  // Simulate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex)
  
  return {
    profiles: paginatedProfiles,
    total: filteredProfiles.length,
    page,
    limit,
    hasMore: endIndex < filteredProfiles.length
  }
}

export default function BuscarPageClient() {
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasSearched, setHasSearched] = useState(false)
  const { measurePerformance } = usePerformance()
  const [savedSearches, setSavedSearches] = useState<Array<{
    id: string
    name: string
    filters: SearchFilters
    created_at: Date
  }>>([])
  const [showSaveSearch, setShowSaveSearch] = useState(false)

  // Parse URL parameters into filters
  const initialFilters = useMemo(() => {
    const filters: SearchFilters = {}
    
    const query = searchParams.get('q')
    const role = searchParams.get('role') as UserRole
    const location = searchParams.get('location')
    const experienceLevel = searchParams.get('experience_level') as ExperienceLevel
    const specialties = searchParams.get('specialties')?.split(',')
    
    if (query) filters.query = query
    if (role) filters.role = role
    if (location) filters.location = location
    if (experienceLevel) filters.experience_level = experienceLevel
    if (specialties && specialties.length > 0) filters.specialties = specialties
    
    return filters
  }, [searchParams])

  const [filters, setFilters] = useState<SearchFilters>(initialFilters)

  // Perform search when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      performSearch(filters, 1)
    }
  }, [filters])

  // Initial search if URL has parameters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      performSearch(initialFilters, 1)
    }
  }, [initialFilters])

  const performSearch = async (searchFilters: SearchFilters, page: number = 1) => {
    setLoading(true)
    setHasSearched(true)
    
    try {
      const results = await measurePerformance('search-profiles', async () => {
        return await mockSearchProfiles(searchFilters, page)
      })
      
      if (page === 1) {
        setSearchResults(results)
      } else {
        // Append results for infinite scroll
        setSearchResults(prev => prev ? {
          ...results,
          profiles: [...prev.profiles, ...results.profiles]
        } : results)
      }
      
      setCurrentPage(page)
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleLoadMore = () => {
    if (searchResults?.hasMore && !loading) {
      performSearch(filters, currentPage + 1)
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchResults(null)
    setHasSearched(false)
    setCurrentPage(1)
  }

  const handleSaveSearch = (name: string) => {
    const newSavedSearch = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      created_at: new Date()
    }
    setSavedSearches(prev => [...prev, newSavedSearch])
    setShowSaveSearch(false)
    
    // In a real app, this would be saved to the backend
    localStorage.setItem('savedSearches', JSON.stringify([...savedSearches, newSavedSearch]))
  }

  const handleLoadSavedSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters)
    setCurrentPage(1)
  }

  const handleDeleteSavedSearch = (id: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== id)
    setSavedSearches(updatedSearches)
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches))
  }

  // Load saved searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches')
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved)
        setSavedSearches(parsedSaved)
      } catch (error) {
        console.error('Error loading saved searches:', error)
      }
    }
  }, [])

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-secondary-900 mb-6 text-center">
                Buscar Profesionales
              </h1>
              <SearchBar 
                className="w-full"
                showFilters={true}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Advanced Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-8">
                <LazySearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  loading={loading}
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="lg:w-3/4">
              {/* Results Header */}
              {hasSearched && searchResults && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-secondary-600">
                    {searchResults.total === 0 
                      ? 'No se encontraron resultados'
                      : `${searchResults.total} profesional${searchResults.total !== 1 ? 'es' : ''} encontrado${searchResults.total !== 1 ? 's' : ''}`
                    }
                  </p>
                  
                  {/* Save Search Button */}
                  {Object.keys(filters).length > 0 && searchResults.total > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSaveSearch(!showSaveSearch)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Guardar búsqueda
                      </button>
                      
                      {/* Save Search Modal */}
                      {showSaveSearch && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <h3 className="font-medium text-secondary-900 mb-2">
                            Guardar búsqueda
                          </h3>
                          <input
                            type="text"
                            placeholder="Nombre de la búsqueda"
                            className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement
                                if (input.value.trim()) {
                                  handleSaveSearch(input.value.trim())
                                  input.value = ''
                                }
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const input = document.querySelector('input[placeholder="Nombre de la búsqueda"]') as HTMLInputElement
                                if (input?.value.trim()) {
                                  handleSaveSearch(input.value.trim())
                                  input.value = ''
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setShowSaveSearch(false)}
                              className="px-3 py-2 text-secondary-600 text-sm rounded-lg hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Saved Searches */}
              {savedSearches.length > 0 && !hasSearched && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Búsquedas guardadas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedSearches.map((savedSearch) => (
                      <div
                        key={savedSearch.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-secondary-900">
                            {savedSearch.name}
                          </h4>
                          <button
                            onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                            className="text-secondary-400 hover:text-secondary-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm text-secondary-600 mb-3">
                          {savedSearch.filters.role && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-1">
                              {savedSearch.filters.role}
                            </span>
                          )}
                          {savedSearch.filters.location && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-1">
                              {savedSearch.filters.location}
                            </span>
                          )}
                          {savedSearch.filters.specialties && savedSearch.filters.specialties.length > 0 && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-1">
                              {savedSearch.filters.specialties.length} especialidades
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleLoadSavedSearch(savedSearch.filters)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Aplicar búsqueda
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && !searchResults && (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {/* No Results */}
              {hasSearched && searchResults && searchResults.total === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Intenta ajustar tus filtros o buscar con términos diferentes.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* Results Grid */}
              {searchResults && searchResults.profiles.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.profiles.map((profile) => (
                      <LazyRender
                        key={profile.id}
                        fallback={
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                            <div className="h-32 bg-gray-200"></div>
                            <div className="p-4">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        }
                        rootMargin="200px"
                      >
                        <ProfileCard
                          profile={profile}
                          variant="grid"
                          showContact={true}
                        />
                      </LazyRender>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {searchResults.hasMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            Cargando...
                          </>
                        ) : (
                          'Cargar más resultados'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Initial State - No Search Performed */}
              {!hasSearched && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    Busca profesionales creativos
                  </h3>
                  <p className="text-secondary-600">
                    Utiliza los filtros o la barra de búsqueda para encontrar fotógrafos, modelos, maquilladores, estilistas y productores.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}