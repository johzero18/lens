import { MainLayout } from '@/components/layout'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Servicio - Project Lens',
  description: 'Términos y condiciones de uso de Project Lens, la red profesional para la industria visual.',
}

export default function TerminosPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-8">
              Términos de Servicio
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-secondary-600 mb-6">
                <strong>Última actualización:</strong> Febrero 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  1. Aceptación de los Términos
                </h2>
                <p className="text-secondary-700 mb-4">
                  Al acceder y utilizar Project Lens, usted acepta estar sujeto a estos Términos de Servicio 
                  y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos 
                  términos, no debe utilizar este servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  2. Descripción del Servicio
                </h2>
                <p className="text-secondary-700 mb-4">
                  Project Lens es una plataforma digital que conecta profesionales de la industria visual, 
                  incluyendo fotógrafos, modelos, maquilladores, estilistas y productores. Facilitamos 
                  la creación de perfiles profesionales, la búsqueda de talento y la comunicación entre usuarios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  3. Registro y Cuentas de Usuario
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Para utilizar nuestros servicios, debe:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Proporcionar información precisa y completa durante el registro</li>
                    <li>Mantener la seguridad de su contraseña</li>
                    <li>Ser mayor de 18 años o tener el consentimiento de un tutor legal</li>
                    <li>Utilizar su nombre real y información profesional verificable</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  4. Contenido del Usuario
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Al subir contenido a Project Lens, usted:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Garantiza que posee todos los derechos necesarios sobre el contenido</li>
                    <li>Otorga a Project Lens una licencia no exclusiva para mostrar su contenido</li>
                    <li>Se compromete a no subir contenido ofensivo, ilegal o que infrinja derechos de terceros</li>
                    <li>Acepta que podemos moderar y remover contenido que viole nuestras políticas</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  5. Uso Aceptable
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Está prohibido:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Usar la plataforma para actividades ilegales o no autorizadas</li>
                    <li>Acosar, intimidar o amenazar a otros usuarios</li>
                    <li>Crear múltiples cuentas o cuentas falsas</li>
                    <li>Intentar acceder a cuentas de otros usuarios</li>
                    <li>Enviar spam o contenido no solicitado</li>
                    <li>Interferir con el funcionamiento de la plataforma</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  6. Propiedad Intelectual
                </h2>
                <p className="text-secondary-700 mb-4">
                  Project Lens y su contenido original, características y funcionalidad son propiedad 
                  exclusiva de Project Lens y están protegidos por derechos de autor, marcas comerciales 
                  y otras leyes de propiedad intelectual.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  7. Privacidad
                </h2>
                <p className="text-secondary-700 mb-4">
                  Su privacidad es importante para nosotros. Consulte nuestra 
                  <Link href="/privacidad" className="text-primary-600 hover:text-primary-700 underline">
                    Política de Privacidad
                  </Link> para obtener información sobre cómo recopilamos, utilizamos y protegemos su información.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  8. Limitación de Responsabilidad
                </h2>
                <p className="text-secondary-700 mb-4">
                  Project Lens no será responsable de daños indirectos, incidentales, especiales o 
                  consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios. 
                  Proporcionamos la plataforma &quot;tal como está&quot; sin garantías de ningún tipo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  9. Terminación
                </h2>
                <p className="text-secondary-700 mb-4">
                  Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso, por cualquier 
                  motivo, incluyendo la violación de estos Términos de Servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  10. Modificaciones
                </h2>
                <p className="text-secondary-700 mb-4">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  11. Ley Aplicable
                </h2>
                <p className="text-secondary-700 mb-4">
                  Estos términos se regirán e interpretarán de acuerdo con las leyes de la República Argentina, 
                  sin tener en cuenta sus disposiciones sobre conflictos de leyes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  12. Contacto
                </h2>
                <p className="text-secondary-700 mb-4">
                  Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-secondary-700">
                    <strong>Email:</strong> legal@projectlens.com<br />
                    <strong>Dirección:</strong> Buenos Aires, Argentina
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}