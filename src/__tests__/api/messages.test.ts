/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/messages/route'
import { createClient } from '@/lib/supabase'
import { MessageStatus } from '@/types'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn()
}))

// Mock global Request if not available
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(public url: string, public init?: any) {}
  } as any
}

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            is: jest.fn(),
            not: jest.fn()
          }))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  })),
  functions: {
    invoke: jest.fn()
  }
}

describe('/api/messages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('GET /api/messages', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/messages')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return messages for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const mockMessages = [
        {
          id: 'msg-1',
          sender_id: 'sender-1',
          receiver_id: 'user-123',
          subject: 'Test message',
          message: 'Hello world',
          read_at: null,
          created_at: '2024-02-08T10:00:00Z',
          sender: { username: 'sender', full_name: 'Sender Name', role: 'photographer' }
        }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockQuery = {
        is: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      }
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockMessages,
                error: null,
                count: 1
              })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/messages')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.messages).toHaveLength(1)
      expect(data.data.messages[0].status).toBe(MessageStatus.UNREAD)
    })

    it('should filter messages by status', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const mockQuery = {
        is: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      }
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockReturnValue(mockQuery)
            })
          })
        })
      })

      mockQuery.is.mockResolvedValue({
        data: [],
        error: null,
        count: 0
      })

      const request = new NextRequest('http://localhost:3000/api/messages?status=unread')
      const response = await GET(request)

      expect(mockQuery.is).toHaveBeenCalledWith('read_at', null)
    })
  })

  describe('POST /api/messages', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'receiver-123',
          subject: 'Test',
          message: 'Hello'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should validate required fields', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'receiver-123',
          subject: '',
          message: 'Hello'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should validate field lengths', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const longSubject = 'a'.repeat(101)
      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'receiver-123',
          subject: longSubject,
          message: 'Hello'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.message).toContain('100 caracteres')
    })

    it('should prevent self-messaging', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'user-123', // Same as sender
          subject: 'Test',
          message: 'Hello'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.message).toContain('ti mismo')
    })

    it('should verify receiver exists', async () => {
      const mockUser = { id: 'user-123' }
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Not found')
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'nonexistent-user',
          subject: 'Test',
          message: 'Hello'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('NOT_FOUND')
    })

    it('should send message successfully', async () => {
      const mockUser = { id: 'user-123' }
      const mockReceiver = {
        id: 'receiver-123',
        username: 'receiver',
        full_name: 'Receiver Name',
        role: 'model'
      }
      const mockMessage = {
        id: 'msg-123',
        sender_id: 'user-123',
        receiver_id: 'receiver-123',
        subject: 'Test message',
        message: 'Hello world',
        created_at: '2024-02-08T10:00:00Z',
        sender: { username: 'sender', full_name: 'Sender Name', role: 'photographer' },
        receiver: mockReceiver
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock receiver lookup
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockReceiver,
              error: null
            })
          })
        })
      })

      // Mock message insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockMessage,
              error: null
            })
          })
        })
      })

      // Mock email notification
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: 'receiver-123',
          subject: 'Test message',
          message: 'Hello world'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.data.id).toBe('msg-123')
      expect(data.data.subject).toBe('Test message')
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-message-notification',
        {
          body: {
            messageId: 'msg-123',
            type: 'new-message'
          }
        }
      )
    })
  })
})