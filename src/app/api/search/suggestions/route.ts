import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SearchSuggestion } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') // 'profile', 'location', 'specialty'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const suggestions: SearchSuggestion[] = []

    // Profile suggestions (names and usernames)
    if (!type || type === 'profile') {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('username, full_name, role, avatar_url')
        .or(`full_name.ilike.%${query}%, username.ilike.%${query}%`)
        .limit(limit)

      if (!profilesError && profiles) {
        profiles.forEach(profile => {
          // Add username suggestion
          if (profile.username.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: 'profile',
              value: profile.username,
              label: `@${profile.username} (${profile.full_name})`,
            })
          }
          // Add full name suggestion
          if (profile.full_name.toLowerCase().includes(query.toLowerCase()) && 
              !suggestions.some(s => s.value === profile.full_name)) {
            suggestions.push({
              type: 'profile',
              value: profile.full_name,
              label: profile.full_name,
            })
          }
        })
      }
    }

    // Location suggestions
    if (!type || type === 'location') {
      const { data: locations, error: locationsError } = await supabase
        .from('profiles')
        .select('location')
        .ilike('location', `%${query}%`)
        .limit(limit)

      if (!locationsError && locations) {
        const uniqueLocations = [...new Set(locations.map(l => l.location))]
        uniqueLocations.forEach(location => {
          if (!suggestions.some(s => s.value === location)) {
            suggestions.push({
              type: 'location',
              value: location,
              label: location,
            })
          }
        })
      }
    }

    // Specialty suggestions (from role_specific_data)
    if (!type || type === 'specialty') {
      const specialtyMappings = {
        photographer: ['retrato', 'moda', 'comercial', 'editorial', 'belleza', 'lifestyle', 'producto', 'evento', 'artistico'],
        model: ['moda', 'comercial', 'fitness', 'artistico', 'editorial', 'glamour', 'alternativo'],
        makeup_artist: ['belleza', 'moda', 'editorial', 'novias', 'efectos_especiales', 'teatral', 'comercial'],
        stylist: ['moda', 'comercial', 'editorial', 'personal', 'vestuario', 'utileria'],
        producer: ['moda', 'comercial', 'editorial', 'video_musical', 'publicidad', 'eventos']
      }

      Object.entries(specialtyMappings).forEach(([role, specialties]) => {
        specialties.forEach(specialty => {
          if (specialty.toLowerCase().includes(query.toLowerCase()) && 
              !suggestions.some(s => s.value === specialty)) {
            suggestions.push({
              type: 'specialty',
              value: specialty,
              label: specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' '),
            })
          }
        })
      })
    }

    // Sort suggestions by relevance (exact matches first)
    suggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
      const bExact = b.value.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
      return bExact - aExact
    })

    // Limit results
    const limitedSuggestions = suggestions.slice(0, limit)

    return NextResponse.json({ data: limitedSuggestions })

  } catch (error) {
    console.error('Search suggestions API error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}