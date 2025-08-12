import { supabase } from '@/lib/supabase'
import { 
  SearchFilters, 
  SearchResults, 
  SearchSuggestion, 
  Profile, 
  UserRole,
  ExperienceLevel,
  Pagination 
} from '@/types'

export interface SearchOptions {
  sortBy?: 'relevance' | 'recent' | 'name' | 'score'
  sortOrder?: 'asc' | 'desc'
}

export class SearchService {
  /**
   * Search profiles with filters and pagination
   */
  static async searchProfiles(
    filters: SearchFilters,
    pagination: Pagination,
    options: SearchOptions = {}
  ): Promise<SearchResults> {
    try {
      const { page = 1, limit = 20 } = pagination
      const { sortBy = 'relevance', sortOrder = 'desc' } = options
      const offset = (page - 1) * limit

      // Build the base query
      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          role,
          bio,
          location,
          avatar_url,
          cover_image_url,
          subscription_tier,
          role_specific_data,
          created_at,
          updated_at,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)

      // Apply filters
      query = this.applyFilters(query, filters)

      // Apply sorting
      query = this.applySorting(query, sortBy, sortOrder, filters.query)

      // Get total count
      const countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      const countQueryWithFilters = this.applyFilters(countQuery, filters)

      // Execute both queries
      const [{ data: profiles, error: profilesError }, { count, error: countError }] = 
        await Promise.all([
          query.range(offset, offset + limit - 1),
          countQueryWithFilters
        ])

      if (profilesError) {
        throw new Error(`Search error: ${profilesError.message}`)
      }

      if (countError) {
        throw new Error(`Count error: ${countError.message}`)
      }

      // Transform the data
      const transformedProfiles = this.transformProfiles(profiles || [])

      return {
        profiles: transformedProfiles,
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > offset + limit
      }

    } catch (error) {
      console.error('SearchService.searchProfiles error:', error)
      throw error
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSearchSuggestions(
    query: string,
    type?: 'profile' | 'location' | 'specialty',
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      const suggestions: SearchSuggestion[] = []

      // Profile suggestions
      if (!type || type === 'profile') {
        const profileSuggestions = await this.getProfileSuggestions(query, limit)
        suggestions.push(...profileSuggestions)
      }

      // Location suggestions
      if (!type || type === 'location') {
        const locationSuggestions = await this.getLocationSuggestions(query, limit)
        suggestions.push(...locationSuggestions)
      }

      // Specialty suggestions
      if (!type || type === 'specialty') {
        const specialtySuggestions = await this.getSpecialtySuggestions(query, limit)
        suggestions.push(...specialtySuggestions)
      }

      // Sort by relevance and limit
      return this.sortAndLimitSuggestions(suggestions, query, limit)

    } catch (error) {
      console.error('SearchService.getSearchSuggestions error:', error)
      return []
    }
  }

