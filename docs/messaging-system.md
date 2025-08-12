# Sistema de Mensajería - Project Lens

## Descripción General

El sistema de mensajería de Project Lens permite a los usuarios comunicarse de manera segura y profesional dentro de la plataforma. Incluye funcionalidades de envío de mensajes, gestión de conversaciones, notificaciones por email y protección contra spam.

## Características Principales

### 1. Envío de Mensajes
- Formulario de contacto con campos específicos del proyecto
- Validación de contenido y límites de caracteres
- Vista previa antes del envío
- Rate limiting para prevenir spam (10 mensajes por día)

### 2. Gestión de Mensajes
- Lista de mensajes recibidos con filtros
- Estados de mensaje: no leído, leído, respondido
- Vista detallada de mensajes
- Sistema de respuestas

### 3. Notificaciones por Email
- Notificación automática al recibir mensajes
- Notificación de respuestas
- Templates HTML y texto plano
- Integración con servicios de email externos

### 4. Protección contra Spam
- Rate limiting por usuario (10 mensajes/día)
- Validación de contenido
- Prevención de auto-mensajes
- Verificación de usuarios existentes

## Arquitectura del Sistema

### Base de Datos

```sql
-- Tabla de mensajes de contacto
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL CHECK (char_length(subject) >= 1 AND char_length(subject) <= 100),
  message TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 1000),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_contact CHECK (sender_id != receiver_id)
);

-- Índices para optimización
CREATE INDEX idx_contacts_receiver_id ON contacts(receiver_id);
CREATE INDEX idx_contacts_sender_id ON contacts(sender_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

### APIs

#### 1. GET /api/messages
Obtiene los mensajes del usuario autenticado.

**Parámetros de consulta:**
- `status`: Filtrar por estado (unread, read, replied)
- `page`: Número de página (default: 1)
- `limit`: Mensajes por página (default: 20)

**Respuesta:**
```json
{
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender_id": "uuid",
        "receiver_id": "uuid",
        "subject": "string",
        "message": "string",
        "status": "unread|read|replied",
        "created_at": "ISO date",
        "read_at": "ISO date",
        "sender": {
          "username": "string",
          "full_name": "string",
          "role": "string",
          "avatar_url": "string"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasMore": true
    }
  }
}
```

#### 2. POST /api/messages
Envía un nuevo mensaje.

**Cuerpo de la solicitud:**
```json
{
  "receiver_id": "uuid",
  "subject": "string (max 100 chars)",
  "message": "string (max 1000 chars)",
  "project_type": "string (opcional)",
  "budget_range": "string (opcional)",
  "timeline": "string (opcional)"
}
```

**Respuesta:**
```json
{
  "data": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "subject": "string",
    "message": "string",
    "created_at": "ISO date",
    "sender": { ... },
    "receiver": { ... }
  },
  "meta": {
    "rateLimit": {
      "remaining": 9,
      "resetTime": "ISO date"
    }
  }
}
```

#### 3. PATCH /api/messages/[messageId]/read
Marca un mensaje como leído.

**Respuesta:**
```json
{
  "data": {
    "id": "uuid",
    "read_at": "ISO date",
    "already_read": false
  }
}
```

#### 4. POST /api/messages/[messageId]/reply
Responde a un mensaje.

**Cuerpo de la solicitud:**
```json
{
  "message": "string (max 1000 chars)"
}
```

### Rate Limiting

El sistema implementa rate limiting para prevenir spam:

- **Límite:** 10 mensajes por usuario por día
- **Ventana:** 24 horas
- **Almacenamiento:** En memoria (desarrollo) / Redis (producción)
- **Headers de respuesta:**
  - `X-RateLimit-Limit`: Límite máximo
  - `X-RateLimit-Remaining`: Mensajes restantes
  - `X-RateLimit-Reset`: Tiempo de reset

### Notificaciones por Email

#### Edge Function: send-message-notification

Ubicación: `supabase/functions/send-message-notification/index.ts`

**Funcionalidades:**
- Genera emails HTML y texto plano
- Integra con servicios de email externos
- Maneja errores de envío sin afectar la funcionalidad principal

**Configuración requerida:**
```env
EMAIL_SERVICE_URL=https://api.emailservice.com/send
EMAIL_SERVICE_KEY=your_api_key
SITE_URL=https://projectlens.com
```

**Templates de email:**
- Nuevo mensaje: Notifica al receptor sobre un mensaje nuevo
- Respuesta: Notifica al remitente original sobre una respuesta

## Servicios

### MessageService

Ubicación: `src/lib/services/messageService.ts`

**Métodos principales:**
- `getMessages(filters)`: Obtiene mensajes con filtros
- `sendMessage(messageData)`: Envía un nuevo mensaje
- `markAsRead(messageId)`: Marca mensaje como leído
- `replyToMessage(messageId, replyText)`: Responde a un mensaje
- `getUnreadCount()`: Obtiene contador de no leídos
- `validateContactForm(formData)`: Valida formulario de contacto

**Utilidades:**
- `formatMessagePreview()`: Formatea preview de mensajes
- `getProjectTypeDisplayName()`: Nombres de tipos de proyecto
- `getBudgetRangeDisplayName()`: Nombres de rangos de presupuesto
- `formatDate()`: Formatea fechas para display
- `getRelativeTime()`: Tiempo relativo (ej: "hace 2 horas")

## Componentes

### ContactModal

Ubicación: `src/components/features/ContactModal.tsx`

**Props:**
- `isOpen`: Estado del modal
- `onClose`: Función de cierre
- `recipientId`: ID del destinatario
- `recipientName`: Nombre del destinatario
- `recipientRole`: Rol del destinatario

**Funcionalidades:**
- Formulario de contacto con validación
- Vista previa del mensaje
- Integración con MessageService
- Manejo de errores y rate limiting

### MessagesPageClient

Ubicación: `src/app/mensajes/MessagesPageClient.tsx`

**Funcionalidades:**
- Lista de mensajes con filtros
- Vista detallada de mensajes
- Sistema de respuestas
- Marcado automático como leído
- Manejo de estados de carga y error

## Seguridad

### Validaciones
- Longitud de asunto: 1-100 caracteres
- Longitud de mensaje: 1-1000 caracteres
- Prevención de auto-mensajes
- Verificación de usuarios existentes

### Autenticación
- Verificación de usuario autenticado en todas las APIs
- Row-Level Security (RLS) en Supabase
- Verificación de permisos para leer/responder mensajes

### Rate Limiting
- 10 mensajes por usuario por día
- Aplicado tanto a mensajes nuevos como respuestas
- Headers informativos para el cliente

## Configuración de Desarrollo

### Variables de Entorno
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service (opcional para desarrollo)
EMAIL_SERVICE_URL=https://api.emailservice.com/send
EMAIL_SERVICE_KEY=your_api_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

### Configuración de Supabase

1. **Habilitar Edge Functions:**
```bash
supabase functions deploy send-message-notification
```

2. **Configurar RLS:**
```sql
-- Habilitar RLS en la tabla contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política para leer mensajes (solo receptor)
CREATE POLICY "Users can read their received messages" ON contacts
  FOR SELECT USING (receiver_id = auth.uid());

