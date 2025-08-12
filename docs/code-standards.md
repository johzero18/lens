# Estándares de Código - Project Lens

Esta guía establece las convenciones, mejores prácticas y estándares de código para el desarrollo de Project Lens.

## 📋 Índice

- [Principios Generales](#principios-generales)
- [TypeScript](#typescript)
- [React y Next.js](#react-y-nextjs)
- [Styling con Tailwind CSS](#styling-con-tailwind-css)
- [Estructura de Archivos](#estructura-de-archivos)
- [Naming Conventions](#naming-conventions)
- [Comentarios y Documentación](#comentarios-y-documentación)
- [Performance](#performance)
- [Accesibilidad](#accesibilidad)
- [Testing](#testing)

## 🎯 Principios Generales

### Clean Code

- **Legibilidad**: El código debe ser fácil de leer y entender
- **Simplicidad**: Prefiere soluciones simples sobre complejas
- **Consistencia**: Mantén un estilo consistente en todo el proyecto
- **DRY**: Don't Repeat Yourself - evita duplicación de código
- **SOLID**: Aplica principios SOLID cuando sea apropiado

### Arquitectura

- **Separación de responsabilidades**: Cada módulo debe tener una responsabilidad clara
- **Composición sobre herencia**: Prefiere composición de componentes
- **Inmutabilidad**: Evita mutaciones directas de estado
- **Functional Programming**: Prefiere funciones puras cuando sea posible

## 📝 TypeScript

### Configuración Estricta

```typescript
// tsconfig.json - Configuración estricta habilitada
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Tipos y Interfaces

```typescript
// ✅ Buenas prácticas
interface User {
  readonly id: string
  username: string
  email: string
  role: UserRole
  createdAt: Date
}

// Usar tipos específicos en lugar de any
type UserRole = 'photographer' | 'model' | 'stylist' | 'makeup_artist' | 'producer'

// Usar utility types cuando sea apropiado
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>
type UpdateUserRequest = Partial<Pick<User, 'username' | 'email'>>

// ❌ Evitar
interface User {
  id: any // Usar tipos específicos
  data: object // Ser más específico
  callback: Function // Usar tipos de función específicos
}
```

### Funciones y Métodos

```typescript
// ✅ Funciones con tipos explícitos
const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await userService.findById(id)
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// ✅ Usar type guards
const isPhotographer = (user: User): user is User & { role: 'photographer' } => {
  return user.role === 'photographer'
}

// ✅ Usar assertion functions cuando sea necesario
const assertIsString = (value: unknown): asserts value is string => {
  if (typeof value !== 'string') {
    throw new Error('Expected string')
  }
}
```

### Enums vs Union Types

```typescript
// ✅ Usar const assertions para valores inmutables
const USER_ROLES = ['photographer', 'model', 'stylist'] as const
type UserRole = typeof USER_ROLES[number]

// ✅ Usar enums para valores que pueden cambiar
enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

// ❌ Evitar enums numéricos
enum Status {
  Active, // 0
  Inactive, // 1
  Pending // 2
}
```

## ⚛️ React y Next.js

### Componentes Funcionales

```typescript
// ✅ Componente funcional con TypeScript
interface ProfileCardProps {
  user: User
  onContact?: (userId: string) => void
  className?: string
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onContact,
  className
}) => {
  const handleContactClick = useCallback(() => {
    onContact?.(user.id)
  }, [onContact, user.id])

  return (
    <div className={cn('profile-card', className)}>
      <h3>{user.username}</h3>
      {onContact && (
        <button onClick={handleContactClick}>
          Contactar
        </button>
      )}
    </div>
  )
}
```

### Hooks Personalizados

```typescript
// ✅ Hook personalizado con tipos
interface UseUserProfileReturn {
  profile: User | null
  loading: boolean
  error: string | null
  updateProfile: (data: UpdateUserRequest) => Promise<void>
}

export const useUserProfile = (userId: string): UseUserProfileReturn => {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (data: UpdateUserRequest) => {
    try {
      setLoading(true)
      const updatedProfile = await userService.update(userId, data)
      setProfile(updatedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    // Fetch profile logic
  }, [userId])

  return { profile, loading, error, updateProfile }
}
```

### Manejo de Estado

```typescript
// ✅ Usar useReducer para estado complejo
interface ProfileState {
  profile: User | null
  loading: boolean
  error: string | null
}

type ProfileAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, profile: action.payload }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null
      }
    default:
      return state
  }
}
```

### Next.js App Router

```typescript
// ✅ Page component con metadata
import type { Metadata } from 'next'

interface ProfilePageProps {
  params: { username: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: ProfilePageProps
): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username)
  
  return {
    title: `${profile.fullName} - ${profile.role}`,
    description: profile.bio,
    openGraph: {
      title: profile.fullName,
      description: profile.bio,
      images: [profile.avatarUrl],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getProfileByUsername(params.username)
  
  if (!profile) {
    notFound()
  }
  
  return <ProfileView profile={profile} />
}
```

## 🎨 Styling con Tailwind CSS

### Organización de Clases

```typescript
// ✅ Usar cn() para combinar clases
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variant styles
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-secondary-100 text-secondary-900 hover:bg-secondary-200': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'outline',
        },
        
        // Size styles
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        
        className
      )}
      {...props}
    />
  )
}
```

### Responsive Design

```typescript
// ✅ Mobile-first responsive design
<div className={cn(
  // Mobile (default)
  'flex flex-col space-y-4 p-4',
  
  // Tablet
  'md:flex-row md:space-y-0 md:space-x-6 md:p-6',
  
  // Desktop
  'lg:p-8 lg:space-x-8',
  
  // Large desktop
  'xl:max-w-7xl xl:mx-auto'
)}>
```

### Componentes Reutilizables

```typescript
// ✅ Crear variantes de componentes
const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        destructive: 'border-destructive/50 text-destructive',
        outline: 'border-border',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size }), className)}
    {...props}
  />
))
```

## 📁 Estructura de Archivos

### Organización de Directorios

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   │   ├── login/
│   │   └── registro/
│   ├── [username]/        # Dynamic routes
│   ├── api/               # API routes
│   └── globals.css
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── services/         # API services
│   ├── hooks/           # Custom hooks
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
└── constants/           # Application constants
```

