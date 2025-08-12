import { NextRequest, NextResponse } from 'next/server'
import { StorageService, ValidationService } from '@/lib/services'
import { supabase } from '@/lib/supabase'

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'avatar' | 'cover' | 'portfolio'

    if (!file) {
      return NextResponse.json(
        { error: { code: 'MISSING_FILE', message: 'Archivo requerido' } },
        { status: 400 }
      )
    }

    if (!type || !['avatar', 'cover', 'portfolio'].includes(type)) {
      return NextResponse.json(
        { error: { code: 'INVALID_TYPE', message: 'Tipo de archivo inválido' } },
        { status: 400 }
      )
    }

    // Validate file
    const validation = ValidationService.validateFileUpload(file, type)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: validation.errors[0].message,
            details: validation.errors
          } 
        },
        { status: 400 }
      )
    }

    // Upload file
    const uploadOptions = {
      quality: type === 'avatar' ? 90 : 85,
      maxWidth: type === 'avatar' ? 400 : type === 'cover' ? 1200 : 1200,
      maxHeight: type === 'avatar' ? 400 : type === 'cover' ? 300 : undefined
    }

    const result = await StorageService.uploadImage(
      file,
      `${user.id}/${type}`,
      uploadOptions
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: { code: 'MISSING_URL', message: 'URL de imagen requerida' } },
        { status: 400 }
      )
    }

    const result = await StorageService.deleteImageByUrl(imageUrl)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}