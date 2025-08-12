import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SearchFilters, SearchResults, UserRole, ExperienceLevel } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse search parameters
    const filters: SearchFilters = {
      query: searchParams.get('query') || undefined,
      role: searchParams.get('role') as UserRole || undefined,
      location: searchParams.get('location') || undefined,
      experience_level: searchParams.get('experience_level') as ExperienceLevel || undefined,
      specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || undefined,
      travel_availability: searchParams.get('travel_availability') === 'true' ? true : undefined,
    }

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 per page
    const offset = (page - 1) * limit

    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Build the query
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
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    if (filters.query) {
      // Search in multiple fields
      query = query.or(`
        full_name.ilike.%${filters.query}%,
        bio.ilike.%${filters.query}%,
        location.ilike.%${filters.query}%,
        username.ilike.%${filters.query}%
      `)
    }

    // Apply role-specific filters using JSONB queries
    if (filters.experience_level) {
      query = query.eq('role_specific_data->experience_level', filters.experience_level)
    }

    if (filters.specialties && filters.specialties.length > 0) {
      // Check if any of the specialties match
      const specialtyConditions = filters.specialties.map(specialty => 
        `role_specific_data->'specialties' ? '${specialty}'`
      ).join(' or ')
      query = query.or(specialtyConditions)
    }

    if (filters.travel_availability !== undefined) {
      query = query.eq('role_specific_data->travel_availability', filters.travel_availability)
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'full_name', 'username']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // Get total count for pagination
    const countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Apply same filters to count query
    if (filters.role) {
      countQuery.eq('role', filters.role)
    }
    if (filters.location) {
      countQuery.ilike('location', `%${filters.location}%`)
    }
    if (filters.query) {
      countQuery.or(`
        full_name.ilike.%${filters.query}%,
        bio.ilike.%${filters.query}%,
        location.ilike.%${filters.query}%,
        username.ilike.%${filters.query}%
      `)
    }
    if (filters.experience_level) {
      countQuery.eq('role_specific_data->experience_level', filters.experience_level)
    }
    if (filters.specialties && filters.specialties.length > 0) {
      const specialtyConditions = filters.specialties.map(specialty => 
        `role_specific_data->'specialties' ? '${specialty}'`
      ).join(' or ')
      countQuery.or(specialtyConditions)
    }
    if (filters.travel_availability !== undefined) {
      countQuery.eq('role_specific_data->travel_availability', filters.travel_availability)
    }

    // Execute queries
    const [{ data: profiles, error: profilesError }, { count, error: countError }] = await Promise.all([
      query.range(offset, offset + limit - 1),
      countQuery
    ])

    if (profilesError) {
      console.error('Search profiles error:', profilesError)
      return NextResponse.json(
        { error: { code: 'SEARCH_ERROR', message: 'Error al buscar perfiles' } },
        { status: 500 }
      )
    }

    if (countError) {
      console.error('Count profiles error:', countError)
      return NextResponse.json(
        { error: { code: 'COUNT_ERROR', message: 'Error al contar perfiles' } },
        { status: 500 }
      )
    }

    // Transform the data
    const transformedProfiles = profiles?.map(profile => ({
      ...profile,
      created_at: new Date(profile.created_at),
      updated_at: new Date(profile.updated_at),
      portfolio_images: profile.portfolio_images?.map(img => ({
        ...img,
        created_at: new Date(img.created_at)
      })) || []
    })) || []

    const searchResults: SearchResults = {
      profiles: transformedProfiles,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    }

    return NextResponse.json({ data: searchResults })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}