### Naming de Archivos

```
// ✅ Nombres descriptivos
ProfileCard.tsx          # Componente React
useUserProfile.ts        # Hook personalizado
profileService.ts        # Servicio
types.ts                # Definiciones de tipos
constants.ts            # Constantes
utils.ts                # Utilidades

// ❌ Nombres genéricos
component.tsx
hook.ts
service.ts
index.ts (excepto para exports)
```

## 🏷️ Naming Conventions

### Variables y Funciones

```typescript
// ✅ camelCase para variables y funciones
const userName = 'john_doe'
const isAuthenticated = true
const getUserProfile = async () => {}

// ✅ Nombres descriptivos
const isLoadingUserProfile = true
const handleSubmitContactForm = () => {}

// ❌ Nombres poco descriptivos
const data = {}
const temp = ''
const handle = () => {}
```

### Componentes

```typescript
// ✅ PascalCase para componentes
export const ProfileCard = () => {}
export const SearchFilters = () => {}
export const ContactModal = () => {}

// ✅ Nombres descriptivos que indican propósito
export const UserProfileEditForm = () => {}
export const PhotographerSearchResults = () => {}
```

### Constantes

```typescript
// ✅ SCREAMING_SNAKE_CASE para constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024
const API_ENDPOINTS = {
  USERS: '/api/users',
  PROFILES: '/api/profiles'
} as const

const USER_ROLES = ['photographer', 'model', 'stylist'] as const
```

### CSS Classes y IDs

```typescript
// ✅ kebab-case para clases CSS personalizadas
<div className="profile-card profile-card--featured">

// ✅ data-testid para testing
<button data-testid="submit-button">

// ✅ IDs descriptivos
<input id="user-email-input" />
```

## 📝 Comentarios y Documentación

### JSDoc para Funciones Públicas

```typescript
/**
 * Busca perfiles de usuarios basado en filtros específicos
 * 
 * @param filters - Filtros de búsqueda aplicados
 * @param pagination - Configuración de paginación
 * @returns Promise que resuelve con resultados de búsqueda paginados
 * 
 * @example
 * ```typescript
 * const results = await searchProfiles(
 *   { role: 'photographer', location: 'Buenos Aires' },
 *   { page: 1, limit: 20 }
 * )
 * ```
 */
export async function searchProfiles(
  filters: SearchFilters,
  pagination: PaginationOptions
): Promise<SearchResults> {
  // Implementation
}
```

### Comentarios en Código

