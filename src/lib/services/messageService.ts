import { ContactMessage, ContactFormData, MessageStatus, ApiResponse } from '@/types'

export interface MessageFilters {
  status?: 'all' | MessageStatus
  dateRange?: 'all' | 'today' | 'week' | 'month'
  page?: number
  limit?: number
}

export interface MessagesResponse {
  messages: ContactMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface SendMessageRequest {
  receiver_id: string
  subject: string
  message: string
  project_type?: string
  budget_range?: string
  timeline?: string
}

export interface RateLimitInfo {
  remaining: number
  resetTime: string
}

export class MessageService {
  private baseUrl = '/api/messages'

  /**
   * Get messages for the authenticated user
   */
  async getMessages(filters: MessageFilters = {}): Promise<ApiResponse<MessagesResponse>> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: result.error }
      }

      // Apply client-side date filtering if needed
      let messages = result.data.messages
      if (filters.dateRange && filters.dateRange !== 'all') {
        messages = this.filterMessagesByDate(messages, filters.dateRange)
      }

      return {
        data: {
          ...result.data,
          messages
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión al obtener mensajes'
        }
      }
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<ContactMessage & { meta?: { rateLimit: RateLimitInfo } }>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: result.error }
      }

      return { data: result.data }
    } catch (error) {
      console.error('Error sending message:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión al enviar mensaje'
        }
      }
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<ApiResponse<{ id: string; read_at: Date; already_read: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: result.error }
      }

      return { data: result.data }
    } catch (error) {
      console.error('Error marking message as read:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión al marcar mensaje como leído'
        }
      }
    }
  }

  /**
   * Reply to a message
   */
  async replyToMessage(messageId: string, replyText: string): Promise<ApiResponse<ContactMessage & { meta?: { rateLimit: RateLimitInfo } }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: replyText })
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: result.error }
      }

      return { data: result.data }
    } catch (error) {
      console.error('Error replying to message:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión al enviar respuesta'
        }
      }
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await this.getMessages({ status: MessageStatus.UNREAD, limit: 1 })
      
      if (response.error) {
        return { error: response.error }
      }

      return {
        data: {
          count: response.data?.pagination.total || 0
        }
      }
    } catch (error) {
      console.error('Error getting unread count:', error)
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error al obtener contador de mensajes no leídos'
        }
      }
    }
  }

  /**
   * Validate contact form data
   */
  validateContactForm(formData: ContactFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = 'El asunto es requerido'
    } else if (formData.subject.length > 100) {
      errors.subject = 'El asunto no puede exceder 100 caracteres'
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'El mensaje es requerido'
    } else if (formData.message.length > 1000) {
      errors.message = 'El mensaje no puede exceder 1000 caracteres'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Format message for display
   */
  formatMessagePreview(message: string, maxLength: number = 150): string {
    if (message.length <= maxLength) {
      return message
    }
    return message.substring(0, maxLength).trim() + '...'
  }

  /**
   * Get display name for project type
   */
  getProjectTypeDisplayName(type: string): string {
    const projectTypes: Record<string, string> = {
      fashion: 'Sesión de moda',
      commercial: 'Comercial/Publicidad',
      editorial: 'Editorial',
      portrait: 'Retratos',
      beauty: 'Belleza',
      lifestyle: 'Lifestyle',
      event: 'Evento',
      other: 'Otro',
    }
    return projectTypes[type] || type
  }

  /**
   * Get display name for budget range
   */
  getBudgetRangeDisplayName(range: string): string {
    const budgetRanges: Record<string, string> = {
      under_50k: 'Menos de $50.000',
      '50k_100k': '$50.000 - $100.000',
      '100k_250k': '$100.000 - $250.000',
      '250k_500k': '$250.000 - $500.000',
      over_500k: 'Más de $500.000',
      tbd: 'A definir',
    }
    return budgetRanges[range] || range
  }

  /**
   * Filter messages by date range (client-side)
   */
  private filterMessagesByDate(messages: ContactMessage[], dateRange: string): ContactMessage[] {
    const now = new Date()
    
    return messages.filter(message => {
      const messageDate = new Date(message.created_at)
      
      switch (dateRange) {
        case 'today':
          return messageDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return messageDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return messageDate >= monthAgo
        default:
          return true
      }
    })
  }

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  /**
   * Get relative time (e.g., "hace 2 horas")
   */
  getRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'hace unos segundos'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `hace ${days} día${days > 1 ? 's' : ''}`
    } else {
      return this.formatDate(dateObj)
    }
  }
}

// Export singleton instance
export const messageService = new MessageService()