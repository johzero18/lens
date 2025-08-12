import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Rate limiting for replies (same as regular messages)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX }
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - userLimit.count }
}

function incrementRateLimit(userId: string): void {
  const userLimit = rateLimitStore.get(userId)
  if (userLimit) {
    userLimit.count += 1
    rateLimitStore.set(userId, userLimit)
  }
}

// POST /api/messages/[messageId]/reply - Reply to a message
export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
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

    // Check rate limit
    const rateLimit = checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'Has alcanzado el límite de 10 mensajes por día' 
          } 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    const { messageId } = params
    const body = await request.json()
    const { message } = body

    if (!messageId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'ID de mensaje requerido' } },
        { status: 400 }
      )
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'El mensaje de respuesta es requerido' } },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'El mensaje no puede exceder 1000 caracteres' } },
        { status: 400 }
      )
    }

    // Get original message to verify permissions and get sender info
    const { data: originalMessage, error: fetchError } = await supabase
      .from('contacts')
      .select(`
        id,
        sender_id,
        receiver_id,
        subject,
        sender:profiles!contacts_sender_id_fkey(id, username, full_name, role, avatar_url),
        receiver:profiles!contacts_receiver_id_fkey(id, username, full_name, role, avatar_url)
      `)
      .eq('id', messageId)
      .single()

    if (fetchError || !originalMessage) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Mensaje original no encontrado' } },
        { status: 404 }
      )
    }

    // Verify user is the receiver of the original message
    if (originalMessage.receiver_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'No tienes permisos para responder este mensaje' } },
        { status: 403 }
      )
    }

    // Create reply message (sender becomes receiver and vice versa)
    const replySubject = originalMessage.subject.startsWith('Re: ') 
      ? originalMessage.subject 
      : `Re: ${originalMessage.subject}`

    const { data: replyMessage, error: insertError } = await supabase
      .from('contacts')
      .insert({
        sender_id: user.id,
        receiver_id: originalMessage.sender_id,
        subject: replySubject,
        message: message.trim()
      })
      .select(`
        *,
        sender:profiles!contacts_sender_id_fkey(username, full_name, role, avatar_url),
        receiver:profiles!contacts_receiver_id_fkey(username, full_name, role, avatar_url)
      `)
      .single()

    if (insertError) {
      console.error('Error inserting reply message:', insertError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Error al enviar la respuesta' } },
        { status: 500 }
      )
    }

    // Mark original message as read if not already
    if (!originalMessage.read_at) {
      await supabase
        .from('contacts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
    }

    // Increment rate limit counter
    incrementRateLimit(user.id)

    // TODO: Send email notification to original sender
    try {
      await sendReplyEmailNotification(originalMessage.sender, replyMessage, user)
    } catch (emailError) {
      console.error('Error sending reply email notification:', emailError)
    }

    return NextResponse.json(
      { 
        data: {
          ...replyMessage,
          created_at: new Date(replyMessage.created_at)
        },
        meta: {
          rateLimit: {
            remaining: rateLimit.remaining - 1
          }
        }
      },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString()
        }
      }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/messages/[messageId]/reply:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

// Helper function to send reply email notification
async function sendReplyEmailNotification(receiver: any, replyMessage: any, sender: any) {
  try {
    const supabase = createClient()
    
    // Call the Edge Function for email notification
    const { data, error } = await supabase.functions.invoke('send-message-notification', {
      body: {
        messageId: replyMessage.id,
        type: 'message-reply'
      }
    })

    if (error) {
      console.error('Error calling reply email notification function:', error)
      return
    }

    console.log('Reply email notification sent successfully:', data)
  } catch (error) {
    console.error('Error sending reply email notification:', error)
  }
}