```typescript
// ✅ Comentarios que explican el "por qué"
// Usamos debounce para evitar múltiples requests mientras el usuario escribe
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  [handleSearch]
)

// ✅ Comentarios para lógica compleja
// Calculamos la distancia usando la fórmula de Haversine
// para filtrar perfiles por proximidad geográfica
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  // Implementation
}

// ❌ Comentarios que repiten el código
// Incrementa el contador en 1
counter += 1
```

### TODO y FIXME

```typescript
// TODO: Implementar cache para mejorar performance
// FIXME: Manejar caso edge cuando el usuario no tiene avatar
// HACK: Workaround temporal hasta que se arregle el bug en la librería
// NOTE: Esta función será deprecada en la próxima versión
```

## ⚡ Performance

### Optimizaciones de React

```typescript
// ✅ Usar React.memo para componentes que no cambian frecuentemente
export const ProfileCard = React.memo<ProfileCardProps>(({ profile, onContact }) => {
  return (
    <div className="profile-card">
      {/* Component content */}
    </div>
  )
})

// ✅ Usar useCallback para funciones que se pasan como props
const handleContactClick = useCallback((userId: string) => {
  onContact(userId)
}, [onContact])

// ✅ Usar useMemo para cálculos costosos
const sortedProfiles = useMemo(() => {
  return profiles.sort((a, b) => a.name.localeCompare(b.name))
}, [profiles])
```

### Lazy Loading

```typescript
// ✅ Lazy loading de componentes
const ProfileEditModal = lazy(() => import('./ProfileEditModal'))
const PortfolioGallery = lazy(() => import('./PortfolioGallery'))

// ✅ Lazy loading con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ProfileEditModal />
</Suspense>
```

### Optimización de Imágenes

```typescript
// ✅ Usar Next.js Image component
import Image from 'next/image'

<Image
  src={profile.avatarUrl}
  alt={`Avatar de ${profile.fullName}`}
  width={200}
  height={200}
  className="rounded-full"
  priority={false} // Solo true para imágenes above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## ♿ Accesibilidad

### Semantic HTML

```typescript
// ✅ Usar elementos semánticos
<main>
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">Buscar Profesionales</h2>
    <form role="search">
      <label htmlFor="search-input">Buscar por nombre o especialidad</label>
      <input
        id="search-input"
        type="search"
        aria-describedby="search-help"
      />
      <div id="search-help">
        Ingresa al menos 3 caracteres para buscar
      </div>
    </form>
  </section>
</main>
```

### ARIA Labels y Roles

```typescript
// ✅ ARIA labels descriptivos
<button
  aria-label={`Contactar a ${profile.fullName}`}
  aria-describedby="contact-help"
>
  Contactar
</button>

// ✅ Live regions para actualizaciones dinámicas
<div aria-live="polite" aria-atomic="true">
  {searchResults.length > 0 && (
    `Se encontraron ${searchResults.length} resultados`
  )}
</div>

// ✅ Skip links
<a href="#main-content" className="sr-only focus:not-sr-only">
  Saltar al contenido principal
</a>
```

### Keyboard Navigation

```typescript
// ✅ Manejo de teclado
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
  
  if (event.key === 'Escape') {
    handleClose()
  }
}

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
>
  Elemento interactivo
</div>
```

## 🧪 Testing

### Estructura de Tests

```typescript
// ✅ Estructura clara de tests
describe('ProfileCard Component', () => {
  const mockProfile = {
    id: '1',
    username: 'testuser',
    fullName: 'Test User',
    role: 'photographer'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders profile information correctly', () => {
      render(<ProfileCard profile={mockProfile} />)
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('photographer')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onContact when contact button is clicked', () => {
      const mockOnContact = jest.fn()
      render(<ProfileCard profile={mockProfile} onContact={mockOnContact} />)
      
      fireEvent.click(screen.getByRole('button', { name: /contactar/i }))
      
      expect(mockOnContact).toHaveBeenCalledWith(mockProfile.id)
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ProfileCard profile={mockProfile} />)
      const results = await axe(container)
      
      expect(results).toHaveNoViolations()
    })
  })
})
```

## 🔧 Herramientas de Desarrollo

### ESLint Configuration

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      
      // React
      'react/prop-types': 'off', // TypeScript handles this
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    }
  }
]
```

### Prettier Configuration

```javascript
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test:changed
```

---

**📚 Documentación actualizada**: Febrero 2025  
**🛠️ Herramientas**: TypeScript 5.0+, ESLint 9.0+, Prettier 3.0+  
**📋 Revisión**: Estos estándares deben revisarse trimestralmente