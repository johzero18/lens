import { messageService } from '@/lib/services/messageService'
import { MessageStatus } from '@/types'

// Mock fetch
global.fetch = jest.fn()

describe('MessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMessages', () => {
    it('should fetch messages successfully', async () => {
      const mockResponse = {
        data: {
          messages: [
            {
              id: 'msg-1',
              subject: 'Test message',
              message: 'Hello world',
              status: MessageStatus.UNREAD,
              created_at: '2024-02-08T10:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            hasMore: false
          }
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await messageService.getMessages()

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      expect(result.data?.messages).toHaveLength(1)
    })

    it('should handle API errors', async () => {
      const mockError = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(mockError)
      })

      const result = await messageService.getMessages()

      expect(result.error).toEqual(mockError.error)
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await messageService.getMessages()

      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('should apply filters correctly', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { messages: [], pagination: {} } })
      })

      await messageService.getMessages({
        status: MessageStatus.UNREAD,
        page: 2,
        limit: 10
      })

      expect(fetch).toHaveBeenCalledWith('/api/messages?status=no_leido&page=2&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
    })
  })

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockResponse = {
        data: {
          id: 'msg-123',
          subject: 'Test message',
          message: 'Hello world',
          created_at: '2024-02-08T10:00:00Z'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messageData = {
        receiver_id: 'receiver-123',
        subject: 'Test message',
        message: 'Hello world'
      }

      const result = await messageService.sendMessage(messageData)

      expect(fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      })
      expect(result.data?.id).toBe('msg-123')
    })

    it('should handle rate limit errors', async () => {
      const mockError = {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Has alcanzado el límite de 10 mensajes por día'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve(mockError)
      })

      const result = await messageService.sendMessage({
        receiver_id: 'receiver-123',
        subject: 'Test',
        message: 'Hello'
      })

      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED')
    })
  })

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      const mockResponse = {
        data: {
          id: 'msg-123',
          read_at: '2024-02-08T10:00:00Z',
          already_read: false
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await messageService.markAsRead('msg-123')

      expect(fetch).toHaveBeenCalledWith('/api/messages/msg-123/read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      expect(result.data?.already_read).toBe(false)
    })
  })

  describe('replyToMessage', () => {
    it('should reply to message successfully', async () => {
      const mockResponse = {
        data: {
          id: 'reply-123',
          subject: 'Re: Test message',
          message: 'Thank you for your message',
          created_at: '2024-02-08T10:00:00Z'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await messageService.replyToMessage('msg-123', 'Thank you for your message')

      expect(fetch).toHaveBeenCalledWith('/api/messages/msg-123/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: 'Thank you for your message' })
      })
      expect(result.data?.id).toBe('reply-123')
    })
  })

  describe('validateContactForm', () => {
    it('should validate form successfully', () => {
      const formData = {
        subject: 'Valid subject',
        message: 'Valid message content',
        project_type: 'fashion',
        budget_range: '50k_100k',
        timeline: 'Next month'
      }

      const result = messageService.validateContactForm(formData)

      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should validate required fields', () => {
      const formData = {
        subject: '',
        message: '',
        project_type: '',
        budget_range: '',
        timeline: ''
      }

      const result = messageService.validateContactForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.subject).toBe('El asunto es requerido')
      expect(result.errors.message).toBe('El mensaje es requerido')
    })

    it('should validate field lengths', () => {
      const formData = {
        subject: 'a'.repeat(101), // Too long
        message: 'b'.repeat(1001), // Too long
        project_type: '',
        budget_range: '',
        timeline: ''
      }

      const result = messageService.validateContactForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.subject).toContain('100 caracteres')
      expect(result.errors.message).toContain('1000 caracteres')
    })
  })

  describe('formatMessagePreview', () => {
    it('should return full message if under limit', () => {
      const message = 'Short message'
      const result = messageService.formatMessagePreview(message, 150)

      expect(result).toBe('Short message')
    })

    it('should truncate long messages', () => {
      const message = 'a'.repeat(200)
      const result = messageService.formatMessagePreview(message, 150)

      expect(result).toHaveLength(153) // 150 + '...'
      expect(result.endsWith('...')).toBe(true)
    })
  })

  describe('getProjectTypeDisplayName', () => {
    it('should return display name for known types', () => {
      expect(messageService.getProjectTypeDisplayName('fashion')).toBe('Sesión de moda')
      expect(messageService.getProjectTypeDisplayName('commercial')).toBe('Comercial/Publicidad')
      expect(messageService.getProjectTypeDisplayName('editorial')).toBe('Editorial')
    })

    it('should return original value for unknown types', () => {
      expect(messageService.getProjectTypeDisplayName('unknown')).toBe('unknown')
    })
  })

  describe('getBudgetRangeDisplayName', () => {
    it('should return display name for known ranges', () => {
      expect(messageService.getBudgetRangeDisplayName('under_50k')).toBe('Menos de $50.000')
      expect(messageService.getBudgetRangeDisplayName('50k_100k')).toBe('$50.000 - $100.000')
      expect(messageService.getBudgetRangeDisplayName('tbd')).toBe('A definir')
    })

    it('should return original value for unknown ranges', () => {
      expect(messageService.getBudgetRangeDisplayName('unknown')).toBe('unknown')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-02-08T10:30:00Z')
      const result = messageService.formatDate(date)

      expect(result).toContain('8')
      expect(result).toContain('feb')
      expect(result).toContain('2024')
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should handle string dates', () => {
      const dateString = '2024-02-08T10:30:00Z'
      const result = messageService.formatDate(dateString)

      expect(result).toContain('8')
      expect(result).toContain('feb')
      expect(result).toContain('2024')
    })
  })

  describe('getRelativeTime', () => {
    beforeEach(() => {
      // Mock current time
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-02-08T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return "hace unos segundos" for recent messages', () => {
      const date = new Date('2024-02-08T11:59:30Z') // 30 seconds ago
      const result = messageService.getRelativeTime(date)

      expect(result).toBe('hace unos segundos')
    })

    it('should return minutes for messages within an hour', () => {
      const date = new Date('2024-02-08T11:45:00Z') // 15 minutes ago
      const result = messageService.getRelativeTime(date)

      expect(result).toBe('hace 15 minutos')
    })

    it('should return hours for messages within a day', () => {
      const date = new Date('2024-02-08T10:00:00Z') // 2 hours ago
      const result = messageService.getRelativeTime(date)

      expect(result).toBe('hace 2 horas')
    })

    it('should return days for messages within a week', () => {
      const date = new Date('2024-02-06T12:00:00Z') // 2 days ago
      const result = messageService.getRelativeTime(date)

      expect(result).toBe('hace 2 días')
    })

    it('should return formatted date for older messages', () => {
      const date = new Date('2024-01-01T12:00:00Z') // More than a week ago
      const result = messageService.getRelativeTime(date)

      expect(result).toContain('1')
      expect(result).toContain('ene')
      expect(result).toContain('2024')
    })
  })
})