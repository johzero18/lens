# Configuración de Supabase - Project Lens

## Resumen

Este documento proporciona una guía completa para configurar Supabase como backend para Project Lens, una red profesional para la industria visual argentina.

## ¿Qué es Supabase?

Supabase es una alternativa open-source a Firebase que proporciona:
- Base de datos PostgreSQL gestionada
- Autenticación integrada
- Storage para archivos
- APIs REST y GraphQL automáticas
- Row-Level Security (RLS)
- Edge Functions

## Configuración Completada

### ✅ Dependencias Instaladas

- `@supabase/supabase-js`: Cliente oficial de Supabase para JavaScript
- `dotenv`: Para manejo de variables de entorno en desarrollo

### ✅ Archivos Creados

1. **`src/lib/supabase.ts`**: Cliente de Supabase configurado
2. **`docs/supabase-setup.md`**: Guía detallada de configuración
3. **`docs/installation.md`**: Guía de instalación del proyecto
4. **`scripts/test-supabase.js`**: Script para probar la configuración
5. **`README-SUPABASE.md`**: Este archivo de documentación

### ✅ Variables de Entorno Configuradas

El archivo `.env` ya contiene las variables necesarias:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ucfrmyrccubxfiztfiss.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Uso del Cliente Supabase

### Cliente Básico (Frontend)

```typescript
import { supabase } from '@/lib/supabase'

// Ejemplo de uso
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', 'john_doe')
```

### Cliente de Servidor (Backend/Admin)

```typescript
import { createServerClient } from '@/lib/supabase'

// Para operaciones administrativas
const serverClient = createServerClient()
const { data, error } = await serverClient
  .from('profiles')
  .insert({ /* datos */ })
```

## Verificar Configuración

Ejecuta el script de prueba para verificar que todo esté configurado correctamente:

```bash
npm run test:supabase
```

Este script verificará:
- ✅ Variables de entorno
- ✅ Conexión a Supabase
- ✅ Configuración de autenticación
- ✅ Acceso a storage

## Próximos Pasos

Con Supabase configurado, los siguientes pasos son:

1. **Crear esquema de base de datos** (Tarea 16)
   - Tablas: `profiles`, `portfolio_images`, `contacts`
   - Índices y constraints
   - Row-Level Security policies

2. **Implementar autenticación** (Tarea 17)
   - Conectar formularios de registro/login
   - Configurar verificación de email
   - Sistema de recuperación de contraseña

3. **Configurar storage** (Tarea 18)
   - Buckets para avatars, covers, portfolio
   - Políticas de acceso
   - Optimización de imágenes

4. **Conectar funcionalidades** (Tareas 19-20)
   - Sistema de búsqueda
   - Gestión de perfiles
   - Sistema de mensajería

## Estructura de Datos Planificada

### Tabla `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  role_specific_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `portfolio_images`
```sql
CREATE TABLE portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `contacts`
```sql
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Seguridad

### Row-Level Security (RLS)

Supabase utiliza RLS para proteger los datos:

```sql
-- Ejemplo: Solo el propietario puede editar su perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Ejemplo: Todos pueden ver perfiles públicos
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (true);
```

### Variables de Entorno Seguras

- `NEXT_PUBLIC_*`: Variables públicas (seguras para el frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Variable privada (solo servidor)

## Recursos

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de Next.js con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## Soporte

Si encuentras problemas:

1. Revisa `docs/supabase-setup.md` para configuración detallada
2. Ejecuta `npm run test:supabase` para diagnosticar problemas
3. Verifica las variables de entorno en `.env.local`
4. Consulta los logs de Supabase Dashboard

---

**Estado**: ✅ Configuración completada
**Siguiente tarea**: Crear esquema de base de datos (Tarea 16)