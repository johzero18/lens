# Documentación de APIs - Project Lens

Esta documentación describe todas las APIs disponibles en Project Lens, incluyendo endpoints, parámetros, respuestas y ejemplos de uso.

## 📋 Índice de APIs

- [Autenticación](#autenticación)
- [Gestión de Perfiles](#gestión-de-perfiles)
- [Sistema de Búsqueda](#sistema-de-búsqueda)
- [Gestión de Portfolio](#gestión-de-portfolio)
- [Sistema de Mensajería](#sistema-de-mensajería)
- [Subida de Archivos](#subida-de-archivos)

## 🔐 Autenticación

Todas las APIs protegidas requieren autenticación mediante JWT token de Supabase.

### Headers Requeridos

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtener Token

```javascript
// Cliente
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## 👤 Gestión de Perfiles

### GET /api/profile

Obtiene el perfil del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "username": "johndoe",
  "full_name": "John Doe",
  "role": "photographer",
  "bio": "Fotógrafo profesional especializado en retratos",
  "location": "Buenos Aires, Argentina",
  "avatar_url": "https://storage.supabase.co/...",
  "cover_image_url": "https://storage.supabase.co/...",
  "subscription_tier": "free",
  "role_specific_data": {
    "specialties": ["portrait", "wedding"],
    "experience_level": "professional",
    "equipment_highlights": "Canon EOS R5, Sony A7R IV"
  },
  "portfolio_images": [
    {
      "id": "uuid",
      "image_url": "https://storage.supabase.co/...",
      "alt_text": "Retrato profesional",
      "sort_order": 1
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `404`: Perfil no encontrado

### PUT /api/profile

Actualiza el perfil del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "full_name": "John Doe Updated",
  "bio": "Nueva biografía",
  "location": "Córdoba, Argentina",
  "role_specific_data": {
    "specialties": ["portrait", "fashion", "commercial"],
    "experience_level": "expert",
    "equipment_highlights": "Canon EOS R5, Sony A7R IV, Profoto B10"
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "profile": {
    // ... perfil actualizado
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autenticado
- `422`: Error de validación

### GET /api/profile/[username]

Obtiene el perfil público de un usuario por username.

**Parámetros:**
- `username`: Nombre de usuario único

**Respuesta exitosa (200):**
```json
{
  // ... mismo formato que GET /api/profile
  // pero sin información privada
}
```

**Errores:**
- `404`: Usuario no encontrado

## 🔍 Sistema de Búsqueda

### GET /api/search

Busca perfiles con filtros avanzados.

**Query Parameters:**
```
?q=photographer
&role=photographer
&location=Buenos Aires
&specialties=portrait,wedding
&experience_level=professional
&page=1
&limit=20
&sort=created_at
&order=desc
```

**Parámetros:**
- `q` (string, opcional): Término de búsqueda general
- `role` (string, opcional): Filtrar por rol específico
- `location` (string, opcional): Filtrar por ubicación
- `specialties` (string, opcional): Especialidades separadas por coma
- `experience_level` (string, opcional): Nivel de experiencia
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Resultados por página (default: 20, max: 50)
- `sort` (string, opcional): Campo de ordenamiento (default: created_at)
- `order` (string, opcional): Orden asc/desc (default: desc)

**Respuesta exitosa (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "username": "johndoe",
      "full_name": "John Doe",
      "role": "photographer",
      "bio": "Fotógrafo profesional...",
      "location": "Buenos Aires, Argentina",
      "avatar_url": "https://storage.supabase.co/...",
      "specialties": ["portrait", "wedding"],
      "experience_level": "professional"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "role": "photographer",
    "location": "Buenos Aires"
  }
}
```

**Errores:**
- `400`: Parámetros inválidos
- `422`: Filtros inválidos

### GET /api/search/suggestions

Obtiene sugerencias de búsqueda basadas en el input del usuario.

**Query Parameters:**
```
?q=fotog&type=all&limit=10
```

**Parámetros:**
- `q` (string, requerido): Término de búsqueda parcial
- `type` (string, opcional): Tipo de sugerencia (all, users, specialties, locations)
- `limit` (number, opcional): Número de sugerencias (default: 10, max: 20)

**Respuesta exitosa (200):**
```json
{
  "suggestions": [
    {
      "type": "user",
      "value": "fotografo_pro",
      "label": "Fotógrafo Pro - Buenos Aires",
      "avatar_url": "https://storage.supabase.co/..."
    },
    {
      "type": "specialty",
      "value": "fotografia_comercial",
      "label": "Fotografía Comercial",
      "count": 45
    },
    {
      "type": "location",
      "value": "Buenos Aires",
      "label": "Buenos Aires, Argentina",
      "count": 120
    }
  ]
}
```

## 🖼️ Gestión de Portfolio

### GET /api/profile/portfolio

Obtiene las imágenes del portfolio del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Respuesta exitosa (200):**
```json
{
  "images": [
    {
      "id": "uuid",
      "image_url": "https://storage.supabase.co/...",
      "alt_text": "Descripción de la imagen",
      "sort_order": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "max_allowed": 20
}
```

### POST /api/profile/portfolio

Agrega una nueva imagen al portfolio.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "image_url": "https://storage.supabase.co/...",
  "alt_text": "Descripción de la imagen",
  "sort_order": 5
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Imagen agregada al portfolio",
  "image": {
    "id": "uuid",
    "image_url": "https://storage.supabase.co/...",
    "alt_text": "Descripción de la imagen",
    "sort_order": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autenticado
- `413`: Límite de imágenes alcanzado
- `422`: Error de validación

### DELETE /api/profile/portfolio/[imageId]

Elimina una imagen del portfolio.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Parámetros:**
- `imageId`: ID de la imagen a eliminar

**Respuesta exitosa (200):**
```json
{
  "message": "Imagen eliminada del portfolio"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No autorizado (no es propietario)
- `404`: Imagen no encontrada

## 💬 Sistema de Mensajería

### GET /api/messages

Obtiene los mensajes del usuario autenticado.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
```
?type=received&page=1&limit=20&status=unread
```

**Parámetros:**
- `type` (string, opcional): sent/received (default: received)
- `page` (number, opcional): Página (default: 1)
- `limit` (number, opcional): Mensajes por página (default: 20)
- `status` (string, opcional): read/unread

**Respuesta exitosa (200):**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender": {
        "id": "uuid",
        "username": "sender_user",
        "full_name": "Sender Name",
        "avatar_url": "https://storage.supabase.co/..."
      },
      "receiver": {
        "id": "uuid",
        "username": "receiver_user",
        "full_name": "Receiver Name"
      },
      "subject": "Colaboración para sesión de fotos",
      "message": "Hola, me interesa trabajar contigo...",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "unread_count": 12
}
```

### POST /api/messages

Envía un nuevo mensaje.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "receiver_id": "uuid",
  "subject": "Colaboración para sesión de fotos",
  "message": "Hola, me interesa trabajar contigo en un proyecto..."
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Mensaje enviado exitosamente",
  "contact": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "subject": "Colaboración para sesión de fotos",
    "message": "Hola, me interesa trabajar contigo...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: No autenticado
- `403`: No se puede enviar mensaje a sí mismo
- `422`: Error de validación
- `429`: Límite de mensajes alcanzado

### PUT /api/messages/[messageId]/read

Marca un mensaje como leído.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Parámetros:**
- `messageId`: ID del mensaje

**Respuesta exitosa (200):**
```json
{
  "message": "Mensaje marcado como leído"
}
```

### POST /api/messages/[messageId]/reply

Responde a un mensaje.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Gracias por tu mensaje. Me parece una excelente oportunidad..."
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Respuesta enviada exitosamente",
  "reply": {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "subject": "Re: Colaboración para sesión de fotos",
    "message": "Gracias por tu mensaje...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📤 Subida de Archivos

### POST /api/upload

Sube archivos (imágenes) al storage de Supabase.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'avatar'); // avatar, cover, portfolio
formData.append('alt_text', 'Descripción de la imagen');
```

**Parámetros:**
- `file` (File, requerido): Archivo de imagen (JPG, PNG, WebP)
- `type` (string, requerido): Tipo de imagen (avatar, cover, portfolio)
- `alt_text` (string, opcional): Texto alternativo para la imagen

**Respuesta exitosa (200):**
```json
{
  "message": "Archivo subido exitosamente",
  "file": {
    "url": "https://storage.supabase.co/object/public/avatars/user-id/filename.jpg",
    "path": "user-id/filename.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

**Errores:**
- `400`: Archivo inválido o faltante
- `401`: No autenticado
- `413`: Archivo muy grande (max 5MB)
- `415`: Tipo de archivo no soportado
- `422`: Error de validación

## 🔧 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Los datos enviados son inválidos",
    "details": {
      "field": "email",
      "issue": "Formato de email inválido"
    }
  }
}
```

### 401 - Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticación requerido o inválido"
  }
}
```

### 403 - Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para realizar esta acción"
  }
}
```

### 404 - Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El recurso solicitado no fue encontrado"
  }
}
```

### 422 - Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación en los datos",
    "details": [
      {
        "field": "bio",
        "message": "La biografía no puede exceder 500 caracteres"
      },
      {
        "field": "specialties",
        "message": "Debes seleccionar al menos una especialidad"
      }
    ]
  }
}
```

### 429 - Rate Limit Exceeded
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Has excedido el límite de solicitudes",
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "retry_after": 900
    }
  }
}
```

### 500 - Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor",
    "request_id": "uuid"
  }
}
```

## 📝 Ejemplos de Uso

### Búsqueda de Fotógrafos en Buenos Aires

```javascript
const searchPhotographers = async () => {
  const response = await fetch('/api/search?' + new URLSearchParams({
    role: 'photographer',
    location: 'Buenos Aires',
    specialties: 'portrait,wedding',
    page: '1',
    limit: '20'
  }));
  
  const data = await response.json();
  return data.results;
};
```

### Enviar Mensaje de Contacto

```javascript
const sendMessage = async (receiverId, subject, message) => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      receiver_id: receiverId,
      subject,
      message
    })
  });
  
  if (!response.ok) {
    throw new Error('Error al enviar mensaje');
  }
  
  return response.json();
};
```

### Subir Imagen de Avatar

```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Error al subir imagen');
  }
  
  return response.json();
};
```

## 🔄 Rate Limiting

Todas las APIs tienen límites de velocidad para prevenir abuso:

- **Búsqueda**: 60 requests por minuto
- **Mensajes**: 10 mensajes por hora
- **Subida de archivos**: 20 uploads por hora
- **Actualización de perfil**: 30 requests por hora
- **APIs generales**: 100 requests por 15 minutos

Los headers de respuesta incluyen información sobre el rate limiting:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔐 Seguridad

### Validación de Datos
- Todos los inputs son validados y sanitizados
- Límites de longitud en campos de texto
- Validación de tipos de archivo para uploads
- Verificación de permisos para operaciones

### Protección CSRF
- Tokens CSRF en formularios
- Verificación de origen en requests

### Rate Limiting
- Límites por IP y por usuario
- Protección contra ataques de fuerza bruta
- Throttling inteligente

---

**📚 Documentación actualizada**: Febrero 2025  
**🔄 Versión de API**: v1.0  
**🛠️ Soporte**: Para dudas sobre las APIs, consulta la documentación específica de cada funcionalidad.