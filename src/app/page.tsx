import { MainLayout } from '@/components/layout'
import Link from 'next/link'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ProfileCard from '@/components/features/ProfileCard'
import SearchBar from '@/components/features/SearchBar'
import { mockFeaturedProfiles, platformStats, roleInfo } from '@/lib/mockData'

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-secondary-100/20"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-secondary-900 mb-6 leading-tight">
              Project <span className="text-primary-600">Lens</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-600 mb-6 font-medium">
              Red Profesional Visual Argentina
            </p>
            <p className="text-lg text-secondary-500 mb-12 max-w-3xl mx-auto leading-relaxed">
              La plataforma que conecta fotógrafos, modelos, maquilladores, estilistas y 
              productores en la industria de producción visual. Encuentra talento, 
              muestra tu trabajo y colabora en proyectos increíbles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/registro">
                <Button variant="primary" size="lg" className="px-8 py-4 text-lg">
                  Comenzar Gratis
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/explorar">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  Explorar Perfiles
                </Button>
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                  {platformStats.totalProfiles.toLocaleString()}+
                </div>
                <div className="text-sm text-secondary-600">Profesionales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                  {platformStats.projectsCompleted.toLocaleString()}+
                </div>
                <div className="text-sm text-secondary-600">Proyectos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                  {platformStats.citiesCovered}+
                </div>
                <div className="text-sm text-secondary-600">Ciudades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600 mb-1">
                  5★
                </div>
                <div className="text-sm text-secondary-600">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Encuentra el Talento Perfecto
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Busca profesionales por especialidad, ubicación y experiencia. 
              Conecta con el equipo ideal para tu próximo proyecto.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card variant="elevated" padding="lg">
              <SearchBar showFilters={true} />
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Profesionales Destacados
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Descubre algunos de los talentos más reconocidos en nuestra plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockFeaturedProfiles.slice(0, 6).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                variant="grid"
                showContact={true}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/explorar">
              <Button variant="outline" size="lg">
                Ver Todos los Perfiles
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits by Role Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Beneficios para Cada Profesional
            </h2>
            <p className="text-lg text-secondary-600 max-w-3xl mx-auto">
              Project Lens está diseñado específicamente para las necesidades de cada rol 
              en la industria visual. Descubre cómo podemos ayudarte a crecer profesionalmente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roleInfo.map((role) => (
              <Card key={role.role} variant="elevated" padding="lg" className="hover:shadow-hard transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl mb-4 flex-shrink-0">
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                      {role.title}
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      {role.description}
                    </p>
                    <ul className="space-y-2">
                      {role.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-secondary-700">
                          <svg className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              La Red Visual Más Grande de Argentina
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Miles de profesionales ya confían en Project Lens para hacer crecer sus carreras 
              y encontrar las mejores oportunidades de colaboración.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.photographers}
              </div>
              <div className="text-primary-200 text-sm">Fotógrafos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.models}
              </div>
              <div className="text-primary-200 text-sm">Modelos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.makeupArtists}
              </div>
              <div className="text-primary-200 text-sm">Maquilladores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.stylists}
              </div>
              <div className="text-primary-200 text-sm">Estilistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.producers}
              </div>
              <div className="text-primary-200 text-sm">Productores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {platformStats.citiesCovered}+
              </div>
              <div className="text-primary-200 text-sm">Ciudades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-secondary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para Impulsar tu Carrera?
          </h2>
          <p className="text-xl text-secondary-300 mb-12 max-w-3xl mx-auto">
            Únete a la comunidad de profesionales visuales más activa de Argentina. 
            Crea tu perfil, muestra tu trabajo y conecta con oportunidades increíbles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/registro">
              <Button variant="primary" size="lg" className="px-10 py-4 text-lg bg-primary-600 hover:bg-primary-700">
                Crear Perfil Gratis
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg border-secondary-600 text-secondary-300 hover:bg-secondary-800">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 text-sm text-secondary-400">
            <p>✓ Registro gratuito ✓ Sin comisiones ✓ Soporte 24/7</p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
