'use client'

import React, { useState } from 'react'
import { 
  SearchFilters as SearchFiltersType, 
  UserRole, 
  ExperienceLevel,
  ModelType,
  PhotographySpecialty,
  MakeupSpecialty,
  StylistSpecialty,
  ProducerSpecialty,
  StudioAccess,
  BudgetRange
} from '@/types'
import { MultiSelect } from '@/components/ui'
import { Select } from '@/components/ui'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  onClearFilters: () => void
  loading?: boolean
  className?: string
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    role_specific: false,
    experience: false,
    location: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  // Role-specific specialty options
  const getSpecialtyOptions = (role: UserRole) => {
    switch (role) {
      case 'photographer':
        return Object.values(PhotographySpecialty).map(specialty => ({
          value: specialty,
          label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')
        }))
      case 'model':
        return Object.values(ModelType).map(type => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
        }))
      case 'makeup_artist':
        return Object.values(MakeupSpecialty).map(specialty => ({
          value: specialty,
          label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')
        }))
      case 'stylist':
        return Object.values(StylistSpecialty).map(specialty => ({
          value: specialty,
          label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')
        }))
      case 'producer':
        return Object.values(ProducerSpecialty).map(specialty => ({
          value: specialty,
          label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')
        }))
      default:
        return []
    }
  }

  const experienceLevelOptions = [
    { value: ExperienceLevel.BEGINNER, label: 'Principiante' },
    { value: ExperienceLevel.INTERMEDIATE, label: 'Intermedio' },
    { value: ExperienceLevel.ADVANCED, label: 'Avanzado' },
    { value: ExperienceLevel.EXPERT, label: 'Experto' }
  ]

  const studioAccessOptions = [
    { value: StudioAccess.OWN_STUDIO, label: 'Estudio propio' },
    { value: StudioAccess.RENTAL_ACCESS, label: 'Acceso a alquiler' },
    { value: StudioAccess.PARTNER_STUDIOS, label: 'Estudios asociados' },
    { value: StudioAccess.LOCATION_ONLY, label: 'Solo locación' }
  ]

  const budgetRangeOptions = [
    { value: BudgetRange.UNDER_50K, label: 'Menos de $50.000' },
    { value: BudgetRange.FROM_50K_TO_100K, label: '$50.000 - $100.000' },
    { value: BudgetRange.FROM_100K_TO_500K, label: '$100.000 - $500.000' },
    { value: BudgetRange.FROM_500K_TO_1M, label: '$500.000 - $1.000.000' },
    { value: BudgetRange.OVER_1M, label: 'Más de $1.000.000' }
  ]

  const popularLocations = [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Mar del Plata',
    'Tucumán',
    'Salta',
    'Santa Fe',
    'Neuquén'
  ]

  const FilterSection: React.FC<{
    title: string
    sectionKey: string
    children: React.ReactNode
  }> = ({ title, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey]
    
    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between py-3 text-left"
        >
          <span className="font-medium text-secondary-900">{title}</span>
          <svg
            className={`w-5 h-5 text-secondary-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="pb-4 space-y-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">
            Filtros de búsqueda
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              disabled={loading}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="space-y-0">
          {/* Basic Filters */}
          <FilterSection title="Filtros básicos" sectionKey="basic">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rol profesional
              </label>
              <Select
                value={filters.role || ''}
                onChange={(value) => updateFilter('role', value || undefined)}
                options={[
                  { value: '', label: 'Todos los roles' },
                  { value: 'photographer', label: 'Fotógrafos' },
                  { value: 'model', label: 'Modelos' },
                  { value: 'makeup_artist', label: 'Maquilladores' },
                  { value: 'stylist', label: 'Estilistas' },
                  { value: 'producer', label: 'Productores' }
                ]}
                placeholder="Seleccionar rol"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nivel de experiencia
              </label>
              <Select
                value={filters.experience_level || ''}
                onChange={(value) => updateFilter('experience_level', value || undefined)}
                options={[
                  { value: '', label: 'Cualquier nivel' },
                  ...experienceLevelOptions
                ]}
                placeholder="Seleccionar nivel"
              />
            </div>
          </FilterSection>

          {/* Location Filters */}
          <FilterSection title="Ubicación" sectionKey="location">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Ciudad o provincia
              </label>
              <input
                type="text"
                placeholder="Escribir ubicación..."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Ubicaciones populares
              </label>
              <div className="grid grid-cols-2 gap-2">
                {popularLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => updateFilter('location', location)}
                    className={`text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                      filters.location === location
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-white border-gray-200 text-secondary-700 hover:bg-gray-50'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Availability for Makeup Artists */}
            {filters.role === 'makeup_artist' && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.travel_availability || false}
                    onChange={(e) => updateFilter('travel_availability', e.target.checked || undefined)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">
                    Disponible para viajar
                  </span>
                </label>
              </div>
            )}
          </FilterSection>

          {/* Role-Specific Filters */}
          {filters.role && (
            <FilterSection title="Especialidades" sectionKey="role_specific">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  {filters.role === 'photographer' && 'Especialidades fotográficas'}
                  {filters.role === 'model' && 'Tipos de modelaje'}
                  {filters.role === 'makeup_artist' && 'Especialidades de maquillaje'}
                  {filters.role === 'stylist' && 'Especialidades de styling'}
                  {filters.role === 'producer' && 'Especialidades de producción'}
                </label>
                <MultiSelect
                  value={filters.specialties || []}
                  onChange={(value) => updateFilter('specialties', value.length > 0 ? value : undefined)}
                  options={getSpecialtyOptions(filters.role)}
                  placeholder="Seleccionar especialidades"
                />
              </div>

              {/* Studio Access for Photographers */}
              {filters.role === 'photographer' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Acceso a estudio
                  </label>
                  <Select
                    value={filters.studio_access || ''}
                    onChange={(value) => updateFilter('studio_access', value || undefined)}
                    options={[
                      { value: '', label: 'Cualquier tipo' },
                      ...studioAccessOptions
                    ]}
                    placeholder="Seleccionar tipo de estudio"
                  />
                </div>
              )}

              {/* Budget Range for Producers */}
              {filters.role === 'producer' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Rango de presupuesto típico
                  </label>
                  <Select
                    value={filters.budget_range || ''}
                    onChange={(value) => updateFilter('budget_range', value || undefined)}
                    options={[
                      { value: '', label: 'Cualquier presupuesto' },
                      ...budgetRangeOptions
                    ]}
                    placeholder="Seleccionar rango"
                  />
                </div>
              )}
            </FilterSection>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-secondary-700 mb-3">
              Filtros activos:
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.role && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Rol: {filters.role === 'photographer' ? 'Fotógrafo' :
                        filters.role === 'model' ? 'Modelo' :
                        filters.role === 'makeup_artist' ? 'Maquillador' :
                        filters.role === 'stylist' ? 'Estilista' :
                        filters.role === 'producer' ? 'Productor' : filters.role}
                  <button
                    onClick={() => updateFilter('role', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Ubicación: {filters.location}
                  <button
                    onClick={() => updateFilter('location', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.experience_level && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Experiencia: {filters.experience_level}
                  <button
                    onClick={() => updateFilter('experience_level', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.specialties && filters.specialties.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Especialidades: {filters.specialties.length}
                  <button
                    onClick={() => updateFilter('specialties', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.travel_availability && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Disponible para viajar
                  <button
                    onClick={() => updateFilter('travel_availability', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFiltersComponent