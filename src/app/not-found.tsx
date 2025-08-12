import Link from 'next/link'
import { MainLayout } from '@/components/layout'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl mb-4">🔍</div>
            <h1 className="text-6xl font-bold text-primary-600 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
              Página no encontrada
            </h2>
            <p className="text-secondary-600 mb-8">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Ir al Inicio
                </Button>
              </Link>
              <Link href="/buscar">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Buscar Perfiles
                </Button>
              </Link>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-secondary-600 mb-4">
                ¿Necesitas ayuda? Explora estas opciones:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link 
                  href="/explorar" 
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Explorar Talentos
                </Link>
                <Link 
                  href="/ayuda" 
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Centro de Ayuda
                </Link>
                <Link 
                  href="/contacto" 
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Contacto
                </Link>
                <Link 
                  href="/acerca-de" 
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Acerca de
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}