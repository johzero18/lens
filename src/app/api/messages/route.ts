import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { ContactMessage, MessageStatus } from '@/types'

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX = 10 // 10 messages per day
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
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

// GET /api/messages - Get messages for authenticated user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as MessageStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('contacts')
      .select(`
        *,
        sender:profiles!contacts_sender_id_fkey(username, full_name, role, avatar_url),
        receiver:profiles!contacts_receiver_id_fkey(username, full_name, role, avatar_url)
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status && Object.values(MessageStatus).includes(status)) {
      // For status filtering, we need to determine read status based on read_at
      if (status === MessageStatus.UNREAD) {
        query = query.is('read_at', null)
      } else if (status === MessageStatus.READ) {
        query = query.not('read_at', 'is', null)
      }
      // Note: REPLIED status would need additional logic or database field
    }

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Error al obtener mensajes' } },
        { status: 500 }
      )
    }

    // Transform messages to include computed status
    const transformedMessages = messages?.map(message => ({
      ...message,
      status: message.read_at ? MessageStatus.READ : MessageStatus.UNREAD,
      created_at: new Date(message.created_at),
      read_at: message.read_at ? new Date(message.read_at) : undefined
    })) || []

    return NextResponse.json({
      data: {
        messages: transformedMessages,
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        }
      }
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/messages:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
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
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString()
          }
        }
      )
    }

    const body = await request.json()
    const { receiver_id, subject, message, project_type, budget_range, timeline } = body

    // Validate required fields
    if (!receiver_id || !subject || !message) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Campos requeridos: receiver_id, subject, message' } },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (subject.length > 100) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'El asunto no puede exceder 100 caracteres' } },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'El mensaje no puede exceder 1000 caracteres' } },
        { status: 400 }
      )
    }

    // Prevent self-messaging
    if (receiver_id === user.id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No puedes enviarte mensajes a ti mismo' } },
        { status: 400 }
      )
    }

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id, username, full_name, role')
      .eq('id', receiver_id)
      .single()

    if (receiverError || !receiver) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Usuario destinatario no encontrado' } },
        { status: 404 }
      )
    }

    // Build message content with additional fields
    let fullMessage = message
    if (project_type || budget_range || timeline) {
      fullMessage += '\n\n--- Detalles del proyecto ---'
      if (project_type) fullMessage += `\nTipo de proyecto: ${project_type}`
      if (budget_range) fullMessage += `\nPresupuesto: ${budget_range}`
      if (timeline) fullMessage += `\nCronograma: ${timeline}`
    }

    // Insert message into database
    const { data: newMessage, error: insertError } = await supabase
      .from('contacts')
      .insert({
        sender_id: user.id,
        receiver_id,
        subject,
        message: fullMessage
      })
      .select(`
        *,
        sender:profiles!contacts_sender_id_fkey(username, full_name, role, avatar_url),
        receiver:profiles!contacts_receiver_id_fkey(username, full_name, role, avatar_url)
      `)
      .single()

    if (insertError) {
      console.error('Error inserting message:', insertError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Error al enviar el mensaje' } },
        { status: 500 }
      )
    }

    // Increment rate limit counter
    incrementRateLimit(user.id)

    // TODO: Send email notification to receiver
    // This would be implemented using Supabase Edge Functions or a service like SendGrid
    try {
      await sendEmailNotification(receiver, newMessage, user)
    } catch (emailError) {
      console.error('Error sending email notification:', emailError)
      // Don't fail the request if email fails
    }

    // Transform response
    const transformedMessage = {
      ...newMessage,
      status: MessageStatus.UNREAD,
      created_at: new Date(newMessage.created_at)
    }

    return NextResponse.json(
      { 
        data: transformedMessage,
        meta: {
          rateLimit: {
            remaining: rateLimit.remaining - 1,
            resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString()
          }
        }
      },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString()
        }
      }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/messages:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    )
  }
}

// Helper function to send email notification
async function sendEmailNotification(receiver: any, message: any, sender: any) {
  try {
    const supabase = createClient()
    
    // Call the Edge Function for email notification
    const { data, error } = await supabase.functions.invoke('send-message-notification', {
      body: {
        messageId: message.id,
        type: 'new-message'
      }
    })

    if (error) {
      console.error('Error calling email notification function:', error)
      return
    }

    console.log('Email notification sent successfully:', data)
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}