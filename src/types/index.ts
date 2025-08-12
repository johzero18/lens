// User roles
export type UserRole =
  | 'photographer'
  | 'model'
  | 'makeup_artist'
  | 'stylist'
  | 'producer'

// Subscription tiers
export type SubscriptionTier = 'free' | 'pro'

// Enums for estados y categorías
export enum ExperienceLevel {
  BEGINNER = 'principiante',
  INTERMEDIATE = 'intermedio',
  ADVANCED = 'avanzado',
  EXPERT = 'experto'
}

export enum ModelType {
  FASHION = 'moda',
  COMMERCIAL = 'comercial',
  FITNESS = 'fitness',
  ARTISTIC = 'artistico',
  EDITORIAL = 'editorial',
  GLAMOUR = 'glamour',
  ALTERNATIVE = 'alternativo'
}

export enum PhotographySpecialty {
  PORTRAIT = 'retrato',
  FASHION = 'moda',
  COMMERCIAL = 'comercial',
  EDITORIAL = 'editorial',
  BEAUTY = 'belleza',
  LIFESTYLE = 'lifestyle',
  PRODUCT = 'producto',
  EVENT = 'evento',
  ARTISTIC = 'artistico'
}

export enum MakeupSpecialty {
  BEAUTY = 'belleza',
  FASHION = 'moda',
  EDITORIAL = 'editorial',
  BRIDAL = 'novias',
  SPECIAL_EFFECTS = 'efectos_especiales',
  THEATRICAL = 'teatral',
  COMMERCIAL = 'comercial'
}

export enum StylistSpecialty {
  FASHION = 'moda',
  COMMERCIAL = 'comercial',
  EDITORIAL = 'editorial',
  PERSONAL = 'personal',
  WARDROBE = 'vestuario',
  PROP = 'utileria'
}

export enum ProducerSpecialty {
  FASHION = 'moda',
  COMMERCIAL = 'comercial',
  EDITORIAL = 'editorial',
  MUSIC_VIDEO = 'video_musical',
  ADVERTISING = 'publicidad',
  EVENTS = 'eventos'
}

export enum HairColor {
  BLACK = 'negro',
  BROWN = 'castano',
  BLONDE = 'rubio',
  RED = 'pelirrojo',
  GRAY = 'gris',
  WHITE = 'blanco',
  OTHER = 'otro'
}

export enum EyeColor {
  BROWN = 'marron',
  BLUE = 'azul',
  GREEN = 'verde',
  HAZEL = 'avellana',
  GRAY = 'gris',
  OTHER = 'otro'
}

export enum StudioAccess {
  OWN_STUDIO = 'estudio_propio',
  RENTAL_ACCESS = 'acceso_alquiler',
  PARTNER_STUDIOS = 'estudios_asociados',
  LOCATION_ONLY = 'solo_locacion'
}

export enum BudgetRange {
  UNDER_50K = 'menos_50k',
  FROM_50K_TO_100K = '50k_100k',
  FROM_100K_TO_500K = '100k_500k',
  FROM_500K_TO_1M = '500k_1m',
  OVER_1M = 'mas_1m'
}

export enum MessageStatus {
  UNREAD = 'no_leido',
  READ = 'leido',
  REPLIED = 'respondido'
}

export enum ValidationErrorType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  EMAIL = 'email',
  PASSWORD = 'password',
  USERNAME = 'username',
  FILE_SIZE = 'file_size',
  FILE_TYPE = 'file_type'
}

// Base user profile interface
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
  portfolio_images: PortfolioImage[]
  created_at: Date
  updated_at: Date
}

// Portfolio image interface
export interface PortfolioImage {
  id: string
  profile_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: Date
}

// Contact message interface
export interface ContactMessage {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  message: string
  status: MessageStatus
  created_at: Date
  read_at?: Date
}

// Contact form data
export interface ContactFormData {
  subject: string
  message: string
  project_type?: string
  budget_range?: string
  timeline?: string
}

// Role-specific data types
export type RoleSpecificData =
  | ModelData
  | PhotographerData
  | MakeupArtistData
  | StylistData
  | ProducerData

export interface ModelData {
  model_type: ModelType[]
  experience_level: ExperienceLevel
  height_cm: number
  measurements: {
    bust_cm: number
    waist_cm: number
    hips_cm: number
  }
  shoe_size_eu: number
  dress_size_eu: number
  hair_color: HairColor
  eye_color: EyeColor
  special_attributes: {
    tattoos: boolean
    piercings: boolean
  }
  languages?: string[]
  availability?: string
}

export interface PhotographerData {
  specialties: PhotographySpecialty[]
  experience_level: ExperienceLevel
  studio_access: StudioAccess
  equipment_highlights: string
  post_production_skills: string[]
  years_experience?: number
  portfolio_url?: string
}

export interface MakeupArtistData {
  specialties: MakeupSpecialty[]
  experience_level: ExperienceLevel
  kit_highlights: string[]
  services_offered: string[]
  travel_availability: boolean
  years_experience?: number
  certifications?: string[]
}

