import { MainLayout } from '@/components/layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Project Lens',
  description: 'Política de privacidad de Project Lens. Conoce cómo protegemos y utilizamos tu información personal.',
}

export default function PrivacidadPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-8">
              Política de Privacidad
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-secondary-600 mb-6">
                <strong>Última actualización:</strong> Febrero 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  1. Introducción
                </h2>
                <p className="text-secondary-700 mb-4">
                  En Project Lens, respetamos su privacidad y nos comprometemos a proteger su información personal. 
                  Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y protegemos 
                  su información cuando utiliza nuestros servicios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  2. Información que Recopilamos
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <h3 className="text-lg font-semibold">Información que nos proporciona:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Información de registro (nombre, email, contraseña)</li>
                    <li>Información de perfil profesional (biografía, ubicación, especialidades)</li>
                    <li>Imágenes de portfolio y fotografías de perfil</li>
                    <li>Mensajes y comunicaciones con otros usuarios</li>
                    <li>Información de contacto y preferencias</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold mt-6">Información recopilada automáticamente:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Información del dispositivo y navegador</li>
                    <li>Dirección IP y datos de ubicación general</li>
                    <li>Patrones de uso y navegación en la plataforma</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  3. Cómo Utilizamos su Información
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Utilizamos su información para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Proporcionar y mantener nuestros servicios</li>
                    <li>Crear y gestionar su perfil profesional</li>
                    <li>Facilitar conexiones con otros profesionales</li>
                    <li>Procesar y entregar mensajes entre usuarios</li>
                    <li>Mejorar y personalizar su experiencia</li>
                    <li>Enviar notificaciones importantes sobre el servicio</li>
                    <li>Prevenir fraude y garantizar la seguridad</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  4. Compartir Información
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Podemos compartir su información en las siguientes circunstancias:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Con otros usuarios:</strong> Su perfil público es visible para otros usuarios registrados</li>
                    <li><strong>Proveedores de servicios:</strong> Con terceros que nos ayudan a operar la plataforma</li>
                    <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                    <li><strong>Transferencias comerciales:</strong> En caso de fusión, adquisición o venta de activos</li>
                  </ul>
                  <p className="mt-4">
                    <strong>No vendemos</strong> su información personal a terceros para fines comerciales.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  5. Seguridad de los Datos
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cifrado de datos en tránsito y en reposo</li>
                    <li>Autenticación segura y gestión de sesiones</li>
                    <li>Acceso limitado a información personal por parte del personal</li>
                    <li>Monitoreo regular de seguridad y auditorías</li>
                    <li>Respaldo seguro de datos</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  6. Sus Derechos
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Usted tiene derecho a:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                    <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                    <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
                    <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                    <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                    <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
                  </ul>
                  <p className="mt-4">
                    Para ejercer estos derechos, contáctenos en privacy@projectlens.com
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  7. Cookies y Tecnologías Similares
                </h2>
                <div className="text-secondary-700 space-y-4">
                  <p>Utilizamos cookies para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Mantener su sesión iniciada</li>
                    <li>Recordar sus preferencias</li>
                    <li>Analizar el uso de la plataforma</li>
                    <li>Mejorar la funcionalidad y rendimiento</li>
                  </ul>
                  <p className="mt-4">
                    Puede gestionar las cookies a través de la configuración de su navegador.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  8. Retención de Datos
                </h2>
                <p className="text-secondary-700 mb-4">
                  Conservamos su información personal durante el tiempo necesario para cumplir con los 
                  propósitos descritos en esta política, a menos que la ley requiera o permita un 
                  período de retención más largo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  9. Transferencias Internacionales
                </h2>
                <p className="text-secondary-700 mb-4">
                  Su información puede ser transferida y procesada en países distintos al suyo. 
                  Nos aseguramos de que dichas transferencias cumplan con las leyes de protección 
                  de datos aplicables.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  10. Menores de Edad
                </h2>
                <p className="text-secondary-700 mb-4">
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos 
                  intencionalmente información personal de menores de edad.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  11. Cambios a esta Política
                </h2>
                <p className="text-secondary-700 mb-4">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos 
                  sobre cambios significativos publicando la nueva política en esta página y 
                  actualizando la fecha de &quot;última actualización&quot;.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
                  12. Contacto
                </h2>
                <p className="text-secondary-700 mb-4">
                  Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-secondary-700">
                    <strong>Email:</strong> privacy@projectlens.com<br />
                    <strong>Dirección:</strong> Buenos Aires, Argentina<br />
                    <strong>Teléfono:</strong> +54 11 1234-5678
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