'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ContactFormData } from '@/types'
import { messageService } from '@/lib/services/messageService'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
  recipientRole: string
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientRole,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    subject: '',
    message: '',
    project_type: '',
    budget_range: '',
    timeline: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const validation = messageService.validateContactForm(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await messageService.sendMessage({
        receiver_id: recipientId,
        subject: formData.subject,
        message: formData.message,
        project_type: formData.project_type,
        budget_range: formData.budget_range,
        timeline: formData.timeline,
      })

      if (response.error) {
        if (response.error.code === 'RATE_LIMIT_EXCEEDED') {
          alert('Has alcanzado el límite de 10 mensajes por día. Intenta nuevamente mañana.')
        } else {
          alert(response.error.message || 'Error al enviar el mensaje')
        }
        return
      }
      
      // Show success message
      alert(`Mensaje enviado exitosamente a ${recipientName}`)
      
      // Reset form and close modal
      setFormData({
        subject: '',
        message: '',
        project_type: '',
        budget_range: '',
        timeline: '',
      })
      setShowPreview(false)
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToEdit = () => {
    setShowPreview(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setShowPreview(false)
      onClose()
    }
  }

  // Helper functions using message service
  const getProjectTypeDisplayName = (type: string): string => {
    return messageService.getProjectTypeDisplayName(type)
  }

  const getBudgetRangeDisplayName = (range: string): string => {
    return messageService.getBudgetRangeDisplayName(range)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showPreview ? 'Vista previa del mensaje' : `Contactar a ${recipientName}`}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="space-y-6">
        {/* Recipient Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-lg">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">{recipientName}</h3>
              <p className="text-sm text-secondary-600">{recipientRole}</p>
            </div>
          </div>
        </div>

        {showPreview ? (
          /* Message Preview */
          <div className="space-y-6">
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Tu mensaje se verá así:
              </h3>
              
              {/* Preview Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary-600 mb-1">Asunto:</h4>
                  <p className="text-secondary-900 font-medium">{formData.subject}</p>
                </div>

                {formData.project_type && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-600 mb-1">Tipo de proyecto:</h4>
                    <p className="text-secondary-900">{getProjectTypeDisplayName(formData.project_type)}</p>
                  </div>
                )}

                {formData.budget_range && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-600 mb-1">Presupuesto:</h4>
                    <p className="text-secondary-900">{getBudgetRangeDisplayName(formData.budget_range)}</p>
                  </div>
                )}

                {formData.timeline && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-600 mb-1">Cronograma:</h4>
                    <p className="text-secondary-900">{formData.timeline}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-secondary-600 mb-1">Mensaje:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-secondary-900 whitespace-pre-wrap">{formData.message}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEdit}
                disabled={isSubmitting}
                className="sm:order-1"
              >
                ← Editar mensaje
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="sm:order-2 flex-1"
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar y enviar'}
              </Button>
            </div>
          </div>
        ) : (
          /* Contact Form */
          <form onSubmit={handlePreview} className="space-y-4">
            {/* Subject */}
            <div>
              <Input
                label="Asunto *"
                placeholder="Ej: Propuesta de colaboración para sesión de moda"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                error={errors.subject}
                maxLength={100}
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                {formData.subject.length}/100 caracteres
              </p>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tipo de proyecto
              </label>
              <select
                value={formData.project_type}
                onChange={(e) => handleInputChange('project_type', e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Seleccionar tipo de proyecto</option>
                <option value="fashion">Sesión de moda</option>
                <option value="commercial">Comercial/Publicidad</option>
                <option value="editorial">Editorial</option>
                <option value="portrait">Retratos</option>
                <option value="beauty">Belleza</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="event">Evento</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rango de presupuesto
              </label>
              <select
                value={formData.budget_range}
                onChange={(e) => handleInputChange('budget_range', e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Seleccionar rango de presupuesto</option>
                <option value="under_50k">Menos de $50.000</option>
                <option value="50k_100k">$50.000 - $100.000</option>
                <option value="100k_250k">$100.000 - $250.000</option>
                <option value="250k_500k">$250.000 - $500.000</option>
                <option value="over_500k">Más de $500.000</option>
                <option value="tbd">A definir</option>
              </select>
            </div>

            {/* Timeline */}
            <div>
              <Input
                label="Cronograma"
                placeholder="Ej: Primera semana de marzo, flexible con fechas"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Mensaje *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Describe tu proyecto, expectativas y cualquier información relevante..."
                rows={6}
                maxLength={1000}
                disabled={isSubmitting}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.message ? 'border-red-300' : 'border-secondary-300'
                }`}
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">{errors.message}</p>
              )}
              <p className="text-xs text-secondary-500 mt-1">
                {formData.message.length}/1000 caracteres
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                💡 Consejos para un mensaje efectivo:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sé específico sobre tu proyecto y expectativas</li>
                <li>• Menciona fechas tentativas y ubicación</li>
                <li>• Incluye referencias visuales si es posible</li>
                <li>• Sé profesional y respetuoso en tu comunicación</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="sm:order-2 flex-1"
              >
                Vista previa →
              </Button>
            </div>
          </form>
        )}

        {/* Rate Limiting Notice */}
        {!showPreview && (
          <div className="text-xs text-secondary-500 text-center border-t pt-4">
            Límite: 10 mensajes por día para prevenir spam
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ContactModal