  /**
   * Get featured profiles for homepage
   */
  static async getFeaturedProfiles(limit: number = 12): Promise<Profile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          role,
          bio,
          location,
          avatar_url,
          cover_image_url,
          subscription_tier,
          role_specific_data,
          created_at,
          updated_at,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)
        .not('avatar_url', 'is', null)
        .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Active in last 30 days
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Featured profiles error: ${error.message}`)
      }

      return this.transformProfiles(profiles || [])

    } catch (error) {
      console.error('SearchService.getFeaturedProfiles error:', error)
      return []
    }
  }

  /**
   * Get profiles by role
   */
  static async getProfilesByRole(role: UserRole, limit: number = 20): Promise<Profile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          role,
          bio,
          location,
          avatar_url,
          cover_image_url,
          subscription_tier,
          role_specific_data,
          created_at,
          updated_at,
          portfolio_images (
            id,
            image_url,
            alt_text,
            sort_order,
            created_at
          )
        `)
        .eq('role', role)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Profiles by role error: ${error.message}`)
      }

      return this.transformProfiles(profiles || [])

    } catch (error) {
      console.error('SearchService.getProfilesByRole error:', error)
      return []
    }
  }

  /**
   * Apply filters to a Supabase query
   */
  private static applyFilters(query: any, filters: SearchFilters) {
    // Role filter
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    // Location filter
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    // Text search filter
    if (filters.query) {
      query = query.or(`
        full_name.ilike.%${filters.query}%,
        bio.ilike.%${filters.query}%,
        location.ilike.%${filters.query}%,
        username.ilike.%${filters.query}%
      `)
    }

    // Experience level filter
    if (filters.experience_level) {
      query = query.eq('role_specific_data->experience_level', filters.experience_level)
    }

    // Specialties filter
    if (filters.specialties && filters.specialties.length > 0) {
      const specialtyConditions = filters.specialties.map(specialty => 
        `role_specific_data->'specialties' ? '${specialty}'`
      ).join(' or ')
      query = query.or(specialtyConditions)
    }

    // Travel availability filter
    if (filters.travel_availability !== undefined) {
      query = query.eq('role_specific_data->travel_availability', filters.travel_availability)
    }

    // Studio access filter
    if (filters.studio_access) {
      query = query.eq('role_specific_data->studio_access', filters.studio_access)
    }

    // Budget range filter
    if (filters.budget_range) {
      query = query.eq('role_specific_data->typical_budget_range', filters.budget_range)
    }

    return query
  }

  /**
   * Apply sorting to a Supabase query
   */
  private static applySorting(
    query: any, 
    sortBy: string, 
    sortOrder: string, 
    hasTextQuery?: string
  ) {
    switch (sortBy) {
      case 'relevance':
        if (hasTextQuery) {
          // For text search, we'll rely on database ordering
          query = query.order('updated_at', { ascending: false })
        } else {
          // Default to recent activity
          query = query.order('updated_at', { ascending: false })
        }
        break
      case 'recent':
        query = query.order('updated_at', { ascending: sortOrder === 'asc' })
        break
      case 'name':
        query = query.order('full_name', { ascending: sortOrder === 'asc' })
        break
      case 'score':
        // For now, use updated_at as proxy for activity score
        query = query.order('updated_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    return query
  }

  /**
   * Transform database profiles to application format
   */
  private static transformProfiles(profiles: any[]): Profile[] {
    return profiles.map(profile => ({
      ...profile,
      created_at: new Date(profile.created_at),
      updated_at: new Date(profile.updated_at),
      portfolio_images: profile.portfolio_images?.map((img: any) => ({
        ...img,
        created_at: new Date(img.created_at)
      })) || []
    }))
  }

  /**
   * Get profile name and username suggestions
   */
  private static async getProfileSuggestions(
    query: string, 
    limit: number
  ): Promise<SearchSuggestion[]> {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, full_name, role, avatar_url')
      .or(`full_name.ilike.%${query}%, username.ilike.%${query}%`)
      .limit(limit)

    const suggestions: SearchSuggestion[] = []

    profiles?.forEach(profile => {
      // Username suggestions
      if (profile.username.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          type: 'profile',
          value: profile.username,
          label: `@${profile.username} (${profile.full_name})`
        })
      }

      // Full name suggestions
      if (profile.full_name.toLowerCase().includes(query.toLowerCase()) && 
          !suggestions.some(s => s.value === profile.full_name)) {
        suggestions.push({
          type: 'profile',
          value: profile.full_name,
          label: profile.full_name
        })
      }
    })

    return suggestions
  }

  /**
   * Get location suggestions
   */
  private static async getLocationSuggestions(
    query: string, 
    limit: number
  ): Promise<SearchSuggestion[]> {
    const { data: locations } = await supabase
      .from('profiles')
      .select('location')
      .ilike('location', `%${query}%`)
      .limit(limit)

    const uniqueLocations = [...new Set(locations?.map(l => l.location) || [])]
    
    return uniqueLocations.map(location => ({
      type: 'location' as const,
      value: location,
      label: location
    }))
  }

  /**
   * Get specialty suggestions
   */
  private static getSpecialtySuggestions(
    query: string, 
    limit: number
  ): SearchSuggestion[] {
    const specialtyMappings = {
      photographer: ['retrato', 'moda', 'comercial', 'editorial', 'belleza', 'lifestyle', 'producto', 'evento', 'artistico'],
      model: ['moda', 'comercial', 'fitness', 'artistico', 'editorial', 'glamour', 'alternativo'],
      makeup_artist: ['belleza', 'moda', 'editorial', 'novias', 'efectos_especiales', 'teatral', 'comercial'],
      stylist: ['moda', 'comercial', 'editorial', 'personal', 'vestuario', 'utileria'],
      producer: ['moda', 'comercial', 'editorial', 'video_musical', 'publicidad', 'eventos']
    }

    const suggestions: SearchSuggestion[] = []

    Object.entries(specialtyMappings).forEach(([role, specialties]) => {
      specialties.forEach(specialty => {
        if (specialty.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            type: 'specialty',
            value: specialty,
            label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')
          })
        }
      })
    })

    return suggestions.slice(0, limit)
  }

  /**
   * Sort suggestions by relevance and limit results
   */
  private static sortAndLimitSuggestions(
    suggestions: SearchSuggestion[], 
    query: string, 
    limit: number
  ): SearchSuggestion[] {
    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.value === suggestion.value && s.type === suggestion.type)
    )

    // Sort by relevance (exact matches first, then starts with, then contains)
    uniqueSuggestions.sort((a, b) => {
      const aValue = a.value.toLowerCase()
      const bValue = b.value.toLowerCase()
      const queryLower = query.toLowerCase()

      // Exact match
      if (aValue === queryLower && bValue !== queryLower) return -1
      if (bValue === queryLower && aValue !== queryLower) return 1

      // Starts with
      if (aValue.startsWith(queryLower) && !bValue.startsWith(queryLower)) return -1
      if (bValue.startsWith(queryLower) && !aValue.startsWith(queryLower)) return 1

      // Alphabetical for same relevance
      return aValue.localeCompare(bValue)
    })

    return uniqueSuggestions.slice(0, limit)
  }
}