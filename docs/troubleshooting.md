# Troubleshooting - Project Lens

Esta guía ayuda a diagnosticar y resolver problemas comunes en Project Lens.

## 📋 Índice

- [Problemas de Instalación](#problemas-de-instalación)
- [Problemas de Base de Datos](#problemas-de-base-de-datos)
- [Problemas de Autenticación](#problemas-de-autenticación)
- [Problemas de Subida de Archivos](#problemas-de-subida-de-archivos)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Despliegue](#problemas-de-despliegue)
- [Errores Comunes](#errores-comunes)

## 🛠️ Problemas de Instalación

### Error: "Module not found"

**Síntomas:**
```bash
Module not found: Can't resolve '@/components/ui/Button'
Error: Cannot find module '@supabase/supabase-js'
```

**Soluciones:**

1. **Limpiar e instalar dependencias:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Verificar alias de TypeScript:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Verificar que el archivo existe:**
```bash
ls -la src/components/ui/Button.tsx
```

### Error: "Node version incompatible"

**Síntomas:**
```bash
error @next/swc-darwin-arm64@14.0.0: The engine "node" is incompatible
```

**Soluciones:**

1. **Actualizar Node.js:**
```bash
# Usando nvm
nvm install 18
nvm use 18

# Verificar versión
node --version # Debe ser 18.17+
```

2. **Limpiar cache de npm:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

**Síntomas:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluciones:**

1. **Cambiar puerto:**
```bash
npm run dev -- -p 3001
```

2. **Matar proceso en puerto 3000:**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 🗄️ Problemas de Base de Datos

### Error: "Invalid API key"

**Síntomas:**
```bash
Error: Invalid API key
AuthApiError: Invalid JWT
```

**Soluciones:**

1. **Verificar variables de entorno:**
```bash
# Verificar que existan
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# Verificar formato
# URL debe ser: https://xxx.supabase.co
# Keys deben empezar con: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

2. **Regenerar claves en Supabase:**
   - Ve a Settings → API en tu proyecto Supabase
   - Copia las nuevas claves
   - Actualiza `.env.local`
   - Reinicia el servidor de desarrollo

3. **Verificar configuración del cliente:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Error: "relation does not exist"

**Síntomas:**
```bash
PostgrestError: relation "public.profiles" does not exist
```

**Soluciones:**

1. **Verificar que las migraciones se ejecutaron:**
```sql
-- En el SQL Editor de Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. **Ejecutar migraciones manualmente:**
   - Ve a SQL Editor en Supabase
   - Ejecuta los archivos de migración en orden:
     - `001_initial_schema.sql`
     - `002_indexes.sql`
     - `003_rls_policies.sql`

3. **Verificar permisos:**
```sql
-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Error: "permission denied for table"

**Síntomas:**
```bash
PostgrestError: permission denied for table profiles
```

**Soluciones:**

1. **Verificar políticas RLS:**
```sql
-- Ver políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

2. **Recrear políticas básicas:**
```sql
-- Política para perfiles
CREATE POLICY "Users can view all profiles" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

3. **Verificar autenticación:**
```typescript
// Verificar que el usuario esté autenticado
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

## 🔐 Problemas de Autenticación

### Error: "Email not confirmed"

**Síntomas:**
```bash
AuthApiError: Email not confirmed
```

**Soluciones:**

1. **Verificar configuración de email:**
   - Ve a Authentication → Settings en Supabase
   - Verifica que "Enable email confirmations" esté configurado correctamente

2. **Reenviar email de confirmación:**
```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

3. **Deshabilitar confirmación para desarrollo:**
```sql
-- Solo para desarrollo
UPDATE auth.users SET email_confirmed_at = NOW() 
WHERE email = 'test@example.com';
```

### Error: "Invalid login credentials"

**Síntomas:**
```bash
AuthApiError: Invalid login credentials
```

**Soluciones:**

1. **Verificar credenciales:**
```typescript
// Debug login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

console.log('Login result:', { data, error })
```

2. **Verificar que el usuario existe:**
```sql
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

3. **Reset password si es necesario:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: 'http://localhost:3000/reset-password' }
)
```

### Error: "Session expired"

**Síntomas:**
```bash
AuthSessionMissingError: Session is missing
```

**Soluciones:**

1. **Implementar refresh automático:**
```typescript
// lib/auth.ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  }
  if (event === 'SIGNED_OUT') {
    // Redirect to login
    window.location.href = '/login'
  }
})
```

2. **Verificar configuración de JWT:**
   - Ve a Settings → API en Supabase
   - Verifica JWT expiry (default: 3600 segundos)

## 📤 Problemas de Subida de Archivos

### Error: "File too large"

**Síntomas:**
```bash
StorageApiError: The object exceeded the maximum allowed size
```

**Soluciones:**

1. **Verificar límites de tamaño:**
```typescript
// Verificar tamaño antes de subir
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large. Maximum size is 5MB')
}
```

2. **Comprimir imagen antes de subir:**
```typescript
// lib/imageUtils.ts
export const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: file.type }))
      }, file.type, quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

