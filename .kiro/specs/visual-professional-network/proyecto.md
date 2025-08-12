1. Resumen Ejecutivo (Overview)

"Project Lens" es una red profesional vertical diseñada para conectar talentos de la industria de la producción visual: fotógrafos, modelos, maquilladores, estilistas y productores. La plataforma ofrece un espacio centralizado para descubrir talento, gestionar portafolios profesionales y facilitar contactos laborales. Con un diseño minimalista, intuitivo y optimizado, "Project Lens" busca reemplazar las búsquedas desorganizadas en redes sociales generalistas, proporcionando una herramienta eficiente y profesional para la industria creativa.

La aplicación será una SPA (Single Page Application) basada en Jamstack, priorizando rendimiento, escalabilidad y facilidad de desarrollo. El MVP se centrará en perfiles de usuario, búsqueda/filtros y contacto básico, con planes de expansión hacia mensajería y monetización en fases futuras.

2. Metas y Alcance (Goals & Non-Goals)

2.1. Metas del Producto Mínimo Viable (MVP)

✅ Registro y Perfil: Los usuarios pueden registrarse, autenticarse y crear un perfil seleccionando su rol (fotógrafo, modelo, maquillador, estilista, productor).

✅ Portafolio Visual: Cada perfil soporta una biografía, datos de contacto y una galería de imágenes de alta calidad (hasta 20 imágenes en el MVP).

✅ Búsqueda y Filtros: Los usuarios pueden buscar profesionales por rol, ubicación y especialidades, con filtros dinámicos y responsivos.

✅ Contacto Básico: Un formulario de contacto integrado permite a los usuarios conectar sin necesidad de mensajería en tiempo real.

✅ Diseño Responsivo: Interfaz optimizada para dispositivos móviles y escritorio, asegurando una experiencia consistente.

✅ SEO Básico: URLs limpias, metadatos dinámicos y datos estructurados (Schema.org) para maximizar la visibilidad en motores de búsqueda.

2.2. Fuera del Alcance del MVP (Non-Goals)

❌ Mensajería en Tiempo Real: No se incluirá un sistema de chat en el MVP.

❌ Gestión de Proyectos: Funcionalidades como moodboards, calendarios o gestión de tareas se implementarán en fases posteriores.

❌ Aplicaciones Móviles Nativas: El enfoque inicial será una PWA (Progressive Web App) en lugar de apps nativas para iOS/Android.

❌ Muro de Oportunidades: Publicación de castings o trabajos no estará disponible en el MVP.

❌ Monetización Completa: Suscripciones de pago y funcionalidades avanzadas se implementarán en la Fase 2.

3. Arquitectura y Stack Tecnológico

El stack está diseñado para maximizar velocidad de desarrollo, rendimiento y escalabilidad, minimizando la gestión de infraestructura:

Frontend: Next.js 14 (React) con App Router para un desarrollo moderno, soporte para SSR (Server-Side Rendering) y SSG (Static Site Generation), y un SEO robusto.

Estilos: Tailwind CSS para un diseño rápido, consistente y responsivo, con un enfoque en componentes reutilizables.

Backend & Base de Datos: Supabase:

PostgreSQL: Base de datos relacional gestionada para datos estructurados.

Auth: Sistema de autenticación integrado con soporte para email, OAuth (Google, LinkedIn) y tokens JWT.

Storage: Almacenamiento de imágenes para portafolios y avatares, con soporte para optimización de imágenes.

Edge Functions: Lógica de negocio personalizada (e.g., validación de formularios, webhooks de pago en Fase 2).

Hosting: Netlify para deploys automáticos, CDN global, soporte de funciones serverless y gestión de dominios.

Herramientas Adicionales:

Vercel Analytics (integrado con Next.js) para monitoreo de tráfico y rendimiento.

Cloudinary (opcional en Fase 2) para optimización avanzada de imágenes y entrega dinámica.

3.1. Arquitectura General

Frontend (Next.js):

App Router: Maneja rutas dinámicas (/profile/[username]) y layouts anidados.

Server Components: Usados para renderizado inicial de páginas estáticas (e.g., Homepage, página de búsqueda).

Client Components: Para interacciones dinámicas (e.g., formularios, filtros de búsqueda).

Backend (Supabase):

