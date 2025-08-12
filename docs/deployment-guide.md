# Guía de Despliegue en Producción - Project Lens

Esta guía te ayudará a desplegar Project Lens en producción de manera segura y eficiente.

## 🎯 Opciones de Despliegue

### Opción 1: Netlify (Recomendado)
- ✅ Despliegue automático desde Git
- ✅ CDN global incluido
- ✅ HTTPS automático
- ✅ Funciones serverless
- ✅ Formularios y analytics incluidos

### Opción 2: Vercel
- ✅ Optimizado para Next.js
- ✅ Edge Functions
- ✅ Analytics integrado
- ✅ Despliegue automático

### Opción 3: Docker + VPS
- ✅ Control total del entorno
- ✅ Escalabilidad personalizada
- ⚠️ Requiere más configuración

## 🚀 Despliegue en Netlify

### Paso 1: Preparar el Repositorio

1. **Asegúrate de que el código esté en Git**:
```bash
git add .
git commit -m "Preparar para despliegue en producción"
git push origin main
```

2. **Verifica la configuración de build**:
El proyecto ya incluye `netlify.toml` con la configuración optimizada.

3. **Valida las variables de entorno**:
```bash
npm run validate-env
```

### Paso 2: Configurar Netlify

1. **Conectar repositorio**:
   - Ve a [netlify.com](https://netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio de Project Lens

2. **Configurar build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

3. **Configurar variables de entorno**:
   - Ve a **Site settings** → **Environment variables**
   - Agrega todas las variables de producción:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_produccion
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NODE_ENV=production
CONTACT_EMAIL=contact@tu-dominio.com
```

### Paso 3: Configurar Dominio Personalizado

1. **En Netlify**:
   - Ve a **Site settings** → **Domain management**
   - Haz clic en "Add custom domain"
   - Ingresa tu dominio (ej: `projectlens.dev`)

2. **Configurar DNS**:
   - En tu proveedor de DNS, crea un registro CNAME:
   ```
   CNAME www tu-sitio.netlify.app
   CNAME @ tu-sitio.netlify.app
   ```

3. **Habilitar HTTPS**:
   - Netlify configurará automáticamente Let's Encrypt
   - Verifica que el certificado SSL esté activo

### Paso 4: Configurar Funciones Serverless (Opcional)

```javascript
// netlify/functions/contact.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Lógica de contacto
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Mensaje enviado' })
  };
};
```

## 🚀 Despliegue en Vercel

### Paso 1: Configurar Vercel

1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login y configurar**:
```bash
vercel login
vercel
```

3. **Configurar proyecto**:
```bash
# Seguir el wizard de configuración
# Seleccionar framework: Next.js
# Configurar directorio raíz: ./
```

### Paso 2: Configurar Variables de Entorno

```bash
# Agregar variables una por una
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

### Paso 3: Desplegar

```bash
# Despliegue de producción
vercel --prod
```

### Paso 4: Configurar Dominio

```bash
# Agregar dominio personalizado
vercel domains add tu-dominio.com
```

## 🐳 Despliegue con Docker

### Paso 1: Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Paso 2: Configurar Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - NODE_ENV=production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Paso 3: Configurar Nginx

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name tu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tu-dominio.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🔧 Configuración de Supabase para Producción

### Paso 1: Crear Proyecto de Producción

1. **Nuevo proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto para producción
   - Selecciona región cercana a tus usuarios
   - Usa una contraseña segura

2. **Configurar autenticación**:
```bash
# Site URL
https://tu-dominio.com

# Redirect URLs
https://tu-dominio.com/auth/callback
https://tu-dominio.com/auth/confirm
```

### Paso 2: Migrar Base de Datos

```bash
# Exportar desde desarrollo
supabase db dump --db-url "postgresql://..." > backup.sql

# Importar a producción
psql "postgresql://..." < backup.sql
```

### Paso 3: Configurar Storage

```sql
-- Crear buckets de producción
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('covers', 'covers', true),
('portfolio', 'portfolio', true);

-- Configurar políticas de storage
-- (Usar las mismas políticas que en desarrollo)
```

## 📊 Monitoreo y Analytics

### Google Analytics

