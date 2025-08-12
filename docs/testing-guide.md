# Guía de Testing - Project Lens

Esta guía documenta las estrategias, herramientas y mejores prácticas para testing en Project Lens.

## 📋 Índice

- [Estrategia de Testing](#estrategia-de-testing)
- [Configuración](#configuración)
- [Testing Unitario](#testing-unitario)
- [Testing de Integración](#testing-de-integración)
- [Testing End-to-End](#testing-end-to-end)
- [Testing de Accesibilidad](#testing-de-accesibilidad)
- [Testing de Performance](#testing-de-performance)
- [Mejores Prácticas](#mejores-prácticas)

## 🎯 Estrategia de Testing

### Pirámide de Testing

```
    /\
   /  \     E2E Tests (Pocos, críticos)
  /____\    
 /      \   Integration Tests (Moderados)
/________\  Unit Tests (Muchos, rápidos)
```

### Cobertura de Testing

- **Unit Tests**: 80%+ cobertura en funciones críticas
- **Integration Tests**: Flujos principales de usuario
- **E2E Tests**: Casos de uso críticos del negocio
- **Accessibility Tests**: Cumplimiento WCAG 2.1 AA

### Herramientas

- **Jest**: Testing framework principal
- **React Testing Library**: Testing de componentes React
- **Playwright**: Testing end-to-end
- **axe-core**: Testing de accesibilidad
- **MSW**: Mocking de APIs

## ⚙️ Configuración

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Jest Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
      })),
    },
  })),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))
```

## 🧪 Testing Unitario

### Testing de Componentes UI

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button loading>Loading Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5 text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg')
  })
})
```

### Testing de Hooks Personalizados

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles login successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    
    expect(result.current.user).toBeTruthy()
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles login error', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrongpassword')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### Testing de Servicios

```typescript
// src/lib/services/__tests__/profileService.test.ts
import { profileService } from '../profileService'
import { createClient } from '@supabase/supabase-js'

jest.mock('@supabase/supabase-js')
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('gets profile by username', async () => {
    const mockProfile = {
      id: '123',
      username: 'testuser',
      full_name: 'Test User',
      role: 'photographer'
    }

    mockSupabase().from().select().eq().single.mockResolvedValue({
      data: mockProfile,
      error: null
    })

    const result = await profileService.getProfileByUsername('testuser')
    
    expect(result).toEqual(mockProfile)
    expect(mockSupabase().from).toHaveBeenCalledWith('profiles')
  })

  it('handles profile not found', async () => {
    mockSupabase().from().select().eq().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Row not found' }
    })

    await expect(profileService.getProfileByUsername('nonexistent'))
      .rejects.toThrow('Profile not found')
  })

  it('updates profile successfully', async () => {
    const updateData = { full_name: 'Updated Name' }
    const updatedProfile = { id: '123', ...updateData }

    mockSupabase().from().update().eq().select().single.mockResolvedValue({
      data: updatedProfile,
      error: null
    })

    const result = await profileService.updateProfile('123', updateData)
    
    expect(result).toEqual(updatedProfile)
    expect(mockSupabase().from().update).toHaveBeenCalledWith(updateData)
  })
})
```

### Testing de Utilidades

```typescript
// src/lib/__tests__/utils.test.ts
import { cn, formatDate, validateEmail, slugify } from '../utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden'))
        .toBe('base conditional')
    })

    it('resolves Tailwind conflicts', () => {
      expect(cn('px-4 px-6')).toBe('px-6')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('15 de enero de 2024')
    })

    it('handles relative dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(formatDate(yesterday, { relative: true })).toBe('hace 1 día')
    })
  })

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
    })
  })

  describe('slugify', () => {
    it('creates URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Café & Música')).toBe('cafe-musica')
    })

    it('handles special characters', () => {
      expect(slugify('¡Hola! ¿Cómo estás?')).toBe('hola-como-estas')
    })
  })
})
```

## 🔗 Testing de Integración

### Testing de Formularios

```typescript
// src/components/features/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('LoginForm Integration', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    
    renderWithAuth(<LoginForm onSuccess={onSuccess} />)
    
    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password123')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    
    renderWithAuth(<LoginForm />)
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    
    // Mock failed login
    mockSupabase().auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    })
    
    renderWithAuth(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })
})
```

