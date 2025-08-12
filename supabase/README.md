# Supabase Database Setup

Este directorio contiene las migraciones y configuración de la base de datos para Project Lens.

## Estructura de Archivos

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql    # Esquema inicial y tipos
│   ├── 002_indexes.sql           # Índices de rendimiento
│   ├── 003_rls_policies.sql      # Políticas de seguridad RLS
│   └── 004_sample_data.sql       # Datos de ejemplo (solo desarrollo)
└── README.md                     # Este archivo
```

## Orden de Ejecución

Las migraciones deben ejecutarse en el siguiente orden:

1. **001_initial_schema.sql** - Crea las tablas principales, tipos y funciones básicas
2. **002_indexes.sql** - Agrega índices para optimización de rendimiento
3. **003_rls_policies.sql** - Configura las políticas de Row Level Security
4. **004_sample_data.sql** - Inserta datos de ejemplo (solo en desarrollo)

## Configuración en Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda la URL del proyecto y la clave anon

### 2. Ejecutar Migraciones

#### Opción A: Usando Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto local
supabase init

# Vincular con proyecto remoto
supabase link --project-ref YOUR_PROJECT_REF

# Ejecutar migraciones
supabase db push
```

#### Opción B: Usando SQL Editor en Dashboard

1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido de cada archivo de migración
3. Ejecuta en orden: 001 → 002 → 003 → 004 (opcional)

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Verificación de la Instalación

Después de ejecutar las migraciones, verifica que todo esté configurado correctamente:

### 1. Verificar Tablas

```sql
-- Verificar que las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'portfolio_images', 'contacts');
```

### 2. Verificar Tipos Personalizados

```sql
-- Verificar tipos enum
SELECT typname 
FROM pg_type 
WHERE typname IN ('user_role', 'subscription_tier');
```

### 3. Verificar Políticas RLS

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Verificar Índices

```sql
-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';
```

## Datos de Ejemplo

El archivo `004_sample_data.sql` incluye datos de ejemplo para desarrollo:

- 5 perfiles de ejemplo (uno por cada rol)
- Imágenes de portfolio de ejemplo
- Mensajes de contacto de ejemplo

**⚠️ Importante**: No ejecutes este archivo en producción.

## Estructura de Datos por Rol

### Fotógrafo
```json
{
  "specialties": ["retratos", "moda", "eventos"],
  "experience_level": "profesional",
  "studio_access": "propio",
  "equipment_highlights": "Canon EOS R5, lentes profesionales",
  "post_production_skills": ["lightroom", "photoshop"]
}
```

### Modelo
```json
{
  "model_type": ["moda", "comercial"],
  "experience_level": "profesional",
  "height_cm": 175,
  "measurements": {
    "bust_cm": 86,
    "waist_cm": 61,
    "hips_cm": 89
  },
  "shoe_size_eu": 38,
  "dress_size_eu": 36,
  "hair_color": "castaño",
  "eye_color": "marrones",
  "special_attributes": {
    "tattoos": false,
    "piercings": true
  }
}
```

### Maquilladora
```json
{
  "specialties": ["moda", "belleza", "editorial"],
  "experience_level": "profesional",
  "kit_highlights": ["MAC", "Urban Decay"],
  "services_offered": ["maquillaje_dia", "maquillaje_noche"],
  "travel_availability": true
}
```

### Estilista
```json
{
  "specialties": ["moda", "editorial"],
  "experience_level": "profesional",
  "industry_focus": ["moda", "publicidad"],
  "wardrobe_access": "showroom_propio",
  "portfolio_url": "https://example.com/portfolio"
}
```

### Productor
```json
{
  "specialties": ["publicidad", "fashion_films"],
  "services": ["produccion_ejecutiva", "casting"],
  "typical_budget_range": "50000-200000",
  "portfolio_url": "https://example.com/portfolio"
}
```

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

- **Perfiles**: Lectura pública, escritura solo del propietario
- **Portfolio**: Lectura pública, escritura solo del propietario
- **Contactos**: Solo visible para emisor y receptor

### Validaciones

- Longitud de username: 3-30 caracteres
- Formato de username: solo letras, números, guiones y guiones bajos
- Bio máximo: 500 caracteres
- Asunto de mensaje: 1-100 caracteres
- Mensaje: 1-1000 caracteres

## Troubleshooting

### Error: "relation does not exist"
- Verifica que las migraciones se ejecutaron en orden
- Asegúrate de estar conectado al proyecto correcto

### Error: "permission denied"
- Verifica que RLS esté configurado correctamente
- Asegúrate de estar autenticado

### Error: "constraint violation"
- Revisa las validaciones de datos
- Verifica que los datos cumplan con las restricciones

## Soporte

Para más información sobre Supabase:
- [Documentación oficial](https://supabase.com/docs)
- [Guías de PostgreSQL](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)