-- Política para enviar mensajes (usuarios autenticados)
CREATE POLICY "Authenticated users can send messages" ON contacts
  FOR INSERT WITH CHECK (sender_id = auth.uid());
```

## Testing

### Tests Unitarios
- Validación de formularios
- Formateo de fechas y mensajes
- Rate limiting logic

### Tests de Integración
- Flujo completo de envío de mensajes
- Marcado como leído
- Sistema de respuestas
- Notificaciones por email

### Tests E2E
- Envío de mensaje desde perfil
- Gestión de mensajes en página de mensajes
- Respuesta a mensajes
- Filtros y búsqueda

## Monitoreo y Métricas

### Métricas Recomendadas
- Mensajes enviados por día
- Tasa de respuesta
- Errores de envío de email
- Rate limiting hits
- Tiempo de respuesta de APIs

### Logs
- Errores de envío de mensajes
- Fallos de notificaciones por email
- Rate limiting events
- Errores de validación

## Roadmap Futuro

### Funcionalidades Planeadas
1. **Conversaciones agrupadas:** Agrupar mensajes por conversación
2. **Mensajes multimedia:** Soporte para imágenes y archivos
3. **Notificaciones push:** Notificaciones en tiempo real
4. **Mensajes programados:** Envío diferido de mensajes
5. **Templates de mensaje:** Plantillas predefinidas
6. **Búsqueda avanzada:** Búsqueda en contenido de mensajes
7. **Archivado de mensajes:** Organización de mensajes antiguos
8. **Reportes de spam:** Sistema de reportes y moderación

### Optimizaciones Técnicas
1. **Cache de mensajes:** Redis para mejor rendimiento
2. **Paginación infinita:** Scroll infinito en lista de mensajes
3. **Compresión de mensajes:** Optimización de almacenamiento
4. **Analytics avanzados:** Métricas detalladas de uso
5. **A/B testing:** Testing de templates de email

## Soporte y Mantenimiento

### Tareas de Mantenimiento
- Limpieza de mensajes antiguos (opcional)
- Monitoreo de rate limiting
- Actualización de templates de email
- Optimización de queries de base de datos

### Troubleshooting Común
1. **Mensajes no se envían:** Verificar autenticación y rate limiting
2. **Emails no llegan:** Verificar configuración del servicio de email
3. **Errores de validación:** Verificar longitud de campos
4. **Performance lenta:** Verificar índices de base de datos

Para más información técnica, consultar el código fuente en:
- APIs: `src/app/api/messages/`
- Servicios: `src/lib/services/messageService.ts`
- Componentes: `src/components/features/ContactModal.tsx`
- Edge Functions: `supabase/functions/send-message-notification/`