import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// PATCH /api/messages/[messageId]/read - Mark message as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado' } },
        { status: 401 }
      )
    }

    const { messageId } = await params

    if (!messageId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ID de mensaje requerido' } },
        { status: 400 }
      )
    }

    // Verify message exists and user is the receiver
    const { data: message, error: fetchError } = await supabase
      .from('contacts')
      .select('id, receiver_id, read_at')
      .eq('id', messageId)
      .eq('receiver_id', user.id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Mensaje no encontrado' } },
        { status: 404 }
      )
    }

    // If already read, return current state
    if (message.read_at) {
      return NextResponse.json({
        data: {
          id: message.id,
          read_at: new Date(message.read_at),
          already_read: true
        }
      })
    }

    // Mark as read
    const { data: updatedMessage, error: updateError } = await supabase
      .from('contacts')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('receiver_id', user.id)
      .select('id, read_at')
      .single()

    if (updateError) {
      console.error('Error marking message as read:', updateError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Error al marcar mensaje como leído' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        id: updatedMessage.id,
        read_at: new Date(updatedMessage.read_at),
        already_read: false
      }
    })

  } catch (error) {
    console.error('Unexpected error in PATCH /api/messages/[messageId]/read:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}