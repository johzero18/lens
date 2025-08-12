import { NextRequest, NextResponse } from 'next/server'
import { ProfileService, ValidationService } from '@/lib/services'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const userId = searchParams.get('userId')

    if (!username && !userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMETER', message: 'Username o userId requerido' } },
        { status: 400 }
      )
    }

    let result
    if (username) {
      result = await ProfileService.getProfileByUsername(username)
    } else {
      result = await ProfileService.getProfileById(userId!)
    }

    if (result.error) {
      const status = result.error.code === 'PROFILE_NOT_FOUND' ? 404 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token de autorización requerido' } },
        { status: 401 }
      )
    }

    // Verify JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token inválido' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { full_name, bio, location, role_specific_data, avatar_url, cover_image_url } = body

    // Get user's current profile to validate role
    const currentProfile = await ProfileService.getProfileById(user.id)
    if (currentProfile.error) {
      return NextResponse.json({ error: currentProfile.error }, { status: 404 })
    }

    // Validate update data
    const validation = ValidationService.validateProfileUpdate({
      full_name,
      bio,
      location,
      role_specific_data,
      avatar_url,
      cover_image_url
    }, currentProfile.data!.role)

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Datos de perfil inválidos',
            details: validation.errors
          } 
        },
        { status: 400 }
      )
    }

    // Update profile
    const result = await ProfileService.updateProfile(user.id, {
      full_name: full_name ? ValidationService.sanitizeText(full_name) : undefined,
      bio: bio ? ValidationService.sanitizeText(bio) : undefined,
      location: location ? ValidationService.sanitizeText(location) : undefined,
      role_specific_data,
      avatar_url,
      cover_image_url
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}