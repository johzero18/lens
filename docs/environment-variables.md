# Variables de Entorno - Project Lens

Esta guía documenta todas las variables de entorno necesarias para ejecutar Project Lens en diferentes entornos.

## 📋 Variables Requeridas

### Supabase Configuration

```bash
# URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co

# Clave pública anónima de Supabase (segura para el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave de rol de servicio (SOLO para servidor, mantener segura)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Application Configuration

```bash
# URL base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Entorno de ejecución
NODE_ENV=development

# Email de contacto para notificaciones del sistema
CONTACT_EMAIL=contact@projectlens.dev
```

### Optional Configuration

```bash
# Configuración de analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Configuración de Sentry para error tracking (opcional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Configuración de rate limiting (opcional)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## 🔧 Configuración por Entorno

### Desarrollo Local (.env.local)

```bash
# Supabase - Proyecto de desarrollo
NEXT_PUBLIC_SUPABASE_URL=https://dev-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_desarrollo
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_desarrollo

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
CONTACT_EMAIL=dev@projectlens.dev

# Debug (opcional para desarrollo)
DEBUG=true
NEXT_PUBLIC_DEBUG_MODE=true
```

### Staging (.env.staging)

```bash
# Supabase - Proyecto de staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_staging
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_staging

# Aplicación
NEXT_PUBLIC_APP_URL=https://staging.projectlens.dev
NODE_ENV=production
CONTACT_EMAIL=staging@projectlens.dev

# Analytics y monitoreo
NEXT_PUBLIC_GA_ID=G-STAGING-ID
SENTRY_DSN=https://staging-dsn@sentry.io/project
```

### Producción (.env.production)

```bash
# Supabase - Proyecto de producción
NEXT_PUBLIC_SUPABASE_URL=https://prod-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_produccion

# Aplicación
NEXT_PUBLIC_APP_URL=https://projectlens.dev
NODE_ENV=production
CONTACT_EMAIL=contact@projectlens.dev

# Analytics y monitoreo
NEXT_PUBLIC_GA_ID=G-PRODUCTION-ID
SENTRY_DSN=https://production-dsn@sentry.io/project

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=900000
```

## 🔐 Seguridad de Variables

### Variables Públicas (NEXT_PUBLIC_*)

Estas variables son **visibles en el cliente** y pueden ser vistas por cualquier usuario:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_DEBUG_MODE`

**⚠️ NUNCA incluyas información sensible en variables NEXT_PUBLIC_***

### Variables Privadas (Solo servidor)

Estas variables son **solo accesibles en el servidor**:

- `SUPABASE_SERVICE_ROLE_KEY` - Clave con permisos administrativos
- `CONTACT_EMAIL` - Email interno del sistema
- `SENTRY_DSN` - DSN para error tracking
- `RATE_LIMIT_*` - Configuración de rate limiting

## 📝 Cómo Obtener las Variables

### Supabase Variables

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **Settings** → **API**
3. Copia los valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Google Analytics (Opcional)

1. Crea una propiedad en [Google Analytics](https://analytics.google.com)
2. Obtén el **Measurement ID** (formato: G-XXXXXXXXXX)
3. Úsalo como `NEXT_PUBLIC_GA_ID`

### Sentry (Opcional)

1. Crea un proyecto en [Sentry](https://sentry.io)
2. Obtén el **DSN** de la configuración del proyecto
3. Úsalo como `SENTRY_DSN`

## 🛠️ Configuración en Diferentes Plataformas

### Netlify

1. Ve a **Site settings** → **Environment variables**
2. Agrega cada variable individualmente
3. Asegúrate de marcar las variables sensibles como "Secret"

```bash
# Ejemplo de configuración en Netlify
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI... (Secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI... (Secret)
```

### Vercel

1. Ve a **Settings** → **Environment Variables**
2. Agrega variables por entorno (Development, Preview, Production)
3. Las variables sensibles se ocultan automáticamente

```bash
# Comando CLI de Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Docker

```dockerfile
# Dockerfile
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

```bash
# docker-compose.yml
environment:
  - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
  - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

## ✅ Validación de Variables

### Script de Validación

Crea un script para validar que todas las variables estén configuradas:

```javascript
// scripts/validate-env.js
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ Todas las variables de entorno están configuradas');
```

### Ejecutar Validación

```bash
# Agregar al package.json
"scripts": {
  "validate-env": "node scripts/validate-env.js",
  "dev": "npm run validate-env && next dev",
  "build": "npm run validate-env && next build"
}
```

## 🔍 Troubleshooting

### Error: "Invalid API key"

```bash
# Verifica que las claves sean correctas
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# Regenera las claves en Supabase si es necesario
```

### Error: "Environment variable not found"

```bash
# Verifica que el archivo .env.local exista
ls -la .env.local

# Verifica el contenido
cat .env.local

# Reinicia el servidor de desarrollo
npm run dev
```

### Variables no se actualizan

```bash
# Limpia el cache de Next.js
rm -rf .next
npm run dev
```

## 📋 Checklist de Configuración

### Desarrollo Local
- [ ] Archivo `.env.local` creado
- [ ] Variables de Supabase configuradas
- [ ] `NEXT_PUBLIC_APP_URL` apunta a localhost:3000
- [ ] Variables validadas con script
- [ ] Servidor de desarrollo funciona

### Staging
- [ ] Variables configuradas en plataforma de hosting
- [ ] Proyecto de Supabase de staging creado
- [ ] URL de staging configurada
- [ ] Analytics de staging configurado
- [ ] Deploy de staging funciona

### Producción
- [ ] Variables de producción configuradas
- [ ] Proyecto de Supabase de producción creado
- [ ] Dominio personalizado configurado
- [ ] Analytics de producción configurado
- [ ] Monitoreo de errores configurado
- [ ] Rate limiting configurado
- [ ] Deploy de producción funciona

## 🔄 Rotación de Claves

### Cuándo Rotar Claves

- Cada 90 días (recomendado)
- Cuando un miembro del equipo deja el proyecto
- Si sospechas que una clave fue comprometida
- Antes de lanzar a producción

### Proceso de Rotación

1. **Genera nuevas claves en Supabase**
2. **Actualiza variables en todos los entornos**
3. **Redeploy todas las aplicaciones**
4. **Verifica que todo funcione correctamente**
5. **Revoca las claves antiguas**

---

**⚠️ Importante**: Nunca commitees archivos `.env*` al repositorio. Siempre usa `.gitignore` para excluirlos.

**🔐 Seguridad**: Trata las variables de entorno como secretos. No las compartas en canales inseguros.