### Testing de APIs

```typescript
// src/__tests__/api/profile.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/profile'
import { createClient } from '@supabase/supabase-js'

jest.mock('@supabase/supabase-js')

describe('/api/profile', () => {
  it('returns profile for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })

    const mockProfile = {
      id: '123',
      username: 'testuser',
      full_name: 'Test User'
    }

    mockSupabase().from().select().eq().single.mockResolvedValue({
      data: mockProfile,
      error: null
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(mockProfile)
  })

  it('returns 401 for unauthenticated request', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Authentication required'
    })
  })

  it('updates profile with valid data', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        full_name: 'Updated Name',
        bio: 'Updated bio'
      }
    })

    const updatedProfile = {
      id: '123',
      full_name: 'Updated Name',
      bio: 'Updated bio'
    }

    mockSupabase().from().update().eq().select().single.mockResolvedValue({
      data: updatedProfile,
      error: null
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(updatedProfile)
  })
})
```

## 🎭 Testing End-to-End

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Go to registration page
    await page.goto('/registro')
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'password123')
    await page.fill('[data-testid="username-input"]', 'testuser')
    await page.fill('[data-testid="full-name-input"]', 'Test User')
    await page.selectOption('[data-testid="role-select"]', 'photographer')
    await page.check('[data-testid="terms-checkbox"]')
    
    // Submit form
    await page.click('[data-testid="register-button"]')
    
    // Should redirect to profile completion
    await expect(page).toHaveURL('/perfil/completar')
    
    // Complete profile
    await page.fill('[data-testid="bio-textarea"]', 'Professional photographer')
    await page.fill('[data-testid="location-input"]', 'Buenos Aires, Argentina')
    await page.click('[data-testid="save-profile-button"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('user can login with existing account', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'existing@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'wrong@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Credenciales inválidas')
  })
})
```

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('user can search for photographers', async ({ page }) => {
    await page.goto('/buscar')
    
    // Use search filters
    await page.selectOption('[data-testid="role-filter"]', 'photographer')
    await page.fill('[data-testid="location-filter"]', 'Buenos Aires')
    await page.click('[data-testid="search-button"]')
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"]')
    
    // Verify results
    const results = page.locator('[data-testid="profile-card"]')
    await expect(results).toHaveCount.greaterThan(0)
    
    // Check first result
    const firstResult = results.first()
    await expect(firstResult.locator('[data-testid="role-badge"]')).toContainText('Fotógrafo')
  })

  test('user can view profile details', async ({ page }) => {
    await page.goto('/buscar')
    
    // Click on first profile
    await page.click('[data-testid="profile-card"]:first-child')
    
    // Should navigate to profile page
    await expect(page).toHaveURL(/\/[a-zA-Z0-9_]+/)
    
    // Verify profile elements
    await expect(page.locator('[data-testid="profile-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="portfolio-grid"]')).toBeVisible()
    await expect(page.locator('[data-testid="contact-button"]')).toBeVisible()
  })

  test('user can send contact message', async ({ page }) => {
    await page.goto('/photographer-username')
    
    // Open contact modal
    await page.click('[data-testid="contact-button"]')
    await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible()
    
    // Fill contact form
    await page.fill('[data-testid="subject-input"]', 'Collaboration Opportunity')
    await page.fill('[data-testid="message-textarea"]', 'Hi, I would like to work with you on a project.')
    
    // Send message
    await page.click('[data-testid="send-message-button"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Mensaje enviado')
    await expect(page.locator('[data-testid="contact-modal"]')).not.toBeVisible()
  })
})
```

## ♿ Testing de Accesibilidad

### Automated Accessibility Testing

