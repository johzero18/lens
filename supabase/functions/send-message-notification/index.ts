import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailNotificationRequest {
  messageId: string
  type: 'new-message' | 'message-reply'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { messageId, type }: EmailNotificationRequest = await req.json()

    if (!messageId || !type) {
      return new Response(
        JSON.stringify({ error: 'messageId and type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get message details with sender and receiver info
    const { data: message, error: messageError } = await supabaseClient
      .from('contacts')
      .select(`
        *,
        sender:profiles!contacts_sender_id_fkey(id, username, full_name, role, avatar_url),
        receiver:profiles!contacts_receiver_id_fkey(id, username, full_name, role, avatar_url)
      `)
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get receiver's email from auth.users
    const { data: receiverAuth, error: authError } = await supabaseClient.auth.admin.getUserById(
      message.receiver.id
    )

    if (authError || !receiverAuth.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Receiver email not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email data
    const emailData = {
      to: receiverAuth.user.email,
      subject: type === 'new-message' 
        ? `Nuevo mensaje en Project Lens: ${message.subject}`
        : `Respuesta en Project Lens: ${message.subject}`,
      html: generateEmailHTML(message, type),
      text: generateEmailText(message, type)
    }

    // Send email using your preferred email service
    // This example uses a generic email service API
    const emailResponse = await sendEmail(emailData)

    if (!emailResponse.success) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId,
        emailSent: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending email notification:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateEmailHTML(message: any, type: string): string {
  const isReply = type === 'message-reply'
  const baseUrl = Deno.env.get('SITE_URL') || 'https://projectlens.com'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isReply ? 'Nueva respuesta' : 'Nuevo mensaje'} - Project Lens</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px 20px; border: 1px solid #e1e5e9; }
        .message-preview { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        .sender-info { display: flex; align-items: center; margin-bottom: 15px; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Lens</h1>
          <p>${isReply ? 'Tienes una nueva respuesta' : 'Tienes un nuevo mensaje'}</p>
        </div>
        
        <div class="content">
          <div class="sender-info">
            <div class="avatar">${message.sender.full_name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>${message.sender.full_name}</strong><br>
              <span style="color: #666;">${message.sender.role}</span>
            </div>
          </div>
          
          <h2 style="color: #333; margin-bottom: 10px;">${message.subject}</h2>
          
          <div class="message-preview">
            <p>${message.message.length > 200 ? message.message.substring(0, 200) + '...' : message.message}</p>
          </div>
          
          <p>Para ver el mensaje completo y responder, haz clic en el botón de abajo:</p>
          
          <a href="${baseUrl}/mensajes" class="button">Ver mensaje completo</a>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            También puedes visitar el perfil de ${message.sender.full_name} en: 
            <a href="${baseUrl}/${message.sender.username}" style="color: #667eea;">${baseUrl}/${message.sender.username}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Este email fue enviado desde Project Lens, la red profesional para la industria visual.</p>
          <p>Si no deseas recibir estas notificaciones, puedes desactivarlas en tu perfil.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateEmailText(message: any, type: string): string {
  const isReply = type === 'message-reply'
  const baseUrl = Deno.env.get('SITE_URL') || 'https://projectlens.com'
  
  return `
Project Lens - ${isReply ? 'Nueva respuesta' : 'Nuevo mensaje'}

${isReply ? 'Tienes una nueva respuesta' : 'Tienes un nuevo mensaje'} de ${message.sender.full_name} (${message.sender.role})

Asunto: ${message.subject}

Mensaje:
${message.message.length > 300 ? message.message.substring(0, 300) + '...' : message.message}

Para ver el mensaje completo y responder, visita:
${baseUrl}/mensajes

Perfil del remitente:
${baseUrl}/${message.sender.username}

---
Este email fue enviado desde Project Lens, la red profesional para la industria visual.
Si no deseas recibir estas notificaciones, puedes desactivarlas en tu perfil.
  `
}

async function sendEmail(emailData: any): Promise<{ success: boolean; error?: string }> {
  // This is a placeholder for actual email sending logic
  // You would integrate with services like:
  // - SendGrid
  // - Mailgun  
  // - Amazon SES
  // - Resend
  // - etc.
  
  const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
  const emailServiceKey = Deno.env.get('EMAIL_SERVICE_KEY')
  
  if (!emailServiceUrl || !emailServiceKey) {
    console.log('Email service not configured, skipping email send')
    console.log('Email would be sent:', emailData)
    return { success: true } // Return success for development
  }
  
  try {
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })
    
    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}