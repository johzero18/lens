# Guía de Instalación - Project Lens

Esta guía te ayudará a configurar el proyecto Project Lens en tu entorno local.

## Requisitos Previos

- Node.js 18.17 o superior
- npm o yarn
- Git
- Cuenta en Supabase (gratuita)

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd project-lens
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env .env.local
```

2. Edita `.env.local` con tus credenciales de Supabase:
```bash
# Reemplaza con tus credenciales reales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Configurar Supabase

Sigue la [Guía de Configuración de Supabase](./supabase-setup.md) para:
- Crear proyecto en Supabase
- Configurar autenticación
- Configurar storage
- Crear buckets necesarios

### 5. Ejecutar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build           # Construye para producción
npm run start           # Inicia servidor de producción

# Calidad de código
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Corrige errores de ESLint automáticamente
npm run format          # Formatea código con Prettier
npm run type-check      # Verifica tipos de TypeScript

# Testing
npm run test            # Ejecuta tests
npm run test:watch      # Ejecuta tests en modo watch
npm run test:coverage   # Ejecuta tests con cobertura

# Análisis de rendimiento
npm run perf:lighthouse # Ejecuta análisis de Lighthouse
npm run perf:bundle     # Analiza el tamaño del bundle
```

## Estructura del Proyecto

```
project-lens/
├── src/
│   ├── app/                 # Páginas de Next.js (App Router)
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes UI base
│   │   ├── features/       # Componentes de funcionalidades
│   │   └── layout/         # Componentes de layout
│   ├── lib/                # Utilidades y configuraciones
│   ├── types/              # Definiciones de tipos TypeScript
│   └── hooks/              # Custom hooks
├── docs/                   # Documentación
├── public/                 # Archivos estáticos
└── .kiro/                  # Configuración de Kiro
    └── specs/              # Especificaciones del proyecto
```

## Configuración de Desarrollo

### ESLint y Prettier

El proyecto viene preconfigurado con:
- ESLint para análisis de código
- Prettier para formateo automático
- Configuración de TypeScript estricta

### Testing

- Jest para tests unitarios
- React Testing Library para tests de componentes
- Configuración de cobertura de código

### Variables de Entorno

Archivo `.env.local` (no commitear):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=tu-clave-publica
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
CONTACT_EMAIL=contact@projectlens.dev
```

## Solución de Problemas

### Error: "Module not found"

```bash
# Limpia node_modules e instala de nuevo
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid Supabase credentials"

1. Verifica que las variables de entorno estén correctas
2. Reinicia el servidor de desarrollo
3. Revisa la [guía de Supabase](./supabase-setup.md)

### Error de TypeScript

```bash
# Verifica tipos
npm run type-check

# Limpia cache de TypeScript
rm -rf .next
npm run dev
```

### Error de Build

```bash
# Limpia y reconstruye
npm run clean
npm run build
```

## Próximos Pasos

1. ✅ Instalación completada
2. ⏳ Configurar base de datos (ver `docs/supabase-setup.md`)
3. ⏳ Ejecutar migraciones de base de datos
4. ⏳ Configurar autenticación
5. ⏳ Probar funcionalidades básicas

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Guía de configuración de Supabase](./supabase-setup.md)