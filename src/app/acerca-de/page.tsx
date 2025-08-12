import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Acerca de Project Lens - Red Profesional para la Industria Visual',
  description: 'Conoce la historia, misión y visión de Project Lens, la plataforma que conecta profesionales de la industria visual en Argentina.',
}

export default function AcercaDePage() {
  const teamMembers = [
    {
      name: 'María González',
      role: 'CEO & Fundadora',
      bio: 'Fotógrafa profesional con 10+ años de experiencia en la industria.',
      image: 'https://dummyimage.com/300x300/6366f1/ffffff&text=MG'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      bio: 'Desarrollador full-stack especializado en plataformas creativas.',
      image: 'https://dummyimage.com/300x300/ec4899/ffffff&text=CR'
    },
    {
      name: 'Ana Martínez',
      role: 'Head of Community',
      bio: 'Especialista en community management y marketing digital.',
      image: 'https://dummyimage.com/300x300/10b981/ffffff&text=AM'
    }
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Fundación de Project Lens',
      description: 'Nace la idea de crear una plataforma especializada para profesionales visuales.'
    },
    {
      year: '2024',
      title: 'Desarrollo del MVP',
      description: 'Creación de la primera versión con funcionalidades básicas de perfiles y búsqueda.'
    },
    {
      year: '2025',
      title: 'Lanzamiento Beta',
      description: 'Lanzamiento de la versión beta con los primeros 100 usuarios profesionales.'
    },
    {
      year: '2025',
      title: 'Expansión Nacional',
      description: 'Crecimiento a las principales ciudades de Argentina.'
    }
  ]

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Conectando el Talento Visual de Argentina
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Project Lens nació para revolucionar la forma en que los profesionales 
              de la industria visual se conectan, colaboran y crecen juntos.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-6">
                  Nuestra Misión
                </h2>
                <p className="text-lg text-secondary-700 mb-6">
                  Facilitar conexiones auténticas entre fotógrafos, modelos, maquilladores, 
                  estilistas y productores, creando un ecosistema donde el talento creativo 
                  pueda florecer y colaborar de manera eficiente.
                </p>
                <p className="text-lg text-secondary-700">
                  Creemos que cada proyecto visual merece el equipo perfecto, y cada 
                  profesional merece las oportunidades que lo hagan crecer.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8">
                <div className="text-6xl mb-4 text-center">🎯</div>
                <h3 className="text-2xl font-bold text-primary-800 text-center mb-4">
                  Nuestra Visión
                </h3>
                <p className="text-primary-700 text-center">
                  Ser la plataforma líder en Latinoamérica para profesionales de la 
                  industria visual, donde cada conexión genere proyectos extraordinarios 
                  y carreras exitosas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-12">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Colaboración
                </h3>
                <p className="text-secondary-600">
                  Fomentamos el trabajo en equipo y las conexiones genuinas entre profesionales.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Creatividad
                </h3>
                <p className="text-secondary-600">
                  Celebramos la diversidad creativa y apoyamos la expresión artística única.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Confianza
                </h3>
                <p className="text-secondary-600">
                  Construimos un entorno seguro donde los profesionales pueden conectar con confianza.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Crecimiento
                </h3>
                <p className="text-secondary-600">
                  Impulsamos el desarrollo profesional y personal de nuestra comunidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-12">
              Nuestra Historia
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200"></div>
                
                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Timeline dot */}
                      <div className="absolute left-6 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                      
                      {/* Content */}
                      <div className="ml-16 bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {milestone.year}
                          </span>
                          <h3 className="text-xl font-semibold text-secondary-900">
                            {milestone.title}
                          </h3>
                        </div>
                        <p className="text-secondary-700">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-secondary-900 text-center mb-12">
              Nuestro Equipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                    <div 
                      className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xl"
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-secondary-600 text-sm">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Project Lens en Números
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">1,200+</div>
                <div className="text-primary-200">Profesionales Registrados</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2,800+</div>
                <div className="text-primary-200">Proyectos Conectados</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15</div>
                <div className="text-primary-200">Ciudades Cubiertas</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-primary-200">Satisfacción de Usuarios</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-6">
              ¿Listo para formar parte de nuestra comunidad?
            </h2>
            <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
              Únete a miles de profesionales que ya están conectando y creando 
              proyectos increíbles en Project Lens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button variant="primary" size="lg">
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/explorar">
                <Button variant="outline" size="lg">
                  Explorar Talentos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}