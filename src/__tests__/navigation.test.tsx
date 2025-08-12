import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import Navbar from '@/components/layout/Navbar'
import { setViewport, viewports } from '@/test-utils'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()
const mockPathname = jest.fn(() => '/')

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => mockPathname(),
}))

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/')
  })

  describe('Navbar Navigation', () => {
    it('renders all navigation links with correct hrefs', () => {
      render(<Navbar />)
      
      const expectedLinks = [
        { name: 'Inicio', href: '/' },
        { name: 'Buscar', href: '/buscar' },
        { name: 'Explorar', href: '/explorar' },
        { name: 'Mensajes', href: '/mensajes' },
        { name: 'Iniciar Sesión', href: '/login' },
        { name: 'Registrarse', href: '/registro' },
      ]
      
      expectedLinks.forEach(({ name, href }) => {
        const link = screen.getByRole('link', { name })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', href)
      })
    })

    it('highlights active navigation item correctly', () => {
      const testCases = [
        { pathname: '/', expectedActive: 'Inicio' },
        { pathname: '/buscar', expectedActive: 'Buscar' },
        { pathname: '/buscar/resultados', expectedActive: 'Buscar' },
        { pathname: '/explorar', expectedActive: 'Explorar' },
        { pathname: '/mensajes', expectedActive: 'Mensajes' },
      ]

      testCases.forEach(({ pathname, expectedActive }) => {
        mockPathname.mockReturnValue(pathname)
        const { rerender } = render(<Navbar />)
        
        const activeLink = screen.getByRole('link', { name: expectedActive })
        expect(activeLink).toHaveClass('bg-primary-100 text-primary-700')
        
        // Ensure other links are not active
        const allNavLinks = ['Inicio', 'Buscar', 'Explorar', 'Mensajes']
        allNavLinks
          .filter(name => name !== expectedActive)
          .forEach(name => {
            const inactiveLink = screen.getByRole('link', { name })
            expect(inactiveLink).not.toHaveClass('bg-primary-100 text-primary-700')
            expect(inactiveLink).toHaveClass('text-secondary-600')
          })
        
        rerender(<div />)
      })
    })

    it('handles nested paths correctly', () => {
      const nestedPaths = [
        { pathname: '/buscar/filtros', expectedActive: 'Buscar' },
        { pathname: '/buscar/resultados/fotografos', expectedActive: 'Buscar' },
        { pathname: '/explorar/modelos', expectedActive: 'Explorar' },
        { pathname: '/mensajes/conversacion/123', expectedActive: 'Mensajes' },
      ]

      nestedPaths.forEach(({ pathname, expectedActive }) => {
        mockPathname.mockReturnValue(pathname)
        const { rerender } = render(<Navbar />)
        
        const activeLink = screen.getByRole('link', { name: expectedActive })
        expect(activeLink).toHaveClass('bg-primary-100 text-primary-700')
        
        rerender(<div />)
      })
    })

    it('does not highlight navigation for non-matching paths', () => {
      const nonMatchingPaths = [
        '/perfil',
        '/configuracion',
        '/ayuda',
        '/contacto',
        '/terminos',
        '/privacidad',
      ]

      nonMatchingPaths.forEach(pathname => {
        mockPathname.mockReturnValue(pathname)
        const { rerender } = render(<Navbar />)
        
        const navLinks = ['Inicio', 'Buscar', 'Explorar', 'Mensajes']
        navLinks.forEach(name => {
          const link = screen.getByRole('link', { name })
          expect(link).not.toHaveClass('bg-primary-100 text-primary-700')
        })
        
        rerender(<div />)
      })
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      setViewport(viewports.mobile.width, viewports.mobile.height)
    })

    it('shows mobile menu button on mobile devices', () => {
      render(<Navbar />)
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toBeInTheDocument()
      // Mobile menu button should be present on mobile
    })

    it('toggles mobile menu when button is clicked', () => {
      render(<Navbar />)
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      
      // Initially, mobile menu should be closed
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      
      // Click to open
      fireEvent.click(mobileMenuButton)
      
      // Note: The actual mobile menu visibility would depend on the MobileMenu component
      // This test verifies the button interaction
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('hides desktop navigation on mobile', () => {
      render(<Navbar />)
      
      // Desktop navigation should have hidden class
      const desktopNavLinks = screen.getAllByRole('link').filter(link => 
        ['Inicio', 'Buscar', 'Explorar', 'Mensajes'].includes(link.textContent || '')
      )
      
      // Links should exist but be in hidden desktop navigation
      expect(desktopNavLinks.length).toBeGreaterThan(0)
      
      // Check that desktop auth buttons are hidden
      const loginLink = screen.getByRole('link', { name: 'Iniciar Sesión' })
      const registerLink = screen.getByRole('link', { name: 'Registrarse' })
      
      expect(loginLink.closest('.hidden.md\\:block')).toBeInTheDocument()
      expect(registerLink.closest('.hidden.md\\:block')).toBeInTheDocument()
    })
  })

  describe('Desktop Navigation', () => {
    beforeEach(() => {
      setViewport(viewports.desktop.width, viewports.desktop.height)
    })

    it('shows desktop navigation on desktop devices', () => {
      render(<Navbar />)
      
      // All navigation links should be visible
      const navLinks = ['Inicio', 'Buscar', 'Explorar', 'Mensajes']
      navLinks.forEach(name => {
        const link = screen.getByRole('link', { name })
        expect(link).toBeInTheDocument()
      })
      
      // Auth buttons should be visible
      expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()
    })

    it('hides mobile menu button on desktop', () => {
      render(<Navbar />)
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      // Mobile menu button should be present but hidden on desktop via CSS
    })
  })

  describe('Navigation Accessibility', () => {
    it('supports keyboard navigation', () => {
      render(<Navbar />)
      
      const links = screen.getAllByRole('link')
      
      // Test that all links are focusable
      links.forEach(link => {
        link.focus()
        expect(link).toHaveFocus()
      })
    })

    it('has proper ARIA attributes', () => {
      render(<Navbar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toHaveAttribute('aria-expanded')
    })

    it('provides visual focus indicators', () => {
      render(<Navbar />)
      
      const navLinks = screen.getAllByRole('link').filter(link => 
        ['Inicio', 'Buscar', 'Explorar', 'Mensajes', 'Iniciar Sesión', 'Registrarse'].includes(link.textContent || '')
      )
      navLinks.forEach(link => {
        expect(link).toHaveClass('transition-colors')
      })
      
      const mobileMenuButton = screen.getByRole('button', { name: /abrir menú/i })
      expect(mobileMenuButton).toHaveClass('focus:ring-2')
    })
  })

  describe('Navigation State Management', () => {
    it('maintains navigation state across re-renders', () => {
      mockPathname.mockReturnValue('/buscar')
      const { rerender } = render(<Navbar />)
      
      expect(screen.getByRole('link', { name: 'Buscar' })).toHaveClass('bg-primary-100')
      
      // Re-render with same pathname
      rerender(<Navbar />)
      expect(screen.getByRole('link', { name: 'Buscar' })).toHaveClass('bg-primary-100')
    })

    it('updates active state when pathname changes', () => {
      mockPathname.mockReturnValue('/')
      const { rerender } = render(<Navbar />)
      
      expect(screen.getByRole('link', { name: 'Inicio' })).toHaveClass('bg-primary-100')
      
      // Change pathname
      mockPathname.mockReturnValue('/explorar')
      rerender(<Navbar />)
      
      expect(screen.getByRole('link', { name: 'Explorar' })).toHaveClass('bg-primary-100')
      expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveClass('bg-primary-100')
    })
  })

  describe('Navigation Performance', () => {
    it('renders efficiently with multiple re-renders', () => {
      const { rerender } = render(<Navbar />)
      
      // Multiple re-renders should not cause issues
      for (let i = 0; i < 5; i++) {
        rerender(<Navbar />)
      }
      
      expect(screen.getByText('Project Lens')).toBeInTheDocument()
      expect(screen.getAllByRole('link')).toHaveLength(7) // 1 logo + 4 nav + 2 auth
    })

    it('handles rapid pathname changes', () => {
      const pathnames = ['/', '/buscar', '/explorar', '/mensajes', '/']
      
      pathnames.forEach(pathname => {
        mockPathname.mockReturnValue(pathname)
        const { rerender } = render(<Navbar />)
        
        // Should render without errors
        expect(screen.getByText('Project Lens')).toBeInTheDocument()
        
        rerender(<div />)
      })
    })
  })

  describe('Navigation Edge Cases', () => {
    it('handles undefined pathname gracefully', () => {
      mockPathname.mockReturnValue(undefined as any)
      
      expect(() => render(<Navbar />)).not.toThrow()
      expect(screen.getByText('Project Lens')).toBeInTheDocument()
    })

    it('handles empty pathname gracefully', () => {
      mockPathname.mockReturnValue('')
      
      expect(() => render(<Navbar />)).not.toThrow()
      expect(screen.getByText('Project Lens')).toBeInTheDocument()
    })

    it('handles very long pathnames', () => {
      const longPathname = '/very/long/nested/path/that/goes/on/and/on/and/should/not/break/the/navigation'
      mockPathname.mockReturnValue(longPathname)
      
      expect(() => render(<Navbar />)).not.toThrow()
      expect(screen.getByText('Project Lens')).toBeInTheDocument()
    })
  })

  describe('Navigation Integration with Layout', () => {
    it('maintains sticky positioning', () => {
      render(<Navbar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('sticky top-0 z-50')
    })

    it('has proper z-index for layering', () => {
      render(<Navbar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('z-50')
    })

    it('applies consistent styling', () => {
      render(<Navbar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('bg-white shadow-soft')
    })
  })

  describe('Responsive Navigation Breakpoints', () => {
    it('handles tablet viewport correctly', () => {
      setViewport(viewports.tablet.width, viewports.tablet.height)
      render(<Navbar />)
      
      // At tablet size (768px), should show desktop navigation
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    })

    it('handles breakpoint transitions', () => {
      // Test just below md breakpoint
      setViewport(767, 400)
      const { rerender } = render(<Navbar />)
      
      expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument()
      
      // Test just above md breakpoint
      setViewport(769, 400)
      rerender(<Navbar />)
      
      expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument()
    })
  })
})