```typescript
// src/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { HomePage } from '@/pages/index'
import { SearchPage } from '@/pages/buscar'
import { ProfilePage } from '@/pages/[username]'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('HomePage has no accessibility violations', async () => {
    const { container } = render(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('SearchPage has no accessibility violations', async () => {
    const { container } = render(<SearchPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ProfilePage has no accessibility violations', async () => {
    const mockProfile = {
      username: 'testuser',
      full_name: 'Test User',
      role: 'photographer',
      bio: 'Test bio'
    }
    
    const { container } = render(<ProfilePage profile={mockProfile} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Accessibility Testing

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility E2E', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'skip-to-content')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'logo-link')
    
    // Test search form accessibility
    await page.goto('/buscar')
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'search-input')
    
    // Test form submission with Enter
    await page.keyboard.type('photographer')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/buscar\?q=photographer/)
  })

  test('screen reader announcements work', async ({ page }) => {
    await page.goto('/buscar')
    
    // Fill search form
    await page.fill('[data-testid="search-input"]', 'photographer')
    await page.click('[data-testid="search-button"]')
    
    // Check for aria-live announcements
    await expect(page.locator('[aria-live="polite"]')).toContainText('Se encontraron')
  })
})
```

## ⚡ Testing de Performance

### Performance Testing

```typescript
// src/__tests__/performance.test.tsx
import { render } from '@testing-library/react'
import { ProfileCard } from '@/components/features/ProfileCard'

describe('Performance Tests', () => {
  it('ProfileCard renders quickly with many items', () => {
    const profiles = Array.from({ length: 100 }, (_, i) => ({
      id: `profile-${i}`,
      username: `user${i}`,
      full_name: `User ${i}`,
      role: 'photographer',
      bio: `Bio for user ${i}`,
      location: 'Buenos Aires'
    }))

    const startTime = performance.now()
    
    render(
      <div>
        {profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render 100 cards in less than 100ms
    expect(renderTime).toBeLessThan(100)
  })

  it('lazy loading works correctly', async () => {
    const { container } = render(<ProfileCard profile={mockProfile} />)
    
    // Check that images have loading="lazy"
    const images = container.querySelectorAll('img')
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })
})
```

### Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/buscar',
        'http://localhost:3000/registro',
        'http://localhost:3000/login',
      ],
      startServerCommand: 'npm run start',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

## 📋 Mejores Prácticas

### Estructura de Tests

```
src/
├── __tests__/
│   ├── __mocks__/          # Mocks globales
│   ├── utils/              # Utilidades de testing
│   └── setup.ts            # Configuración global
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
└── lib/
    └── services/
        ├── profileService.ts
        └── __tests__/
            └── profileService.test.ts
```

### Naming Conventions

```typescript
// ✅ Buenos nombres de tests
describe('ProfileCard Component', () => {
  it('renders user information correctly', () => {})
  it('handles click events', () => {})
  it('shows loading state when data is loading', () => {})
})

// ❌ Malos nombres de tests
describe('ProfileCard', () => {
  it('works', () => {})
  it('test 1', () => {})
  it('should do something', () => {})
})
```

### Test Data Management

```typescript
// src/__tests__/utils/testData.ts
export const mockUser = {
  id: '123',
  username: 'testuser',
  full_name: 'Test User',
  role: 'photographer' as const,
  bio: 'Professional photographer',
  location: 'Buenos Aires, Argentina',
}

export const mockProfile = {
  ...mockUser,
  avatar_url: 'https://example.com/avatar.jpg',
  cover_image_url: 'https://example.com/cover.jpg',
  subscription_tier: 'free' as const,
  role_specific_data: {
    specialties: ['portrait', 'wedding'],
    experience_level: 'professional',
    equipment_highlights: 'Canon EOS R5',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const createMockProfile = (overrides = {}) => ({
  ...mockProfile,
  ...overrides,
})
```

### Custom Testing Utilities

```typescript
// src/__tests__/utils/renderWithProviders.tsx
import { render } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function renderWithProviders(
  ui: React.ReactElement,
  options = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
```

## 🚀 Scripts de Testing

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:accessibility": "jest --testPathPattern=accessibility",
    "test:performance": "lighthouse-ci",
    "test:all": "npm run test:ci && npm run test:e2e && npm run test:performance"
  }
}
```

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
      - run: npm run test:performance
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

**📚 Documentación actualizada**: Febrero 2025  
**🧪 Testing Framework**: Jest + React Testing Library + Playwright  
**🎯 Cobertura objetivo**: 80%+ en funciones críticas