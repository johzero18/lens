import { NextRequest, NextResponse } from 'next/server'
import { ProfileService, ValidationService } from '@/lib/services'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMETER', message: 'userId requerido' } },
        { status: 400 }
      )
    }

    const result = await ProfileService.getPortfolioImages(userId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token de autorización requerido' } },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token inválido' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { images } = body

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: { code: 'INVALID_DATA', message: 'Se requiere un array de imágenes' } },
        { status: 400 }
      )
    }

    // Validate each image
    for (const image of images) {
      const validation = ValidationService.validatePortfolioImageData(image)
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: 'Datos de imagen inválidos',
              details: validation.errors
            } 
          },
          { status: 400 }
        )
      }
    }

    const result = await ProfileService.addPortfolioImages(user.id, images)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Portfolio POST error:', error)
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

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Token inválido' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageOrders } = body

    if (!Array.isArray(imageOrders)) {
      return NextResponse.json(
        { error: { code: 'INVALID_DATA', message: 'Se requiere un array de órdenes de imagen' } },
        { status: 400 }
      )
    }

    const result = await ProfileService.reorderPortfolioImages(user.id, imageOrders)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Portfolio PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}