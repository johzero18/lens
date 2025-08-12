'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserRole } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface SearchBarProps {
  className?: string
  placeholder?: string
  showFilters?: boolean
  onSearch?: (query: string, role?: UserRole, location?: string) => void
}

function SearchBarContent({
  className = '',
  placeholder = 'Buscar fotógrafos, modelos, maquilladores...',
  showFilters = true,
  onSearch
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [location, setLocation] = useState('')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  // Initialize from URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    const urlRole = searchParams.get('role') as UserRole || ''
    const urlLocation = searchParams.get('location') || ''
    
    setQuery(urlQuery)
    setSelectedRole(urlRole)
    setLocation(urlLocation)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSearch) {
      // If onSearch callback is provided, use it (for controlled usage)
      onSearch(query, selectedRole || undefined, location || undefined)
    } else {
      // Default behavior: navigate to search page
      const searchParams = new URLSearchParams()
      if (query.trim()) searchParams.set('q', query.trim())
      if (selectedRole) searchParams.set('role', selectedRole)
      if (location.trim()) searchParams.set('location', location.trim())
      
      router.push(`/buscar?${searchParams.toString()}`)
    }
  }

  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'photographer', label: 'Fotógrafos' },
    { value: 'model', label: 'Modelos' },
    { value: 'makeup_artist', label: 'Maquilladores' },
    { value: 'stylist', label: 'Estilistas' },
    { value: 'producer', label: 'Productores' }
  ]

  const popularLocations = [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Mar del Plata'
  ]

  const handleLocationFocus = () => {
    setShowLocationDropdown(true)
  }

  const handleLocationBlur = () => {
    // Delay hiding to allow clicks on dropdown items
    setTimeout(() => setShowLocationDropdown(false), 200)
  }

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
    setShowLocationDropdown(false)
  }

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main search input */}
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            className="text-lg py-3 pl-12 pr-4"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rol
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Ubicación
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ciudad o provincia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={handleLocationFocus}
                  onBlur={handleLocationBlur}
                  leftIcon={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  }
                />
                {/* Popular locations dropdown */}
                {showLocationDropdown && location === '' && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-secondary-500 mb-2 px-2">Ubicaciones populares:</p>
                      {popularLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleLocationSelect(loc)}
                          className="w-full text-left px-2 py-1 text-sm text-secondary-700 hover:bg-secondary-50 rounded transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search button */}
        <div className="flex justify-center">
          <Button type="submit" variant="primary" size="lg" className="px-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar Profesionales
          </Button>
        </div>
      </form>
    </div>
  )
}

const SearchBar: React.FC<SearchBarProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="w-full p-4 bg-white rounded-lg border border-secondary-200 animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    }>
      <SearchBarContent {...props} />
    </Suspense>
  )
}

export default SearchBar