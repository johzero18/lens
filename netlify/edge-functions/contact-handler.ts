import type { Context } from "https://edge.netlify.com"

interface ContactRequest {
  senderEmail: string
  receiverEmail: string
  subject: string
  message: string
  senderName: string
}

export default async (request: Request, context: Context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: ContactRequest = await request.json()
    
    // Basic validation
    if (!body.senderEmail || !body.receiverEmail || !body.subject || !body.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting by IP
    const clientIP = context.ip
    const rateLimitKey = `contact_${clientIP}`
    
    // In a real implementation, you'd use a KV store or database
    // For now, we'll just log and pass through to the main API
    
    console.log('Contact form submission:', {
      from: body.senderEmail,
      to: body.receiverEmail,
      subject: body.subject,
      ip: clientIP,
      timestamp: new Date().toISOString(),
    })

    // Forward to main API
    const apiResponse = await fetch(`${new URL(request.url).origin}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await apiResponse.json()
    
    return new Response(JSON.stringify(result), {
      status: apiResponse.status,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Contact handler error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Failed to process contact request'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  path: "/api/contact-edge"
}