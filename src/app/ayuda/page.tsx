'use client'

import React, { useState } from 'react'
import { MainLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '¿Cómo creo mi perfil profesional?',
    answer: 'Para crear tu perfil, regístrate con tu email y selecciona tu rol profesional (fotógrafo, modelo, maquillador, estilista o productor). Luego completa tu información personal, sube tu foto de perfil y portfolio, y describe tu experiencia y especialidades.',
    category: 'perfil'
  },
  {
    id: '2',
    question: '¿Puedo cambiar mi rol profesional después del registro?',
    answer: 'Actualmente no es posible cambiar el rol profesional una vez registrado. Si necesitas cambiar tu rol, contáctanos a soporte@projectlens.com y evaluaremos tu caso particular.',
    category: 'perfil'
  },
  {
    id: '3',
    question: '¿Cómo subo imágenes a mi portfolio?',
    answer: 'Ve a tu perfil, haz clic en "Editar perfil" y luego en la sección "Portfolio". Puedes subir hasta 20 imágenes en formato JPG o PNG, con un tamaño máximo de 5MB cada una. Las imágenes se optimizan automáticamente para una mejor visualización.',
    category: 'portfolio'
  },
  {
    id: '4',
    question: '¿Qué formatos de imagen acepta la plataforma?',
    answer: 'Aceptamos imágenes en formato JPG y PNG. El tamaño máximo por imagen es de 5MB. Para mejores resultados, recomendamos imágenes de alta calidad con una resolución mínima de 1200x800 píxeles.',
    category: 'portfolio'
  },
  {
    id: '5',
    question: '¿Cómo busco otros profesionales?',
    answer: 'Utiliza la página de búsqueda para filtrar profesionales por rol, ubicación, especialidades y nivel de experiencia. También puedes usar la barra de búsqueda para encontrar perfiles específicos por nombre o especialidad.',
    category: 'busqueda'
  },
  {
    id: '6',
    question: '¿Cómo contacto a otros profesionales?',
    answer: 'En el perfil de cualquier profesional, encontrarás un botón "Contactar". Haz clic para abrir un formulario donde puedes enviar un mensaje con detalles sobre tu proyecto. El profesional recibirá tu mensaje por email.',
    category: 'contacto'
  },
  {
    id: '7',
    question: '¿Hay límites en los mensajes que puedo enviar?',
    answer: 'Sí, para prevenir spam, limitamos a 10 mensajes por día por usuario. Si necesitas enviar más mensajes, considera actualizar a una cuenta PRO o contáctanos para casos especiales.',
    category: 'contacto'
  },
  {
    id: '8',
    question: '¿Qué incluye la suscripción PRO?',
    answer: 'La suscripción PRO incluye: perfil destacado en búsquedas, más espacio para portfolio (hasta 50 imágenes), estadísticas detalladas de visualizaciones, mensajes ilimitados y soporte prioritario.',
    category: 'suscripcion'
  },
  {
    id: '9',
    question: '¿Cómo cancelo mi suscripción PRO?',
    answer: 'Puedes cancelar tu suscripción PRO en cualquier momento desde la configuración de tu cuenta. La suscripción seguirá activa hasta el final del período facturado.',
    category: 'suscripcion'
  },
  {
    id: '10',
    question: '¿Es segura mi información personal?',
    answer: 'Sí, tomamos la seguridad muy en serio. Utilizamos cifrado SSL, almacenamiento seguro y cumplimos con las mejores prácticas de protección de datos. Lee nuestra Política de Privacidad para más detalles.',
    category: 'seguridad'
  },
  {
    id: '11',
    question: '¿Puedo eliminar mi cuenta?',
    answer: 'Sí, puedes eliminar tu cuenta desde la configuración. Ten en cuenta que esta acción es irreversible y se eliminarán todos tus datos, incluyendo tu perfil, portfolio y mensajes.',
    category: 'cuenta'
  },
  {
    id: '12',
    question: '¿Cómo reporto contenido inapropiado?',
    answer: 'Si encuentras contenido que viola nuestras políticas, puedes reportarlo usando el botón "Reportar" en el perfil o contactándonos directamente. Revisamos todos los reportes en un plazo de 24 horas.',
    category: 'seguridad'
  }
]

const categories = [
  { id: 'all', name: 'Todas las preguntas', icon: '❓' },
  { id: 'perfil', name: 'Perfil y Registro', icon: '👤' },
  { id: 'portfolio', name: 'Portfolio e Imágenes', icon: '📸' },
  { id: 'busqueda', name: 'Búsqueda y Filtros', icon: '🔍' },
  { id: 'contacto', name: 'Mensajes y Contacto', icon: '💬' },
  { id: 'suscripcion', name: 'Suscripción PRO', icon: '⭐' },
  { id: 'seguridad', name: 'Seguridad y Privacidad', icon: '🔒' },
  { id: 'cuenta', name: 'Gestión de Cuenta', icon: '⚙️' }
]

export default function AyudaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más frecuentes sobre Project Lens
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3',
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-secondary-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {filteredFAQs.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-secondary-600">
                      Intenta con otros términos de búsqueda o selecciona una categoría diferente
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => toggleExpanded(faq.id)}
                          className="w-full text-left flex items-center justify-between group"
                        >
                          <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
                            {faq.question}
                          </h3>
                          <div className={cn(
                            'flex-shrink-0 ml-4 transition-transform duration-200',
                            expandedItems.includes(faq.id) ? 'rotate-180' : ''
                          )}>
                            <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {expandedItems.includes(faq.id) && (
                          <div className="mt-4 text-secondary-700 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">
                  ¿No encontraste lo que buscabas?
                </h3>
                <p className="text-primary-100 mb-6">
                  Nuestro equipo de soporte está aquí para ayudarte
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.location.href = '/contacto'}
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Contactar Soporte
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = 'mailto:soporte@projectlens.com'}
                    className="border-white text-white hover:bg-white hover:text-primary-600"
                  >
                    Enviar Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}