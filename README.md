# Project Lens - Red Profesional Visual

Una aplicación web moderna construida con Next.js 14 que conecta profesionales de la industria de producción visual incluyendo fotógrafos, modelos, maquilladores, estilistas y productores.

## 🌟 Características Principales

- **Perfiles Profesionales**: Perfiles específicos por rol con portfolios visuales
- **Búsqueda Avanzada**: Filtros por rol, ubicación, especialidades y experiencia
- **Sistema de Mensajería**: Comunicación directa entre profesionales
- **Portfolio Visual**: Gestión de imágenes con optimización automática
- **SEO Optimizado**: Meta tags dinámicos y structured data
- **Responsive Design**: Experiencia optimizada para móvil y desktop

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 con App Router, React 18, TypeScript
- **Styling**: Tailwind CSS con sistema de diseño personalizado
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Hosting**: Netlify/Vercel con CDN global
- **Testing**: Jest, React Testing Library, Playwright
- **Monitoreo**: Google Analytics, Sentry, Vercel Analytics

## 📚 Documentación Completa

### 🚀 Configuración e Instalación
- [**Guía de Instalación Local**](./docs/installation.md) - Configuración completa del entorno de desarrollo
- [**Configuración de Supabase**](./docs/supabase-setup.md) - Configuración paso a paso de la base de datos
- [**Variables de Entorno**](./docs/environment-variables.md) - Todas las variables necesarias y su configuración
- [**Guía de Despliegue**](./docs/deployment-guide.md) - Despliegue en producción paso a paso

### 🏗️ Arquitectura y Desarrollo
- [**Esquema de Base de Datos**](./docs/database-schema.md) - Estructura completa de la base de datos
- [**Flujo de Autenticación**](./docs/authentication-flow.md) - Sistema de autenticación y autorización
- [**APIs y Endpoints**](./docs/api-documentation.md) - Documentación completa de todas las APIs
- [**Estructura de Datos**](./docs/data-structures.md) - Modelos y tipos de datos

### 🔧 Funcionalidades
- [**Gestión de Perfiles**](./docs/profile-management-api.md) - Sistema de perfiles y portfolio
- [**Sistema de Búsqueda**](./docs/search-api.md) - Búsqueda y filtros avanzados
- [**Sistema de Mensajería**](./docs/messaging-system.md) - Comunicación entre usuarios

### 🧪 Testing y Calidad
- [**Guía de Testing**](./docs/testing-guide.md) - Estrategias y configuración de tests
- [**Estándares de Código**](./docs/code-standards.md) - Convenciones y mejores prácticas

### 🚀 Producción y Mantenimiento
- [**Monitoreo y Analytics**](./docs/monitoring.md) - Herramientas de monitoreo y métricas
- [**Troubleshooting**](./docs/troubleshooting.md) - Solución de problemas comunes
- [**Changelog**](./docs/changelog.md) - Historial de cambios y versiones

## 🛠️ Configuración de Desarrollo

### Prerrequisitos

- Node.js 18.17 o superior
- npm 9+ o yarn 1.22+
- Git 2.30+
- Cuenta en Supabase (gratuita disponible)

### Instalación Rápida

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd project-lens
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales de Supabase
   ```

4. **Configurar base de datos**:
   - Seguir la [Guía de Configuración de Supabase](./docs/supabase-setup.md)

5. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**: [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Corregir errores automáticamente
npm run format          # Formatear código con Prettier
npm run type-check      # Verificar tipos TypeScript

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con cobertura
npm run test:e2e        # Tests end-to-end

# Utilidades
npm run clean           # Limpiar archivos de build
```

## 📁 Estructura del Proyecto

```
project-lens/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Rutas de autenticación
│   │   ├── [username]/     # Perfiles dinámicos
│   │   └── api/            # API routes
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes UI base
│   │   ├── features/       # Componentes de funcionalidades
│   │   └── layout/         # Componentes de layout
│   ├── lib/                # Utilidades y configuraciones
│   │   ├── services/       # Servicios de API
│   │   └── utils.ts        # Funciones de utilidad
│   ├── types/              # Definiciones TypeScript
│   └── hooks/              # Custom hooks
├── docs/                   # Documentación completa
├── supabase/               # Configuración de Supabase
│   ├── migrations/         # Migraciones de BD
│   └── functions/          # Edge Functions
└── .kiro/                  # Especificaciones del proyecto
    └── specs/              # Documentos de especificación
```

## 🎨 Sistema de Diseño

El proyecto incluye un sistema de diseño completo con:

- **Colores**: Paletas primary, secondary, accent, success, warning, error
- **Tipografía**: Inter font con escalado responsivo
- **Espaciado**: Escala de espaciado consistente
- **Sombras**: Variantes soft, medium, hard
- **Animaciones**: Fade-in, slide, scale
- **Componentes**: Librería completa de componentes UI

## 🔐 Seguridad y Performance

- **Autenticación**: JWT con Supabase Auth
- **Autorización**: Row Level Security (RLS)
- **Rate Limiting**: Protección contra spam y abuso
- **Optimización**: SSR/SSG, lazy loading, code splitting
- **SEO**: Meta tags dinámicos, structured data, sitemap
- **Accesibilidad**: Cumplimiento WCAG 2.1 AA

## 🚀 Estado del Proyecto

**Versión Actual**: v1.0.0 (MVP Completo)

### ✅ Funcionalidades Implementadas
- Sistema de autenticación completo
- Perfiles profesionales por rol
- Sistema de portfolio con subida de imágenes
- Búsqueda y filtros avanzados
- Sistema de mensajería
- SEO y optimizaciones de performance
- Testing completo
- Documentación técnica

### 🔄 Próximas Funcionalidades
- Sistema de notificaciones en tiempo real
- Reviews y ratings
- Chat en vivo
- App móvil nativa
- Marketplace de servicios

## 🤝 Contribución

Para contribuir al proyecto:

1. Lee los [Estándares de Código](./docs/code-standards.md)
2. Sigue la [Guía de Testing](./docs/testing-guide.md)
3. Revisa la documentación de APIs
4. Ejecuta todos los tests antes de hacer commit

## 📞 Soporte

Si encuentras problemas:

1. Revisa la [Guía de Troubleshooting](./docs/troubleshooting.md)
2. Consulta la documentación específica
3. Verifica la configuración de variables de entorno
4. Crea un issue en GitHub con detalles completos

## 📄 Licencia

Este proyecto es privado y propietario.

---

**🌟 Project Lens** - Conectando el talento visual de Argentina  
**📅 Última actualización**: Febrero 2025  
**🔗 Documentación completa**: [docs/README.md](./docs/README.md)
