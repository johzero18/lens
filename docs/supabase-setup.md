# Guía de Configuración de Supabase

Esta guía te ayudará a configurar la base de datos de Supabase para Project Lens paso a paso.

## Prerrequisitos

- Cuenta en [Supabase](https://supabase.com)
- Node.js instalado en tu sistema
- Proyecto Project Lens clonado localmente

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en "New Project"
3. Selecciona tu organización
4. Completa los datos del proyecto:
   - **Name**: `project-lens` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: Selecciona la región más cercana a tus usuarios
5. Haz clic en "Create new project"
6. Espera a que el proyecto se inicialice (puede tomar unos minutos)

## Paso 2: Obtener Credenciales

Una vez que el proyecto esté listo:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantén esta clave segura)

## Paso 3: Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea un archivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

2. Asegúrate de que `.env.local` esté en tu `.gitignore`

## Paso 4: Ejecutar Migraciones

### Opción A: Usando el SQL Editor (Recomendado para principiantes)

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Ejecuta las migraciones en orden:

#### 1. Esquema Inicial
Copia y pega el contenido de `supabase/migrations/001_initial_schema.sql` y ejecuta.

#### 2. Índices
Copia y pega el contenido de `supabase/migrations/002_indexes.sql` y ejecuta.

#### 3. Políticas RLS
Copia y pega el contenido de `supabase/migrations/003_rls_policies.sql` y ejecuta.

#### 4. Datos de Ejemplo (Opcional - Solo para desarrollo)
Copia y pega el contenido de `supabase/migrations/004_sample_data.sql` y ejecuta.

### Opción B: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto local
supabase init

# Vincular con proyecto remoto
supabase link --project-ref TU_PROJECT_REF

# Ejecutar migraciones
supabase db push
```

## Paso 5: Verificar Configuración

Ejecuta el script de verificación:

```bash
npm run db:verify
```

Este script verificará:
- ✅ Que todas las tablas existan
- ✅ Que los tipos personalizados estén creados
- ✅ Que las políticas RLS estén configuradas
- ✅ Que los índices estén en su lugar
- ✅ Que las operaciones básicas funcionen

## Paso 6: Configurar Autenticación

1. Ve a **Authentication** → **Settings**
2. Configura las siguientes opciones:

### Email Templates
- Personaliza los templates de email si lo deseas
- Asegúrate de que la URL de confirmación apunte a tu dominio

### URL Configuration
```
Site URL: http://localhost:3000 (desarrollo) / https://tu-dominio.com (producción)
Redirect URLs: 
- http://localhost:3000/auth/callback
- https://tu-dominio.com/auth/callback
```

### Providers
- Email: Habilitado por defecto
- Puedes habilitar OAuth providers si lo deseas (Google, GitHub, etc.)

## Paso 7: Configurar Storage (Para imágenes)

1. Ve a **Storage**
2. Crea los siguientes buckets:

### Bucket: `avatars`
```sql
-- Política para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Bucket: `covers`
```sql
-- Política para cover images
CREATE POLICY "Cover images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Bucket: `portfolio`
```sql
-- Política para portfolio images
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own portfolio images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can manage their own portfolio images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own portfolio images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Paso 8: Probar la Configuración

1. Inicia tu aplicación:
```bash
npm run dev
```

2. Ve a `http://localhost:3000`
3. Prueba el registro de un nuevo usuario
4. Verifica que se cree automáticamente un perfil
5. Prueba la subida de imágenes

## Estructura de la Base de Datos

### Tablas Principales

- **profiles**: Información de usuarios y perfiles profesionales
- **portfolio_images**: Imágenes del portfolio de cada usuario
- **contacts**: Mensajes entre usuarios

### Tipos Personalizados

- **user_role**: photographer, model, makeup_artist, stylist, producer
- **subscription_tier**: free, pro

### Características de Seguridad

- **Row Level Security (RLS)**: Habilitado en todas las tablas
- **Políticas de acceso**: Solo los propietarios pueden modificar sus datos
- **Validaciones**: Constraints en longitud y formato de datos

## Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar la clave correcta (anon para cliente, service_role para servidor)

### Error: "relation does not exist"
- Verifica que todas las migraciones se ejecutaron correctamente
- Revisa el orden de ejecución de las migraciones

### Error: "permission denied for table"
- Verifica que las políticas RLS estén configuradas
- Asegúrate de estar autenticado correctamente

### Error: "new row violates check constraint"
- Revisa que los datos cumplan con las validaciones
- Verifica la longitud y formato de los campos

## Monitoreo y Mantenimiento

### Dashboard de Supabase
- **Database**: Monitorea queries y performance
- **Auth**: Revisa usuarios registrados y sesiones
- **Storage**: Monitorea uso de almacenamiento
- **Logs**: Revisa logs de errores y actividad

### Backups
- Supabase realiza backups automáticos diarios
- Puedes descargar backups desde el dashboard
- Configura alertas para monitoreo proactivo

## Próximos Pasos

Una vez configurada la base de datos:

1. ✅ Implementar autenticación en la aplicación
2. ✅ Conectar formularios con la base de datos
3. ✅ Implementar subida de imágenes
4. ✅ Configurar búsqueda y filtros
5. ✅ Implementar sistema de mensajería

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

¡Tu base de datos está lista para Project Lens! 🚀