export interface StylistData {
  specialties: StylistSpecialty[]
  experience_level: ExperienceLevel
  industry_focus: string[]
  wardrobe_access: string
  portfolio_url?: string
  years_experience?: number
  brand_partnerships?: string[]
}

export interface ProducerData {
  specialties: ProducerSpecialty[]
  services: string[]
  typical_budget_range: BudgetRange
  portfolio_url?: string
  years_experience?: number
  team_size?: string
  notable_clients?: string[]
}

// Search and filter types
export interface SearchFilters {
  role?: UserRole
  location?: string
  specialties?: string[]
  experience_level?: ExperienceLevel
  query?: string
  model_type?: ModelType[]
  photography_specialty?: PhotographySpecialty[]
  makeup_specialty?: MakeupSpecialty[]
  stylist_specialty?: StylistSpecialty[]
  producer_specialty?: ProducerSpecialty[]
  studio_access?: StudioAccess
  travel_availability?: boolean
  budget_range?: BudgetRange
}

export interface SearchResults {
  profiles: Profile[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface Pagination {
  page: number
  limit: number
  offset?: number
}

// Search suggestions
export interface SearchSuggestion {
  type: 'profile' | 'location' | 'specialty'
  value: string
  label: string
  count?: number
}

// Form types
export interface RegisterFormData {
  email: string
  password: string
  username: string
  full_name: string
  role: UserRole
}

export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface ResetPasswordFormData {
  email: string
}

export interface NewPasswordFormData {
  password: string
  confirmPassword: string
}

// Profile editing form types
export interface ProfileFormData {
  full_name: string
  bio: string
  location: string
  role_specific_data: RoleSpecificData
}

export interface ModelFormData {
  model_type: ModelType[]
  experience_level: ExperienceLevel
  height_cm: number
  measurements: {
    bust_cm: number
    waist_cm: number
    hips_cm: number
  }
  shoe_size_eu: number
  dress_size_eu: number
  hair_color: HairColor
  eye_color: EyeColor
  special_attributes: {
    tattoos: boolean
    piercings: boolean
  }
  languages?: string[]
  availability?: string
}

export interface PhotographerFormData {
  specialties: PhotographySpecialty[]
  experience_level: ExperienceLevel
  studio_access: StudioAccess
  equipment_highlights: string
  post_production_skills: string[]
  years_experience?: number
  portfolio_url?: string
}

export interface MakeupArtistFormData {
  specialties: MakeupSpecialty[]
  experience_level: ExperienceLevel
  kit_highlights: string[]
  services_offered: string[]
  travel_availability: boolean
  years_experience?: number
  certifications?: string[]
}

export interface StylistFormData {
  specialties: StylistSpecialty[]
  experience_level: ExperienceLevel
  industry_focus: string[]
  wardrobe_access: string
  portfolio_url?: string
  years_experience?: number
  brand_partnerships?: string[]
}

export interface ProducerFormData {
  specialties: ProducerSpecialty[]
  services: string[]
  typical_budget_range: BudgetRange
  portfolio_url?: string
  years_experience?: number
  team_size?: string
  notable_clients?: string[]
}

// Form validation types
export interface ValidationError {
  field: string
  type: ValidationErrorType
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: unknown) => boolean | string
}

export interface FormValidationRules {
  [fieldName: string]: FieldValidation
}

// File upload types
export interface FileUploadData {
  file: File
  type: 'avatar' | 'cover' | 'portfolio'
  preview?: string
}

export interface ImageUploadResult {
  url: string
  publicId?: string
  width?: number
  height?: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface AuthResponse {
  user?: {
    id: string
    email: string
    username: string
  }
  session?: {
    access_token: string
    refresh_token: string
  }
  error?: {
    code: string
    message: string
  }
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
  icon?: React.ReactNode
}

export interface InputProps {
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value?: string | number
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  helperText?: string
  maxLength?: number
  minLength?: number
}

export interface TextareaProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  rows?: number
  maxLength?: number
}

export interface SelectProps {
  label?: string
  placeholder?: string
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  options: SelectOption[]
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  multiple?: boolean
  searchable?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
}

export interface ProfileCardProps {
  profile: Profile
  variant?: 'grid' | 'list'
  showContact?: boolean
  onClick?: () => void
  className?: string
}

export interface PortfolioGridProps {
  images: PortfolioImage[]
  columns?: number
  gap?: number
  onImageClick?: (image: PortfolioImage) => void
  loading?: boolean
  className?: string
}

export interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  loading?: boolean
  className?: string
}

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Database types
export interface DatabaseProfile extends Omit<Profile, 'created_at' | 'updated_at'> {
  created_at: string
  updated_at: string
}

export interface DatabasePortfolioImage extends Omit<PortfolioImage, 'created_at'> {
  created_at: string
}

export interface DatabaseContactMessage extends Omit<ContactMessage, 'created_at' | 'read_at'> {
  created_at: string
  read_at?: string
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: unknown
  field?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
  external?: boolean
}

// Theme types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  neutral: string
  success: string
  warning: string
  error: string
  info: string
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  userId?: string
  timestamp?: Date
}