1. **Crear propiedad GA4**:
   - Ve a [analytics.google.com](https://analytics.google.com)
   - Crea nueva propiedad para tu dominio
   - Obtén el Measurement ID

2. **Configurar en la aplicación**:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Sentry (Error Tracking)

1. **Crear proyecto en Sentry**:
   - Ve a [sentry.io](https://sentry.io)
   - Crea nuevo proyecto Next.js
   - Obtén el DSN

2. **Configurar variables**:
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Uptime Monitoring

```javascript
// netlify/functions/health-check.js
exports.handler = async (event, context) => {
  try {
    // Verificar conexión a Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) throw error;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
```

## 🔒 Seguridad en Producción

### Headers de Seguridad

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *.supabase.co; connect-src 'self' *.supabase.co *.google-analytics.com;"
          }
        ]
      }
    ];
  }
};
```

### Rate Limiting

```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const limit = 100; // requests per window
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitMap.get(ip);

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  }

  if (ipData.count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  ipData.count += 1;

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: '.next'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## ✅ Checklist de Despliegue

### Pre-despliegue
- [ ] Código testeado y funcionando en desarrollo
- [ ] Variables de entorno de producción configuradas
- [ ] Base de datos de producción configurada
- [ ] Dominio y DNS configurados
- [ ] Certificado SSL configurado

### Despliegue
- [ ] Build de producción exitoso
- [ ] Aplicación desplegada y accesible
- [ ] Todas las funcionalidades funcionan
- [ ] Formularios de contacto funcionan
- [ ] Subida de imágenes funciona
- [ ] Autenticación funciona

### Post-despliegue
- [ ] Analytics configurado y funcionando
- [ ] Monitoreo de errores configurado
- [ ] Health checks configurados
- [ ] Backups automáticos configurados
- [ ] Documentación actualizada

## 🔄 Rollback Plan

### En caso de problemas:

1. **Rollback inmediato**:
```bash
# Netlify
netlify sites:list
netlify api listSiteDeploys --site-id=SITE_ID
netlify api restoreSiteDeploy --site-id=SITE_ID --deploy-id=DEPLOY_ID

# Vercel
vercel rollback
```

2. **Verificar servicios**:
   - Base de datos funcionando
   - Storage accesible
   - APIs respondiendo

3. **Comunicar el incidente**:
   - Notificar al equipo
   - Actualizar status page
   - Investigar causa raíz

## 📞 Soporte Post-Despliegue

### Monitoreo Continuo
- Revisar métricas de performance
- Monitorear logs de errores
- Verificar uptime
- Revisar analytics de usuarios

### Mantenimiento Regular
- Actualizar dependencias
- Rotar claves de API
- Revisar y optimizar performance
- Backup de base de datos

---

**🎉 ¡Felicitaciones!** Tu aplicación Project Lens está ahora en producción y lista para conectar profesionales de la industria visual.
## 🔄 
CI/CD Pipeline Automatizado

### GitHub Actions

El proyecto incluye tres workflows automatizados:

1. **CI (Continuous Integration)** - `.github/workflows/ci.yml`
   - Se ejecuta en push y pull requests
   - Ejecuta tests, linting y type checking
   - Construye la aplicación
   - Ejecuta auditoría de seguridad

2. **Deploy to Production** - `.github/workflows/deploy-production.yml`
   - Se ejecuta solo en push a `main`
   - Despliega a Netlify automáticamente
   - Ejecuta health checks post-despliegue
   - Ejecuta auditoría de Lighthouse

3. **Deploy to Staging** - `.github/workflows/deploy-staging.yml`
   - Se ejecuta en push a `develop`
   - Despliega a entorno de staging

### Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions y agrega:

```bash
# Netlify
NETLIFY_AUTH_TOKEN=tu_token_de_netlify
NETLIFY_SITE_ID=tu_site_id_de_netlify
NETLIFY_SITE_ID_STAGING=tu_site_id_staging

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL_PROD=https://tu-proyecto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD=tu_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY_PROD=tu_service_role_key_produccion
NEXT_PUBLIC_APP_URL_PROD=https://tu-dominio.com

# Supabase Staging
NEXT_PUBLIC_SUPABASE_URL_STAGING=https://tu-proyecto-staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=tu_anon_key_staging
SUPABASE_SERVICE_ROLE_KEY_STAGING=tu_service_role_key_staging
NEXT_PUBLIC_APP_URL_STAGING=https://staging.tu-dominio.com

# Analytics y Monitoreo
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/project-id

# Vercel (si usas Vercel)
VERCEL_TOKEN=tu_token_de_vercel
```

### Flujo de Despliegue Automatizado

1. **Desarrollo**: Trabaja en feature branches
2. **Staging**: Merge a `develop` → Despliegue automático a staging
3. **Producción**: Merge a `main` → Despliegue automático a producción

### Comandos de Despliegue Manual

```bash
# Validar entorno antes del despliegue
npm run validate-env

# Ejecutar todos los checks pre-despliegue
npm run pre-deploy

# Desplegar a Netlify manualmente
npm run deploy:netlify

# Desplegar a Vercel manualmente
npm run deploy:vercel

# Verificar salud post-despliegue
npm run post-deploy
```

## 📊 Monitoreo y Analytics en Producción

### Health Checks Automatizados

El proyecto incluye endpoints de monitoreo:

- `GET /api/health` - Estado general del sistema
- `POST /api/monitoring/error` - Reporte de errores del cliente

### Métricas de Performance

- **Lighthouse CI**: Auditoría automática de performance en cada despliegue
- **Core Web Vitals**: Tracking automático de métricas de usuario
- **Bundle Analysis**: Análisis del tamaño del bundle en cada build

### Error Tracking

```javascript
// Configuración automática de error tracking
import { reportError } from '@/lib/monitoring'

// Los errores se reportan automáticamente a:
// - Console (desarrollo)
// - Sentry (producción, si está configurado)
// - API endpoint interno (/api/monitoring/error)
```

### Analytics

```javascript
// Google Analytics configurado automáticamente
import { trackEvent, trackPageView } from '@/lib/analytics'

// Tracking automático de:
// - Page views
// - User interactions
// - Search queries
// - Profile views
// - Contact form submissions
```

## 🔒 Seguridad en Producción

### Headers de Seguridad Configurados

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate Limiting

- API endpoints protegidos con rate limiting
- Error reporting con límites por IP
- Configuración ajustable via variables de entorno

### Auditoría de Seguridad Automatizada

```bash
# Ejecutar auditoría de seguridad
npm run security:audit

# Verificar dependencias vulnerables
npm run security:check
```

## 🚨 Rollback y Recuperación

### Rollback Automático en Netlify

```bash
# Listar despliegues
netlify sites:list
netlify api listSiteDeploys --site-id=SITE_ID

# Rollback a despliegue anterior
netlify api restoreSiteDeploy --site-id=SITE_ID --deploy-id=DEPLOY_ID
```

### Rollback en Vercel

```bash
# Rollback automático
vercel rollback
```

### Plan de Contingencia

1. **Detección de problema**: Health checks fallan
2. **Rollback automático**: GitHub Actions puede revertir automáticamente
3. **Notificación**: Equipo notificado via GitHub/Slack
4. **Investigación**: Logs y métricas disponibles para debugging

## ✅ Checklist de Despliegue Completo

### Pre-despliegue
- [ ] Código testeado y funcionando en desarrollo
- [ ] Variables de entorno validadas (`npm run validate-env`)
- [ ] Tests pasando (`npm run test:ci`)
- [ ] Linting sin errores (`npm run lint`)
- [ ] Type checking sin errores (`npm run type-check`)
- [ ] Build exitoso (`npm run build`)
- [ ] Auditoría de seguridad pasada (`npm run security:audit`)

### Configuración de Producción
- [ ] Proyecto Supabase de producción creado
- [ ] Variables de entorno de producción configuradas
- [ ] Dominio personalizado configurado
- [ ] Certificado SSL configurado
- [ ] GitHub Secrets configurados
- [ ] Analytics configurado (Google Analytics)
- [ ] Error tracking configurado (Sentry)

### Post-despliegue
- [ ] Health check pasando (`/api/health`)
- [ ] Todas las funcionalidades funcionan
- [ ] Performance metrics dentro de límites
- [ ] Error tracking funcionando
- [ ] Analytics reportando datos
- [ ] Backups configurados

### Monitoreo Continuo
- [ ] Lighthouse CI configurado
- [ ] Uptime monitoring activo
- [ ] Error alerts configurados
- [ ] Performance monitoring activo
- [ ] Security scanning programado

---

**🎉 ¡Despliegue Completo!** Tu aplicación Project Lens está ahora en producción con monitoreo completo, CI/CD automatizado y todas las mejores prácticas de seguridad implementadas.