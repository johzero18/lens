# Estructura de Datos - Project Lens

Esta documentación describe todos los modelos de datos, tipos TypeScript e interfaces utilizados en Project Lens.

## 📋 Índice

- [Tipos Base](#tipos-base)
- [Modelos de Usuario](#modelos-de-usuario)
- [Modelos de Portfolio](#modelos-de-portfolio)
- [Modelos de Mensajería](#modelos-de-mensajería)
- [Tipos de Formularios](#tipos-de-formularios)
- [Tipos de API](#tipos-de-api)
- [Enums y Constantes](#enums-y-constantes)

## 🔧 Tipos Base

### Database Types

```typescript
// Tipos base de la base de datos
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      portfolio_images: {
        Row: PortfolioImage
        Insert: PortfolioImageInsert
        Update: PortfolioImageUpdate
      }
      contacts: {
        Row: ContactMessage
        Insert: ContactMessageInsert
        Update: ContactMessageUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      subscription_tier: SubscriptionTier
    }
  }
}
```

### Utility Types

```typescript
// Tipos de utilidad para operaciones comunes
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Tipos para paginación
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}
```

## 👤 Modelos de Usuario

### User Role Enum

```typescript
export enum UserRole {
  PHOTOGRAPHER = 'photographer',
  MODEL = 'model',
  MAKEUP_ARTIST = 'makeup_artist',
  STYLIST = 'stylist',
  PRODUCER = 'producer'
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PHOTOGRAPHER]: 'Fotógrafo/a',
  [UserRole.MODEL]: 'Modelo',
  [UserRole.MAKEUP_ARTIST]: 'Maquillador/a',
  [UserRole.STYLIST]: 'Estilista',
  [UserRole.PRODUCER]: 'Productor/a'
}
```

### Subscription Tier

```typescript
export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro'
}

export const SUBSCRIPTION_FEATURES = {
  [SubscriptionTier.FREE]: {
    portfolio_images: 10,
    monthly_messages: 20,
    featured_profile: false,
    analytics: false
  },
  [SubscriptionTier.PRO]: {
    portfolio_images: 50,
    monthly_messages: 200,
    featured_profile: true,
    analytics: true
  }
}
```

### Profile Base

```typescript
export interface Profile {
  id: string
  username: string
  full_name: string
  role: UserRole
  bio: string
  location: string
  avatar_url?: string
  cover_image_url?: string
  subscription_tier: SubscriptionTier
  role_specific_data: RoleSpecificData
  portfolio_images?: PortfolioImage[]
  created_at: string
  updated_at: string
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'portfolio_images'>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'username' | 'created_at' | 'updated_at' | 'portfolio_images'>>
```

### Role-Specific Data Types

```typescript
// Union type para datos específicos por rol
export type RoleSpecificData = 
  | PhotographerData 
  | ModelData 
  | MakeupArtistData 
  | StylistData 
  | ProducerData

// Datos específicos para fotógrafos
export interface PhotographerData {
  specialties: PhotographySpecialty[]
  experience_level: ExperienceLevel
  studio_access: StudioAccess
  equipment_highlights: string
  post_production_skills: PostProductionSkill[]
  travel_availability: boolean
  typical_session_rate?: string
  portfolio_url?: string
}

export enum PhotographySpecialty {
  PORTRAIT = 'portrait',
  WEDDING = 'wedding',
  FASHION = 'fashion',
  COMMERCIAL = 'commercial',
  EVENT = 'event',
  PRODUCT = 'product',
  LANDSCAPE = 'landscape',
  STREET = 'street',
  DOCUMENTARY = 'documentary',
  ARTISTIC = 'artistic'
}

export enum PostProductionSkill {
  LIGHTROOM = 'lightroom',
  PHOTOSHOP = 'photoshop',
  CAPTURE_ONE = 'capture_one',
  LUMINAR = 'luminar',
  COLOR_GRADING = 'color_grading',
  RETOUCHING = 'retouching'
}

// Datos específicos para modelos
export interface ModelData {
  model_type: ModelType[]
  experience_level: ExperienceLevel
  height_cm: number
  measurements: ModelMeasurements
  shoe_size_eu: number
  dress_size_eu: number
  hair_color: HairColor
  eye_color: EyeColor
  special_attributes: SpecialAttributes
  travel_availability: boolean
  languages: Language[]
}

export enum ModelType {
  FASHION = 'fashion',
  COMMERCIAL = 'commercial',
  FITNESS = 'fitness',
  GLAMOUR = 'glamour',
  ARTISTIC = 'artistic',
  PLUS_SIZE = 'plus_size',
  MATURE = 'mature',
  ALTERNATIVE = 'alternative'
}

export interface ModelMeasurements {
  bust_cm: number
  waist_cm: number
  hips_cm: number
}

export enum HairColor {
  BLACK = 'black',
  BROWN = 'brown',
  BLONDE = 'blonde',
  RED = 'red',
  GRAY = 'gray',
  WHITE = 'white',
  OTHER = 'other'
}

export enum EyeColor {
  BROWN = 'brown',
  BLUE = 'blue',
  GREEN = 'green',
  HAZEL = 'hazel',
  GRAY = 'gray',
  OTHER = 'other'
}

export interface SpecialAttributes {
  tattoos: boolean
  piercings: boolean
  scars: boolean
  birthmarks: boolean
}

// Datos específicos para maquilladores
export interface MakeupArtistData {
  specialties: MakeupSpecialty[]
  experience_level: ExperienceLevel
  kit_highlights: string[]
  services_offered: MakeupService[]
  travel_availability: boolean
  typical_session_rate?: string
  certifications: string[]
}

export enum MakeupSpecialty {
  BRIDAL = 'bridal',
  FASHION = 'fashion',
  EDITORIAL = 'editorial',
  COMMERCIAL = 'commercial',
  SPECIAL_EFFECTS = 'special_effects',
  THEATRICAL = 'theatrical',
  BEAUTY = 'beauty',
  AVANT_GARDE = 'avant_garde'
}

export enum MakeupService {
  MAKEUP_APPLICATION = 'makeup_application',
  MAKEUP_LESSONS = 'makeup_lessons',
  BRIDAL_TRIALS = 'bridal_trials',
  GROUP_BOOKINGS = 'group_bookings',
  TOUCH_UPS = 'touch_ups'
}

// Datos específicos para estilistas
export interface StylistData {
  specialties: StylistSpecialty[]
  experience_level: ExperienceLevel
  industry_focus: IndustryFocus[]
  wardrobe_access: WardrobeAccess
  services_offered: StylistService[]
  travel_availability: boolean
  typical_session_rate?: string
  portfolio_url?: string
}

export enum StylistSpecialty {
  FASHION = 'fashion',
  COMMERCIAL = 'commercial',
  EDITORIAL = 'editorial',
  PERSONAL = 'personal',
  WARDROBE = 'wardrobe',
  PROP = 'prop'
}

export enum IndustryFocus {
  PHOTOGRAPHY = 'photography',
  FILM = 'film',
  TELEVISION = 'television',
  ADVERTISING = 'advertising',
  MUSIC_VIDEO = 'music_video',
  THEATER = 'theater'
}

export enum WardrobeAccess {
  PERSONAL_COLLECTION = 'personal_collection',
  BRAND_PARTNERSHIPS = 'brand_partnerships',
  RENTAL_CONNECTIONS = 'rental_connections',
  VINTAGE_SPECIALIST = 'vintage_specialist'
}

export enum StylistService {
  WARDROBE_STYLING = 'wardrobe_styling',
  PROP_STYLING = 'prop_styling',
  SET_DECORATION = 'set_decoration',
  PERSONAL_SHOPPING = 'personal_shopping',
  CLOSET_ORGANIZATION = 'closet_organization'
}

// Datos específicos para productores
export interface ProducerData {
  specialties: ProductionSpecialty[]
  experience_level: ExperienceLevel
  services: ProductionService[]
  typical_budget_range: BudgetRange
  team_size: TeamSize
  equipment_access: EquipmentAccess[]
  travel_availability: boolean
  portfolio_url?: string
}

export enum ProductionSpecialty {
  PHOTOGRAPHY = 'photography',
  VIDEO = 'video',
  COMMERCIAL = 'commercial',
  FASHION = 'fashion',
  EVENT = 'event',
  DOCUMENTARY = 'documentary',
  MUSIC_VIDEO = 'music_video'
}

export enum ProductionService {
  FULL_PRODUCTION = 'full_production',
  LOCATION_SCOUTING = 'location_scouting',
  TALENT_CASTING = 'talent_casting',
  EQUIPMENT_RENTAL = 'equipment_rental',
  PERMIT_COORDINATION = 'permit_coordination',
  BUDGET_MANAGEMENT = 'budget_management',
  CREW_COORDINATION = 'crew_coordination'
}

export enum BudgetRange {
  UNDER_1K = 'under_1k',
  ONE_TO_5K = '1k_to_5k',
  FIVE_TO_10K = '5k_to_10k',
  TEN_TO_25K = '10k_to_25k',
  OVER_25K = 'over_25k'
}

export enum TeamSize {
  SOLO = 'solo',
  SMALL = 'small', // 2-5 personas
  MEDIUM = 'medium', // 6-15 personas
  LARGE = 'large' // 16+ personas
}

export enum EquipmentAccess {
  CAMERAS = 'cameras',
  LIGHTING = 'lighting',
  AUDIO = 'audio',
  GRIP = 'grip',
  DRONES = 'drones',
  VEHICLES = 'vehicles'
}
```

### Common Enums

```typescript
export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  PROFESSIONAL = 'professional',
  EXPERT = 'expert'
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  [ExperienceLevel.BEGINNER]: 'Principiante',
  [ExperienceLevel.INTERMEDIATE]: 'Intermedio',
  [ExperienceLevel.PROFESSIONAL]: 'Profesional',
  [ExperienceLevel.EXPERT]: 'Experto'
}

export enum StudioAccess {
  NO_STUDIO = 'no_studio',
  HOME_STUDIO = 'home_studio',
  SHARED_STUDIO = 'shared_studio',
  PRIVATE_STUDIO = 'private_studio',
  MULTIPLE_STUDIOS = 'multiple_studios'
}

export enum Language {
  SPANISH = 'spanish',
  ENGLISH = 'english',
  PORTUGUESE = 'portuguese',
  ITALIAN = 'italian',
  FRENCH = 'french',
  GERMAN = 'german'
}
```

## 🖼️ Modelos de Portfolio

### Portfolio Image

```typescript
export interface PortfolioImage {
  id: string
  profile_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export type PortfolioImageInsert = Omit<PortfolioImage, 'id' | 'created_at'>
export type PortfolioImageUpdate = Partial<Omit<PortfolioImage, 'id' | 'profile_id' | 'created_at'>>

// Tipos para gestión de portfolio
export interface PortfolioUpload {
  file: File
  alt_text?: string
  sort_order?: number
}

export interface PortfolioReorder {
  image_id: string
  new_sort_order: number
}
```

## 💬 Modelos de Mensajería

### Contact Message

```typescript
export interface ContactMessage {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export type ContactMessageInsert = Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>
export type ContactMessageUpdate = Partial<Pick<ContactMessage, 'is_read'>>

// Tipos extendidos con información de usuario
export interface ContactMessageWithUsers extends ContactMessage {
  sender: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    role: UserRole
  }
  receiver: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    role: UserRole
  }
}

// Tipos para formularios de contacto
export interface ContactFormData {
  receiver_id: string
  subject: string
  message: string
}

export interface MessageReplyData {
  message: string
}
```

## 📝 Tipos de Formularios

### Registration Form

```typescript
export interface RegistrationFormData {
  email: string
  password: string
  confirm_password: string
  username: string
  full_name: string
  role: UserRole
  terms_accepted: boolean
}

export interface LoginFormData {
  email: string
  password: string
  remember_me: boolean
}

export interface PasswordResetFormData {
  email: string
}

export interface PasswordUpdateFormData {
  password: string
  confirm_password: string
}
```

### Profile Forms

```typescript
export interface ProfileFormData {
  full_name: string
  bio: string
  location: string
  role_specific_data: RoleSpecificData
}

export interface AvatarUploadData {
  file: File
  alt_text?: string
}

export interface CoverImageUploadData {
  file: File
  alt_text?: string
}
```

### Search Forms

```typescript
export interface SearchFormData {
  q?: string
  role?: UserRole
  location?: string
  specialties?: string[]
  experience_level?: ExperienceLevel
  travel_availability?: boolean
}

export interface SearchFilters extends SearchFormData {
  page?: number
  limit?: number
  sort?: SearchSortField
  order?: SortOrder
}

export enum SearchSortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  FULL_NAME = 'full_name',
  LOCATION = 'location'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
```

## 🔍 Tipos de API

### Search Results

```typescript
export interface SearchResult {
  id: string
  username: string
  full_name: string
  role: UserRole
  bio: string
  location: string
  avatar_url?: string
  specialties: string[]
  experience_level: ExperienceLevel
  created_at: string
}

export interface SearchResponse {
  results: SearchResult[]
  pagination: PaginationMeta
  filters_applied: Partial<SearchFilters>
  total_results: number
}
```

### Search Suggestions

```typescript
export interface SearchSuggestion {
  type: SuggestionType
  value: string
  label: string
  avatar_url?: string
  count?: number
}

export enum SuggestionType {
  USER = 'user',
  SPECIALTY = 'specialty',
  LOCATION = 'location',
  ROLE = 'role'
}

export interface SuggestionsResponse {
  suggestions: SearchSuggestion[]
  query: string
}
```

### File Upload

```typescript
export interface FileUploadResponse {
  url: string
  path: string
  size: number
  type: string
}

export interface FileUploadData {
  file: File
  type: UploadType
  alt_text?: string
}

export enum UploadType {
  AVATAR = 'avatar',
  COVER = 'cover',
  PORTFOLIO = 'portfolio'
}
```

## 📊 Enums y Constantes

### Validation Constants

```typescript
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  BIO: {
    MAX_LENGTH: 500
  },
  SUBJECT: {
    MAX_LENGTH: 100
  },
  MESSAGE: {
    MAX_LENGTH: 1000
  },
  FULL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  }
} as const

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_PORTFOLIO_IMAGES: 20
} as const

export const RATE_LIMITS = {
  MESSAGES_PER_HOUR: 10,
  UPLOADS_PER_HOUR: 20,
  PROFILE_UPDATES_PER_HOUR: 30,
  SEARCH_REQUESTS_PER_MINUTE: 60
} as const
```

### UI Constants

```typescript
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 50
} as const

export const SEARCH_DEFAULTS = {
  SORT: SearchSortField.CREATED_AT,
  ORDER: SortOrder.DESC,
  DEBOUNCE_MS: 300
} as const

export const IMAGE_DIMENSIONS = {
  AVATAR: {
    WIDTH: 200,
    HEIGHT: 200
  },
  COVER: {
    WIDTH: 1200,
    HEIGHT: 300
  },
  PORTFOLIO: {
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080
  }
} as const
```

## 🔄 Type Guards

```typescript
// Type guards para verificar tipos en runtime
export function isPhotographerData(data: RoleSpecificData): data is PhotographerData {
  return 'specialties' in data && 'equipment_highlights' in data
}

export function isModelData(data: RoleSpecificData): data is ModelData {
  return 'model_type' in data && 'measurements' in data
}

export function isMakeupArtistData(data: RoleSpecificData): data is MakeupArtistData {
  return 'kit_highlights' in data && 'services_offered' in data
}

export function isStylistData(data: RoleSpecificData): data is StylistData {
  return 'industry_focus' in data && 'wardrobe_access' in data
}

export function isProducerData(data: RoleSpecificData): data is ProducerData {
  return 'services' in data && 'typical_budget_range' in data
}

// Validadores de datos
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUsername(username: string): boolean {
  return VALIDATION_RULES.USERNAME.PATTERN.test(username) &&
         username.length >= VALIDATION_RULES.USERNAME.MIN_LENGTH &&
         username.length <= VALIDATION_RULES.USERNAME.MAX_LENGTH
}

export function isValidPassword(password: string): boolean {
  return VALIDATION_RULES.PASSWORD.PATTERN.test(password) &&
         password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
         password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH
}
```

## 🛠️ Utility Functions

```typescript
// Funciones de utilidad para trabajar con los tipos
export function getRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role]
}

export function getExperienceLevelLabel(level: ExperienceLevel): string {
  return EXPERIENCE_LEVEL_LABELS[level]
}

export function formatProfileUrl(username: string): string {
  return `/${username}`
}

export function getAvatarUrl(profile: Profile): string {
  return profile.avatar_url || '/default-avatar.jpg'
}

export function getCoverImageUrl(profile: Profile): string {
  return profile.cover_image_url || '/default-cover.jpg'
}

export function getPortfolioImageCount(profile: Profile): number {
  return profile.portfolio_images?.length || 0
}

export function canUploadMoreImages(profile: Profile): boolean {
  const currentCount = getPortfolioImageCount(profile)
  const maxImages = SUBSCRIPTION_FEATURES[profile.subscription_tier].portfolio_images
  return currentCount < maxImages
}
```

---

**📚 Documentación actualizada**: Febrero 2025  
**🔄 Versión de tipos**: 1.0.0  
**🛠️ TypeScript**: Versión 5.0+