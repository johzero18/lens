'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Button, Input, Textarea, Select } from '@/components/ui'
import Link from 'next/link'

interface ContactFormData {
  name: string
  email: string
  subject: string
  category: string
  message: string
}

const contactCategories = [
  { value: 'soporte', label: 'Soporte Técnico' },
  { value: 'cuenta', label: 'Problemas de Cuenta' },
  { value: 'facturacion', label: 'Facturación y Pagos' },
  { value: 'sugerencia', label: 'Sugerencias y Mejoras' },
  { value: 'reporte', label: 'Reportar Contenido' },
  { value: 'prensa', label: 'Prensa y Medios' },
  { value: 'partnership', label: 'Alianzas Comerciales' },
  { value: 'otro', label: 'Otro' }
]

export default function ContactoPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido'
    }

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    } else if (formData.message.length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Contact form submitted:', formData)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-white rounded-lg shadow-sm p-8">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              ¡Mensaje Enviado!
            </h2>
            <p className="text-secondary-600 mb-6">
              Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos 
              en un plazo de 24 horas.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  name: '',
                  email: '',
                  subject: '',
                  category: '',
                  message: ''
                })
              }}
            >
              Enviar Otro Mensaje
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-6">
                  Información de Contacto
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900">Email</h4>
                      <p className="text-secondary-600">contacto@projectlens.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900">Ubicación</h4>
                      <p className="text-secondary-600">Buenos Aires, Argentina</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900">Horario de Atención</h4>
                      <p className="text-secondary-600">Lun - Vie: 9:00 - 18:00 ART</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Enlaces Rápidos
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/ayuda"
                    className="block text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Centro de Ayuda
                  </Link>
                  <Link
                    href="/terminos"
                    className="block text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Términos de Servicio
                  </Link>
                  <Link
                    href="/privacidad"
                    className="block text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Política de Privacidad
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-2xl font-semibold text-secondary-900 mb-6">
                  Envíanos un Mensaje
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Nombre completo"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Asunto"
                      placeholder="Asunto de tu mensaje"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      error={errors.subject}
                      required
                    />
                    <Select
                      label="Categoría"
                      placeholder="Selecciona una categoría"
                      value={formData.category}
                      onChange={(value) => handleInputChange('category', value as string)}
                      options={contactCategories}
                      error={errors.category}
                      required
                    />
                  </div>

                  <Textarea
                    label="Mensaje"
                    placeholder="Describe tu consulta o problema en detalle..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    error={errors.message}
                    rows={6}
                    maxLength={1000}
                    required
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              ¿Buscas respuestas rápidas?
            </h3>
            <p className="text-primary-100 mb-6">
              Consulta nuestro centro de ayuda para encontrar respuestas a las preguntas más frecuentes
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/ayuda'}
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              Ver Preguntas Frecuentes
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}