APIs REST/GraphQL: Supabase genera APIs automáticas para las tablas de PostgreSQL.

Edge Functions: Procesamiento ligero para validaciones y lógica personalizada.

Flujo de Datos:

Los usuarios suben imágenes a Supabase Storage, que genera URLs públicas/seguras.

Los perfiles se almacenan en la tabla profiles, con datos específicos por rol en una columna JSONB.

Las búsquedas se optimizan con índices en role y location para consultas rápidas.

4. Diseño de UI/UX

La filosofía de diseño es "El contenido es el rey", con un enfoque en destacar los portafolios visuales de los usuarios a través de una interfaz elegante, limpia y funcional.

4.1. Paleta de Colores

Fondo Principal: Blanco Puro (#FFFFFF) para un look limpio y profesional.

Fondo Secundario: Gris Claro (#F8F8F8) para secciones secundarias.

Texto Principal: Gris Oscuro (#1E1E1E) para máxima legibilidad.

Color de Acento: Azul Cobalto (#0047AB) para botones, enlaces y elementos interactivos.

Color Secundario: Gris Medio (#A9A9A9) para detalles sutiles y bordes.

4.2. Tipografía

Títulos y Encabezados: Playfair Display (Serif, elegante, para un toque sofisticado en títulos y nombres de perfil).

Texto de Interfaz y Párrafos: Inter (Sans-serif, moderna, optimizada para legibilidad en pantallas).

Tamaños:

H1: 32px (móvil: 24px)

H2: 24px (móvil: 20px)

Párrafos: 16px (móvil: 14px)

Notas/Captions: 12px

4.3. Diseño de Pantallas Clave

4.3.1. Homepage

Navbar: Logo a la izquierda, enlaces a "Explorar", "Iniciar Sesión" y "Registrarse" a la derecha (móvil: menú hamburguesa).

Hero Section: Título impactante ("Conecta con el talento visual del mundo"), subtítulo breve y una barra de búsqueda central con filtros por rol y ubicación.

Sección de Destacados: Cuadrícula de 6 perfiles destacados (seleccionados por algoritmo simple basado en completitud del perfil).

Footer: Enlaces a "Acerca", "Términos", "Privacidad" y redes sociales.

4.3.2. Página de Búsqueda

Layout:

Izquierda (30%): Barra de filtros (rol, ubicación, especialidades, experiencia).

Derecha (70%): Cuadrícula de resultados (3 columnas en escritorio, 1 en móvil).

Filtros Dinámicos: Implementados con React hooks para actualizar resultados en tiempo real.

Paginación: Carga infinita (infinite scroll) para mejorar la experiencia.

4.3.3. Página de Perfil

Header:

Banner de portada (imagen subida por el usuario, 1200x300px).

Foto de perfil (circular, 150x150px), nombre, rol y botón de contacto.

Cuerpo:

Izquierda (30%): Biografía, datos de contacto (email, teléfono opcional), datos específicos del rol (renderizados dinámicamente desde JSONB).

Derecha (70%): Galería de portafolio (masonry grid, hasta 20 imágenes, optimizadas con lazy loading).

Botón de Contacto: Abre un modal con un formulario simple (asunto, mensaje).

4.3.4. Formulario de Registro/Edición de Perfil

Campos obligatorios: username, full_name, role, bio, location.

Campos opcionales: avatar_url, cover_image_url, role_specific_data (formulario dinámico según el rol).

Validación en cliente y servidor para garantizar datos completos.

5. Modelo de Datos (Supabase/PostgreSQL)

El esquema está optimizado para flexibilidad y escalabilidad, usando JSONB para datos específicos por rol.

5.1. Tablas Principales

Tabla: profiles

id: uuid (clave primaria, generado por Supabase Auth).

username: text (único, índice para búsquedas rápidas).

full_name: text (nombre completo del usuario).

role: enum ('photographer', 'model', 'stylist', 'makeup_artist', 'producer').

bio: text (máximo 500 caracteres).

location: text (ciudad/país, índice para búsquedas geográficas).

avatar_url: text (URL de Supabase Storage).

cover_image_url: text (URL de Supabase Storage).

subscription_tier: enum ('free', 'pro') (por defecto: 'free').

role_specific_data: jsonb (datos específicos del rol).

created_at: timestamp (fecha de creación).

updated_at: timestamp (fecha de última actualización).

Tabla: contacts

id: uuid (clave primaria).

sender_id: uuid (FK a profiles.id).

receiver_id: uuid (FK a profiles.id).

subject: text (asunto del mensaje, máximo 100 caracteres).

message: text (contenido del mensaje, máximo 1000 caracteres).

created_at: timestamp.

5.2. Estructura del JSON para role_specific_data

Modelo (Model):

{
"model_type": ["Fashion", "Commercial", "Fitness"],
"experience_level": "Intermediate",
"height_cm": 175,
"measurements": {
"bust_cm": 86,
"waist_cm": 64,
"hips_cm": 90
},
"shoe_size_eu": 39,
"dress_size_eu": 36,
"hair_color": "Brown",
"eye_color": "Green",
"special_attributes": {
"tattoos": true,
"piercings": false
}
}

Fotógrafo (Photographer):

{
"specialties": ["Portrait", "Fashion", "Product"],
"experience_level": "Expert",
"studio_access": "Owns Studio",
"equipment_highlights": "Sony A7IV, 85mm f/1.4, Profoto B10s",
"post_production_skills": ["Advanced Retouching", "Color Grading"]
}

Productor (Producer):

{
"specialties": ["Photo Shoots", "Commercials"],
"services": ["Location Scouting", "Casting", "Budget Management"],
"typical_budget_range": "$5k-$20k",
"portfolio_url": "https://vimeo.com/producer"
}

Maquillador/a (Makeup Artist):

{
"specialties": ["Beauty", "Editorial", "SFX", "Bridal"],
"experience_level": "Senior",
"kit_highlights": ["MAC", "NARS", "Kryolan"],
"services_offered": ["Makeup only", "Makeup & Hair Styling"],
"travel_availability": true
}

Estilista (Stylist):

{
"specialties": ["Fashion Styling", "Product Styling", "Wardrobe Consulting"],
"experience_level": "Senior",
"industry_focus": ["Editorial", "E-commerce"],
"wardrobe_access": "Access to designer showrooms",
"portfolio_url": "https://behance.net/stylist"
}

5.3. Índices y Optimizaciones

Índices en profiles(username), profiles(role) y profiles(location) para búsquedas rápidas.

Índice GIN en profiles(role_specific_data) para consultas JSONB eficientes.

Políticas RLS (Row-Level Security) en Supabase para restringir el acceso a datos sensibles (e.g., solo el propietario puede editar su perfil).

6. Flujos de Trabajo Clave

6.1. Registro y Autenticación

Flujo:

El usuario accede a /signup y completa el formulario (email, contraseña, username, rol).

Supabase Auth crea un usuario y genera un id único.

Se crea un registro en la tabla profiles con los datos iniciales.

El usuario es redirigido a /profile/edit para completar su perfil.

Validaciones:

Username único (verificado en tiempo real con una Edge Function).

Contraseña segura (mínimo 8 caracteres, con letras y números).

Email verificado mediante enlace de confirmación.

6.2. Creación/Edición de Perfil

Flujo:

El usuario accede a /profile/edit.

Completa un formulario dinámico según su rol (campos específicos renderizados desde role_specific_data).

Sube imágenes (avatar y portada) a Supabase Storage.

Valida y guarda los datos en la tabla profiles.

Validaciones:

Imágenes: Máximo 5MB por archivo, formatos JPG/PNG.

Bio: Máximo 500 caracteres.

Campos obligatorios según el rol.

6.3. Búsqueda de Talentos

Flujo:

El usuario accede a /search y selecciona filtros (rol, ubicación, especialidades).

Next.js realiza una consulta a la API de Supabase con parámetros de filtro.

Los resultados se renderizan en una cuadrícula con carga infinita.

Optimizaciones:

Debouncing en la barra de búsqueda para evitar consultas excesivas.

Caché de resultados en el cliente con SWR (integrado con Next.js).

6.4. Contacto entre Usuarios

Flujo:

El usuario hace clic en "Contactar" en un perfil.

Se abre un modal con un formulario (asunto, mensaje).

El formulario se envía a una Edge Function que valida los datos y crea un registro en la tabla contacts.

El receptor recibe una notificación por email (usando Supabase Edge Functions).

Validaciones:

Límite de mensajes por usuario/día para prevenir spam (e.g., 10 mensajes/día en el plan gratuito).

7. Monetización (Fase 2)

Modelo: Freemium con suscripciones gestionadas por Stripe.

Funcionalidades Premium:

Filtros de búsqueda avanzados (e.g., por experiencia o especialidades específicas).

Posicionamiento destacado en resultados de búsqueda.

Analíticas de perfil (visitas, contactos recibidos).

Implementación:

Una Edge Function maneja webhooks de Stripe para actualizar subscription_tier en la tabla profiles.

Middleware en Next.js verifica el nivel de suscripción para desbloquear funcionalidades.

8. Estrategia SEO

El SEO es crítico para que los perfiles sean descubiertos en Google.

URLs Limpias: /[username] para perfiles (e.g., domain.com/johnsmith).

Metadatos Dinámicos: Generados en Next.js con next/head:

Título: {full_name} - {role} | Project Lens

Descripción: Extracto de la biografía (primeros 160 caracteres).

Sitemap Automático: Generado por Next.js y actualizado en cada deploy con Netlify.

Datos Estructurados (Schema.org): JSON-LD para perfiles, incluyendo:

Tipo: Person

Propiedades: name, jobTitle (rol), image (avatar), description (bio).

Optimización de Imágenes: Lazy loading y compresión automática con Supabase Storage.

9. Rendimiento y Escalabilidad

Frontend:

Uso de Next.js Image para optimización automática de imágenes.

Carga diferida de componentes dinámicos con next/dynamic.

Caché de páginas estáticas con SSG para la Homepage y perfiles destacados.

Backend:

Índices optimizados en PostgreSQL para consultas rápidas.

Límite de resultados por consulta (e.g., 20 perfiles por página).

CDN de Netlify para entrega rápida de assets.

Escalabilidad:

Supabase escala automáticamente la base de datos y el almacenamiento.

Netlify soporta picos de tráfico con su CDN global.

Edge Functions de Supabase para lógica serverless sin preocupaciones de infraestructura.

10. Seguridad

Autenticación: Supabase Auth con JWT y verificación de email.

Autorización: Políticas RLS en Supabase:

Solo el propietario puede editar su perfil.

Solo los usuarios autenticados pueden enviar mensajes de contacto.

Protección de Datos: Encriptación en tránsito (HTTPS) y en reposo (Supabase).

Prevención de Abuso:

Límite de mensajes/día para evitar spam.

Validación de imágenes subidas (tamaño, formato, contenido inapropiado mediante moderación manual en Fase 2).

11. Plan de Desarrollo (MVP)

11.1. Fases de Implementación

Semana 1-2: Configuración Inicial

Configurar proyecto Next.js con Tailwind CSS.

Configurar Supabase (base de datos, auth, storage).

Diseñar esquema de base de datos y políticas RLS.

Semana 3-4: Frontend Básico

Implementar Homepage y página de búsqueda.

Crear componentes reutilizables (Navbar, Footer, ProfileCard).

Semana 5-6: Perfiles y Contacto

Implementar página de perfil y formulario de edición.

Desarrollar formulario de contacto y Edge Function para procesarlo.

Semana 7-8: Optimización y Testing

Configurar SEO (metadatos, sitemap, Schema.org).

Pruebas de rendimiento y responsividad.

Despliegue inicial en Netlify.

11.2. Requisitos de Equipo

Desarrollador Frontend: Experto en Next.js, React y Tailwind CSS.

Desarrollador Backend: Familiarizado con Supabase, PostgreSQL y serverless.

Diseñador UI/UX: Para refinar wireframes y garantizar consistencia visual.

QA Engineer: Para pruebas de funcionalidad y responsividad.

12. Futuras Iteraciones (Post-MVP)

Fase 2 (3-6 meses post-MVP):

Implementar mensajería en tiempo real con Supabase Realtime.

Agregar sistema de suscripciones con Stripe.

Introducir analíticas de perfil para usuarios premium.

Fase 3 (6-12 meses post-MVP):

Desarrollar un "Muro de Oportunidades" para castings y trabajos.

Implementar herramientas de gestión de proyectos (moodboards, calendarios).

Explorar aplicaciones móviles nativas (React Native).