### Error: "Invalid file type"

**Síntomas:**
```bash
StorageApiError: Invalid file type
```

**Soluciones:**

1. **Verificar tipos permitidos:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed')
}
```

2. **Configurar bucket policies:**
```sql
-- Política para tipos de archivo
CREATE POLICY "Allow image uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.extension(name) = 'jpg' OR 
   storage.extension(name) = 'jpeg' OR 
   storage.extension(name) = 'png' OR 
   storage.extension(name) = 'webp')
);
```

### Error: "Upload failed"

**Síntomas:**
```bash
StorageApiError: Upload failed
```

**Soluciones:**

1. **Verificar permisos de bucket:**
```sql
-- Verificar políticas de storage
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';
```

2. **Implementar retry logic:**
```typescript
const uploadWithRetry = async (file: File, path: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(path, file)
      
      if (error) throw error
      return data
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## ⚡ Problemas de Performance

### Página carga lentamente

**Síntomas:**
- Tiempos de carga > 3 segundos
- Lighthouse score bajo

**Soluciones:**

1. **Optimizar imágenes:**
```typescript
// Usar Next.js Image component
import Image from 'next/image'

<Image
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  priority={false} // Solo true para above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

2. **Implementar lazy loading:**
```typescript
// Lazy load componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

3. **Optimizar queries de base de datos:**
```typescript
// Seleccionar solo campos necesarios
const { data } = await supabase
  .from('profiles')
  .select('id, username, full_name, avatar_url') // No seleccionar todo
  .limit(20)
```

### Bundle size muy grande

**Síntomas:**
```bash
Warning: Bundle size exceeded recommended size
```

**Soluciones:**

1. **Analizar bundle:**
```bash
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

2. **Implementar code splitting:**
```typescript
// Dynamic imports
const ProfileModal = dynamic(() => import('./ProfileModal'), {
  loading: () => <LoadingSpinner />
})
```

3. **Remover dependencias no utilizadas:**
```bash
npm install -g depcheck
depcheck
```

## 🚀 Problemas de Despliegue

### Build falla en producción

**Síntomas:**
```bash
Error: Build failed
Type error: Property 'xxx' does not exist
```

**Soluciones:**

1. **Verificar tipos en desarrollo:**
```bash
npm run type-check
```

2. **Verificar variables de entorno:**
```bash
# En Netlify/Vercel, verificar que todas las variables estén configuradas
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

3. **Verificar configuración de build:**
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### Error 404 en rutas dinámicas

**Síntomas:**
- Rutas como `/username` devuelven 404
- Funciona en desarrollo pero no en producción

**Soluciones:**

1. **Verificar configuración de redirects:**
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Verificar generación estática:**
```typescript
// app/[username]/page.tsx
export async function generateStaticParams() {
  // Generar parámetros estáticos si es necesario
  const profiles = await getProfiles()
  return profiles.map((profile) => ({
    username: profile.username,
  }))
}
```

### Variables de entorno no funcionan

**Síntomas:**
```bash
Error: Environment variable is undefined
```

**Soluciones:**

1. **Verificar prefijo NEXT_PUBLIC_:**
```bash
# Variables del cliente DEBEN tener prefijo
NEXT_PUBLIC_SUPABASE_URL=xxx

# Variables del servidor NO necesitan prefijo
SUPABASE_SERVICE_ROLE_KEY=xxx
```

2. **Verificar configuración en plataforma:**
   - Netlify: Site settings → Environment variables
   - Vercel: Settings → Environment Variables

3. **Redeploy después de cambiar variables:**
```bash
# Trigger nuevo deploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 🐛 Errores Comunes

### Error: "Hydration failed"

**Síntomas:**
```bash
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Soluciones:**

1. **Verificar renderizado condicional:**
```typescript
// ❌ Problemático
const Component = () => {
  return (
    <div>
      {typeof window !== 'undefined' && <ClientOnlyComponent />}
    </div>
  )
}

// ✅ Correcto
const Component = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return <ClientOnlyComponent />
}
```

2. **Usar dynamic imports para componentes del cliente:**
```typescript
const ClientComponent = dynamic(() => import('./ClientComponent'), {
  ssr: false
})
```

### Error: "Cannot read property of undefined"

**Síntomas:**
```bash
TypeError: Cannot read property 'username' of undefined
```

**Soluciones:**

1. **Usar optional chaining:**
```typescript
// ❌ Problemático
const username = user.profile.username

// ✅ Correcto
const username = user?.profile?.username
```

2. **Verificar datos antes de renderizar:**
```typescript
if (!profile) {
  return <LoadingSpinner />
}

return <ProfileComponent profile={profile} />
```

### Error: "Maximum call stack exceeded"

**Síntomas:**
```bash
RangeError: Maximum call stack size exceeded
```

**Soluciones:**

1. **Verificar dependencias de useEffect:**
```typescript
// ❌ Problemático - loop infinito
useEffect(() => {
  setData(data.map(item => ({ ...item, processed: true })))
}, [data])

// ✅ Correcto
useEffect(() => {
  setData(prevData => prevData.map(item => ({ ...item, processed: true })))
}, []) // Sin dependencia de data
```

2. **Usar useCallback para funciones:**
```typescript
const handleClick = useCallback(() => {
  // Handle click
}, [dependency])
```

## 🔍 Herramientas de Debugging

### Debug en Desarrollo

```typescript
// lib/debug.ts
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data)
    }
  },
  
  error: (message: string, error?: Error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error)
    }
  },
  
  time: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label)
    }
  }
}
```

### React Developer Tools

1. **Instalar extensión del navegador**
2. **Usar Profiler para performance**
3. **Inspeccionar estado de componentes**

### Network Debugging

```typescript
// lib/apiClient.ts
const apiClient = {
  async request(url: string, options: RequestInit = {}) {
    console.log(`API Request: ${options.method || 'GET'} ${url}`)
    
    const response = await fetch(url, options)
    
    console.log(`API Response: ${response.status} ${url}`)
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`API Error: ${error}`)
      throw new Error(error)
    }
    
    return response.json()
  }
}
```

## 📞 Obtener Ayuda

### Información para Reportar Bugs

Cuando reportes un problema, incluye:

1. **Descripción del problema**
2. **Pasos para reproducir**
3. **Comportamiento esperado vs actual**
4. **Información del entorno:**
   ```bash
   node --version
   npm --version
   # Browser y versión
   # Sistema operativo
   ```
5. **Logs de error completos**
6. **Screenshots si es relevante**

### Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [GitHub Issues del proyecto](https://github.com/project-lens/issues)

---

**🔧 Última actualización**: Febrero 2025  
**📞 Soporte**: Para problemas no cubiertos aquí, crea un issue en GitHub  
**⚡ Tip**: Siempre verifica los logs del navegador y del servidor para más detalles