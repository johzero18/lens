// User roles
export const USER_ROLES = {
  PHOTOGRAPHER: 'photographer',
  MODEL: 'model',
  MAKEUP_ARTIST: 'makeup_artist',
  STYLIST: 'stylist',
  PRODUCER: 'producer',
} as const

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.PHOTOGRAPHER]: 'Photographer',
  [USER_ROLES.MODEL]: 'Model',
  [USER_ROLES.MAKEUP_ARTIST]: 'Makeup Artist',
  [USER_ROLES.STYLIST]: 'Stylist',
  [USER_ROLES.PRODUCER]: 'Producer',
} as const

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
} as const

// File upload limits
export const FILE_LIMITS = {
  AVATAR_MAX_SIZE_MB: 5,
  COVER_MAX_SIZE_MB: 5,
  PORTFOLIO_MAX_SIZE_MB: 5,
  PORTFOLIO_MAX_IMAGES: 20,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const

// Form validation limits
export const VALIDATION_LIMITS = {
  BIO_MAX_LENGTH: 500,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 8,
  CONTACT_SUBJECT_MAX_LENGTH: 100,
  CONTACT_MESSAGE_MAX_LENGTH: 1000,
  DAILY_MESSAGE_LIMIT: 10,
} as const

// Search and pagination
export const SEARCH_DEFAULTS = {
  RESULTS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  MAX_SEARCH_RESULTS: 1000,
} as const

// Experience levels
export const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
  'Expert',
] as const

// Model specific constants
export const MODEL_TYPES = [
  'Fashion',
  'Commercial',
  'Editorial',
  'Fitness',
  'Glamour',
  'Alternative',
  'Plus Size',
  'Petite',
  'Mature',
  'Child',
] as const

// Photography specialties
export const PHOTOGRAPHY_SPECIALTIES = [
  'Portrait',
  'Fashion',
  'Commercial',
  'Editorial',
  'Beauty',
  'Lifestyle',
  'Product',
  'Event',
  'Wedding',
  'Street',
  'Fine Art',
  'Documentary',
] as const

// Makeup artist specialties
export const MAKEUP_SPECIALTIES = [
  'Beauty',
  'Fashion',
  'Editorial',
  'Bridal',
  'Special Effects',
  'Theatrical',
  'Film/TV',
  'Commercial',
  'Avant-garde',
  'Natural/No-makeup',
] as const

// Stylist specialties
export const STYLIST_SPECIALTIES = [
  'Fashion',
  'Editorial',
  'Commercial',
  'Celebrity',
  'Personal Shopping',
  'Wardrobe Consulting',
  'Costume Design',
  'Prop Styling',
  'Set Design',
] as const

// Producer specialties
export const PRODUCER_SPECIALTIES = [
  'Fashion Shoots',
  'Commercial Production',
  'Editorial Production',
  'Video Production',
  'Event Production',
  'Campaign Management',
  'Casting',
  'Location Scouting',
] as const

// Budget ranges for producers
export const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+',
] as const

// Common locations (can be expanded)
export const COMMON_LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Miami, FL',
  'Chicago, IL',
  'London, UK',
  'Paris, France',
  'Milan, Italy',
  'Tokyo, Japan',
] as const

// API endpoints (will be used when backend is implemented)
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  PROFILES: {
    GET: '/api/profiles',
    UPDATE: '/api/profiles',
    UPLOAD_AVATAR: '/api/profiles/avatar',
    UPLOAD_COVER: '/api/profiles/cover',
  },
  PORTFOLIO: {
    UPLOAD: '/api/portfolio/upload',
    DELETE: '/api/portfolio',
    REORDER: '/api/portfolio/reorder',
  },
  SEARCH: {
    PROFILES: '/api/search/profiles',
    FEATURED: '/api/search/featured',
  },
  CONTACT: {
    SEND: '/api/contact/send',
    HISTORY: '/api/contact/history',
  },
} as const

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  SERVER_ERROR: 'SERVER_ERROR',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  IMAGE_UPLOADED: 'Image uploaded successfully',
  MESSAGE_SENT: 'Message sent successfully',
  REGISTRATION_SUCCESS:
    'Registration successful! Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Welcome back!',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD:
    'Password must be at least 8 characters with letters and numbers',
  INVALID_USERNAME:
    'Username must be 3-20 characters, letters, numbers, and underscores only',
  USERNAME_TAKEN: 'Username is already taken',
  EMAIL_TAKEN: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Only JPG, PNG, and WebP images are allowed',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
} as const
