import { NextRequest, NextResponse } from 'next/server'
import { ProfileService, ValidationService } from '@/lib/services'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
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

    const { imageId } = params
    const body = await request.json()
    const { alt_text, sort_order } = body

    // Validate update data
    const validation = ValidationService.validatePortfolioImageData({
      alt_text,
      sort_order
    })

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

    const result = await ProfileService.updatePortfolioImage(imageId, {
      alt_text: alt_text ? ValidationService.sanitizeText(alt_text) : undefined,
      sort_order
    })

    if (result.error) {
      const status = result.error.code === 'IMAGE_NOT_FOUND' ? 404 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Portfolio image PUT error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
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

    const { imageId } = params

    const result = await ProfileService.deletePortfolioImage(imageId)

    if (result.error) {
      const status = result.error.code === 'IMAGE_NOT_FOUND' ? 404 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Portfolio image DELETE error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}