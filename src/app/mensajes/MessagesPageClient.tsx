'use client'

import React, { useState, useEffect } from 'react'
import { ContactMessage, MessageStatus } from '@/types'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'
import { messageService, MessageFilters } from '@/lib/services/messageService'

export default function MessagesPageClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MessageFilters>({
    status: 'all',
    dateRange: 'all',
  })
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await messageService.getMessages(filters)
      
      if (response.error) {
        setError(response.error.message)
        return
      }
      
      setMessages(response.data?.messages || [])
    } catch (err) {
      setError('Error al cargar los mensajes')
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [filters.status]) // Reload when status filter changes

  // Apply client-side date filtering
  const filteredMessages = filters.dateRange !== 'all' 
    ? messages.filter(message => {
        const now = new Date()
        const messageDate = new Date(message.created_at)
        
        switch (filters.dateRange) {
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
    : messages

  const handleMessageClick = async (message: ContactMessage) => {
    setSelectedMessage(message)
    
    // Mark as read if unread
    if (message.status === MessageStatus.UNREAD) {
      try {
        const response = await messageService.markAsRead(message.id)
        
        if (response.error) {
          console.error('Error marking message as read:', response.error)
          return
        }
        
        const updatedMessage = {
          ...message,
          status: MessageStatus.READ,
          read_at: response.data?.read_at || new Date(),
        }
        
        setMessages(prev => 
          prev.map(m => m.id === message.id ? updatedMessage : m)
        )
        setSelectedMessage(updatedMessage)
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setIsReplying(true)
    
    try {
      const response = await messageService.replyToMessage(selectedMessage.id, replyText)
      
      if (response.error) {
        if (response.error.code === 'RATE_LIMIT_EXCEEDED') {
          alert('Has alcanzado el límite de 10 mensajes por día. Intenta nuevamente mañana.')
        } else {
          alert(response.error.message || 'Error al enviar la respuesta')
        }
        return
      }
      
      // Update message status to replied
      const updatedMessage = {
        ...selectedMessage,
        status: MessageStatus.REPLIED,
      }
      
      setMessages(prev => 
        prev.map(m => m.id === selectedMessage.id ? updatedMessage : m)
      )
      setSelectedMessage(updatedMessage)
      setReplyText('')
      
      alert('Respuesta enviada exitosamente')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Error al enviar la respuesta')
    } finally {
      setIsReplying(false)
    }
  }

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.UNREAD:
        return 'bg-blue-100 text-blue-800'
      case MessageStatus.READ:
        return 'bg-gray-100 text-gray-800'
      case MessageStatus.REPLIED:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.UNREAD:
        return 'No leído'
      case MessageStatus.READ:
        return 'Leído'
      case MessageStatus.REPLIED:
        return 'Respondido'
      default:
        return 'Desconocido'
    }
  }

  const formatDate = (date: Date | string) => {
    return messageService.formatDate(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Error al cargar mensajes</h3>
          <p className="text-secondary-600 mb-4">{error}</p>
          <Button onClick={loadMessages} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Mensajes</h1>
          <p className="text-secondary-600 mt-2">
            Gestiona tus conversaciones con otros profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Todos</option>
                    <option value={MessageStatus.UNREAD}>No leídos</option>
                    <option value={MessageStatus.READ}>Leídos</option>
                    <option value={MessageStatus.REPLIED}>Respondidos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Fecha
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="overflow-y-auto h-full">
              {filteredMessages.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-secondary-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                    </svg>
                  </div>
                  <p className="text-secondary-500">No hay mensajes que coincidan con los filtros</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => {
                    const sender = (message as any).sender // From API join
                    const isSelected = selectedMessage?.id === message.id
                    
                    return (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={cn(
                          'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                          isSelected && 'bg-primary-50 border-r-2 border-primary-500',
                          message.status === MessageStatus.UNREAD && 'bg-blue-50'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm truncate',
                              message.status === MessageStatus.UNREAD ? 'font-semibold text-secondary-900' : 'font-medium text-secondary-700'
                            )}>
                              {sender?.full_name || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-secondary-500">{sender?.role}</p>
                          </div>
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(message.status)
                          )}>
                            {getStatusLabel(message.status)}
                          </span>
                        </div>
                        
                        <h3 className={cn(
                          'text-sm mb-1 truncate',
                          message.status === MessageStatus.UNREAD ? 'font-semibold text-secondary-900' : 'font-medium text-secondary-700'
                        )}>
                          {message.subject}
                        </h3>
                        
                        <p className="text-sm text-secondary-600 line-clamp-2 mb-2">
                          {message.message}
                        </p>
                        
                        <p className="text-xs text-secondary-500">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <span>
                          De: <span className="font-medium">
                            {(selectedMessage as any).sender?.full_name || 'Usuario desconocido'}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{formatDate(selectedMessage.created_at)}</span>
                        <span>•</span>
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(selectedMessage.status)
                        )}>
                          {getStatusLabel(selectedMessage.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose max-w-none">
                    <p className="text-secondary-900 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4">
                    Responder
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      rows={4}
                      maxLength={1000}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-secondary-500">
                        {replyText.length}/1000 caracteres
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleReply}
                        disabled={!replyText.trim() || isReplying}
                        loading={isReplying}
                      >
                        {isReplying ? 'Enviando...' : 'Enviar respuesta'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-secondary-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    Selecciona un mensaje
                  </h3>
                  <p className="text-secondary-500">
                    Elige un mensaje de la lista para ver su contenido completo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}